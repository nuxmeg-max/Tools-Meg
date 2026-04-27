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

    // Log response asli untuk debug
    console.log('[Spotify API Raw]', JSON.stringify(data).slice(0, 500));

    if (data.status !== 200 && data.status !== true && data.status !== 'ok') {
      throw new Error(data.message || 'Tidak dapat memproses URL ini.');
    }

    // Struktur fromscratch: data.data.metadata + data.data.download_url / audio / link
    const d        = data.data || data.result || data;
    const metadata = d.metadata || d;

    const result = {
      title:    metadata.name    || metadata.title  || d.title  || '',
      artist:   Array.isArray(metadata.artists)
                  ? metadata.artists.map(a => a.name || a).join(', ')
                  : metadata.artists || metadata.artist || d.artist || '',
      album:    metadata.album?.name || metadata.album || d.album || '',
      cover:    metadata.images?.[0]?.url || metadata.cover || metadata.image || d.cover || d.thumbnail || '',
      duration: metadata.duration_ms
                  ? Math.floor(metadata.duration_ms / 1000) + 's'
                  : metadata.duration || '',
      audio:    d.download_url || d.audio || d.url || d.link || d.mp3 || d.download || null,
    };

    if (!result.audio) throw new Error('API tidak mengembalikan URL audio. Coba URL lain.');
    return res.status(200).json(result);
  } catch (err) {
    console.error('[Spotify API Error]', err.message);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan server.' });
  }
}
