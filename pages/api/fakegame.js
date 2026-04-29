// pages/api/fakegame.js
// API route untuk convert foto upload → base64 URL untuk FakeML

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

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

  try {
    const parts = await parseFormData(req);
    const filePart = parts.find(p => p.name === 'file');
    const textPart = parts.find(p => p.name === 'text');
    const gamePart = parts.find(p => p.name === 'game'); // 'ff' atau 'ml'
    const bgPart   = parts.find(p => p.name === 'bg');   // untuk FF

    const game = gamePart?.data || 'ff';
    const text = textPart?.data || 'Player';
    const bg   = bgPart?.data   || '1';

    if (game === 'ff') {
      // Fake FF — tidak perlu upload foto
      const params = new URLSearchParams({ text, bg });
      const apiRes = await fetch(`https://api.skylow.web.id/api/maker/fakeff?${params}`);
      const apiData = await apiRes.json();
      return res.status(200).json(apiData);
    }

    if (game === 'ml') {
      // Fake ML — perlu convert foto ke base64 data URL
      if (!filePart || !filePart.data) {
        return res.status(400).json({ error: 'Upload foto hero terlebih dahulu.' });
      }

      // Convert ke base64 data URL
      const base64 = filePart.data.toString('base64');
      const mimeType = filePart.contentType || 'image/jpeg';
      const imageDataUrl = `data:${mimeType};base64,${base64}`;

      const params = new URLSearchParams({ text, image: imageDataUrl });
      const apiRes = await fetch(`https://api.skylow.web.id/api/maker/fakeml?${params}`);
      const apiData = await apiRes.json();
      return res.status(200).json(apiData);
    }

    return res.status(400).json({ error: 'Game tidak dikenal.' });
  } catch (err) {
    console.error('[FakeGame Error]', err.message);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan server.' });
  }
}
