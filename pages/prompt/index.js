// pages/prompts/index.js
import Head from 'next/head';
import { useState } from 'react';
import Layout from '../../components/Layout';
import ToolStats from '../../components/ToolStats';

const PROMPTS = [
  {
    id: 'mirror-selfie',
    label: 'Mirror Selfie MacBook',
    icon: 'fa-laptop',
    desc: 'Generate foto mirror selfie di depan MacBook dengan gaya aesthetic',
    ai: ['ChatGPT', 'Gemini'],
    example: '/Example_Mirror_MacBook.jpg',
    prompt: `Create an image using the original face from the reference photo without changing facial structure, skin tone, or identity. The face must remain identical, natural, and realistic (not AI-generated looking).

Camera angle / shot composition:
Mirror selfie on a MacBook screen, medium close-up shot (chest-up framing), slightly tilted framing (subtle tilt), primary focus on the laptop screen, realistic perspective as if photographed with a phone from in front of the screen.

Outfit:
Oversized black cotton fleece hoodie, hood worn up, no large logos, relaxed loose fit.

Pose:
Head slightly lowered and tilted, hair partially covering the eyes, right hand relaxed naturally, left hand holding an iPhone as if taking a mirror selfie, cool and relaxed expression, not overly posed.

Environment:
Minimalist room with dim lighting, background featuring vertical wall panels and marble texture. On the MacBook screen, a Photo Booth window is visible, with the Spotify app open beside it.

Lighting:
Light coming from the MacBook screen (soft cool light) combined with subtle warm indoor ambient lighting. Natural look, no cinematic effects, no bokeh, facial details remain sharp and realistic.

Aspect ratio: 3:4

Negative prompt:
worst quality, low quality, lowres, blurry, ugly, distorted, deformed, watermark, text, signature, bad anatomy, bad hands, missing fingers, extra limbs, fused fingers, distorted face, plastic skin, unrealistic reflection.`,
    steps: [
      {
        ai: 'ChatGPT',
        icon: 'fa-brands fa-openai',
        color: '#10a37f',
        steps: [
          'Buka chatgpt.com',
          'Upload foto wajahmu',
          'Copy prompt di bawah lalu paste ke kolom chat',
          'Klik Send dan tunggu hasilnya',
        ],
      },
      {
        ai: 'Gemini',
        icon: 'fa-solid fa-gem',
        color: '#4285f4',
        steps: [
          'Buka gemini.google.com',
          'Klik icon gambar untuk upload foto wajahmu',
          'Copy prompt di bawah lalu paste ke kolom chat',
          'Klik Send dan tunggu hasilnya',
        ],
      },
    ],
  },
  {
    id: 'school-candid',
    label: 'School Candid',
    icon: 'fa-school',
    desc: 'Generate foto candid over-the-shoulder gaya SMA Indonesia',
    ai: ['ChatGPT', 'Gemini'],
    example: '/Example_School_Candid.jpg',
    prompt: `Buat Gambar Ultra-realistis
Subjek: seorang pria dan seorang wanita di refrensi
Sudut kamera/framing: Framing over-the-shoulder dari belakang seorang pria, berfokus pada seorang wanita yang berdiri di latar belakang. Pria tersebut memegang smartphone hitam secara vertikal untuk mengambil foto. Komposisi vertikal gaya foto ponsel, medium shot, meniru perspektif seseorang yang kebetulan memotret.
Outfit: Pria mengenakan seragam sekolah SMA Indonesia berupa kemeja putih lengan panjang rapi dengan celana abu-abu, lengkap dengan dasi abu-abu dan sepatu sekolah hitam. Wanita mengenakan seragam sekolah SMA Indonesia berupa kemeja putih lengan panjang, rok abu-abu panjang, hijab putih rapi, kaus kaki putih, dan sepatu sekolah hitam.
Pose: Pria berdiri membelakangi penonton, kedua tangan terangkat sambil memegang ponsel. Wanita berdiri di kejauhan sambil tersenyum ke arah ponsel, memegang boneka teddy bear raksasa warna pink cerah dan buket bunga gelap bermotif floral.
Lingkungan: Halaman luar ruangan dengan paving bata abu-abu. Sebuah pohon besar dengan ranting tipis dan bunga putih kecil menggantung di atas pria. Latar belakang menampilkan bangunan dengan pilar merah besar, dinding abu-abu dengan ventilasi kecil, dan dedaunan tropis hijau.
Pencahayaan: Cahaya matahari alami yang terang langsung dari atas. Bayangan keras terlihat di lantai bata. Kontras tinggi antara pria di area teduh dan wanita yang terkena cahaya matahari. Pencahayaan siang alami dengan saturasi warna yang hidup.
Gaya akhir: Resolusi tinggi, gaya foto genggam, tampilan seperti foto iPhone, candid, tidak terlalu sempurna. Hasil akhir harus sesuai dengan framing over-the-shoulder spesifik dan estetika foto amatir spontan seperti referensi.
penting: pria terlihat setengah badan ketutup frame.
Negative Prompt:
worst quality, low quality, normal quality, lowres, blurry, ugly, distorted, deformed, watermark, text, signature, bad anatomy, bad hands, missing fingers, extra limbs, deformed iris, fused fingers, distorted face, unnatural skin, plastic, uncanny valley
rasio aspek 9:16`,
    steps: [
      {
        ai: 'ChatGPT',
        icon: 'fa-brands fa-openai',
        color: '#10a37f',
        steps: [
          'Buka chatgpt.com',
          'Upload foto referensi pria dan wanita',
          'Copy prompt di bawah lalu paste ke kolom chat',
          'Klik Send dan tunggu hasilnya',
        ],
      },
      {
        ai: 'Gemini',
        icon: 'fa-solid fa-gem',
        color: '#4285f4',
        steps: [
          'Buka gemini.google.com',
          'Upload foto referensi pria dan wanita',
          'Copy prompt di bawah lalu paste ke kolom chat',
          'Klik Send dan tunggu hasilnya',
        ],
      },
    ],
  },
  {
    id: 'bmw-night',
    label: 'BMW M4 Night Shot',
    icon: 'fa-car',
    desc: 'Generate foto cinematic bersandar di BMW M4 modifikasi malam hari',
    ai: ['ChatGPT', 'Gemini'],
    example: '/Example_BMW_Lean.jpg',
    prompt: `Create hyper realistic photo of the given character leaning on a modified White BMW M4 Racing Part, taken at night under streetlights, character facing to the camera, photo taken from high angle down, cinematic DSLR photography, EOS R5, 85mm lens, f/1.4, ISO 400, 8k resolution.`,
    steps: [
      {
        ai: 'ChatGPT',
        icon: 'fa-brands fa-openai',
        color: '#10a37f',
        steps: [
          'Buka chatgpt.com',
          'Upload foto wajahmu',
          'Copy prompt di bawah lalu paste ke kolom chat',
          'Klik Send dan tunggu hasilnya',
        ],
      },
      {
        ai: 'Gemini',
        icon: 'fa-solid fa-gem',
        color: '#4285f4',
        steps: [
          'Buka gemini.google.com',
          'Klik icon gambar untuk upload foto wajahmu',
          'Copy prompt di bawah lalu paste ke kolom chat',
          'Klik Send dan tunggu hasilnya',
        ],
      },
    ],
  },
];

