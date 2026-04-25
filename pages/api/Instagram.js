// pages/api/instagram.js
// Menggunakan API: https://api.fromscratch.web.id/v1/api/down/instagram?url=query

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

    // Tangkap error dari API
    if (data.error || data.status === false || data.status === 'error') {
      throw new Error(data.message || data.error || 'Tidak dapat memproses URL ini. Pastikan konten bersifat publik.');
    }

    // Normalisasi — coba semua kemungkinan key struktur response
    const d = data.result || data.data || data;

    // ── CASE 1: API return array items (carousel / multiple media) ──
    if (Array.isArray(d) && d.length > 0) {
      const items = d.map(item => ({
        type:      item.type      || (item.video || item.video_url ? 'video' : 'image'),
        url:       item.url       || item.video_url || item.image_url || item.video || item.image || '',
        thumbnail: item.thumbnail || item.cover     || item.image     || null,
      })).filter(item => item.url);

      if (items.length === 0) throw new Error('Tidak ada media ditemukan.');
      if (items.length === 1) {
        return res.status(200).json({ type: items[0].type, url: items[0].url, thumbnail: items[0].thumbnail, items: [] });
      }
      return res.status(200).json({ items });
    }

    // ── CASE 2: API return single object ──
    const mediaUrl =
      d.url       || d.video_url || d.image_url ||
      d.video     || d.image     || d.media     || null;

    if (!mediaUrl) throw new Error('API tidak mengembalikan URL media. Coba URL lain atau pastikan konten publik.');

    // Cek apakah ada sub-items di dalam object (beberapa API wrap array di dalam object)
    const subItems = d.items || d.medias || d.media_list || null;
    if (Array.isArray(subItems) && subItems.length > 1) {
      const items = subItems.map(item => ({
        type:      item.type      || (item.video || item.video_url ? 'video' : 'image'),
        url:       item.url       || item.video_url || item.image_url || item.video || item.image || '',
        thumbnail: item.thumbnail || item.cover     || null,
      })).filter(item => item.url);

      if (items.length > 1) return res.status(200).json({ items });
    }

    const type = d.type || (d.video || d.video_url ? 'video' : 'image');
    const thumbnail = d.thumbnail || d.cover || d.image || null;
    const audio = d.audio || d.music || d.sound || null;

    return res.status(200).json({ type, url: mediaUrl, thumbnail, audio, items: [] });

  } catch (err) {
    console.error('[Instagram API Error]', err.message);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan server.' });
  }
}
