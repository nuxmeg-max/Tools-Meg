// pages/index.js
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const features = [
  { href: '/download',    icon: 'fa-brands fa-tiktok',             label: 'TIKTOK',      desc: 'Download video & audio tanpa watermark.', tag: 'downloader', toolId: 'tiktok',      prefix: '▶' },
  { href: '/download',    icon: 'fa-brands fa-instagram',          label: 'INSTAGRAM',   desc: 'Download foto, video, reels & stories.',  tag: 'downloader', toolId: 'instagram',   prefix: '▶' },
  { href: '/download',    icon: 'fa-brands fa-youtube',            label: 'YOUTUBE',     desc: 'Download video & audio multi-kualitas.',  tag: 'downloader', toolId: 'youtube',     prefix: '▶' },
  { href: '/download',    icon: 'fa-brands fa-spotify',            label: 'SPOTIFY',     desc: 'Download lagu & playlist ke MP3.',        tag: 'downloader', toolId: 'spotify',     prefix: '♪' },
  { href: '/remove-bg',   icon: 'fa-solid fa-wand-magic-sparkles', label: 'REMOVE BG',   desc: 'Hapus background foto dengan AI.',        tag: 'ai tool',    toolId: 'remove-bg',   prefix: '★' },
  { href: '/text-styler', icon: 'fa-solid fa-font',                label: 'TEXT STYLER', desc: 'Gaya teks Unicode untuk bio & caption.',  tag: 'generator',  toolId: 'text-styler', prefix: '◆' },
];

const HERO_VIDEO = '/BannerVID.mp4';

