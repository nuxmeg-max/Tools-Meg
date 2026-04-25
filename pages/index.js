// pages/index.js
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';

const features = [
  {
    href: '/download',
    icon: 'fa-brands fa-tiktok',
    label: 'TikTok',
    desc: 'Download video & audio TikTok tanpa watermark.',
    tag: 'downloader',
  },
  {
    href: '/download',
    icon: 'fa-brands fa-instagram',
    label: 'Instagram',
    desc: 'Download foto, video, reels, dan stories IG.',
    tag: 'downloader',
  },
  {
    href: '/download',
    icon: 'fa-brands fa-youtube',
    label: 'YouTube',
    desc: 'Download video & audio YouTube dalam berbagai kualitas.',
    tag: 'downloader',
  },
  {
    href: '/remove-bg',
    icon: 'fa-solid fa-wand-magic-sparkles',
    label: 'Remove BG',
    desc: 'Hapus background foto & video secara otomatis dengan AI.',
    tag: 'ai tool',
  },
  {
    href: '/text-styler',
    icon: 'fa-solid fa-font',
    label: 'Text Styler',
    desc: 'Ubah teks biasa jadi berbagai gaya font unik untuk bio atau caption.',
    tag: 'generator',
  },
];

export default function Home() {
  return (
    <Layout>
      <Head><title>Meg — Free Online Tools</title></Head>

      {/* Hero */}
      <section style={{ padding: '6rem 0 4rem', position: 'relative', overflow: 'hidden' }}>
        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <span className="tag">Free · No Login · Fast</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: 800,
            letterSpacing: '-0.05em',
            lineHeight: 1,
            marginBottom: '1.5rem',
          }}>
            Semua tools<br />
            <span style={{ color: 'var(--gray-400)' }}>dalam satu tempat.</span>
          </h1>

          <p style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--gray-400)',
            fontSize: '1rem',
            maxWidth: '480px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.7,
          }}>
            Download video dari TikTok, IG, YouTube. Remove background. Style text.
            Gratis, tanpa daftar.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/download" className="btn-primary">
              <i className="fa-solid fa-download" />
              Mulai Download
            </Link>
            <Link href="/remove-bg" className="btn-outline">
              <i className="fa-solid fa-wand-magic-sparkles" />
              Remove BG
            </Link>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section style={{ padding: '2rem 0 6rem' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '6px',
            overflow: 'hidden',
          }}>
            {features.map((f, i) => (
              <Link key={i} href={f.href} style={{
                display: 'block',
                background: 'var(--black)',
                padding: '2rem',
                textDecoration: 'none',
                transition: 'background 0.15s ease',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#111'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--black)'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <i className={f.icon} style={{ fontSize: '1.6rem', color: 'var(--gray-200)' }} />
                  <span className="tag">{f.tag}</span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{f.label}</h3>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--gray-400)', lineHeight: 1.6 }}>{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
