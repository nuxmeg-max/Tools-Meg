// pages/api/spotify.js
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL diperlukan.' });
  if (!url.includes('spotify.com')) return res.status(400).json({ error: 'URL bukan link Spotify yang valid.' });

  try {
    const apiUrl = `https://api.fromscratch.web.id/v1/api/down/spotify?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) throw new Error(`Server API merespons dengan status ${response.status}`);
    const data = await response.json();
    if (data.error || data.status === false || data.status === 'error') {
      throw new Error(data.message || data.error || 'Tidak dapat memproses URL ini.');
    }

    const d = data.result || data.data || data;
    const result = {
      title:    d.title    || d.name      || d.track    || '',
      artist:   d.artist   || d.artists   || d.author   || '',
      album:    d.album    || d.album_name || '',
      cover:    d.cover    || d.thumbnail || d.image    || d.artwork || '',
      duration: d.duration || d.length    || '',
      audio:    d.audio    || d.url       || d.download || d.link    || d.mp3 || null,
    };

    if (!result.audio) throw new Error('API tidak mengembalikan URL audio. Coba URL lain.');
    return res.status(200).json(result);
  } catch (err) {
    console.error('[Spotify API Error]', err.message);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan server.' });
  }
}
