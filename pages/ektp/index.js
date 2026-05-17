// pages/ektp/index.js
import Head from 'next/head';
import { useState, useRef, useEffect } from 'react';
import Layout from '../../components/Layout';
import ToolStats from '../../components/ToolStats';

const BLOOD_TYPES  = ['A', 'B', 'AB', 'O', '-'];
const GENDERS      = ['LAKI-LAKI', 'PEREMPUAN'];
const RELIGIONS    = ['ISLAM', 'KRISTEN', 'KATOLIK', 'HINDU', 'BUDDHA', 'KONGHUCU'];
const MARITAL      = ['BELUM KAWIN', 'KAWIN', 'CERAI HIDUP', 'CERAI MATI'];
const CITIZENSHIPS = ['WNI', 'WNA'];

const TEMPLATE_URL = '/ktp-template.jpg';

const defaultForm = {
  nik: '', nama: '', provinsi: '', kota: '', ttl: '',
  jenis_kelamin: 'LAKI-LAKI', golongan_darah: 'A',
  alamat: '', rt_rw: '', kel_desa: '', kecamatan: '',
  agama: 'ISLAM', status: 'BELUM KAWIN', pekerjaan: '',
  kewarganegaraan: 'WNI', masa_berlaku: 'SEUMUR HIDUP',
  kota_terbit: '', tgl_terbit: '',
};

