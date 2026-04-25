// components/downloader/TikTokDownloader.js
// API: https://api.fromscratch.web.id/v1/api/down/tiktok?url=query
// Audio: client-side extraction via AudioExtractor (Web Audio API)
import { useState } from 'react';
import AudioExtractor from '../AudioExtractor';

export default function TikTokDownloader() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    if (!url.trim()) return setError('Masukkan URL TikTok terlebih dahulu.');
    if (!url.includes('tiktok.com')) return setError('URL tidak valid. Pastikan ini link TikTok.');

    setError('');
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/tiktok?url=${encodeURIComponent(url.trim())}`);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Gagal memproses URL.');
      setResult(data);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // URL video terbaik yang tersedia untuk dijadikan sumber audio
  const bestVideoUrl = result?.video_nowm || result?.video_wm || null;

  return (
    <div>
      {/* Input + tombol */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
        <input
          type="url"
          placeholder="https://www.tiktok.com/@user/video/..."
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleDownload()}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <button className="btn-primary" onClick={handleDownload} disabled={loading}>
          {loading ? <span className="spinner" /> : <i className="fa-solid fa-download" />}
          {loading ? 'Memproses...' : 'Download'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '0.4rem' }} />
          {error}
        </div>
      )}

      {result && (
        <div className="result-box">
          {/* Info video */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {result.thumbnail && (
              <img
                src={result.thumbnail}
                alt="thumbnail"
                style={{ width: '90px', height: '120px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
              />
            )}
            <div style={{ flex: 1 }}>
              {result.title && (
                <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem', lineHeight: 1.4 }}>
                  {result.title}
                </p>
              )}
              {result.author && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: '0.4rem' }}>
                  @{result.author}
                </p>
              )}
              {result.duration && (
                <span className="tag">{result.duration}s</span>
              )}
            </div>
          </div>

          <hr className="divider" style={{ margin: '1rem 0' }} />

          {/* Download buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-start' }}>
            {/* Video tanpa watermark */}
            {result.video_nowm && (
              <a
                href={result.video_nowm}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                download="tiktok-video.mp4"
              >
                <i className="fa-solid fa-video" /> Video (No WM)
              </a>
            )}

            {/* Video dengan watermark */}
            {result.video_wm && (
              <a
                href={result.video_wm}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
                download="tiktok-video-wm.mp4"
              >
                <i className="fa-solid fa-video" /> Video (WM)
              </a>
            )}

            {/* Audio — jika API return URL langsung */}
            {result.audio && (
              <a
                href={result.audio}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
                download="tiktok-audio.mp3"
              >
                <i className="fa-solid fa-music" /> Audio
              </a>
            )}

            {/* Audio extractor — jika API tidak return audio URL */}
            {!result.audio && bestVideoUrl && (
              <AudioExtractor
                videoUrl={bestVideoUrl}
                filename="tiktok-audio"
                label="Extract Audio (.wav)"
              />
            )}
          </div>

          {/* Catatan audio extractor */}
          {!result.audio && bestVideoUrl && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--gray-600)', marginTop: '0.75rem' }}>
              <i className="fa-solid fa-circle-info" style={{ marginRight: '0.3rem' }} />
              Audio diekstrak langsung di browser — hasilnya format .wav. Proses tergantung ukuran video.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
