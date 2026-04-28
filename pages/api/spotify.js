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

    if (data.status !== 200) {
      throw new Error(data.message || 'Tidak dapat memproses URL ini.');
    }

    const metadata = data.data?.metadata || {};
    const downloadUrl = data.data?.download_url || null;

    const result = {
      title:    metadata.name || '',
      artist:   Array.isArray(metadata.artists)
                  ? metadata.artists.map(a => a.name).join(', ')
                  : '',
      album:    metadata.album?.name || '',
      cover:    metadata.album?.images?.[0]?.url || '',
      duration: metadata.duration_ms
                  ? Math.floor(metadata.duration_ms / 1000) + 's'
                  : '',
      audio:    downloadUrl,
    };

    if (!result.audio) throw new Error('API tidak mengembalikan URL audio. Coba URL lain.');
    return res.status(200).json(result);

  } catch (err) {
    console.error('[Spotify API Error]', err.message);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan server.' });
  }
}
  
