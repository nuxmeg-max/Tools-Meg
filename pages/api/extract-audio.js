// pages/api/extract-audio.js
// Karena API fromscratch tidak return audio URL untuk TikTok/IG,
// kita proxy video URL-nya ke client sebagai binary stream.
// Ekstraksi audio MP3 dilakukan di browser via Web Audio API (AudioExtractor.js)
// Route ini hanya dipakai untuk PROXY video agar bisa di-fetch cross-origin.

export const config = {
  api: {
    responseLimit: false, // allow large binary response
  },
};

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL diperlukan.' });

  // Whitelist domain yang boleh di-proxy (keamanan)
  const ALLOWED_DOMAINS = [
    'api.fromscratch.web.id',
    'tikwm.com',
    'tiktok.com',
    'cdninstagram.com',
    'instagram.com',
    'fbcdn.net',
    'scontent',
    'video.xx.fbcdn.net',
  ];

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return res.status(400).json({ error: 'URL tidak valid.' });
  }

  const isAllowed = ALLOWED_DOMAINS.some(d => parsedUrl.hostname.includes(d));
  if (!isAllowed) {
    return res.status(403).json({ error: 'Domain tidak diizinkan untuk di-proxy.' });
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.tiktok.com/',
        'Accept': 'video/*, */*',
      },
    });

    if (!upstream.ok) {
      throw new Error(`Upstream server merespons ${upstream.status}`);
    }

    const contentType = upstream.headers.get('content-type') || 'video/mp4';
    const contentLength = upstream.headers.get('content-length');

    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (contentLength) res.setHeader('Content-Length', contentLength);
    res.setHeader('Cache-Control', 'public, max-age=3600');

    // Stream body langsung ke response
    const reader = upstream.body.getReader();
    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
      res.end();
    };
    await pump();

  } catch (err) {
    console.error('[Extract Audio Proxy Error]', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || 'Gagal mem-proxy video.' });
    }
  }
}
