// pages/remove-bg/index.js
// Foto: remove.bg API (50 foto/bulan gratis)
// Video: info bahwa butuh plan berbayar remove.bg
import Head from 'next/head';
import { useState, useRef } from 'react';
import Layout from '../../components/Layout';
import ToolStats from '../../components/ToolStats';

const TABS = [
  { id: 'photo', label: 'Foto', icon: 'fa-image', accept: 'image/png,image/jpeg,image/webp', hint: 'JPG, PNG, WEBP — maks 12MB' },
  { id: 'video', label: 'Video', icon: 'fa-video', accept: null, hint: null },
];

export default function RemoveBgPage() {
  const [tab, setTab]       = useState('photo');
  const [file, setFile]     = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const currentTab = TABS.find(t => t.id === tab);

  const handleFile = (f) => {
    if (!f) return;
    // Validasi ukuran maks 12MB
    if (f.size > 12 * 1024 * 1024) {
      return setError('Ukuran file maksimal 12MB.');
    }
    setError('');
    setResult(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleProcess = async () => {
    if (!file) return setError('Upload foto terlebih dahulu.');
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'photo');

      const res  = await fetch('/api/remove-bg', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok || data.error) throw new Error(data.error || 'Gagal memproses foto.');
      setResult(data.result_url);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <Layout>
      <Head><title>Meg — Remove Background</title></Head>
      <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '720px' }}>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <p className="tag" style={{ marginBottom: '1rem' }}>AI Tool</p>
          <h1 className="section-title">Remove Background</h1>
          <p className="section-sub">Hapus latar belakang foto secara otomatis dengan AI.</p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '4px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '6px', padding: '4px',
          width: 'fit-content', marginBottom: '1.5rem',
        }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); reset(); }}
              style={{
                padding: '0.5rem 1.2rem', borderRadius: '4px',
                fontSize: '0.85rem', fontWeight: 600,
                fontFamily: 'var(--font-display)',
                background: tab === t.id ? 'var(--white)' : 'transparent',
                color: tab === t.id ? 'var(--black)' : 'var(--gray-400)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                transition: 'all 0.15s',
              }}
            >
              <i className={`fa-solid ${t.icon}`} />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB VIDEO: info saja ── */}
        {tab === 'video' && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <i className="fa-solid fa-video" style={{ fontSize: '2.5rem', color: 'var(--gray-600)', display: 'block', marginBottom: '1rem' }} />
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Remove BG Video</h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--gray-400)', lineHeight: 1.7, maxWidth: '380px', margin: '0 auto 1.5rem' }}>
              Fitur ini memerlukan plan berbayar di remove.bg. Upgrade akun kamu untuk menggunakannya.
            </p>
            <a
              href="https://www.remove.bg/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              <i className="fa-solid fa-arrow-up-right-from-square" /> Lihat Pricing remove.bg
            </a>
          </div>
        )}

        {/* ── TAB FOTO ── */}
        {tab === 'photo' && (
          <>
            {/* Upload area */}
            {!file ? (
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current.click()}
                style={{
                  border: `2px dashed ${dragging ? 'var(--white)' : 'var(--gray-600)'}`,
                  borderRadius: '6px',
                  padding: '3.5rem 2rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                  background: dragging ? 'rgba(255,255,255,0.02)' : 'transparent',
                }}
              >
                <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '2.5rem', color: 'var(--gray-600)', marginBottom: '1rem', display: 'block' }} />
                <p style={{ fontWeight: 700, marginBottom: '0.4rem' }}>Drag & drop foto di sini</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--gray-400)' }}>
                  atau klik untuk browse &mdash; JPG, PNG, WEBP &mdash; maks 12MB
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept={currentTab.accept}
                  style={{ display: 'none' }}
                  onChange={e => handleFile(e.target.files[0])}
                />
              </div>
            ) : (
              <div>
                {/* Before / After preview */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: result ? '1fr 1fr' : '1fr',
                  gap: '1rem',
                  marginBottom: '1.25rem',
                }}>
                  {/* Original */}
                  <div>
                    <p className="tag" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>Original</p>
                    <img
                      src={preview}
                      alt="original"
                      style={{ width: '100%', borderRadius: '4px', display: 'block', objectFit: 'contain', maxHeight: '400px' }}
                    />
                  </div>

                  {/* Hasil */}
                  {result && (
                    <div>
                      <p className="tag" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>Hasil</p>
                      {/* Checkerboard background untuk tampilkan transparansi */}
                      <div style={{
                        borderRadius: '4px', overflow: 'hidden',
                        backgroundImage: 'repeating-conic-gradient(#2a2a2a 0% 25%, #1a1a1a 0% 50%)',
                        backgroundSize: '16px 16px',
                      }}>
                        <img
                          src={result}
                          alt="result"
                          style={{ width: '100%', display: 'block', objectFit: 'contain', maxHeight: '400px' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {!result ? (
                    <button className="btn-primary" onClick={handleProcess} disabled={loading}>
                      {loading
                        ? <><span className="spinner" /> Memproses...</>
                        : <><i className="fa-solid fa-wand-magic-sparkles" /> Remove Background</>
                      }
                    </button>
                  ) : (
                    <a href={result} download="meg-nobg.png" className="btn-primary">
                      <i className="fa-solid fa-download" /> Download PNG
                    </a>
                  )}
                  <button className="btn-outline" onClick={reset}>
                    <i className="fa-solid fa-rotate-left" /> Reset
                  </button>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="alert alert-error" style={{ marginTop: '1rem' }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '0.4rem' }} />
                {error}
              </div>
            )}

            {/* Loading info */}
            {loading && (
              <div className="alert alert-info" style={{ marginTop: '1rem' }}>
                <i className="fa-solid fa-gear fa-spin" style={{ marginRight: '0.4rem' }} />
                AI sedang menghapus background... biasanya kurang dari 5 detik.
              </div>
            )}

            {/* Info box */}
            <div className="alert alert-info" style={{ marginTop: '1.5rem' }}>
              <i className="fa-solid fa-circle-info" style={{ marginRight: '0.4rem' }} />
              Menggunakan <strong>remove.bg API</strong> — 50 foto/bulan gratis.
              Setup: tambahkan <code style={{ background: 'rgba(255,255,255,0.06)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>REMOVE_BG_API_KEY</code> di Vercel Environment Variables.{' '}
              <a href="https://www.remove.bg/api" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--white)', textDecoration: 'underline' }}>
                Daftar di sini →
              </a>
            </div>
          </>
        )}

      <ToolStats toolId="remove-bg" />
      </div>
    </Layout>
  );
}
