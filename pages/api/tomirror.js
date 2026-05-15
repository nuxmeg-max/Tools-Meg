// pages/api/tomirror.js
// Hanya upload foto ke qu.ax, dapat URL publik
// api-faa dipanggil langsung dari browser (frontend) agar tidak kena 403

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

    if (!filePart || !filePart.data) {
      return res.status(400).json({ error: 'File tidak ditemukan dalam request.' });
    }

    // Upload ke qu.ax untuk dapat URL publik
    const form = new FormData();
    const blob = new Blob([filePart.data], { type: filePart.contentType || 'image/jpeg' });
    form.append('files[]', blob, filePart.filename || 'image.jpg');

    const uploadRes = await fetch('https://qu.ax/upload.php', {
      method: 'POST',
      body: form,
    });

    if (!uploadRes.ok) throw new Error('Gagal upload ke qu.ax');
    const uploadData = await uploadRes.json();
    const imageUrl = uploadData?.files?.[0]?.url;
    if (!imageUrl) throw new Error('URL tidak ditemukan dari qu.ax');

    // Kembalikan URL ke frontend — api-faa dipanggil dari browser
    return res.status(200).json({ image_url: imageUrl });

  } catch (err) {
    console.error('[ToMirror Upload Error]', err.message);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan server.' });
  }
    }
  
