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

    if (data.status !== 200) {
      throw new Error(data.message || 'Tidak dapat memproses URL ini.');
    }

    const media = data.data?.media;
    if (!media) throw new Error('API tidak mengembalikan data media.');

    const videos = (media.videos || []).filter(v => v);
    const images = (media.images || []).filter(i => i);

    // videos dan images berisi string URL langsung
    const allItems = [
      ...videos.map(v => ({ type: 'video', url: typeof v === 'string' ? v : v.url, thumbnail: null })),
      ...images.map(i => ({ type: 'image', url: typeof i === 'string' ? i : i.url, thumbnail: null })),
    ].filter(item => item.url);

    if (allItems.length === 0) throw new Error('Tidak ada media ditemukan.');
    if (allItems.length === 1) {
      return res.status(200).json({ type: allItems[0].type, url: allItems[0].url, thumbnail: null, items: [] });
    }
    return res.status(200).json({ items: allItems });

  } catch (err) {
    console.error('[Instagram API Error]', err.message);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan server.' });
  }
        }
