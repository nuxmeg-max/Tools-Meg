// pages/api/Instagram.js
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL diperlukan.' });
  if (!url.includes('instagram.com')) return res.status(400).json({ error: 'URL bukan link Instagram yang valid.' });

  try {
    const apiUrl = `https://api.fromscratch.web.id/v1/api/down/instagram?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) throw new Error(`Server API merespons dengan status ${response.status}`);
    const data = await response.json();
    console.log('[Instagram API Raw]', JSON.stringify(data).slice(0, 500));

    if (data.status !== 200 && data.status !== true && data.status !== 'ok') {
      throw new Error(data.message || 'Tidak dapat memproses URL ini.');
    }

    // Struktur baru: data.data.media.videos[] dan data.data.media.images[]
    const media = data.data?.media;
    if (!media) throw new Error('API tidak mengembalikan data media.');

    const videos = media.videos || [];
    const images = media.images || [];

    // Gabungkan semua media
    const allItems = [
      ...videos.map(v => ({ type: 'video', url: v.url || v, thumbnail: v.thumbnail || null })),
      ...images.map(i => ({ type: 'image', url: i.url || i, thumbnail: null })),
    ].filter(item => item.url);

    if (allItems.length === 0) throw new Error('Tidak ada media ditemukan.');
    if (allItems.length === 1) {
      return res.status(200).json({ type: allItems[0].type, url: allItems[0].url, thumbnail: allItems[0].thumbnail, items: [] });
    }
    return res.status(200).json({ items: allItems });

  } catch (err) {
    console.error('[Instagram API Error]', err.message);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan server.' });
  }
}
