// components/downloader/SpotifyDownloader.js
import { useState } from 'react';

export default function SpotifyDownloader() {
  const [url, setUrl]         = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState('');

  const handleDownload = async () => {
    if (!url.trim()) return setError('Masukkan URL Spotify terlebih dahulu.');
    if (!url.includes('spotify.com')) return setError('URL tidak valid. Pastikan ini link Spotify.');
    setError(''); setResult(null); setLoading(true);
    try {
      const res  = await fetch(`/api/spotify?url=${encodeURIComponent(url.trim())}`);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Gagal memproses URL.');
      setResult(data);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
        <input
          type="url"
          placeholder="https://open.spotify.com/track/..."
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleDownload()}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <button className="btn-primary" onClick={handleDownload} disabled={loading}>
          {loading ? <span className="spinner" /> : <i className="fa-brands fa-spotify" />}
          {loading ? 'MEMPROSES...' : 'DOWNLOAD'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '0.4rem' }} />{error}
        </div>
      )}

      {result && (
        <div className="result-box">
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {result.cover && (
              <img src={result.cover} alt="cover" style={{ width: '80px', height: '80px', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--gray-800)' }} />
            )}
            <div style={{ flex: 1 }}>
              {result.title && (
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.55rem', letterSpacing: '0.05em', marginBottom: '0.4rem', lineHeight: 1.8, color: 'var(--white)' }}>
                  {result.title}
                </p>
              )}
              {result.artist && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: '0.25rem' }}>
                  <i className="fa-solid fa-microphone" style={{ marginRight: '0.3rem' }} />{result.artist}
                </p>
              )}
              {result.album && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                  <i className="fa-solid fa-record-vinyl" style={{ marginRight: '0.3rem' }} />{result.album}
                </p>
              )}
              {result.duration && <span className="tag" style={{ marginTop: '0.5rem', display: 'inline-block' }}>{result.duration}</span>}
            </div>
          </div>
          <hr className="divider" style={{ margin: '1rem 0' }} />
          <a href={result.audio} target="_blank" rel="noopener noreferrer" className="btn-primary" download>
            <i className="fa-solid fa-music" /> DOWNLOAD MP3
          </a>
        </div>
      )}

      <div className="alert alert-info" style={{ marginTop: '1rem' }}>
        <i className="fa-solid fa-circle-info" style={{ marginRight: '0.4rem' }} />
        Support: track, album, playlist Spotify.
      </div>
    </div>
  );
}
