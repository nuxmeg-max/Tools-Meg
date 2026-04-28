// pages/api/youtube.js
// Ganti ke yt-dlp3 API yang lebih reliable
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL diperlukan.' });

  const isValidYT = url.includes('youtube.com') || url.includes('youtu.be');
  if (!isValidYT) return res.status(400).json({ error: 'URL bukan link YouTube yang valid.' });

  try {
    // Pakai API cobalt.tools yang gratis dan reliable
    const response = await fetch('https://api.cobalt.tools/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        videoQuality: '720',
        youtubeVideoCodec: 'h264',
        filenameStyle: 'basic',
      }),
    });

    if (!response.ok) throw new Error(`Server API merespons dengan status ${response.status}`);
    const data = await response.json();
    console.log('[YouTube API Raw]', JSON.stringify(data).slice(0, 500));

    // cobalt response: { status: 'stream'|'picker'|'error', url, picker }
    if (data.status === 'error') {
      throw new Error(data.error?.code || 'Tidak dapat memproses URL ini.');
    }

    if (data.status === 'stream' || data.status === 'redirect' || data.status === 'tunnel') {
      return res.status(200).json({
        title: url,
        channel: '',
        thumbnail: `https://img.youtube.com/vi/${extractYouTubeId(url)}/hqdefault.jpg`,
        duration: '',
        formats: [
          { label: '720p', url: data.url, size: null, hasAudio: true },
        ],
      });
    }

    if (data.status === 'picker') {
      const formats = (data.picker || []).map((item, i) => ({
        label: item.quality || `Format ${i + 1}`,
        url: item.url,
        size: null,
        hasAudio: true,
      })).filter(f => f.url);

      if (formats.length === 0) throw new Error('Tidak ada format yang tersedia.');
      return res.status(200).json({
        title: url,
        channel: '',
        thumbnail: `https://img.youtube.com/vi/${extractYouTubeId(url)}/hqdefault.jpg`,
        duration: '',
        formats,
      });
    }

    throw new Error('Tidak ada format yang tersedia. Coba URL lain.');

  } catch (err) {
    console.error('[YouTube API Error]', err.message);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan server.' });
  }
}

function extractYouTubeId(url) {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : '';
}
