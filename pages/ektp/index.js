// pages/ektp/index.js
import Head from 'next/head';
import { useState, useRef } from 'react';
import Layout from '../../components/Layout';
import ToolStats from '../../components/ToolStats';

const BLOOD_TYPES   = ['A', 'B', 'AB', 'O', '-'];
const GENDERS       = ['LAKI-LAKI', 'PEREMPUAN'];
const RELIGIONS     = ['ISLAM', 'KRISTEN', 'KATOLIK', 'HINDU', 'BUDDHA', 'KONGHUCU'];
const MARITAL       = ['BELUM KAWIN', 'KAWIN', 'CERAI HIDUP', 'CERAI MATI'];
const CITIZENSHIPS  = ['WNI', 'WNA'];

const defaultForm = {
  nik: '',
  nama: '',
  provinsi: '',
  kota: '',
  ttl: '',
  jenis_kelamin: 'LAKI-LAKI',
  golongan_darah: 'A',
  alamat: '',
  rt_rw: '',
  kel_desa: '',
  kecamatan: '',
  agama: 'ISLAM',
  status: 'BELUM KAWIN',
  pekerjaan: '',
  kewarganegaraan: 'WNI',
  masa_berlaku: 'SEUMUR HIDUP',
  terbuat: '',
};

function Field({ label, required, children }) {
  return (
    <div className="field">
      <label className="field-label">{label}{required && <span className="req">*</span>}</label>
      {children}
    </div>
  );
}