export default function Home() {
  const [dark, setDark]       = useState(true);
  const [mounted, setMounted] = useState(false);
  const [stats, setStats]     = useState({});
  const [popular, setPopular] = useState('');
  const [cursor, setCursor]   = useState(true);

  useEffect(() => {
    setMounted(true);
    fetch('/api/stats').then(r => r.json()).then(d => {
      if (d.stats) { setStats(d.stats); setPopular(d.popular); }
    }).catch(() => {});
    const saved = localStorage.getItem('meg-theme');
    if (saved) setDark(saved === 'dark');
    const t = setInterval(() => setCursor(c => !c), 500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('meg-theme', dark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark, mounted]);

  const bg        = dark ? '#0a0a0a' : '#f0f0e8';
  const text      = dark ? '#f0f0e8' : '#0a0a0a';
  const sub       = dark ? '#808078' : '#484840';
  const cardBg    = dark ? '#0d0d0c' : '#e0e0d8';
  const borderCol = dark ? '#282820' : '#c0c0b8';

  return (
    <Layout dark={dark}>
      <Head><title>MEG — FREE ONLINE TOOLS</title></Head>

      {/* Floating Theme Toggle */}
      <button
        onClick={() => setDark(!dark)}
        aria-label="Toggle theme"
        style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 200,
          width: '48px', height: '48px',
          background: text, color: bg,
          border: `2px solid ${sub}`,
          boxShadow: `4px 4px 0px ${sub}`,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem',
          transition: 'all 0.05s steps(1)',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = `2px 2px 0px ${sub}`; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = `4px 4px 0px ${sub}`; }}
      >
        <i className={`fa-solid ${dark ? 'fa-sun' : 'fa-moon'}`} />
      </button>

      {/* Hero Video */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: '92vh', display: 'flex', alignItems: 'center' }}>
        <video autoPlay loop muted playsInline style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', zIndex: 0,
          opacity: 0.5,
          filter: 'grayscale(100%) contrast(1.2)',
        }}>
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>

        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: dark
            ? 'linear-gradient(to bottom, rgba(10,10,10,0.4) 0%, rgba(10,10,10,0.8) 100%)'
            : 'linear-gradient(to bottom, rgba(240,240,232,0.4) 0%, rgba(240,240,232,0.85) 100%)',
        }} />

        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          backgroundImage: `linear-gradient(${dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} 1px, transparent 1px), linear-gradient(90deg, ${dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 3, textAlign: 'center', padding: '6rem 1.5rem 4rem' }}>
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: '0.45rem',
              border: `2px solid ${sub}`, padding: '0.4rem 0.8rem',
              color: sub, letterSpacing: '0.15em',
              background: bg, boxShadow: `3px 3px 0px ${borderCol}`,
            }}>
              ★ FREE · NO LOGIN · FAST ★
            </span>
          </div>

          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1rem, 3.5vw, 2rem)',
            lineHeight: 2, letterSpacing: '0.05em',
            color: text, marginBottom: '0.5rem',
            textShadow: `3px 3px 0px ${borderCol}`,
          }}>
            MEG TOOLS<span style={{ color: sub }}>{cursor ? '_' : ' '}</span>
          </div>

          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(0.5rem, 1.5vw, 0.75rem)',
            lineHeight: 2.5, color: sub, marginBottom: '2.5rem', letterSpacing: '0.05em',
          }}>
            ALL-IN-ONE FREE TOOLS
          </div>

          <p style={{ fontFamily: 'var(--font-mono)', color: sub, fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto 2.5rem', lineHeight: 1.8 }}>
            Download TikTok, IG, YouTube, Spotify. Remove background. Style text. Gratis, tanpa daftar.
          </p>

          <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/download" className="btn-primary">
              <i className="fa-solid fa-download" /> START DOWNLOAD
            </Link>
            <Link href="/remove-bg" className="btn-outline">
              <i className="fa-solid fa-wand-magic-sparkles" /> REMOVE BG
            </Link>
          </div>

          <div style={{ marginTop: '4rem', color: sub, fontFamily: 'var(--font-display)', fontSize: '0.45rem', letterSpacing: '0.1em' }}>
            ▼ SCROLL ▼
          </div>
        </div>
      </section>

      {/* Select Tool Header */}
      <section style={{ padding: '3rem 0 1rem' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ flex: 1, height: '2px', background: `repeating-linear-gradient(90deg, ${borderCol} 0px, ${borderCol} 8px, transparent 8px, transparent 16px)` }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.5rem', color: sub, letterSpacing: '0.15em', whiteSpace: 'nowrap' }}>SELECT TOOL</span>
            <div style={{ flex: 1, height: '2px', background: `repeating-linear-gradient(90deg, ${borderCol} 0px, ${borderCol} 8px, transparent 8px, transparent 16px)` }} />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '0 0 5rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '4px' }}>
            {features.map((f, i) => {
              const isPopular = popular === f.toolId;
              return (
                <Link key={i} href={f.href} style={{
                  display: 'block', background: cardBg, padding: '1.75rem',
                  textDecoration: 'none',
                  border: `2px solid ${isPopular ? text : borderCol}`,
                  boxShadow: `4px 4px 0px ${isPopular ? sub : borderCol}`,
                  position: 'relative', transition: 'all 0.05s steps(1)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = `2px 2px 0px ${isPopular ? sub : borderCol}`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = `4px 4px 0px ${isPopular ? sub : borderCol}`; }}
                >
                  {isPopular && (
                    <div style={{ position: 'absolute', top: '-2px', right: '-2px', background: text, color: bg, fontFamily: 'var(--font-display)', fontSize: '0.4rem', padding: '0.2rem 0.5rem', letterSpacing: '0.1em' }}>
                      ★ HOT
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: sub, fontFamily: 'var(--font-display)', fontSize: '0.6rem' }}>{f.prefix}</span>
                      <i className={f.icon} style={{ fontSize: '1.2rem', color: text }} />
                    </div>
                    <span className="tag">{f.tag}</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', letterSpacing: '0.08em', marginBottom: '0.75rem', color: text, lineHeight: 1.8 }}>{f.label}</h3>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: sub, lineHeight: 1.6, marginBottom: '1rem' }}>{f.desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderTop: `1px solid ${borderCol}`, paddingTop: '0.75rem' }}>
                    {stats[f.toolId] && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: sub }}>
                        <i className="fa-solid fa-users" style={{ marginRight: '0.3rem', fontSize: '0.65rem' }} />
                        {stats[f.toolId].usage >= 1000 ? (stats[f.toolId].usage / 1000).toFixed(1) + 'k' : stats[f.toolId].usage}
                      </span>
                    )}
                    {stats[f.toolId] && stats[f.toolId].likes > 0 && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#ff6060' }}>
                        <i className="fa-solid fa-heart" style={{ marginRight: '0.3rem', fontSize: '0.65rem' }} />
                        {stats[f.toolId].likes}
                      </span>
                    )}
                    <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-display)', fontSize: '0.45rem', color: sub }}>▶ PLAY</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* QRIS */}
      <section style={{ padding: '0 0 5rem' }}>
        <div className="container">
          <div style={{ border: `2px solid ${borderCol}`, boxShadow: `4px 4px 0px ${borderCol}`, padding: '2.5rem 2rem', textAlign: 'center', background: cardBg, position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)', background: cardBg, padding: '0 0.75rem' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.45rem', color: sub, letterSpacing: '0.1em' }}>★ SUPPORT MEG ★</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', letterSpacing: '0.08em', marginBottom: '0.75rem', marginTop: '1rem', color: text, lineHeight: 2 }}>
              SUKA DENGAN MEG?
            </h2>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: sub, marginBottom: '1.5rem', lineHeight: 1.8 }}>
              Semua tools gratis. Kalau terbantu, support via QRIS.
            </p>
            <div style={{ display: 'inline-block', border: `2px solid ${borderCol}`, boxShadow: `4px 4px 0px ${borderCol}`, padding: '1rem', background: '#fff', marginBottom: '1rem' }}>
              <img src="/qris.png" alt="QRIS" style={{ width: '200px', height: '200px', display: 'block' }} />
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.4rem', color: sub, letterSpacing: '0.1em' }}>
              ♥ THANK YOU FOR PLAYING ♥
            </p>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(6px); } }
      `}</style>
    </Layout>
  );
}