function Field({ label, required, children }) {
  return (
    <div className="field">
      <label className="field-label">
        {label}{required && <span className="req">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function EKTPPage() {
  const [form, setForm]             = useState(defaultForm);
  const [photo, setPhoto]           = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [result, setResult]         = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [sigDrawing, setSigDrawing] = useState(false);
  const [hasSig, setHasSig]         = useState(false);
  const [activeTab, setActiveTab]   = useState('data');

  const photoRef  = useRef(null);
  const sigRef    = useRef(null);
  const sigCtxRef = useRef(null);
  const lastPos   = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (activeTab === 'ttd' && sigRef.current) {
      const canvas = sigRef.current;
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#000';
      ctx.lineWidth   = 2;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      sigCtxRef.current = ctx;
    }
  }, [activeTab]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const sigStart = (e) => {
    e.preventDefault();
    setSigDrawing(true);
    lastPos.current = getPos(e, sigRef.current);
  };
  const sigMove = (e) => {
    e.preventDefault();
    if (!sigDrawing) return;
    const ctx = sigCtxRef.current;
    const pos = getPos(e, sigRef.current);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
    setHasSig(true);
  };
  const sigEnd = (e) => { e.preventDefault(); setSigDrawing(false); };
  const clearSig = () => {
    const canvas = sigRef.current;
    sigCtxRef.current?.clearRect(0, 0, canvas.width, canvas.height);
    setHasSig(false);
  };

  const handlePhoto = (f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setError('File foto harus berupa gambar.');
      return;
    }
    setError('');
    setPhoto(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const generateKTP = async () => {
    if (!form.nik || !form.nama) {
      setError('NIK dan Nama wajib diisi.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const canvas = document.createElement('canvas');
      const W = 856, H = 540;
      canvas.width  = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');

      const tpl = await loadImage(TEMPLATE_URL);
      ctx.drawImage(tpl, 0, 0, W, H);

      // Header Provinsi/Kota
      ctx.textAlign = 'center';
      if (form.provinsi.trim()) {
        ctx.font      = 'bold 22px Arial Narrow, Arial';
        ctx.fillStyle = '#00008B';
        ctx.fillText(
          'PROVINSI ' + form.provinsi.trim().toUpperCase(),
          W / 2, 38
        );
      }
      if (form.kota.trim()) {
        ctx.font      = 'bold 18px Arial Narrow, Arial';
        ctx.fillStyle = '#00008B';
        ctx.fillText(form.kota.trim().toUpperCase(), W / 2, 60);
      }

      // Hanya tulis NILAI — label sudah ada di template
      ctx.textAlign = 'left';
      ctx.fillStyle = '#0a0a0a';

      const fontNIK = 'bold 16px Arial Narrow, Arial';
      const fontVal = 'bold 13px Arial Narrow, Arial';
      const VX = 205;

      ctx.font = fontNIK;
      ctx.fillText(form.nik || '', VX, 110);

      ctx.font = fontVal;
      ctx.fillText(form.nama.toUpperCase() || '', VX, 150);
      ctx.fillText(form.ttl || '', VX, 173);
      ctx.fillText(form.jenis_kelamin || '', VX, 196);
      ctx.fillText(form.alamat.toUpperCase() || '', VX, 219);
      ctx.fillText(form.rt_rw || '', VX, 242);
      ctx.fillText(form.kel_desa.toUpperCase() || '', VX, 265);
      ctx.fillText(form.kecamatan.toUpperCase() || '', VX, 288);
      ctx.fillText(form.agama || '', VX, 313);
      ctx.fillText(form.status || '', VX, 336);
      ctx.fillText(form.pekerjaan.toUpperCase() || '', VX, 359);
      ctx.fillText(form.kewarganegaraan || '', VX, 382);
      ctx.fillText(form.masa_berlaku || '', VX, 405);

      // Golongan darah
      ctx.fillText(form.golongan_darah || '', 500, 196);
      // Foto Pas
      const PX = 628, PY = 88, PW = 182, PH = 230;
      if (photo) {
        const photoImg = await loadImageFromFile(photo);
        const ratio = Math.max(PW / photoImg.width, PH / photoImg.height);
        const sw = PW / ratio, sh = PH / ratio;
        const sx = (photoImg.width - sw) / 2;
        const sy = (photoImg.height - sh) / 2;
        ctx.drawImage(photoImg, sx, sy, sw, sh, PX, PY, PW, PH);
      }

      // Kota Terbit + Tanggal
      const kotaTerbit = form.kota_terbit.trim() || form.kota.trim() || '';
      const tglTerbit  = form.tgl_terbit.trim() || '';
      if (kotaTerbit || tglTerbit) {
        ctx.font      = 'bold 12px Arial Narrow, Arial';
        ctx.fillStyle = '#0a0a0a';
        ctx.textAlign = 'center';
        ctx.fillText(kotaTerbit.toUpperCase(), 715, 320);
        ctx.fillText(tglTerbit, 715, 336);
      }

      // Tanda Tangan
      if (hasSig && sigRef.current) {
        ctx.drawImage(sigRef.current, 625, 348, 185, 75);
      }

      setResult(canvas.toDataURL('image/jpeg', 0.95));

      fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'ektp', action: 'use' }),
      }).catch(() => {});

    } catch (err) {
      setError('Gagal generate KTP: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href     = result;
    a.download = 'ektp-' + (form.nama || 'meg') + '.jpg';
    a.click();
  };

  return (
    <Layout>
      <Head><title>Fake e-KTP — MEG Tools</title></Head>
      <div className="page-wrap">

        <div className="page-header">
          <div className="page-badge">
            <i className="fa-solid fa-id-card" />
            <span>MAKER TOOLS</span>
          </div>
          <h1 className="page-title">Fake e-KTP</h1>
          <p className="page-subtitle">
            Generate KTP palsu untuk kebutuhan desain, konten, atau hiburan
          </p>
        </div>

        <div className="alert-info-box">
          <i className="fa-solid fa-triangle-exclamation" />
          {' '}Hanya untuk hiburan & desain. Jangan untuk penipuan.
        </div>

        <div className="tabs">
          {[
            ['data','fa-pen','Data KTP'],
            ['foto','fa-image','Foto Pas'],
            ['ttd','fa-signature','TTD'],
          ].map(([t,ic,lb])=>(
            <button
              key={t}
              className={'tab' + (activeTab===t ? ' tab--active' : '')}
              onClick={()=>setActiveTab(t)}
            >
              <i className={'fa-solid ' + ic}/> {lb}
            </button>
          ))}
        </div>

        {activeTab === 'data' && (
          <div className="form-card">
            <div className="form-grid">
              <Field label="NIK (16 digit)" required>
                <input type="text" maxLength={16}
                  placeholder="3271234567890001"
                  value={form.nik}
                  onChange={e=>set('nik',e.target.value)} />
              </Field>
              <Field label="Nama Lengkap" required>
                <input type="text" placeholder="BUDI SANTOSO"
                  value={form.nama}
                  onChange={e=>set('nama',e.target.value.toUpperCase())} />
              </Field>
              <Field label="Provinsi">
                <input type="text"
                  placeholder="JAWA BARAT (kosongkan jika tidak mau)"
                  value={form.provinsi}
                  onChange={e=>set('provinsi',e.target.value)} />
              </Field>
              <Field label="Kota / Kabupaten">
                <input type="text" placeholder="KOTA BANDUNG"
                  value={form.kota}
                  onChange={e=>set('kota',e.target.value)} />
              </Field>
              <Field label="Tempat, Tanggal Lahir">
                <input type="text" placeholder="BANDUNG, 01-01-2000"
                  value={form.ttl}
                  onChange={e=>set('ttl',e.target.value)} />
              </Field>
              <Field label="Jenis Kelamin">
                <select value={form.jenis_kelamin}
                  onChange={e=>set('jenis_kelamin',e.target.value)}>
                  {GENDERS.map(g=><option key={g}>{g}</option>)}
                </select>
              </Field>
              <Field label="Golongan Darah">
                <select value={form.golongan_darah}
                  onChange={e=>set('golongan_darah',e.target.value)}>
                  {BLOOD_TYPES.map(b=><option key={b}>{b}</option>)}
                </select>
              </Field>
              <Field label="Agama">
                <select value={form.agama}
                  onChange={e=>set('agama',e.target.value)}>
                  {RELIGIONS.map(r=><option key={r}>{r}</option>)}
                </select>
              </Field>
              <Field label="Alamat">
                <input type="text" placeholder="JL. MERDEKA NO. 1"
                  value={form.alamat}
                  onChange={e=>set('alamat',e.target.value.toUpperCase())} />
              </Field>
              <Field label="RT/RW">
                <input type="text" placeholder="001/002"
                  value={form.rt_rw}
                  onChange={e=>set('rt_rw',e.target.value)} />
              </Field>
              <Field label="Kelurahan / Desa">
                <input type="text" placeholder="MERDEKA"
                  value={form.kel_desa}
                  onChange={e=>set('kel_desa',e.target.value.toUpperCase())} />
              </Field>
              <Field label="Kecamatan">
                <input type="text" placeholder="SUKAJADI"
                  value={form.kecamatan}
                  onChange={e=>set('kecamatan',e.target.value.toUpperCase())} />
              </Field>
              <Field label="Status Perkawinan">
                <select value={form.status}
                  onChange={e=>set('status',e.target.value)}>
                  {MARITAL.map(s=><option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Pekerjaan">
                <input type="text" placeholder="PELAJAR / MAHASISWA"
                  value={form.pekerjaan}
                  onChange={e=>set('pekerjaan',e.target.value.toUpperCase())} />
              </Field>
              <Field label="Kewarganegaraan">
                <select value={form.kewarganegaraan}
                  onChange={e=>set('kewarganegaraan',e.target.value)}>
                  {CITIZENSHIPS.map(c=><option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Masa Berlaku">
                <input type="text" placeholder="SEUMUR HIDUP"
                  value={form.masa_berlaku}
                  onChange={e=>set('masa_berlaku',e.target.value.toUpperCase())} />
              </Field>
              <Field label="Kota Penerbitan KTP">
                <input type="text"
                  placeholder="BANDUNG (pojok kanan bawah)"
                  value={form.kota_terbit}
                  onChange={e=>set('kota_terbit',e.target.value)} />
              </Field>
              <Field label="Tanggal Penerbitan">
                <input type="text" placeholder="18-10-2022"
                  value={form.tgl_terbit}
                  onChange={e=>set('tgl_terbit',e.target.value)} />
              </Field>
            </div>
            <button className="btn-next" onClick={()=>setActiveTab('foto')}>
              Lanjut: Foto Pas <i className="fa-solid fa-arrow-right"/>
            </button>
          </div>
        )}

        {activeTab === 'foto' && (
          <div className="form-card">
            <div className="field">
              <label className="field-label-big">Upload Foto Pas</label>
              <div className="photo-upload"
                onClick={()=>photoRef.current?.click()}>
                <input ref={photoRef} type="file"
                  accept="image/*"
                  style={{display:'none'}}
                  onChange={e=>handlePhoto(e.target.files?.[0])} />
                {photoPreview
                  ? <img src={photoPreview} alt="Foto"
                      className="photo-preview" />
                  : <div className="photo-placeholder">
                      <i className="fa-solid fa-user"/>
                      <span>Tap untuk upload foto</span>
                    </div>
                }
              </div>
              {photoPreview && (
                <button className="change-photo"
                  onClick={()=>{setPhoto(null);setPhotoPreview(null);}}>
                  <i className="fa-solid fa-rotate-left"/> Ganti Foto
                </button>
              )}
              <p className="field-hint">
                Foto akan otomatis dicrop ke ukuran pas foto KTP
              </p>
            </div>
            <div className="nav-row">
              <button className="btn-back"
                onClick={()=>setActiveTab('data')}>
                <i className="fa-solid fa-arrow-left"/> Kembali
              </button>
              <button className="btn-next"
                onClick={()=>setActiveTab('ttd')}>
                Lanjut: TTD <i className="fa-solid fa-arrow-right"/>
              </button>
            </div>
          </div>
        )}
{activeTab === 'ttd' && (
          <div className="form-card">
            <label className="field-label-big">Gambar Tanda Tangan</label>
            <p className="field-hint" style={{marginBottom:'10px'}}>
              Gambar tanda tanganmu di area putih di bawah ini
            </p>
            <div className="sig-wrap">
              <canvas
                ref={sigRef}
                className="sig-canvas"
                onMouseDown={sigStart}
                onMouseMove={sigMove}
                onMouseUp={sigEnd}
                onMouseLeave={sigEnd}
                onTouchStart={sigStart}
                onTouchMove={sigMove}
                onTouchEnd={sigEnd}
              />
            </div>
            <button className="change-photo" onClick={clearSig}
              style={{marginTop:'8px'}}>
              <i className="fa-solid fa-eraser"/> Hapus
            </button>
            <div className="nav-row" style={{marginTop:'16px'}}>
              <button className="btn-back"
                onClick={()=>setActiveTab('foto')}>
                <i className="fa-solid fa-arrow-left"/> Kembali
              </button>
              <button className="btn-generate"
                onClick={generateKTP}
                disabled={loading}>
                {loading
                  ? <><span className="spinner"/> Generating...</>
                  : <><i className="fa-solid fa-id-card"/> Generate KTP</>
                }
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="alert-error">
            <i className="fa-solid fa-circle-exclamation"/> {error}
          </div>
        )}

        {result && (
          <div className="result-card">
            <div className="card-title">
              <i className="fa-solid fa-check-circle"/> HASIL
            </div>
            <div className="result-img-wrap">
              <img src={result} alt="e-KTP" className="result-img"/>
            </div>
            <div className="action-row">
              <button className="btn-outline"
                onClick={()=>setResult(null)}>
                <i className="fa-solid fa-rotate-left"/> Buat Ulang
              </button>
              <button className="btn-primary"
                onClick={handleDownload}>
                <i className="fa-solid fa-download"/> Download
              </button>
            </div>
          </div>
        )}

        <div style={{
          '--gray-400':'var(--muted)',
          '--gray-600':'var(--border)',
          '--white':'var(--text)',
        }}>
          <ToolStats toolId="ektp"/>
        </div>

      </div>

      <style jsx>{`
        .field { display:flex; flex-direction:column; gap:5px; }
        .field-label {
          font-family:var(--font-mono);
          font-size:0.65rem;
          letter-spacing:2px;
          text-transform:uppercase;
          color:var(--muted);
        }
        .req { color:#f87171; margin-left:2px; }
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
        .alert-info-box {
          padding:12px 16px;
          background:rgba(251,191,36,0.1);
          border:1.5px solid rgba(251,191,36,0.4);
          color:var(--muted);
          font-size:0.8rem;
          margin-bottom:16px;
        }
        .alert-error {
          padding:12px 16px;
          background:rgba(248,113,113,0.1);
          border-left:4px solid #f87171;
          color:#f87171;
          font-size:0.82rem;
          margin-top:12px;
          font-family:var(--font-mono);
        }
        .tabs {
          display:flex;
          margin-bottom:16px;
          border:2px solid var(--border);
        }
        .tab {
          flex:1;
          padding:10px 4px;
          background:none;
          border:none;
          border-right:1px solid var(--border);
          color:var(--muted);
          font-family:var(--font-mono);
          font-size:0.65rem;
          letter-spacing:1px;
          cursor:pointer;
          transition:all 0.15s;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:5px;
        }
        .tab:last-child { border-right:none; }
        .tab--active { background:var(--text); color:var(--bg); }
        .tab:hover:not(.tab--active) {
          background:var(--surface);
          color:var(--text);
        }
        .form-card {
          background:var(--surface);
          border:2px solid var(--border);
          box-shadow:var(--shadow);
          padding:16px;
          margin-bottom:12px;
        }
        .form-grid {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:12px;
          margin-bottom:16px;
        }
        .field-label-big {
          font-family:var(--font-mono);
          font-size:0.7rem;
          letter-spacing:2px;
          text-transform:uppercase;
          color:var(--muted);
          display:block;
          margin-bottom:8px;
        }
        .field-hint {
          font-size:0.75rem;
          color:var(--muted);
          margin-top:6px;
          font-family:var(--font-body);
        }
        .photo-upload {
          width:100%;
          height:200px;
          border:2px dashed var(--border);
          background:var(--bg2);
          display:flex;
          align-items:center;
          justify-content:center;
          cursor:pointer;
          transition:all 0.15s;
          overflow:hidden;
        }
        .photo-upload:hover { border-color:var(--text); }
        .photo-placeholder {
          display:flex;
          flex-direction:column;
          align-items:center;
          gap:8px;
          color:var(--muted);
        }
        .photo-placeholder i { font-size:2.5rem; opacity:0.4; }
        .photo-placeholder span {
          font-family:var(--font-mono);
          font-size:0.7rem;
          letter-spacing:1px;
        }
        .photo-preview {
          width:100%;
          height:200px;
          object-fit:cover;
          display:block;
        }
        .change-photo {
          background:none;
          border:1px solid var(--border);
          color:var(--muted);
          padding:6px 12px;
          font-size:0.7rem;
          font-family:var(--font-mono);
          cursor:pointer;
          letter-spacing:1px;
          display:inline-flex;
          align-items:center;
          gap:6px;
          margin-top:8px;
        }
        .sig-wrap {
          width:100%;
          height:160px;
          border:2px solid var(--border);
          background:#fff;
        }
        .sig-canvas {
          width:100%;
          height:100%;
          display:block;
          touch-action:none;
          cursor:crosshair;
        }
        .nav-row { display:flex; gap:10px; }
        .btn-back {
          flex:1;
          padding:12px;
          background:none;
          border:2px solid var(--border);
          color:var(--muted);
          font-family:var(--font-display);
          font-size:0.75rem;
          letter-spacing:2px;
          cursor:pointer;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:8px;
        }
        .btn-next {
          width:100%;
          padding:12px;
          background:var(--text);
          color:var(--bg);
          border:none;
          font-family:var(--font-display);
          font-size:0.75rem;
          letter-spacing:2px;
          cursor:pointer;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          text-transform:uppercase;
        }
        .btn-generate {
          flex:2;
          padding:12px;
          background:var(--text);
          color:var(--bg);
          border:none;
          font-family:var(--font-display);
          font-size:0.75rem;
          letter-spacing:2px;
          cursor:pointer;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          text-transform:uppercase;
        }
        .btn-generate:disabled { opacity:0.6; cursor:not-allowed; }
        .result-card {
          background:var(--surface);
          border:2px solid var(--border);
          box-shadow:var(--shadow);
          padding:16px;
          margin-top:12px;
        }
        .result-img-wrap {
          width:100%;
          background:var(--bg2);
          padding:12px;
          margin-bottom:16px;
          display:flex;
          justify-content:center;
        }
        .result-img { max-width:100%; display:block; }
        .action-row { display:flex; gap:10px; }
        .action-row .btn-outline { flex:1; justify-content:center; }
        .action-row .btn-primary { flex:2; justify-content:center; }
        @media (max-width:480px) {
          .form-grid { grid-template-columns:1fr; }
          .action-row { flex-direction:column; }
        }
      `}</style>
    </Layout>
  );
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      const img2 = new Image();
      img2.onload = () => resolve(img2);
      img2.onerror = () => reject(new Error('Gagal load template'));
      img2.src = url + '?t=' + Date.now();
    };
    img.src = url;
  });
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Gagal load foto'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Gagal baca file foto'));
    reader.readAsDataURL(file);
  });
                }
