// components/downloader/YouTubeDownloader.js
// API: https://api.fromscratch.web.id/v1/api/down/youtube?url=query
// Audio: client-side extraction via AudioExtractor (Web Audio API)
import { useState } from 'react';
import AudioExtractor from '../AudioExtractor';

export default function YouTubeDownloader() {
  const [url, setUrl]       = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError]   = useState('');

  const handleDownload = async () => {
    if (!url.trim()) return setError('Masukkan URL YouTube terlebih dahulu.');
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      return setError('URL tidak valid. Pastikan ini link YouTube.');
    }

    setError('');
    setResult(null);
    setLoading(true);

    try {
      const res  = await fetch(`/api/youtube?url=${encodeURIComponent(url.trim())}`);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Gagal memproses URL.');
      setResult(data);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // URL video pertama untuk sumber AudioExtractor
  const firstVideoUrl = result?.formats?.find(f => f.hasAudio)?.url || null;

  return (
    <div>
      {/* Input + tombol */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
        <input
          type="url"
          placeholder="https://www.youtube.com/watch?v=... atau youtu.be/..."
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleDownload()}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <button className="btn-primary" onClick={handleDownload} disabled={loading}>
          {loading ? <span className="spinner" /> : <i className="fa-brands fa-youtube" />}
          {loading ? 'Memproses...' : 'Ambil Info'}
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
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {result.thumbnail && (
              <img
                src={result.thumbnail}
                alt="thumbnail"
                style={{ width: '140px', height: '90px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
              />
            )}
            <div style={{ flex: 1 }}>
              {result.title && (
                <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem', lineHeight: 1.4 }}>
                  {result.title}
                </p>
              )}
              {result.channel && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: '0.4rem' }}>
                  {result.channel}
                </p>
              )}
              {result.duration && (
                <span className="tag">{result.duration}</span>
              )}
            </div>
          </div>

          <hr className="divider" style={{ margin: '1rem 0' }} />

          {/* Format list */}
          {result.formats && result.formats.length > 0 && (
            <div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: '0.75rem' }}>
                Pilih kualitas:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                {result.formats.map((fmt, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.9rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '4px',
                    flexWrap: 'wrap', gap: '0.5rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <i
                        className={`fa-solid ${fmt.hasAudio ? 'fa-film' : 'fa-music'}`}
                        style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}
                      />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                        {fmt.label}
                      </span>
                      {fmt.size && <span className="tag">{fmt.size}</span>}
                    </div>
                    <a
                      href={fmt.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline"
                      style={{ padding: '0.35rem 0.9rem', fontSize: '0.78rem' }}
                      download
                    >
                      <i className="fa-solid fa-download" /> Download
                    </a>
                  </div>
                ))}
              </div>

              {/* Audio extractor */}
              {firstVideoUrl && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: '0.75rem' }}>
                    Download audio saja:
                  </p>
                  <AudioExtractor
                    videoUrl={firstVideoUrl}
                    filename="youtube-audio"
                    label="Extract Audio (.wav)"
                  />
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--gray-600)', marginTop: '0.5rem' }}>
                    <i className="fa-solid fa-circle-info" style={{ marginRight: '0.3rem' }} />
                    Audio diekstrak langsung di browser — format .wav, tanpa API tambahan.
                  </p>
                </div>
              )}
            </div>
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
