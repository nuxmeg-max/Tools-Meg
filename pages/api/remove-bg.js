// pages/api/remove-bg.js
// Menggunakan remove.bg API
// Daftar API key gratis di: https://www.remove.bg/api (50 foto/bulan)
// Tambahkan di Vercel: Settings → Environment Variables → REMOVE_BG_API_KEY

export const config = {
  api: {
    bodyParser: false, // kita parse manual karena multipart/form-data
    responseLimit: false,
  },
};

// Parse multipart form-data manual tanpa library tambahan
async function parseFormData(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const body = Buffer.concat(chunks);
      const contentType = req.headers['content-type'] || '';
      const boundaryMatch = contentType.match(/boundary=(.+)$/);
      if (!boundaryMatch) return reject(new Error('Invalid content-type'));

      const boundary = '--' + boundaryMatch[1];
      const parts = [];
      const bodyStr = body.toString('binary');
      const rawParts = bodyStr.split(boundary);

      for (const part of rawParts) {
        if (!part || part === '--\r\n' || part.trim() === '--') continue;
        const [rawHeaders, ...rawBodyParts] = part.split('\r\n\r\n');
        if (!rawHeaders) continue;

        const bodyContent = rawBodyParts.join('\r\n\r\n').replace(/\r\n$/, '');
        const nameMatch = rawHeaders.match(/name="([^"]+)"/);
        const filenameMatch = rawHeaders.match(/filename="([^"]+)"/);
        const ctMatch = rawHeaders.match(/Content-Type:\s*([^\r\n]+)/i);

        if (!nameMatch) continue;

        parts.push({
          name: nameMatch[1],
          filename: filenameMatch?.[1] || null,
          contentType: ctMatch?.[1]?.trim() || 'text/plain',
          data: filenameMatch
            ? Buffer.from(bodyContent, 'binary')
            : bodyContent.trim(),
        });
      }
      resolve(parts);
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.REMOVE_BG_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'REMOVE_BG_API_KEY belum diset di environment variables.' });
  }

  try {
    // Parse form data
    const parts = await parseFormData(req);
    const filePart = parts.find(p => p.name === 'file');
    const typePart = parts.find(p => p.name === 'type');

    if (!filePart || !filePart.data) {
      return res.status(400).json({ error: 'File tidak ditemukan dalam request.' });
    }

    const mediaType = typePart?.data || 'photo'; // 'photo' | 'video'

    // ── FOTO: kirim ke remove.bg API ──────────────────────────────────────
    if (mediaType === 'photo') {
      const formData = new FormData();
      const blob = new Blob([filePart.data], { type: filePart.contentType });
      formData.append('image_file', blob, filePart.filename || 'image.png');
      formData.append('size', 'auto');

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const msg = errData?.errors?.[0]?.title || `remove.bg error ${response.status}`;
        throw new Error(msg);
      }

      // Response adalah binary PNG — convert ke base64 data URL
      const resultBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(resultBuffer).toString('base64');
      const dataUrl = `data:image/png;base64,${base64}`;

      return res.status(200).json({ result_url: dataUrl, type: 'photo' });
    }

    // ── VIDEO: remove.bg mendukung video tapi perlu plan berbayar ─────────
    // Untuk video kita informasikan ke user
    if (mediaType === 'video') {
      return res.status(400).json({
        error: 'Remove background untuk video memerlukan plan berbayar remove.bg. Gunakan fitur foto saja, atau upgrade akun remove.bg kamu.',
      });
    }

    return res.status(400).json({ error: 'Tipe file tidak didukung.' });

  } catch (err) {
    console.error('[Remove BG Error]', err.message);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan server.' });
  }
}
