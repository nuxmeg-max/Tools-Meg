// pages/api/youtube.js
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { url, type = 'mp4', format = '720' } = req.query;
  if (!url) return res.status(400).json({ error: 'URL diperlukan.' });

  const isValidYT = url.includes('youtube.com') || url.includes('youtu.be');
  if (!isValidYT) return res.status(400).json({ error: 'URL bukan link YouTube yang valid.' });

  try {
    const apiUrl = `https://api.fromscratch.web.id/v1/api/down/youtube?url=${encodeURIComponent(url)}&type=${type}&format=${format}`;
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) throw new Error(`Server API merespons dengan status ${response.status}`);
    const data = await response.json();

    if (data.status !== 200) {
      throw new Error(data.message || 'Tidak dapat memproses URL ini.');
    }

    const d = data.data;
    return res.status(200).json({
      title:        d.title || '',
      thumbnail:    d.thumbnail || '',
      type:         d.type || type,
      quality:      d.quality || format,
      download_url: d.download_url || null,
    });

  } catch (err) {
    console.error('[YouTube API Error]', err.message);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan server.' });
  }
}
