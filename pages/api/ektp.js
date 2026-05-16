// pages/api/ektp.js
// Mode 1 (POST): upload foto ke qu.ax, return URL
// Mode 2 (GET): proxy ke api.skylow.web.id/api/maker/ektp

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
        const nameMatch    = rawHeaders.match(/name="([^"]+)"/);
        const filenameMatch= rawHeaders.match(/filename="([^"]+)"/);
        const ctMatch      = rawHeaders.match(/Content-Type:\s*([^\r\n]+)/i);
        if (!nameMatch) continue;
        parts.push({
          name: nameMatch[1],
          filename: filenameMatch?.[1] || null,
          contentType: ctMatch?.[1]?.trim() || 'text/plain',
          data: filenameMatch ? Buffer.from(bodyContent, 'binary') : bodyContent.trim(),
        });
      }
      resolve(parts);
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {

  // ── POST: upload foto ke qu.ax ──────────────────────────────────────────
  if (req.method === 'POST') {
    try {
      const parts = await parseFormData(req);
      const filePart = parts.find(p => p.name === 'file');
      if (!filePart?.data) return res.status(400).json({ error: 'File tidak ditemukan.' });

      const form = new FormData();
      const blob = new Blob([filePart.data], { type: filePart.contentType || 'image/jpeg' });
      form.append('files[]', blob, filePart.filename || 'photo.jpg');

      const upRes = await fetch('https://uguu.se/upload.php', {
        method: 'POST',
        body: form,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
        },
      });
      if (!upRes.ok) throw new Error('Gagal upload ke uguu.se');
      const upData = await upRes.json();
      const url = upData?.files?.[0]?.url;
      if (!url) throw new Error('URL tidak ditemukan dari uguu.se');

      return res.status(200).json({ photo_url: url });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── GET: generate KTP via skylow API ───────────────────────────────────
  if (req.method === 'GET') {
    const {
      nik, nama, pas_photo, provinsi, kota, ttl,
      jenis_kelamin, golongan_darah, alamat, rt_rw,
      kel_desa, kecamatan, agama, status, pekerjaan,
      kewarganegaraan, masa_berlaku, terbuat,
    } = req.query;

    const params = new URLSearchParams({
      nik:             nik || '',
      nama:            nama || '',
      pas_photo:       pas_photo || '',
      provinsi:        provinsi || '',
      kota:            kota || '',
      ttl:             ttl || '',
      jenis_kelamin:   jenis_kelamin || '',
      golongan_darah:  golongan_darah || '',
      alamat:          alamat || '',
      'rt/rw':         rt_rw || '',
      'kel/desa':      kel_desa || '',
      kecamatan:       kecamatan || '',
      agama:           agama || '',
      status:          status || '',
      pekerjaan:       pekerjaan || '',
      kewarganegaraan: kewarganegaraan || '',
      masa_berlaku:    masa_berlaku || '',
      terbuat:         terbuat || '',
    });

    try {
      const apiRes = await fetch(`https://api.skylow.web.id/api/maker/ektp?${params}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
          'Accept': 'image/*',
        },
      });
      if (!apiRes.ok) throw new Error(`Skylow API error: ${apiRes.status}`);

      const contentType = apiRes.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const data = await apiRes.json();
        return res.status(200).json(data);
      }

      // Binary image
      const buffer = await apiRes.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const mime = contentType.split(';')[0] || 'image/png';
      return res.status(200).json({ result_url: `data:${mime};base64,${base64}` });

    } catch (err) {
      console.error('[eKTP Error]', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
    }
