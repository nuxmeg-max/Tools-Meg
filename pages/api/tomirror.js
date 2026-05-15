// pages/api/tomirror.js
// Alur: upload file → qu.ax (dapat URL publik) → api-faa.my.id/faa/tomirror

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

async function uploadToQuax(buffer, filename, contentType) {
  const form = new FormData();
  const blob = new Blob([buffer], { type: contentType });
  form.append('files[]', blob, filename);

  const res = await fetch('https://qu.ax/upload.php', {
    method: 'POST',
    body: form,
  });

  if (!res.ok) throw new Error('Gagal upload ke qu.ax');
  const data = await res.json();
  const url = data?.files?.[0]?.url;
  if (!url) throw new Error('URL tidak ditemukan dari qu.ax');
  return url;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const parts = await parseFormData(req);
    const filePart = parts.find(p => p.name === 'file');

    if (!filePart || !filePart.data) {
      return res.status(400).json({ error: 'File tidak ditemukan dalam request.' });
    }

    // Step 1: Upload ke qu.ax untuk dapat URL publik
    const imageUrl = await uploadToQuax(
      filePart.data,
      filePart.filename || 'image.jpg',
      filePart.contentType || 'image/jpeg'
    );

    // Step 2: Kirim URL ke api-faa tomirror
    const apiUrl = `https://api-faa.my.id/faa/tomirror?url=${encodeURIComponent(imageUrl)}`;
    const apiRes = await fetch(apiUrl);

    if (!apiRes.ok) {
      throw new Error(`api-faa error: ${apiRes.status}`);
    }

    const contentType = apiRes.headers.get('content-type') || '';

    // Kalau response berupa JSON (ada result URL)
    if (contentType.includes('application/json')) {
      const data = await apiRes.json();
      return res.status(200).json({ result_url: data.result || data.url || data.image, source_url: imageUrl });
    }

    // Kalau response berupa binary image langsung
    const buffer = await apiRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mime = contentType.split(';')[0] || 'image/jpeg';
    const dataUrl = `data:${mime};base64,${base64}`;

    return res.status(200).json({ result_url: dataUrl, source_url: imageUrl });

  } catch (err) {
    console.error('[ToMirror Error]', err.message);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan server.' });
  }
}
