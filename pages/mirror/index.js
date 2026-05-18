// pages/mirror/index.js
import Head from 'next/head';
import { useState, useRef } from 'react';
import Layout from '../../components/Layout';
import ToolStats from '../../components/ToolStats';

export default function MirrorPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [used, setUsed] = useState(0);
  const [fileBase64, setFileBase64] = useState(null);
  const [fileMime, setFileMime] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setError('File harus berupa gambar (JPG, PNG, WEBP).');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('Ukuran file maksimal 10MB.');
      return;
    }
    setError('');
    setResult(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
    // Read base64 immediately while file reference is fresh
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      setFileBase64(data.split(',')[1]);
      setFileMime(f.type || 'image/jpeg');
    };
    reader.readAsDataURL(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      if (!fileBase64) throw new Error('File tidak valid, coba upload ulang.');

      const res = await fetch('/api/mirror', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: fileBase64,
          mimeType: fileMime || 'image/jpeg',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan.');
      setResult(data.result);
      setUsed(data.used);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result;
    a.download = 'mirror-meg.jpg';
    a.click();
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError('');
    setFileBase64(null);
    setFileMime(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <Layout>
      <Head><title>Mirror Image — MEG Tools</title></Head>
      <div className="page-wrap">

        <div className="page-header">
          <div className="page-badge">
            <i className="fa-solid fa-wand-magic-sparkles" />
            <span>AI TOOLS</span>
          </div>
          <h1 className="page-title">Mirror Image</h1>
          <p className="page-subtitle">
            Upload fotomu dan AI akan generate versi mirror selfie MacBook
          </p>
        </div>

        <div className="limit-box">
          <i className="fa-solid fa-clock" />
          {' '}Limit: {used}/3 per hari
        </div>

        {!preview && (
          <div
            className={'drop-zone' + (dragging ? ' drop-zone--active' : '')}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <div className="drop-icon">
              <i className="fa-solid fa-cloud-arrow-up" />
            </div>
            <p className="drop-title">Tap atau drag foto ke sini</p>
            <p className="drop-sub">JPG, PNG, WEBP · Maks 10MB</p>
          </div>
        )}

        {preview && !result && !loading && (
          <div className="preview-section">
            <div className="card-title">
              <i className="fa-solid fa-image" /> PREVIEW
            </div>
            <div className="preview-wrap">
              <img src={preview} alt="Preview" className="preview-img" />
            </div>
            <div className="action-row">
              <button className="btn-outline" onClick={handleReset}>
                <i className="fa-solid fa-rotate-left" /> Ganti Foto
              </button>
              <button className="btn-primary" onClick={handleSubmit}>
                <i className="fa-solid fa-wand-magic-sparkles" /> Generate
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="loading-box">
            <span className="spinner" />
            <span>AI sedang memproses foto... bisa 15-30 detik</span>
          </div>
        )}

        {error && (
          <div className="alert-error">
            <i className="fa-solid fa-circle-exclamation" /> {error}
            {preview && !loading && (
              <button className="retry-btn" onClick={handleSubmit}>
                <i className="fa-solid fa-rotate-right" /> Coba Lagi
              </button>
            )}
          </div>
        )}

        {result && (
          <div className="result-section">
            <div className="card-title">
              <i className="fa-solid fa-check-circle" /> HASIL
            </div>
            <div className="result-img-wrap">
              <img src={result} alt="Mirror Result" className="result-img" />
            </div>
            <div className="limit-used">
              Sisa hari ini: {3 - used}x lagi
            </div>
            <div className="action-row">
              <button className="btn-outline" onClick={handleReset}>
                <i className="fa-solid fa-rotate-left" /> Foto Baru
              </button>
              <button className="btn-primary" onClick={handleDownload}>
                <i className="fa-solid fa-download" /> Download
              </button>
            </div>
          </div>
        )}

        <div style={{
          '--gray-400': 'var(--muted)',
          '--gray-600': 'var(--border)',
          '--white': 'var(--text)',
        }}>
          <ToolStats toolId="mirror" />
        </div>

      </div>

      <style jsx>{`
        .page-wrap {
          max-width:680px;
          margin:0 auto;
          padding:80px 16px 60px;
          min-height:100vh;
        }
        .page-header { margin-bottom:16px; }
        .page-badge {
          display:inline-flex;
          align-items:center;
          gap:6px;
          padding:4px 10px;
          border:1.5px solid var(--border);
          font-family:var(--font-mono);
          font-size:0.6rem;
          letter-spacing:3px;
          color:var(--muted);
          text-transform:uppercase;
          margin-bottom:10px;
        }
        .page-title {
          font-size:1.6rem;
          font-weight:700;
          color:var(--text);
          margin-bottom:4px;
        }
        .page-subtitle { font-size:0.85rem; color:var(--muted); }
        .limit-box {
          padding:10px 14px;
          border:1.5px solid var(--border);
          font-family:var(--font-mono);
          font-size:0.72rem;
          color:var(--muted);
          letter-spacing:1px;
          margin-bottom:16px;
          background:var(--surface);
        }
        .drop-zone {
          border:2px dashed var(--border);
          padding:48px 24px;
          text-align:center;
          cursor:pointer;
          transition:all 0.15s;
          background:var(--surface);
          box-shadow:var(--shadow);
          margin-bottom:16px;
        }
        .drop-zone:hover, .drop-zone--active {
          border-style:solid;
          border-color:var(--text);
          transform:translate(-2px,-2px);
          box-shadow:var(--shadow-lg);
        }
        .drop-icon {
          font-size:2.4rem;
          color:var(--muted);
          margin-bottom:12px;
          opacity:0.6;
        }
        .drop-title {
          font-family:var(--font-display);
          font-size:1rem;
          font-weight:700;
          letter-spacing:2px;
          text-transform:uppercase;
          color:var(--text);
          margin-bottom:6px;
        }
        .drop-sub {
          font-family:var(--font-mono);
          font-size:0.72rem;
          color:var(--muted);
          letter-spacing:1px;
        }
        .preview-section, .result-section {
          background:var(--surface);
          border:2px solid var(--border);
          box-shadow:var(--shadow);
          padding:16px;
          margin-bottom:16px;
        }
        .preview-wrap, .result-img-wrap {
          width:100%;
          display:flex;
          align-items:center;
          justify-content:center;
          background:var(--bg2);
          margin-bottom:16px;
          padding:12px;
        }
        .preview-img, .result-img {
          max-width:100%;
          object-fit:contain;
          display:block;
        }
        .loading-box {
          display:flex;
          align-items:center;
          gap:12px;
          padding:16px;
          border:2px solid var(--border);
          background:var(--surface);
          font-family:var(--font-mono);
          font-size:0.78rem;
          color:var(--muted);
          letter-spacing:1px;
          margin-bottom:16px;
          box-shadow:var(--shadow);
        }
        .alert-error {
          display:flex;
          flex-direction:column;
          gap:8px;
          padding:14px 16px;
          background:rgba(248,113,113,0.1);
          border-left:4px solid #f87171;
          color:#f87171;
          font-size:0.82rem;
          margin-bottom:16px;
          font-family:var(--font-mono);
        }
        .retry-btn {
          display:inline-flex;
          align-items:center;
          gap:6px;
          background:none;
          border:1px solid #f87171;
          color:#f87171;
          padding:5px 12px;
          font-size:0.72rem;
          font-family:var(--font-mono);
          cursor:pointer;
          letter-spacing:1px;
          width:fit-content;
        }
        .limit-used {
          font-family:var(--font-mono);
          font-size:0.7rem;
          color:var(--muted);
          letter-spacing:1px;
          margin-bottom:12px;
        }
        .action-row { display:flex; gap:10px; }
        .action-row .btn-outline { flex:1; justify-content:center; }
        .action-row .btn-primary { flex:2; justify-content:center; }
        @media (max-width:400px) {
          .action-row { flex-direction:column; }
        }
      `}</style>
    </Layout>
  );
              }
              
