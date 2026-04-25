// pages/api/tiktok.js
// Menggunakan API: https://api.fromscratch.web.id/v1/api/down/tiktok?url=query

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL diperlukan.' });
  if (!url.includes('tiktok.com')) return res.status(400).json({ error: 'URL bukan link TikTok yang valid.' });

  try {
    const apiUrl = `https://api.fromscratch.web.id/v1/api/down/tiktok?url=${encodeURIComponent(url)}`;

    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) throw new Error(`Server API merespons dengan status ${response.status}`);

    const data = await response.json();

    // Tangkap error dari API
    if (data.error || data.status === false || data.status === 'error') {
      throw new Error(data.message || data.error || 'Tidak dapat memproses URL ini.');
    }

    // Normalisasi — coba semua kemungkinan key struktur response
    const d = data.result || data.data || data;

    const result = {
      title:      d.title      || d.desc        || d.caption      || '',
      author:     d.author     || d.username     || d.creator      || '',
      thumbnail:  d.thumbnail  || d.cover        || d.image        || '',
      duration:   d.duration   || null,
      // Video
      video_nowm: d.video_nowm || d.no_watermark || d.nowatermark  || d.video || d.play || null,
      video_wm:   d.video_wm   || d.watermark    || d.wmplay       || null,
      // Audio — jika API return; kalau null, FE handle via extract-audio
      audio:      d.audio      || d.music        || d.sound        || null,
    };

    if (!result.video_nowm && !result.video_wm) {
      throw new Error('API tidak mengembalikan URL video. Coba URL lain.');
    }

    return res.status(200).json(result);

  } catch (err) {
    console.error('[TikTok API Error]', err.message);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan server.' });
  }
}
 
