// pages/api/youtube.js
// Menggunakan RapidAPI - yt-dlp (free tier: 500 req/bulan)
// Daftar di: https://rapidapi.com/ytdlfree/api/ytdlp2
// Tambahkan di Vercel: RAPIDAPI_KEY=xxxxxxx

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL diperlukan.' });

  const isValidYT = url.includes('youtube.com') || url.includes('youtu.be');
  if (!isValidYT) return res.status(400).json({ error: 'URL bukan link YouTube yang valid.' });

  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) return res.status(500).json({ error: 'RAPIDAPI_KEY belum diset di environment variables.' });

  try {
    // Step 1: Ambil info + daftar format video
    const infoRes = await fetch(
      `https://ytdlp2.p.rapidapi.com/info?url=${encodeURIComponent(url)}`,
      {
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'ytdlp2.p.rapidapi.com',
        },
      }
    );

    if (!infoRes.ok) throw new Error(`RapidAPI merespons ${infoRes.status}`);

    const info = await infoRes.json();
    if (info.error) throw new Error(info.error);

    // Normalisasi field
    const title     = info.title     || info.fulltitle || '';
    const channel   = info.uploader  || info.channel   || '';
    const thumbnail = info.thumbnail || (info.thumbnails?.[info.thumbnails.length - 1]?.url) || '';
    const duration  = info.duration_string || formatDuration(info.duration) || '';

    // Step 2: Saring format yang berguna
    const rawFormats = info.formats || [];

    // Pilih format video+audio (ext: mp4), sorted by quality
    const videoFormats = rawFormats
      .filter(f =>
        f.url &&
        f.vcodec && f.vcodec !== 'none' &&
        f.acodec && f.acodec !== 'none' &&
        (f.ext === 'mp4' || f.ext === 'webm')
      )
      .sort((a, b) => (b.height || 0) - (a.height || 0))
      .slice(0, 5) // ambil max 5 kualitas
      .map(f => ({
        label:    `${f.height || '?'}p ${f.ext?.toUpperCase() || ''}`,
        url:      f.url,
        size:     f.filesize ? formatBytes(f.filesize) : (f.filesize_approx ? '~' + formatBytes(f.filesize_approx) : null),
        hasAudio: true,
        height:   f.height || 0,
      }));

    // Format audio saja (mp3/m4a)
    const audioFormats = rawFormats
      .filter(f =>
        f.url &&
        f.acodec && f.acodec !== 'none' &&
        (f.vcodec === 'none' || !f.vcodec) &&
        (f.ext === 'm4a' || f.ext === 'mp3' || f.ext === 'webm')
      )
      .sort((a, b) => (b.abr || 0) - (a.abr || 0))
      .slice(0, 2)
      .map(f => ({
        label:    `Audio ${f.ext?.toUpperCase() || 'M4A'} ${f.abr ? f.abr + 'kbps' : ''}`.trim(),
        url:      f.url,
        size:     f.filesize ? formatBytes(f.filesize) : null,
        hasAudio: false, // flag: ini audio-only
      }));

    const formats = [...videoFormats, ...audioFormats];

    if (formats.length === 0) throw new Error('Tidak ada format yang tersedia untuk URL ini.');

    return res.status(200).json({ title, channel, thumbnail, duration, formats });

  } catch (err) {
    console.error('[YouTube API Error]', err.message);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan server.' });
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function formatDuration(seconds) {
  if (!seconds) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${m}:${String(s).padStart(2,'0')}`;
}

function formatBytes(bytes) {
  if (!bytes) return null;
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
                                         }
                   