export default function EKTPPage() {
  const [form, setForm]       = useState(defaultForm);
  const [photo, setPhoto]     = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState('');
  const [error, setError]     = useState('');
  const photoRef              = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handlePhoto = (f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) { setError('File foto harus berupa gambar.'); return; }
    setError('');
    setPhoto(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!form.nik || !form.nama || !form.provinsi || !form.kota) {
      setError('NIK, Nama, Provinsi, dan Kota wajib diisi.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);

    try {
      let photoUrl = '';

      // Upload foto lewat server (bukan langsung dari browser)
      if (photo) {
        setLoadMsg('Mengupload foto...');
        const fd = new FormData();
        fd.append('file', photo);
        const upRes = await fetch('/api/ektp', { method: 'POST', body: fd });
        const upData = await upRes.json();
        if (!upRes.ok) throw new Error(upData.error || 'Gagal upload foto.');
        photoUrl = upData.photo_url;
      }

      setLoadMsg('Membuat e-KTP...');
      const params = new URLSearchParams({
        nik:            form.nik,
        nama:           form.nama,
        pas_photo:      photoUrl,
        provinsi:       form.provinsi,
        kota:           form.kota,
        ttl:            form.ttl,
        jenis_kelamin:  form.jenis_kelamin,
        golongan_darah: form.golongan_darah,
        alamat:         form.alamat,
        rt_rw:          form.rt_rw,
        kel_desa:       form.kel_desa,
        kecamatan:      form.kecamatan,
        agama:          form.agama,
        status:         form.status,
        pekerjaan:      form.pekerjaan,
        kewarganegaraan:form.kewarganegaraan,
        masa_berlaku:   form.masa_berlaku,
        terbuat:        form.terbuat,
      });

      const ktpRes = await fetch(`/api/ektp?${params}`);
      const data = await ktpRes.json();
      if (!ktpRes.ok) throw new Error(data.error || 'Gagal generate KTP.');

      const url = data.result_url || data.result || data.url || data.image;
      if (!url) throw new Error('Tidak ada hasil dari API.');

      setResult(url);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadMsg('');
    }
  };

  const handleDownload = async () => {
    if (!result) return;
    try {
      const a = document.createElement('a');
      a.href = result;
      a.download = `ektp-${form.nama || 'meg'}.png`;
      a.click();
    } catch {}
  };

  return (
    <Layout>
      <Head><title>Fake e-KTP — MEG Tools</title></Head>

      <div className="page-wrap">

        {/* Header */}
        <div className="page-header">
          <div className="page-badge">
            <i className="fa-solid fa-id-card" />
            <span>MAKER TOOLS</span>
          </div>
          <h1 className="page-title">Fake e-KTP</h1>
          <p className="page-subtitle">Generate KTP palsu untuk kebutuhan desain, konten, atau hiburan</p>
        </div>

        {/* Disclaimer */}
        <div className="alert alert-info" style={{ marginBottom: '20px' }}>
          <i className="fa-solid fa-triangle-exclamation" /> Hanya untuk hiburan & keperluan desain. Jangan digunakan untuk penipuan.
        </div>

        {/* Form */}
        <div className="form-card">
          <div className="card-title"><i className="fa-solid fa-pen" /> DATA KTP</div>

          <div className="form-grid">

            <Field label="NIK (16 digit)" required>
              <input
                type="text" maxLength={16} placeholder="3271234567890001"
                value={form.nik} onChange={e => set('nik', e.target.value)}
              />
            </Field>

            <Field label="Nama Lengkap" required>
              <input
                type="text" placeholder="BUDI SANTOSO"
                value={form.nama} onChange={e => set('nama', e.target.value.toUpperCase())}
              />
            </Field>

            <Field label="Provinsi" required>
              <input
                type="text" placeholder="JAWA BARAT"
                value={form.provinsi} onChange={e => set('provinsi', e.target.value.toUpperCase())}
              />
            </Field>

            <Field label="Kota / Kabupaten" required>
              <input
                type="text" placeholder="KOTA BANDUNG"
                value={form.kota} onChange={e => set('kota', e.target.value.toUpperCase())}
              />
            </Field>

            <Field label="Tempat, Tanggal Lahir">
              <input
                type="text" placeholder="BANDUNG, 01-01-2000"
                value={form.ttl} onChange={e => set('ttl', e.target.value)}
              />
            </Field>

            <Field label="Jenis Kelamin">
              <select value={form.jenis_kelamin} onChange={e => set('jenis_kelamin', e.target.value)}>
                {GENDERS.map(g => <option key={g}>{g}</option>)}
              </select>
            </Field>

            <Field label="Golongan Darah">
              <select value={form.golongan_darah} onChange={e => set('golongan_darah', e.target.value)}>
                {BLOOD_TYPES.map(b => <option key={b}>{b}</option>)}
              </select>
            </Field>

            <Field label="Agama">
              <select value={form.agama} onChange={e => set('agama', e.target.value)}>
                {RELIGIONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </Field>

            <Field label="Alamat">
              <input
                type="text" placeholder="JL. MERDEKA NO. 1"
                value={form.alamat} onChange={e => set('alamat', e.target.value.toUpperCase())}
              />
            </Field>

            <Field label="RT/RW">
              <input
                type="text" placeholder="001/002"
                value={form.rt_rw} onChange={e => set('rt_rw', e.target.value)}
              />
            </Field>

            <Field label="Kelurahan / Desa">
              <input
                type="text" placeholder="MERDEKA"
                value={form.kel_desa} onChange={e => set('kel_desa', e.target.value.toUpperCase())}
              />
            </Field>

            <Field label="Kecamatan">
              <input
                type="text" placeholder="SUKAJADI"
                value={form.kecamatan} onChange={e => set('kecamatan', e.target.value.toUpperCase())}
              />
            </Field>

            <Field label="Status Perkawinan">
              <select value={form.status} onChange={e => set('status', e.target.value)}>
                {MARITAL.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>

            <Field label="Pekerjaan">
              <input
                type="text" placeholder="PELAJAR / MAHASISWA"
                value={form.pekerjaan} onChange={e => set('pekerjaan', e.target.value.toUpperCase())}
              />
            </Field>

            <Field label="Kewarganegaraan">
              <select value={form.kewarganegaraan} onChange={e => set('kewarganegaraan', e.target.value)}>
                {CITIZENSHIPS.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>

            <Field label="Masa Berlaku">
              <input
                type="text" placeholder="SEUMUR HIDUP"
                value={form.masa_berlaku} onChange={e => set('masa_berlaku', e.target.value.toUpperCase())}
              />
            </Field>

            <Field label="Tanggal Pembuatan">
              <input
                type="text" placeholder="01-01-2020"
                value={form.terbuat} onChange={e => set('terbuat', e.target.value)}
              />
            </Field>

          </div>

          {/* Foto Pas */}
          <div className="field" style={{ marginTop: '4px' }}>
            <label className="field-label">Foto Pas</label>
            <div className="photo-upload" onClick={() => photoRef.current?.click()}>
              <input
                ref={photoRef} type="file" accept="image/*"
                style={{ display: 'none' }}
                onChange={e => handlePhoto(e.target.files?.[0])}
              />
              {photoPreview
                ? <img src={photoPreview} alt="Foto" className="photo-preview" />
                : (
                  <div className="photo-placeholder">
                    <i className="fa-solid fa-user" />
                    <span>Tap untuk upload foto</span>
                  </div>
                )
              }
            </div>
            {photoPreview && (
              <button className="change-photo" onClick={() => { setPhoto(null); setPhotoPreview(null); }}>
                <i className="fa-solid fa-rotate-left" /> Ganti Foto
              </button>
            )}
          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error" style={{ marginTop: '12px' }}>
            <i className="fa-solid fa-circle-exclamation" /> {error}
          </div>
        )}

        {/* Submit */}
        {!loading && (
          <button className="btn-primary submit-btn" onClick={handleSubmit}>
            <i className="fa-solid fa-id-card" /> Generate e-KTP
          </button>
        )}

        {/* Loading */}
        {loading && (
          <div className="loading-box">
            <span className="spinner" />
            <span>{loadMsg || 'Memproses...'}</span>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="result-card">
            <div className="card-title"><i className="fa-solid fa-check-circle" /> HASIL</div>
            <div className="result-img-wrap">
              <img src={result} alt="e-KTP" className="result-img" />
            </div>
            <div className="action-row">
              <button className="btn-outline" onClick={() => { setResult(null); }}>
                <i className="fa-solid fa-rotate-left" /> Buat Ulang
              </button>
              <button className="btn-primary" onClick={handleDownload}>
                <i className="fa-solid fa-download" /> Download
              </button>
            </div>
          </div>
        )}

      <ToolStats toolId="ektp" />

      </div>

      <style jsx>{`
        .page-wrap {
          max-width: 680px; margin: 0 auto;
          padding: 80px 16px 60px; min-height: 100vh;
        }
        .page-header { margin-bottom: 16px; }
        .page-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 10px; border: 1.5px solid var(--border);
          font-family: var(--font-mono); font-size: 0.6rem;
          letter-spacing: 3px; color: var(--muted);
          text-transform: uppercase; margin-bottom: 10px;
        }
        .page-badge i { font-size: 0.55rem; }
        .page-title {
          font-size: 1.6rem; font-weight: 700;
          color: var(--text); margin-bottom: 4px; font-family: var(--font-body);
        }
        .page-subtitle { font-size: 0.85rem; color: var(--muted); font-family: var(--font-body); }

        .form-card {
          background: var(--surface); border: 2px solid var(--border);
          box-shadow: var(--shadow); padding: 16px; margin-bottom: 12px;
        }
        .form-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
          margin-bottom: 12px;
        }
        .field { display: flex; flex-direction: column; gap: 5px; }
        .field-label {
          font-family: var(--font-mono); font-size: 0.65rem;
          letter-spacing: 2px; text-transform: uppercase; color: var(--muted);
        }
        .req { color: #f87171; margin-left: 2px; }

        /* Photo Upload */
        .photo-upload {
          width: 100%; height: 130px;
          border: 2px dashed var(--border); background: var(--bg2);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.15s; overflow: hidden;
        }
        .photo-upload:hover { border-color: var(--text); }
        .photo-placeholder {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          color: var(--muted);
        }
        .photo-placeholder i { font-size: 2rem; opacity: 0.4; }
        .photo-placeholder span { font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 1px; }
        .photo-preview { width: 100%; height: 130px; object-fit: cover; display: block; }
        .change-photo {
          margin-top: 6px; background: none; border: 1px solid var(--border);
          color: var(--muted); padding: 4px 10px; font-size: 0.7rem;
          font-family: var(--font-mono); cursor: pointer; letter-spacing: 1px;
          display: flex; align-items: center; gap: 6px;
        }

        .submit-btn {
          width: 100%; justify-content: center;
          margin-top: 4px; font-size: 0.85rem; padding: 1rem;
        }

        .loading-box {
          display: flex; align-items: center; gap: 12px; padding: 16px;
          border: 2px solid var(--border); background: var(--surface);
          font-family: var(--font-mono); font-size: 0.78rem; color: var(--muted);
          letter-spacing: 1px; margin-top: 4px; box-shadow: var(--shadow);
        }

        .result-card {
          background: var(--surface); border: 2px solid var(--border);
          box-shadow: var(--shadow); padding: 16px; margin-top: 12px;
        }
        .result-img-wrap {
          width: 100%; background: var(--bg2); padding: 12px;
          margin-bottom: 16px; display: flex; justify-content: center;
        }
        .result-img { max-width: 100%; display: block; }

        .action-row { display: flex; gap: 10px; }
        .action-row .btn-outline { flex: 1; justify-content: center; }
        .action-row .btn-primary { flex: 2; justify-content: center; }

        @media (max-width: 480px) {
          .form-grid { grid-template-columns: 1fr; }
          .action-row { flex-direction: column; }
          .action-row .btn-outline, .action-row .btn-primary { flex: unset; }
        }
      `}</style>
    </Layout>
  );
                  }
  
