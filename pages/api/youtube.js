// pages/api/youtube.js
// Menggunakan API: https://api.fromscratch.web.id/v1/api/down/youtube?url=query
// Audio: client-side extraction via AudioExtractor (Web Audio API) — tidak perlu API key

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL diperlukan.' });

  const isValidYT = url.includes('youtube.com') || url.includes('youtu.be');
  if (!isValidYT) return res.status(400).json({ error: 'URL bukan link YouTube yang valid.' });

  try {
    const apiUrl = `https://api.fromscratch.web.id/v1/api/down/youtube?url=${encodeURIComponent(url)}`;

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

    // Normalisasi — coba semua kemungkinan key struktur response
    const d = data.result || data.data || data;

    const title     = d.title     || d.name      || '';
    const channel   = d.channel   || d.uploader  || d.author   || '';
    const thumbnail = d.thumbnail || d.thumb      || d.image    || '';
    const duration  = d.duration  || d.length     || '';

    // Bangun daftar format dari berbagai kemungkinan struktur response
    let formats = [];

    // Case 1: array formats
    if (Array.isArray(d.formats) && d.formats.length > 0) {
      formats = d.formats.map(f => ({
        label:    f.quality || f.label || f.resolution || f.format || 'Video',
        url:      f.url     || f.link  || f.download   || '',
        size:     f.size    || f.filesize || null,
        hasAudio: f.hasAudio ?? !(f.type?.toLowerCase().includes('audio')),
      })).filter(f => f.url);
    }

    // Case 2: array links
    else if (Array.isArray(d.links) && d.links.length > 0) {
      formats = d.links.map(f => ({
        label:    f.quality || f.label || f.type || 'Video',
        url:      f.url     || f.link  || '',
        size:     f.size    || null,
        hasAudio: !(f.type?.toLowerCase().includes('audio')),
      })).filter(f => f.url);
    }

    // Case 3: single URL langsung
    else if (d.url || d.link || d.download || d.video) {
      const videoUrl = d.url || d.link || d.download || d.video;
      formats = [{
        label:    d.quality || d.resolution || 'HD',
        url:      videoUrl,
        size:     d.size || null,
        hasAudio: true,
      }];
    }

    // Case 4: key per kualitas (1080p, 720p, dst)
    else {
      const qualityKeys = ['2160p','1440p','1080p','720p','480p','360p','240p','144p'];
      qualityKeys.forEach(q => {
        if (d[q]) {
          formats.push({
            label:    q,
            url:      typeof d[q] === 'string' ? d[q] : d[q].url || d[q].link || '',
            size:     typeof d[q] === 'object' ? d[q].size || null : null,
            hasAudio: true,
          });
        }
      });
    }

    if (formats.length === 0) {
      throw new Error('Tidak ada format yang tersedia. Coba URL lain.');
    }

    return res.status(200).json({ title, channel, thumbnail, duration, formats });

  } catch (err) {
    console.error('[YouTube API Error]', err.message);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan server.' });
  }
}
