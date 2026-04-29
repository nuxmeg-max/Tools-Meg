// pages/api/stats.js
// Menggunakan Upstash Redis REST API langsung via fetch
// TIDAK perlu @vercel/kv atau library tambahan apapun
// Env variables otomatis dari Vercel Storage:
//   KV_REST_API_URL dan KV_REST_API_TOKEN

const TOOLS = ['tiktok', 'instagram', 'youtube', 'remove-bg', 'text-styler', 'spotify', 'fakeff', 'fakeml'];

// Helper: call Upstash REST API
async function redis(commands) {
  const url  = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  // Fallback jika env belum diset
  if (!url || !token) return null;

  try {
    const res = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commands),
    });
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // ── GET: ambil semua stats ──────────────────────────────────────────────
  if (req.method === 'GET') {
    // Buat pipeline: GET likes dan usage untuk semua tool
    const commands = [];
    TOOLS.forEach(tool => {
      commands.push(['GET', `likes:${tool}`]);
      commands.push(['GET', `usage:${tool}`]);
    });

    const results = await redis(commands);

    const stats = {};
    TOOLS.forEach((tool, i) => {
      const likesVal = results?.[i * 2]?.result;
      const usageVal = results?.[i * 2 + 1]?.result;
      stats[tool] = {
        likes: parseInt(likesVal || 0),
        usage: parseInt(usageVal || 0),
      };
    });

    // Tool paling populer berdasarkan usage
    const popular = TOOLS.reduce((a, b) =>
      (stats[a]?.usage || 0) >= (stats[b]?.usage || 0) ? a : b
    );

    return res.status(200).json({
      stats,
      popular,
      fallback: !results,
    });
  }

  // ── POST: increment likes atau usage ───────────────────────────────────
  if (req.method === 'POST') {
    const { tool, action } = req.body || {};

    if (!tool || !TOOLS.includes(tool)) {
      return res.status(400).json({ error: 'Tool tidak valid.' });
    }
    if (!action || !['like', 'unlike', 'use'].includes(action)) {
      return res.status(400).json({ error: 'Action tidak valid.' });
    }

    let command;
    if (action === 'like' || action === 'use') {
      command = [['INCR', `${action === 'use' ? 'usage' : 'likes'}:${tool}`]];
    } else if (action === 'unlike') {
      command = [['DECR', `likes:${tool}`]];
    }

    const result = await redis(command);
    const value = result?.[0]?.result || 0;

    return res.status(200).json({ success: true, value: Math.max(0, value) });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
