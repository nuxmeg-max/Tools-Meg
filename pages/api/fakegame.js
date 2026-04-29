// pages/api/fakegame.js
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

async function handleApiResponse(apiRes) {
  const contentType = apiRes.headers.get('content-type') || '';

  if (contentType.includes('image/')) {
    const buffer = await apiRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mime = contentType.split(';')[0].trim();
    return { image: `data:${mime};base64,${base64}` };
  }

  const text = await apiRes.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('API tidak mengembalikan respons yang valid. Mungkin API sedang down.');
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const parts = await parseFormData(req);
    const filePart = parts.find(p => p.name === 'file');
    const textPart = parts.find(p => p.name === 'text');
    const gamePart = parts.find(p => p.name === 'game');
    const bgPart   = parts.find(p => p.name === 'bg');

    const game = gamePart?.data || 'ff';
    const text = textPart?.data || 'Player';
    const bg   = bgPart?.data   || '1';

    if (game === 'ff') {
      const params = new URLSearchParams({ text, bg });
      const apiRes = await fetch(`https://api.skylow.web.id/api/maker/fakeff?${params}`);
      const data = await handleApiResponse(apiRes);
      return res.status(200).json(data);
    }

    if (game === 'ml') {
  if (!filePart || !filePart.data || filePart.data.length === 0) {
    return res.status(400).json({ error: 'Upload foto hero terlebih dahulu.' });
  }

  // Upload foto ke tmpfiles.org untuk dapat URL publik
  const formData = new FormData();
  const blob = new Blob([filePart.data], { type: filePart.contentType || 'image/jpeg' });
  formData.append('file', blob, filePart.filename || 'hero.jpg');

  const uploadRes = await fetch('https://tmpfiles.org/api/v1/upload', {
    method: 'POST',
    body: formData,
  });

  const uploadJson = await uploadRes.json();
  // tmpfiles.org return: { status: 'success', data: { url: 'https://tmpfiles.org/...' } }
  const tmpUrl = uploadJson?.data?.url;
  if (!tmpUrl) return res.status(500).json({ error: 'Gagal upload foto ke server sementara.' });

  // Convert URL tmpfiles ke direct link
  const directUrl = tmpUrl.replace('tmpfiles.org/', 'tmpfiles.org/dl/');

  const params = new URLSearchParams({ text, image: directUrl });
  const apiRes = await fetch(`https://api.skylow.web.id/api/maker/fakeml?${params}`);
  const data = await handleApiResponse(apiRes);
  return res.status(200).json(data);
}

    return res.status(400).json({ error: 'Game tidak dikenal.' });
  } catch (err) {
    console.error('[FakeGame Error]', err.message);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan server.' });
  }
}
