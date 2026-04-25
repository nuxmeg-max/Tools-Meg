// pages/api/stats.js
// Menggunakan Vercel KV (Redis) untuk menyimpan likes dan usage count
// Setup: Vercel Dashboard → Storage → Create KV Database → Connect ke project
// Otomatis inject env: KV_URL, KV_REST_API_URL, KV_REST_API_TOKEN

import { kv } from '@vercel/kv';

const TOOLS = ['tiktok', 'instagram', 'youtube', 'remove-bg', 'text-styler'];

export default async function handler(req, res) {
  // Izinkan CORS
  res.setHeader('Access-Control-Allow-Origin', '*');

  // ── GET: ambil semua stats ──────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      // Ambil semua likes dan usage sekaligus (pipeline = 1 round trip)
      const pipeline = kv.pipeline();
      TOOLS.forEach(tool => {
        pipeline.get(`likes:${tool}`);
        pipeline.get(`usage:${tool}`);
      });
      const results = await pipeline.exec();

      const stats = {};
      TOOLS.forEach((tool, i) => {
        stats[tool] = {
          likes: parseInt(results[i * 2] || 0),
          usage: parseInt(results[i * 2 + 1] || 0),
        };
      });

      // Tentukan tool paling populer berdasarkan usage
      const popular = TOOLS.reduce((a, b) =>
        (stats[a]?.usage || 0) >= (stats[b]?.usage || 0) ? a : b
      );

      return res.status(200).json({ stats, popular });
    } catch (err) {
      console.error('[Stats GET Error]', err.message);
      // Fallback kalau KV belum disetup — return data kosong
      const stats = {};
      TOOLS.forEach(tool => { stats[tool] = { likes: 0, usage: 0 }; });
      return res.status(200).json({ stats, popular: 'tiktok', fallback: true });
    }
  }

  // ── POST: increment likes atau usage ───────────────────────────────────
  if (req.method === 'POST') {
    const { tool, action } = req.body;

    if (!tool || !TOOLS.includes(tool)) {
      return res.status(400).json({ error: 'Tool tidak valid.' });
    }
    if (!action || !['like', 'unlike', 'use'].includes(action)) {
      return res.status(400).json({ error: 'Action tidak valid.' });
    }

    try {
      let newValue;

      if (action === 'like') {
        newValue = await kv.incr(`likes:${tool}`);
      } else if (action === 'unlike') {
        const current = parseInt(await kv.get(`likes:${tool}`) || 0);
        newValue = Math.max(0, current - 1);
        await kv.set(`likes:${tool}`, newValue);
      } else if (action === 'use') {
        newValue = await kv.incr(`usage:${tool}`);
      }

      return res.status(200).json({ success: true, value: newValue });
    } catch (err) {
      console.error('[Stats POST Error]', err.message);
      return res.status(500).json({ error: 'KV belum disetup. Tambahkan Vercel KV di dashboard.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
