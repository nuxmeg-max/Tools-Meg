// pages/index.js
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const features = [
  { href: '/download', icon: 'fa-brands fa-tiktok', label: 'TikTok', desc: 'Download video & audio TikTok tanpa watermark.', tag: 'downloader', toolId: 'tiktok' },
  { href: '/download', icon: 'fa-brands fa-instagram', label: 'Instagram', desc: 'Download foto, video, reels, dan stories IG.', tag: 'downloader', toolId: 'instagram' },
  { href: '/download', icon: 'fa-brands fa-youtube', label: 'YouTube', desc: 'Download video & audio YouTube dalam berbagai kualitas.', tag: 'downloader', toolId: 'youtube' },
  { href: '/remove-bg', icon: 'fa-solid fa-wand-magic-sparkles', label: 'Remove BG', desc: 'Hapus background foto & video secara otomatis dengan AI.', tag: 'ai tool', toolId: 'remove-bg' },
  { href: '/text-styler', icon: 'fa-solid fa-font', label: 'Text Styler', desc: 'Ubah teks biasa jadi berbagai gaya font unik untuk bio atau caption.', tag: 'generator', toolId: 'text-styler' },
];

// Video loop hero — pakai free stock video dari Pixabay CDN
// Ganti src dengan video kamu sendiri kalau mau
const HERO_VIDEO = 'public/BannerVID.mp4';