export default function PromptPage() {
  const [selected, setSelected] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Layout>
      <Head><title>Prompt Collection — MEG Tools</title></Head>
      <div className="page-wrap">

        <div className="page-header">
          <div className="page-badge">
            <i className="fa-solid fa-wand-magic-sparkles" />
            <span>PROMPT COLLECTION</span>
          </div>
          <h1 className="page-title">Prompt Collection</h1>
          <p className="page-subtitle">
            Kumpulan prompt AI siap pakai. Pilih, copy, dan paste ke ChatGPT atau Gemini.
          </p>
        </div>

        {!selected && (
          <div className="prompt-grid">
            {PROMPTS.map(p => (
              <div
                key={p.id}
                className="prompt-card"
                onClick={() => setSelected(p)}
              >
                <div className="prompt-card-icon">
                  <i className={'fa-solid ' + p.icon} />
                </div>
                <div className="prompt-card-info">
                  <div className="prompt-card-label">{p.label}</div>
                  <div className="prompt-card-desc">{p.desc}</div>
                  <div className="prompt-card-ai">
                    {p.ai.map(a => (
                      <span key={a} className="ai-badge">{a}</span>
                    ))}
                  </div>
                </div>
                <i className="fa-solid fa-chevron-right prompt-card-arrow" />
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div className="detail-wrap">
            <button
              className="btn-back"
              onClick={() => { setSelected(null); setCopied(false); }}
            >
              <i className="fa-solid fa-arrow-left" /> Kembali
            </button>

            <div className="detail-header">
              <div className="detail-icon">
                <i className={'fa-solid ' + selected.icon} />
              </div>
              <div>
                <div className="detail-label">{selected.label}</div>
                <div className="detail-desc">{selected.desc}</div>
              </div>
            </div>

            <div className="example-section">
              <div className="section-title">
                <i className="fa-solid fa-image" /> CONTOH HASIL
              </div>
              <div className="example-img-wrap">
                <img
                  src={selected.example}
                  alt="Contoh hasil"
                  className="example-img"
                />
              </div>
            </div>

            <div className="steps-section">
              <div className="section-title">
                <i className="fa-solid fa-list-check" /> CARA PAKAI
              </div>
              <div className="steps-grid">
                {selected.steps.map(s => (
                  <div key={s.ai} className="steps-card">
                    <div
                      className="steps-ai-header"
                      style={{ color: s.color }}
                    >
                      <i className={s.icon} /> {s.ai}
                    </div>
                    <ol className="steps-list">
                      {s.steps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>

            <div className="prompt-section">
              <div className="section-title">
                <i className="fa-solid fa-code" /> PROMPT
              </div>
              <div className="prompt-box">
                <pre className="prompt-text">{selected.prompt}</pre>
              </div>
              <button
                className={'copy-btn' + (copied ? ' copy-btn--done' : '')}
                onClick={() => handleCopy(selected.prompt)}
              >
                {copied
                  ? <><i className="fa-solid fa-check" /> Tersalin!</>
                  : <><i className="fa-solid fa-copy" /> Copy Prompt</>
                }
              </button>
            </div>
          </div>
        )}

        <div style={{
          '--gray-400': 'var(--muted)',
          '--gray-600': 'var(--border)',
          '--white': 'var(--text)',
        }}>
          <ToolStats toolId="prompts" />
        </div>

      </div>

      <style jsx>{`
        .page-wrap {
          max-width:680px;
          margin:0 auto;
          padding:80px 16px 60px;
          min-height:100vh;
        }
        .page-header { margin-bottom:24px; }
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
        .prompt-grid {
          display:flex;
          flex-direction:column;
          gap:12px;
        }
        .prompt-card {
          background:var(--surface);
          border:2px solid var(--border);
          box-shadow:var(--shadow);
          padding:16px;
          display:flex;
          align-items:center;
          gap:14px;
          cursor:pointer;
          transition:all 0.15s;
        }
        .prompt-card:hover {
          border-color:var(--text);
          transform:translate(-2px,-2px);
          box-shadow:var(--shadow-lg);
        }
        .prompt-card-icon {
          width:44px;
          height:44px;
          background:var(--bg2);
          border:1.5px solid var(--border);
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:1.2rem;
          color:var(--muted);
          flex-shrink:0;
        }
        .prompt-card-info { flex:1; }
        .prompt-card-label {
          font-family:var(--font-body);
          font-weight:700;
          font-size:0.95rem;
          color:var(--text);
          margin-bottom:3px;
        }
        .prompt-card-desc {
          font-size:0.78rem;
          color:var(--muted);
          margin-bottom:8px;
          line-height:1.4;
        }
        .prompt-card-ai {
          display:flex;
          gap:6px;
          flex-wrap:wrap;
        }
        .ai-badge {
          padding:2px 8px;
          border:1px solid var(--border);
          font-family:var(--font-mono);
          font-size:0.6rem;
          letter-spacing:1px;
          color:var(--muted);
          text-transform:uppercase;
        }
        .prompt-card-arrow {
          color:var(--muted);
          font-size:0.8rem;
          flex-shrink:0;
        }
        .detail-wrap {
          display:flex;
          flex-direction:column;
          gap:16px;
        }
        .btn-back {
          display:inline-flex;
          align-items:center;
          gap:8px;
          background:none;
          border:2px solid var(--border);
          color:var(--muted);
          padding:8px 14px;
          font-family:var(--font-mono);
          font-size:0.72rem;
          letter-spacing:1px;
          cursor:pointer;
          width:fit-content;
        }
        .detail-header {
          display:flex;
          align-items:center;
          gap:14px;
          padding:16px;
          background:var(--surface);
          border:2px solid var(--border);
          box-shadow:var(--shadow);
        }
        .detail-icon {
          width:48px;
          height:48px;
          background:var(--bg2);
          border:1.5px solid var(--border);
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:1.4rem;
          color:var(--muted);
          flex-shrink:0;
        }
        .detail-label {
          font-weight:700;
          font-size:1rem;
          color:var(--text);
          margin-bottom:3px;
        }
        .detail-desc { font-size:0.8rem; color:var(--muted); }
        .section-title {
          font-family:var(--font-mono);
          font-size:0.65rem;
          letter-spacing:3px;
          text-transform:uppercase;
          color:var(--muted);
          margin-bottom:10px;
          display:flex;
          align-items:center;
          gap:6px;
        }
        .example-section {
          background:var(--surface);
          border:2px solid var(--border);
          box-shadow:var(--shadow);
          padding:16px;
        }
        .example-img-wrap {
          width:100%;
          background:var(--bg2);
          border:1.5px solid var(--border);
          display:flex;
          justify-content:center;
          padding:12px;
        }
        .example-img {
          max-width:100%;
          max-height:400px;
          object-fit:contain;
          display:block;
        }
        .steps-section {
          background:var(--surface);
          border:2px solid var(--border);
          box-shadow:var(--shadow);
          padding:16px;
        }
        .steps-grid {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:12px;
        }
        .steps-card {
          background:var(--bg2);
          border:1.5px solid var(--border);
          padding:12px;
        }
        .steps-ai-header {
          font-family:var(--font-mono);
          font-size:0.72rem;
          font-weight:700;
          letter-spacing:1px;
          margin-bottom:10px;
          display:flex;
          align-items:center;
          gap:6px;
        }
        .steps-list {
          padding-left:16px;
          margin:0;
          display:flex;
          flex-direction:column;
          gap:6px;
        }
        .steps-list li {
          font-size:0.75rem;
          color:var(--muted);
          line-height:1.4;
          font-family:var(--font-body);
        }
        .prompt-section {
          background:var(--surface);
          border:2px solid var(--border);
          box-shadow:var(--shadow);
          padding:16px;
        }
        .prompt-box {
          background:var(--bg2);
          border:1.5px solid var(--border);
          padding:14px;
          margin-bottom:12px;
          max-height:280px;
          overflow-y:auto;
        }
        .prompt-text {
          font-family:var(--font-mono);
          font-size:0.72rem;
          color:var(--text);
          white-space:pre-wrap;
          word-break:break-word;
          margin:0;
          line-height:1.6;
        }
        .copy-btn {
          width:100%;
          padding:12px;
          background:var(--text);
          color:var(--bg);
          border:none;
          font-family:var(--font-display);
          font-size:0.8rem;
          letter-spacing:2px;
          text-transform:uppercase;
          cursor:pointer;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          transition:all 0.15s;
        }
        .copy-btn--done {
          background:#22c55e;
          color:#fff;
        }
        @media (max-width:480px) {
          .steps-grid { grid-template-columns:1fr; }
        }
      `}</style>
    </Layout>
  );
    }
