// pages/fakegame/index.js
import Head from 'next/head';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import ToolStats from '../../components/ToolStats';

const TABS = [
  { id: 'ff', label: 'Free Fire', icon: 'fa-solid fa-fire', iconColor: '#ff6b2b' },
  { id: 'ml', label: 'Mobile Legends', icon: 'fa-solid fa-dragon', iconColor: '#3b82f6' },
];

const BG_COUNT = 60;

export default function FakeGamePage() {
  const router = useRouter();
  const [tab, setTab]           = useState('ff');
  const [text, setText]         = useState('');
  const [bg, setBg]             = useState('1');
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    if (router.query.tab === 'ml') setTab('ml');
    if (router.query.tab === 'ff') setTab('ff');
  }, [router.query.tab]);

  const handleFile = (f) => {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return setError('Ukuran foto maksimal 5MB.');
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

  const handleTabChange = (id) => {
    setTab(id);
    setText('');
    setBg('1');
    setFile(null);
    setPreview(null);
    setResult(null);
    setError('');
  };

  const handleGenerate = async () => {
    if (!text.trim()) return setError('Masukkan nama pemain/hero terlebih dahulu.');
    if (tab === 'ml' && !file) return setError('Upload foto hero terlebih dahulu.');

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('game', tab);
      formData.append('text', text.trim());

      if (tab === 'ff') {
        formData.append('bg', bg);
        formData.append('file', new Blob([]), 'dummy.txt');
      }

      if (tab === 'ml') {
        formData.append('file', file);
      }

      const res = await fetch('/api/fakegame', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Gagal generate gambar.');
      }

      const imgUrl = data.image || data.url || data.result || data.data?.image || null;
      if (!imgUrl) throw new Error('Tidak ada gambar di respons API.');

      setResult(imgUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setText('');
    setBg('1');
    setFile(null);
    setPreview(null);
    setResult(null);
    setError('');
  };

  return (
    <Layout>
      <Head>
        <title>{tab === 'ff' ? 'Fake Free Fire' : 'Fake Mobile Legends'} | Meg Tools</title>
        <meta name="description" content="Buat kartu profil palsu Free Fire & Mobile Legends" />
      </Head>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            lineHeight: 1,
            marginBottom: '0.5rem',
          }}>
            {tab === 'ff' ? 'Fake Free Fire' : 'Fake Mobile Legends'}
          </h1>
          <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
            {tab === 'ff'
              ? 'Buat kartu profil palsu Free Fire dengan 60 pilihan background'
              : 'Buat kartu profil palsu Mobile Legends dengan foto hero'}
          </p>
        </div>

        <ToolStats toolId={tab === 'ff' ? 'fakeff' : 'fakeml'} />

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          borderBottom: '2px solid var(--border)',
        }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              style={{
                padding: '0.6rem 1.2rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                border: '2px solid var(--border)',
                borderBottom: tab === t.id ? '2px solid var(--bg)' : '2px solid var(--border)',
                background: tab === t.id ? 'var(--bg)' : 'var(--surface)',
                color: tab === t.id ? 'var(--text)' : 'var(--muted)',
                marginBottom: '-2px',
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <i className={t.icon} style={{ color: t.iconColor }} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={{
          border: '2px solid var(--border)',
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-lg)',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}>

          {/* Input Nama */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              display: 'block',
              marginBottom: '0.5rem',
              color: 'var(--muted)',
            }}>
              {tab === 'ff' ? 'NAMA Player' : 'NAMA Player'}
            </label>
            <input
              type="text"
              placeholder={tab === 'ff' ? 'Masukin nama Player' : 'Masukin nama Player'}
              value={text}
              onChange={e => setText(e.target.value)}
              maxLength={32}
            />
          </div>

          {/* FF: Pilih Background */}
          {tab === 'ff' && (
            <div>
              <label style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                display: 'block',
                marginBottom: '0.75rem',
                color: 'var(--muted)',
              }}>
                ★ PILIH BACKGROUND (1–60) —{' '}
                <span style={{ color: 'var(--text)' }}>TERPILIH: BG {bg}</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {Array.from({ length: BG_COUNT }, (_, i) => String(i + 1)).map(num => (
                  <button
                    key={num}
                    onClick={() => setBg(num)}
                    style={{
                      width: 40,
                      height: 32,
                      border: '2px solid var(--border)',
                      background: bg === num ? 'var(--text)' : 'var(--bg2)',
                      color: bg === num ? 'var(--bg)' : 'var(--text)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.1s',
                      lineHeight: 1,
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ML: Upload Foto Hero */}
          {tab === 'ml' && (
            <div>
              <label style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--muted)',
              }}>
                ★ UPLOAD FOTO HERO
              </label>
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${dragging ? 'var(--text)' : 'var(--border)'}`,
                  background: dragging ? 'var(--bg2)' : 'var(--bg)',
                  padding: '2rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {preview ? (
                  <div>
                    <img
                      src={preview}
                      alt="preview"
                      style={{
                        maxHeight: 180,
                        maxWidth: '100%',
                        objectFit: 'contain',
                        display: 'block',
                        margin: '0 auto',
                        border: '2px solid var(--border)',
                      }}
                    />
                    <p style={{
                      marginTop: '0.5rem',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--muted)',
                    }}>
                      {file?.name} — Klik untuk ganti
                    </p>
                  </div>
                ) : (
                  <>
                    <i className="fa-solid fa-cloud-arrow-up" style={{
                      fontSize: '2rem',
                      color: 'var(--muted)',
                      marginBottom: '0.75rem',
                      display: 'block',
                    }} />
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--muted)' }}>
                      Drag & drop atau klik untuk upload foto hero
                    </p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                      JPG, PNG, WEBP — maks 5MB
                    </p>
                  </>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={e => handleFile(e.target.files[0])}
                />
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            border: '2px solid #ef4444',
            background: 'rgba(239,68,68,0.08)',
            color: '#ef4444',
            padding: '0.75rem 1rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            marginBottom: '1rem',
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.875rem',
            background: loading ? 'var(--muted)' : 'var(--text)',
            color: 'var(--bg)',
            border: '2px solid var(--border)',
            boxShadow: loading ? 'none' : 'var(--shadow)',
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: '1.1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.15s',
            marginBottom: '1.5rem',
          }}
        >
          {loading ? (
            <>
              <i className="fa-solid fa-spinner fa-spin" />
              Generating...
            </>
          ) : (
            <>
              <i className="fa-solid fa-wand-magic-sparkles" />
              Generate {tab === 'ff' ? 'Fake FF' : 'Fake ML'}
            </>
          )}
        </button>

        {/* Result */}
        {result && (
          <div style={{
            border: '2px solid var(--border)',
            background: 'var(--surface)',
            boxShadow: 'var(--shadow-lg)',
            padding: '1.5rem',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: '1.2rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1rem',
            }}>
              ✓ Hasil Generate
            </h2>
            <img
              src={result}
              alt="Fake Game Card"
              style={{
                width: '100%',
                border: '2px solid var(--border)',
                display: 'block',
                marginBottom: '1rem',
              }}
            />
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a
                href={result}
                download={`fake-${tab}-${text}.png`}
                style={{
                  flex: 1,
                  minWidth: 120,
                  padding: '0.6rem 1rem',
                  background: 'var(--text)',
                  color: 'var(--bg)',
                  border: '2px solid var(--border)',
                  boxShadow: 'var(--shadow)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                <i className="fa-solid fa-download" />
                Download
              </a>
              <button
                onClick={handleReset}
                style={{
                  flex: 1,
                  minWidth: 120,
                  padding: '0.6rem 1rem',
                  background: 'var(--bg2)',
                  color: 'var(--text)',
                  border: '2px solid var(--border)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                <i className="fa-solid fa-rotate-left" />
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