export default function Home() {
  const [dark, setDark] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({});
  const [popular, setPopular] = useState('');

  useEffect(() => {
    setMounted(true);
    // Fetch stats untuk homepage
    fetch('/api/stats').then(r => r.json()).then(d => {
      if (d.stats) { setStats(d.stats); setPopular(d.popular); }
    }).catch(() => {});
    const saved = localStorage.getItem('meg-theme');
    if (saved) setDark(saved === 'dark');
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('meg-theme', dark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark, mounted]);

  return (
    <Layout dark={dark}>
      <Head><title>Meg — Free Online Tools</title></Head>

      {/* ── Floating Theme Toggle ── */}
      <button
        onClick={() => setDark(!dark)}
        aria-label="Toggle theme"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 200,
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: dark ? '#f5f5f0' : '#0a0a0a',
          color: dark ? '#0a0a0a' : '#f5f5f0',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.1rem',
          boxShadow: dark
            ? '0 4px 20px rgba(255,255,255,0.15)'
            : '0 4px 20px rgba(0,0,0,0.3)',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: 'scale(1)',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.12)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <i className={`fa-solid ${dark ? 'fa-sun' : 'fa-moon'}`} />
      </button>

      {/* ── Hero dengan Video Loop ── */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: '92vh', display: 'flex', alignItems: 'center' }}>

        {/* Video background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            zIndex: 0,
            opacity: 0.18,
          }}
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>

        {/* Gradient overlay supaya teks tetap terbaca */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: dark
            ? 'linear-gradient(to bottom, rgba(10,10,10,0.5) 0%, rgba(10,10,10,0.85) 100%)'
            : 'linear-gradient(to bottom, rgba(245,245,240,0.6) 0%, rgba(245,245,240,0.92) 100%)',
        }} />

        {/* Grid pattern di atas video */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        {/* Content */}
        <div className="container" style={{ position: 'relative', zIndex: 3, textAlign: 'center', padding: '6rem 1.5rem 4rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <span className="tag">Free · No Login · Fast</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(3rem, 9vw, 6.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.05em',
            lineHeight: 1,
            marginBottom: '1.5rem',
            color: dark ? '#f5f5f0' : '#0a0a0a',
          }}>
            Semua tools<br />
            <span style={{ color: dark ? '#888' : '#555' }}>dalam satu tempat.</span>
          </h1>

          <p style={{
            fontFamily: 'var(--font-mono)',
            color: dark ? '#888' : '#555',
            fontSize: '1rem',
            maxWidth: '480px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.7,
          }}>
            Download video dari TikTok, IG, YouTube. Remove background. Style text.
            Gratis, tanpa daftar.
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/download" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.85rem 1.75rem',
              borderRadius: '100px',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '0.88rem',
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              background: dark ? '#f5f5f0' : '#0a0a0a',
              color: dark ? '#0a0a0a' : '#f5f5f0',
              textDecoration: 'none',
              transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow: dark ? '0 0 0 0 rgba(245,245,240,0)' : '0 0 0 0 rgba(10,10,10,0)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.04)'; e.currentTarget.style.boxShadow = dark ? '0 8px 30px rgba(245,245,240,0.2)' : '0 8px 30px rgba(0,0,0,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <i className="fa-solid fa-download" /> Mulai Download
            </Link>

            <Link href="/remove-bg" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.85rem 1.75rem',
              borderRadius: '100px',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '0.88rem',
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              background: 'transparent',
              color: dark ? '#f5f5f0' : '#0a0a0a',
              border: `1px solid ${dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
              textDecoration: 'none',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.04)'; e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'; }}
            >
              <i className="fa-solid fa-wand-magic-sparkles" /> Remove BG
            </Link>
          </div>

          {/* Scroll indicator */}
          <div style={{ marginTop: '4rem', color: dark ? '#555' : '#aaa' }}>
            <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.8rem', animation: 'bounce 2s infinite' }} />
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section style={{ padding: '3rem 0 5rem' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1px',
            background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
            borderRadius: '8px',
            overflow: 'hidden',
          }}>
            {features.map((f, i) => (
              <Link key={i} href={f.href} style={{
                display: 'block',
                background: dark ? '#0a0a0a' : '#f5f5f0',
                padding: '2rem',
                textDecoration: 'none',
                transition: 'background 0.2s ease, transform 0.2s ease',
              }}
                onMouseEnter={e => e.currentTarget.style.background = dark ? '#141414' : '#ebebeb'}
                onMouseLeave={e => e.currentTarget.style.background = dark ? '#0a0a0a' : '#f5f5f0'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <i className={f.icon} style={{ fontSize: '1.6rem', color: dark ? '#d1d1d1' : '#222' }} />
                  <span className="tag">{f.tag}</span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: dark ? '#f5f5f0' : '#0a0a0a' }}>{f.label}</h3>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: dark ? '#888' : '#555', lineHeight: 1.6 }}>{f.desc}</p>
                {/* Stats row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  {popular && f.href.includes(popular.replace('tiktok','download').replace('instagram','download').replace('youtube','download')) && popular === ['tiktok','instagram','youtube'].find(x => f.icon.includes(x)) || popular === 'remove-bg' && f.href === '/remove-bg' || popular === 'text-styler' && f.href === '/text-styler' ? (
                    <span style={{ display:'inline-flex', alignItems:'center', gap:'0.25rem', background:'linear-gradient(135deg,#f59e0b,#ef4444)', borderRadius:'100px', padding:'0.15rem 0.5rem', fontSize:'0.65rem', fontWeight:700, color:'#fff', letterSpacing:'0.05em', textTransform:'uppercase' }}>
                      <i className="fa-solid fa-fire" style={{ fontSize:'0.6rem' }}/> Popular
                    </span>
                  ) : null}
                  {stats[f.toolId] && (
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.72rem', color: dark?'#555':'#999' }}>
                      <i className="fa-solid fa-users" style={{ marginRight:'0.25rem', fontSize:'0.65rem' }}/>
                      {stats[f.toolId].usage >= 1000 ? (stats[f.toolId].usage/1000).toFixed(1)+'k' : stats[f.toolId].usage} pengguna
                    </span>
                  )}
                  {stats[f.toolId] && stats[f.toolId].likes > 0 && (
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.72rem', color:'#ff6060' }}>
                      <i className="fa-solid fa-heart" style={{ marginRight:'0.25rem', fontSize:'0.65rem' }}/>
                      {stats[f.toolId].likes}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── QRIS Support ── */}
      <section style={{ padding: '1rem 0 5rem' }}>
        <div className="container">
          <div style={{
            border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
            borderRadius: '8px',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            background: dark ? '#0d0d0d' : '#efefea',
          }}>
            <span className="tag" style={{ marginBottom: '1rem', display: 'inline-block' }}>Support Meg</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.03em', color: dark ? '#f5f5f0' : '#0a0a0a' }}>
              Suka dengan Meg?
            </h2>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: dark ? '#888' : '#555', marginBottom: '1.5rem', lineHeight: 1.7 }}>
              Semua tools ini gratis. Kalau kamu merasa terbantu,<br />
              kamu bisa support dengan scan QRIS di bawah.
            </p>
            <div style={{ display: 'inline-block', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', padding: '1rem', background: '#fff', marginBottom: '1rem' }}>
              <img src="/qris.png" alt="QRIS Support Meg" style={{ width: '200px', height: '200px', display: 'block', objectFit: 'contain' }} />
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: dark ? '#555' : '#888' }}>
              <i className="fa-solid fa-heart" style={{ color: '#ff6060', marginRight: '0.3rem' }} />
              Terima kasih sudah menggunakan Meg!
            </p>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        [data-theme="light"] {
          --black: #f5f5f0;
          --white: #0a0a0a;
          --gray-100: #222;
          --gray-200: #333;
          --gray-400: #555;
          --gray-600: #888;
          --gray-800: #bbb;
          --border: rgba(0,0,0,0.08);
          --accent: #e8e8e0;
        }
      `}</style>
    </Layout>
  );
}
