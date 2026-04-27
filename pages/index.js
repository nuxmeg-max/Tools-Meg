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
  const [dark, setDark]       = useState(false);
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

  return (
    <Layout>
      <Head><title>MEG — FREE ONLINE TOOLS</title></Head>

      {/* Floating Theme Toggle */}
      <button onClick={() => setDark(!dark)} aria-label="Toggle theme" className="fab-theme-btn">
        <i className={`fa-solid ${dark ? 'fa-sun' : 'fa-moon'}`} />
      </button>

      {/* ===== HERO ===== */}
      <section className="hero-section">
        <video autoPlay loop muted playsInline className="hero-video">
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
        <div className="hero-overlay" />
        <div className="hero-grid" />

        <div className="container hero-content">
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
            <span className="hero-badge">★ FREE · NO LOGIN · FAST ★</span>
          </div>

          <h1 className="hero-title">
            MEG TOOLS<span className="hero-cursor">{cursor ? '_' : '\u00a0'}</span>
          </h1>

          <p className="hero-subtitle">ALL-IN-ONE FREE TOOLS</p>

          <p className="hero-desc">
            Download TikTok, IG, YouTube, Spotify.<br />
            Remove background. Style text.<br />
            Gratis, tanpa daftar.
          </p>

          <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/download" className="btn-primary">
              <i className="fa-solid fa-download" /> START DOWNLOAD
            </Link>
            <Link href="/remove-bg" className="btn-outline">
              <i className="fa-solid fa-wand-magic-sparkles" /> REMOVE BG
            </Link>
          </div>

          <div className="hero-scroll-hint">▼ SCROLL ▼</div>
        </div>
      </section>

      {/* ===== SELECT TOOL ===== */}
      <section style={{ padding: '3rem 0 1rem' }}>
        <div className="container">
          <div className="section-sep"><span>SELECT TOOL</span></div>
        </div>
      </section>

      {/* ===== FEATURES GRID ===== */}
      <section style={{ padding: '0 0 5rem' }}>
        <div className="container">
          <div className="features-grid">
            {features.map((f, i) => {
              const isPopular = popular === f.toolId;
              return (
                <Link key={i} href={f.href} className={`feature-card${isPopular ? ' feature-card--popular' : ''}`}>
                  {isPopular && <div className="popular-badge">★ HOT</div>}

                  <div className="feature-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="feature-prefix">{f.prefix}</span>
                      <i className={f.icon} style={{ fontSize: '1.2rem', color: 'var(--text)' }} />
                    </div>
                    <span className="tag">{f.tag}</span>
                  </div>

                  <h3 className="feature-label">{f.label}</h3>
                  <p className="feature-desc">{f.desc}</p>

                  <div className="feature-footer">
                    {stats[f.toolId] && (
                      <span className="feature-stat">
                        <i className="fa-solid fa-users" />
                        {stats[f.toolId].usage >= 1000
                          ? (stats[f.toolId].usage / 1000).toFixed(1) + 'k'
                          : stats[f.toolId].usage}
                      </span>
                    )}
                    {stats[f.toolId] && stats[f.toolId].likes > 0 && (
                      <span className="feature-likes">
                        <i className="fa-solid fa-heart" />
                        {stats[f.toolId].likes}
                      </span>
                    )}
                    <span className="feature-play">▶ PLAY</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== QRIS ===== */}
      <section style={{ padding: '0 0 5rem' }}>
        <div className="container">
          <div className="qris-box">
            <div className="qris-label">★ SUPPORT MEG ★</div>
            <h2 className="qris-title">SUKA DENGAN MEG?</h2>
            <p className="qris-desc">Semua tools gratis. Kalau terbantu, support via QRIS.</p>
            <div className="qris-img-wrap">
              <img src="/qris.png" alt="QRIS" style={{ width: '200px', height: '200px', display: 'block' }} />
            </div>
            <p className="qris-thanks">♥ THANK YOU FOR PLAYING ♥</p>
          </div>
        </div>
      </section>

      <style jsx>{`
        .fab-theme-btn {
          position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 200;
          width: 48px; height: 48px;
          background: var(--text); color: var(--bg);
          border: 2px solid var(--border);
          box-shadow: var(--shadow-lg);
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          font-size: 1rem; transition: all 0.15s; font-family: inherit;
        }
        .fab-theme-btn:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0px var(--border); }
        .fab-theme-btn:active { transform: translate(2px,2px); box-shadow: none; }

        .hero-section {
          position: relative; overflow: hidden;
          min-height: 92vh; display: flex; align-items: center;
        }
        .hero-video {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover; z-index: 0;
          opacity: 0.55; filter: grayscale(80%) contrast(1.1);
        }
        .hero-overlay {
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(to bottom, transparent 20%, var(--bg) 100%);
        }
        .hero-grid {
          position: absolute; inset: 0; z-index: 2; pointer-events: none;
          background-image:
            linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .hero-content {
          position: relative; z-index: 3;
          text-align: center; padding: 6rem 1.5rem 4rem;
        }
        .hero-badge {
          font-family: var(--font-mono); font-size: 0.58rem;
          border: 2px solid var(--border); padding: 0.45rem 1rem;
          color: var(--muted); letter-spacing: 3px; text-transform: uppercase;
          background: var(--surface); box-shadow: var(--shadow);
        }
        .hero-title {
          font-family: var(--font-display); font-weight: 900;
          font-size: clamp(2.5rem, 10vw, 5rem);
          letter-spacing: 8px; text-transform: uppercase;
          color: var(--text); line-height: 1;
          margin: 1.5rem 0 0.5rem;
          text-shadow: 4px 4px 0px var(--border);
        }
        .hero-cursor { color: var(--muted); }
        .hero-subtitle {
          font-family: var(--font-mono); font-size: 0.58rem;
          letter-spacing: 5px; text-transform: uppercase;
          color: var(--muted); margin-bottom: 2rem;
        }
        .hero-desc {
          font-family: var(--font-body); color: var(--muted);
          font-size: 0.9rem; max-width: 380px;
          margin: 0 auto 2.5rem; line-height: 1.9;
        }
        .hero-scroll-hint {
          margin-top: 4rem; color: var(--muted);
          font-family: var(--font-mono); font-size: 0.52rem;
          letter-spacing: 3px; text-transform: uppercase; opacity: 0.6;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 6px;
        }
        .feature-card {
          display: block; background: var(--surface); padding: 1.75rem;
          text-decoration: none; border: 2px solid var(--border);
          box-shadow: var(--shadow); position: relative; transition: all 0.15s;
        }
        .feature-card:hover { transform: translate(-2px,-2px); box-shadow: var(--shadow-lg); }
        .feature-card:active { transform: translate(2px,2px); box-shadow: none; }
        .feature-card--popular { border-color: var(--text); box-shadow: var(--shadow-lg); }
        .popular-badge {
          position: absolute; top: -2px; right: -2px;
          background: var(--text); color: var(--bg);
          font-family: var(--font-mono); font-size: 0.52rem;
          padding: 0.2rem 0.6rem; letter-spacing: 2px; text-transform: uppercase;
        }
        .feature-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
        .feature-prefix { color: var(--muted); font-family: var(--font-display); font-size: 0.7rem; }
        .feature-label {
          font-family: var(--font-display); font-weight: 900;
          font-size: 1rem; letter-spacing: 4px; text-transform: uppercase;
          margin-bottom: 0.6rem; color: var(--text); line-height: 1.2;
        }
        .feature-desc { font-family: var(--font-body); font-size: 0.82rem; color: var(--muted); line-height: 1.7; margin-bottom: 1rem; }
        .feature-footer { display: flex; align-items: center; gap: 0.75rem; border-top: 1px solid var(--border); padding-top: 0.75rem; opacity: 0.8; }
        .feature-stat { font-family: var(--font-mono); font-size: 0.7rem; color: var(--muted); display: flex; align-items: center; gap: 0.3rem; }
        .feature-likes { font-family: var(--font-mono); font-size: 0.7rem; color: #c05050; display: flex; align-items: center; gap: 0.3rem; }
        .feature-play { margin-left: auto; font-family: var(--font-mono); font-size: 0.52rem; color: var(--muted); letter-spacing: 2px; }

        .qris-box { border: 2px solid var(--border); box-shadow: var(--shadow-lg); padding: 2.5rem 2rem; text-align: center; background: var(--surface); position: relative; }
        .qris-label { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--surface); padding: 0 0.75rem; font-family: var(--font-mono); font-size: 0.52rem; color: var(--muted); letter-spacing: 3px; text-transform: uppercase; white-space: nowrap; }
        .qris-title { font-family: var(--font-display); font-weight: 900; font-size: 1.6rem; letter-spacing: 5px; text-transform: uppercase; margin: 1rem 0 0.75rem; color: var(--text); }
        .qris-desc { font-family: var(--font-body); font-size: 0.85rem; color: var(--muted); margin-bottom: 1.5rem; line-height: 1.8; }
        .qris-img-wrap { display: inline-block; border: 2px solid var(--border); box-shadow: var(--shadow-lg); padding: 1rem; background: #fff; margin-bottom: 1rem; }
        .qris-thanks { font-family: var(--font-mono); font-size: 0.52rem; color: var(--muted); letter-spacing: 3px; text-transform: uppercase; opacity: 0.7; }
      `}</style>
    </Layout>
  );
}
