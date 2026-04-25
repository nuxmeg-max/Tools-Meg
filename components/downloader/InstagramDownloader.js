// components/downloader/InstagramDownloader.js
// API: https://api.fromscratch.web.id/v1/api/down/instagram?url=query
// Audio: client-side extraction via AudioExtractor (Web Audio API)
import { useState } from 'react';
import AudioExtractor from '../AudioExtractor';

export default function InstagramDownloader() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    if (!url.trim()) return setError('Masukkan URL Instagram terlebih dahulu.');
    if (!url.includes('instagram.com')) return setError('URL tidak valid. Pastikan ini link Instagram.');

    setError('');
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/instagram?url=${encodeURIComponent(url.trim())}`);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Gagal memproses URL.');
      setResult(data);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Cari video URL pertama dari items untuk sumber audio
  const firstVideoUrl = result
    ? (result.type === 'video' ? result.url : null)
      || result.items?.find(i => i.type === 'video')?.url
      || null
    : null;

  return (
    <div>
      {/* Input + tombol */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
        <input
          type="url"
          placeholder="https://www.instagram.com/p/... atau /reel/..."
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleDownload()}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <button className="btn-primary" onClick={handleDownload} disabled={loading}>
          {loading ? <span className="spinner" /> : <i className="fa-brands fa-instagram" />}
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

          {/* ── CASE A: Carousel (multiple items) ── */}
          {result.items && result.items.length > 0 ? (
            <div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--gray-400)', marginBottom: '1rem' }}>
                {result.items.length} media ditemukan
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {result.items.map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '0.75rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '4px',
                    flexWrap: 'wrap',
                  }}>
                    {item.thumbnail && (
                      <img src={item.thumbnail} alt="" style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '3px', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: '120px' }}>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--gray-400)', marginBottom: '0.4rem' }}>
                        <i className={`fa-solid ${item.type === 'video' ? 'fa-video' : 'fa-image'}`} style={{ marginRight: '0.3rem' }} />
                        {item.type === 'video' ? 'Video' : 'Foto'} #{i + 1}
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-outline"
                          style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem' }}
                          download
                        >
                          <i className="fa-solid fa-download" /> Download
                        </a>
                        {/* Audio extractor hanya untuk item video */}
                        {item.type === 'video' && (
                          <AudioExtractor
                            videoUrl={item.url}
                            filename={`ig-audio-${i + 1}`}
                            label="Audio"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          ) : result.url ? (
            /* ── CASE B: Single media ── */
            <div>
              {result.thumbnail && (
                <img
                  src={result.thumbnail}
                  alt=""
                  style={{ maxWidth: '220px', borderRadius: '4px', marginBottom: '1rem', display: 'block' }}
                />
              )}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  download
                >
                  <i className="fa-solid fa-download" />
                  Download {result.type === 'video' ? 'Video' : 'Foto'}
                </a>

                {/* Audio — jika API return URL langsung */}
                {result.audio && (
                  <a href={result.audio} target="_blank" rel="noopener noreferrer" className="btn-outline" download>
                    <i className="fa-solid fa-music" /> Audio
                  </a>
                )}

                {/* Audio extractor jika video dan tidak ada audio URL */}
                {result.type === 'video' && !result.audio && (
                  <AudioExtractor
                    videoUrl={result.url}
                    filename="ig-audio"
                    label="Extract Audio (.wav)"
                  />
                )}
              </div>

              {result.type === 'video' && !result.audio && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--gray-600)', marginTop: '0.75rem' }}>
                  <i className="fa-solid fa-circle-info" style={{ marginRight: '0.3rem' }} />
                  Audio diekstrak langsung di browser — hasilnya format .wav.
                </p>
              )}
            </div>
          ) : null}
        </div>
      )}

      <div className="alert alert-info" style={{ marginTop: '1rem' }}>
        <i className="fa-solid fa-lock" style={{ marginRight: '0.4rem' }} />
        Hanya bisa download konten publik. Akun private tidak didukung.
      </div>
    </div>
  );
}
