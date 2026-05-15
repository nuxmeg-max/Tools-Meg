// pages/mirror/index.js
import Head from 'next/head';
import { useState, useRef } from 'react';
import Layout from '../../components/Layout';

export default function MirrorPage() {
  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState(null);
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [dragging, setDragging]   = useState(false);
  const inputRef                  = useRef(null);

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
      const form = new FormData();
      form.append('file', file);

      const res = await fetch('/api/tomirror', { method: 'POST', body: form });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan.');
      setResult(data.result_url);
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
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <Layout>
      <Head><title>Mirror Image — MEG Tools</title></Head>

      <div className="page-wrap">

        {/* Header */}
        <div className="page-header">
          <div className="page-badge">
            <i className="fa-solid fa-left-right" />
            <span>IMAGE FILTER</span>
          </div>
          <h1 className="page-title">Mirror Image</h1>
          <p className="page-subtitle">Ubah gambarmu menjadi efek mirror + iPhone frame secara otomatis</p>
        </div>

        {/* Upload Area */}
        {!preview && (
          <div
            className={`drop-zone${dragging ? ' drop-zone--active' : ''}`}
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

        {/* Preview + Action */}
        {preview && !result && (
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
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading
                  ? <><span className="spinner" /> Memproses...</>
                  : <><i className="fa-solid fa-left-right" /> Buat Mirror</>
                }
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="alert alert-error">
            <i className="fa-solid fa-circle-exclamation" /> {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="loading-box">
            <span className="spinner" />
            <span>Sedang memproses gambar... mohon tunggu</span>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="result-section">
            <div className="card-title">
              <i className="fa-solid fa-check-circle" /> HASIL
            </div>
            <div className="result-img-wrap">
              <img src={result} alt="Mirror Result" className="result-img" />
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

        {/* Info */}
        <div className="info-box">
          <div className="card-title">
            <i className="fa-solid fa-circle-info" /> INFO
          </div>
          <ul className="info-list">
            <li><i className="fa-solid fa-check" /> Gambar diproses dengan efek mirror otomatis</li>
            <li><i className="fa-solid fa-check" /> Ditambahkan frame iPhone untuk tampilan lebih keren</li>
            <li><i className="fa-solid fa-check" /> Cocok untuk foto profil, konten sosmed</li>
            <li><i className="fa-solid fa-check" /> Gratis tanpa batas</li>
          </ul>
        </div>

      </div>

      <style jsx>{`
        .page-wrap {
          max-width: 680px;
          margin: 0 auto;
          padding: 80px 16px 60px;
          min-height: 100vh;
        }

        .page-header { margin-bottom: 24px; }

        .page-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border: 1.5px solid var(--border);
          font-family: var(--font-mono);
          font-size: 0.6rem;
          letter-spacing: 3px;
          color: var(--muted);
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .page-badge i { font-size: 0.55rem; }

        .page-title {
          font-size: 1.6rem; font-weight: 700;
          color: var(--text); margin-bottom: 4px;
          font-family: var(--font-body);
        }
        .page-subtitle {
          font-size: 0.85rem; color: var(--muted);
          font-family: var(--font-body);
        }

        /* Drop Zone */
        .drop-zone {
          border: 2px dashed var(--border);
          border-radius: 0;
          padding: 48px 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.15s;
          background: var(--surface);
          box-shadow: var(--shadow);
          margin-bottom: 16px;
        }
        .drop-zone:hover, .drop-zone--active {
          border-style: solid;
          border-color: var(--text);
          transform: translate(-2px, -2px);
          box-shadow: var(--shadow-lg);
        }
        .drop-icon {
          font-size: 2.4rem;
          color: var(--muted);
          margin-bottom: 12px;
          opacity: 0.6;
        }
        .drop-title {
          font-family: var(--font-display);
          font-size: 1rem; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          color: var(--text); margin-bottom: 6px;
        }
        .drop-sub {
          font-family: var(--font-mono);
          font-size: 0.72rem; color: var(--muted);
          letter-spacing: 1px;
        }

        /* Preview */
        .preview-section {
          background: var(--surface);
          border: 2px solid var(--border);
          box-shadow: var(--shadow);
          padding: 16px;
          margin-bottom: 16px;
        }
        .preview-wrap {
          width: 100%;
          max-height: 400px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg2);
          margin-bottom: 16px;
        }
        .preview-img {
          max-width: 100%;
          max-height: 400px;
          object-fit: contain;
          display: block;
        }

        /* Action Row */
        .action-row {
          display: flex;
          gap: 10px;
        }
        .action-row .btn-outline { flex: 1; justify-content: center; }
        .action-row .btn-primary { flex: 2; justify-content: center; }

        /* Loading */
        .loading-box {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border: 2px solid var(--border);
          background: var(--surface);
          font-family: var(--font-mono);
          font-size: 0.78rem;
          color: var(--muted);
          letter-spacing: 1px;
          margin-bottom: 16px;
          box-shadow: var(--shadow);
        }

        /* Result */
        .result-section {
          background: var(--surface);
          border: 2px solid var(--border);
          box-shadow: var(--shadow);
          padding: 16px;
          margin-bottom: 16px;
        }
        .result-img-wrap {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg2);
          margin-bottom: 16px;
          padding: 12px;
        }
        .result-img {
          max-width: 100%;
          object-fit: contain;
          display: block;
        }

        /* Info */
        .info-box {
          background: var(--surface);
          border: 2px solid var(--border);
          box-shadow: var(--shadow);
          padding: 16px;
          margin-top: 8px;
        }
        .info-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 0;
        }
        .info-list li {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-body);
          font-size: 0.82rem;
          color: var(--muted);
        }
        .info-list li i {
          font-size: 0.65rem;
          color: var(--text);
          opacity: 0.6;
          flex-shrink: 0;
        }

        @media (max-width: 400px) {
          .action-row { flex-direction: column; }
          .action-row .btn-outline,
          .action-row .btn-primary { flex: unset; }
        }
      `}</style>
    </Layout>
  );
    }
              
