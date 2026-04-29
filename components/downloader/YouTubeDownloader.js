// components/downloader/YouTubeDownloader.js
import { useState } from 'react';

const VIDEO_QUALITIES = ['1080', '720', '480'];
const AUDIO_QUALITIES = ['320', '128'];

export default function YouTubeDownloader() {
  const [url, setUrl]         = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState('');
  const [mediaType, setMediaType] = useState('mp4'); // mp4 atau mp3
  const [quality, setQuality]     = useState('720');

  const handleTypeChange = (type) => {
    setMediaType(type);
    setQuality(type === 'mp4' ? '720' : '320');
    setResult(null);
    setError('');
  };

  const handleDownload = async () => {
    if (!url.trim()) return setError('Masukkan URL YouTube terlebih dahulu.');
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      return setError('URL tidak valid. Pastikan ini link YouTube.');
    }

    setError('');
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch(
        `/api/youtube?url=${encodeURIComponent(url.trim())}&type=${mediaType}&format=${quality}`
      );
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Gagal memproses URL.');
      if (!data.download_url) throw new Error('Tidak ada URL download tersedia. Coba quality lain.');
      setResult(data);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* URL Input */}
      <input
        type="url"
        placeholder="https://www.youtube.com/watch?v=... atau youtu.be/..."
        value={url}
        onChange={e => { setUrl(e.target.value); setResult(null); setError(''); }}
        onKeyDown={e => e.key === 'Enter' && handleDownload()}
        style={{ width: '100%', marginBottom: '0.75rem' }}
      />

      {/* Type selector: MP4 / MP3 */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {['mp4', 'mp3'].map(t => (
          <button
            key={t}
            onClick={() => handleTypeChange(t)}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '8px',
              border: `1px solid ${mediaType === t ? 'var(--text)' : 'var(--border)'}`,
              background: mediaType === t ? 'var(--text)' : 'transparent',
              color: mediaType === t ? 'var(--bg)' : 'var(--muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              fontWeight: mediaType === t ? 700 : 400,
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}
          >
            <i className={`fa-solid ${t === 'mp4' ? 'fa-film' : 'fa-music'}`} />
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Quality selector */}
      <div style={{ marginBottom: '0.75rem' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>
          {mediaType === 'mp4' ? 'Kualitas Video' : 'Kualitas Audio (kbps)'}
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {(mediaType === 'mp4' ? VIDEO_QUALITIES : AUDIO_QUALITIES).map(q => (
            <button
              key={q}
              onClick={() => setQuality(q)}
              style={{
                padding: '0.35rem 0.9rem',
                borderRadius: '100px',
                border: `1px solid ${quality === q ? 'var(--text)' : 'var(--border)'}`,
                background: quality === q ? 'var(--text)' : 'transparent',
                color: quality === q ? 'var(--bg)' : 'var(--muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {mediaType === 'mp4' ? `${q}p` : `${q}kbps`}
            </button>
          ))}
        </div>
      </div>

      {/* Download button */}
      <button className="btn-primary" onClick={handleDownload} disabled={loading} style={{ width: '100%', marginBottom: '0.75rem' }}>
        {loading ? <span className="spinner" /> : <i className="fa-brands fa-youtube" />}
        {loading ? 'Memproses...' : 'Download'}
      </button>

      {/* Error */}
      {error && (
        <div className="alert alert-error">
          <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '0.4rem' }} />
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="result-box">
          {/* Info video */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {result.thumbnail && (
              <img
                src={result.thumbnail}
                alt="thumbnail"
                style={{ width: '140px', height: '90px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              {result.title && (
                <p style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.4rem', lineHeight: 1.4, wordBreak: 'break-word' }}>
                  {result.title}
                </p>
              )}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span className="tag">
                  <i className={`fa-solid ${result.type === 'mp3' ? 'fa-music' : 'fa-film'}`} />
                  {' '}{result.type?.toUpperCase()}
                </span>
                <span className="tag">
                  {result.type === 'mp3' ? `${result.quality}kbps` : `${result.quality}p`}
                </span>
              </div>
            </div>
          </div>

          {/* Download button */}
          {result.download_url && (
            <a
              href={result.download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', padding: '0.7rem' }}
              download
            >
              <i className="fa-solid fa-download" />
              Download {result.type?.toUpperCase()} {result.type === 'mp3' ? `${result.quality}kbps` : `${result.quality}p`}
            </a>
          )}
        </div>
      )}

      <div className="alert alert-info" style={{ marginTop: '1rem' }}>
        <i className="fa-solid fa-circle-info" style={{ marginRight: '0.4rem' }} />
        Download hanya untuk konten yang bebas hak cipta atau milik sendiri.
      </div>
    </div>
  );
}
