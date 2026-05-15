// pages/api/ektp.js
// Proxy ke api.skylow.web.id/api/maker/ektp

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const {
    nik, nama, pas_photo, provinsi, kota, ttl,
    jenis_kelamin, golongan_darah, alamat, rt_rw,
    kel_desa, kecamatan, agama, status, pekerjaan,
    kewarganegaraan, masa_berlaku, terbuat,
  } = req.query;

  const params = new URLSearchParams({
    nik:            nik || '',
    nama:           nama || '',
    pas_photo:      pas_photo || '',
    provinsi:       provinsi || '',
    kota:           kota || '',
    ttl:            ttl || '',
    jenis_kelamin:  jenis_kelamin || '',
    golongan_darah: golongan_darah || '',
    alamat:         alamat || '',
    'rt/rw':        rt_rw || '',
    'kel/desa':     kel_desa || '',
    kecamatan:      kecamatan || '',
    agama:          agama || '',
    status:         status || '',
    pekerjaan:      pekerjaan || '',
    kewarganegaraan:kewarganegaraan || '',
    masa_berlaku:   masa_berlaku || '',
    terbuat:        terbuat || '',
  });

  try {
    const apiRes = await fetch(`https://api.skylow.web.id/api/maker/ektp?${params}`);
    if (!apiRes.ok) throw new Error(`API error: ${apiRes.status}`);

    const contentType = apiRes.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await apiRes.json();
      return res.status(200).json(data);
    }

    // Response binary image
    const buffer = await apiRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mime = contentType.split(';')[0] || 'image/png';
    return res.status(200).json({ result_url: `data:${mime};base64,${base64}` });

  } catch (err) {
    console.error('[eKTP Error]', err.message);
    return res.status(500).json({ error: err.message });
  }
}

