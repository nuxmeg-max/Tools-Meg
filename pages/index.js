// pages/index.js
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const HERO_VIDEO = '/BannerVID.mp4';

const categories = [
  {
    label: 'Downloader',
    tools: [
      { href: '/download?tab=tiktok',    icon: 'fa-brands fa-tiktok',    iconColor: '#ee1d52', label: 'TikTok Downloader',    desc: 'Download media from TikTok without watermark', toolId: 'tiktok' },
{ href: '/download?tab=youtube',   icon: 'fa-brands fa-youtube',   iconColor: '#ff0000', label: 'YouTube Downloader',   desc: 'Download media from YouTube',                  toolId: 'youtube' },
{ href: '/download?tab=instagram', icon: 'fa-brands fa-instagram', iconColor: '#e1306c', label: 'Instagram Downloader', desc: 'Download foto, video, reels & stories',         toolId: 'instagram' },
{ href: '/download?tab=spotify',   icon: 'fa-brands fa-spotify',   iconColor: '#1db954', label: 'Spotify Downloader',   desc: 'Download lagu & playlist ke MP3',               toolId: 'spotify' },    ],
  },
  {
    label: 'AI Tools',
    tools: [
      { href: '/remove-bg', icon: 'fa-solid fa-wand-magic-sparkles', iconColor: '#a78bfa', label: 'Remove Background', desc: 'Hapus background foto dengan AI', toolId: 'remove-bg' },
    ],
  },
  {
    label: 'Generator',
    tools: [
      { href: '/text-styler', icon: 'fa-solid fa-font', iconColor: '#60a5fa', label: 'Text Styler', desc: 'Gaya teks Unicode untuk bio & caption', toolId: 'text-styler' },
    ],
  },
];

export default function Home() {
  const [dark, setDark]       = useState(true);
  const [mounted, setMounted] = useState(false);
  const [stats, setStats]     = useState({});
  const [popular, setPopular] = useState('');
  const [liked, setLiked]     = useState({});

  useEffect(() => {
    setMounted(true);
    fetch('/api/stats').then(r => r.json()).then(d => {
      if (d.stats) { setStats(d.stats); setPopular(d.popular); }
    }).catch(() => {});
    const saved = localStorage.getItem('meg-theme');
    if (saved) setDark(saved === 'dark');
    const savedLiked = JSON.parse(localStorage.getItem('meg-liked') || '{}');
    setLiked(savedLiked);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('meg-theme', dark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark, mounted]);

  const handleLike = async (toolId, e) => {
    e.preventDefault();
    const isLiked = liked[toolId];
    const action = isLiked ? 'unlike' : 'like';
    const newLiked = { ...liked, [toolId]: !isLiked };
    setLiked(newLiked);
    localStorage.setItem('meg-liked', JSON.stringify(newLiked));
    try {
      const r = await fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: toolId, action }),
      });
      const d = await r.json();
      if (d.success) {
        setStats(prev => ({
          ...prev,
          [toolId]: { ...prev[toolId], likes: Math.max(0, d.value) },
        }));
      }
    } catch {}
  };

  const totalTools = categories.reduce((a, c) => a + c.tools.length, 0);
  const totalUsage = Object.values(stats).reduce((a, s) => a + (s?.usage || 0), 0);
  const totalLikes = Object.values(stats).reduce((a, s) => a + (s?.likes || 0), 0);
  const popularTool = categories.flatMap(c => c.tools).find(t => t.toolId === popular);

  const fmt = (n) => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n;

  return (
    <Layout>
      <Head><title>MEG — FREE ONLINE TOOLS</title></Head>

      {/* Theme Toggle */}
      <button onClick={() => setDark(!dark)} aria-label="Toggle theme" className="fab-btn">
        <i className={`fa-solid ${dark ? 'fa-sun' : 'fa-moon'}`} />
      </button>

      <div className="page-wrap">

        {/* ── HEADER ── */}
        <div className="page-header">
          <h1 className="page-title">Available Tools</h1>
          <p className="page-subtitle">Choose a tool to use from the categories below</p>
        </div>

        {/* ── VIDEO BANNER ── */}
        <div className="video-wrap">
          <video autoPlay loop muted playsInline className="banner-video">
            <source src={HERO_VIDEO} type="video/mp4" />
          </video>
          <div className="video-overlay">
            <span className="video-label">MEG TOOLS</span>
          </div>
        </div>

        {/* ── STATS CARDS ── */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Total Tools</span>
              <i className="fa-solid fa-grid-2 stat-icon" />
            </div>
            <div className="stat-value" style={{ color: '#a78bfa' }}>{totalTools}</div>
            <div className="stat-sub">Available</div>
          </div>
          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Total Users</span>
              <i className="fa-solid fa-users stat-icon" />
            </div>
            <div className="stat-value" style={{ color: '#22d3ee' }}>{fmt(totalUsage)}</div>
            <div className="stat-sub">This Month</div>
          </div>
          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Total Likes</span>
              <i className="fa-solid fa-heart stat-icon" />
            </div>
            <div className="stat-value" style={{ color: '#f472b6' }}>{fmt(totalLikes)}</div>
            <div className="stat-sub">Community</div>
          </div>
          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Popular Tool</span>
              <i className="fa-solid fa-arrow-trend-up stat-icon" />
            </div>
            <div className="stat-value stat-value--sm" style={{ color: '#fbbf24' }}>
              {popularTool ? popularTool.label : '—'}
            </div>
            <div className="stat-sub">
              {popularTool && stats[popular]
                ? `${fmt(stats[popular].usage)} users • ${stats[popular].likes} likes`
                : 'No data yet'}
            </div>
          </div>
        </div>

        {/* ── TOOL CATEGORIES ── */}
        {categories.map(cat => (
          <div key={cat.label} className="category-section">
            <h2 className="category-label">{cat.label}</h2>
            <div className="tool-list">
              {cat.tools.map(tool => {
                const s = stats[tool.toolId];
                const isPopular = popular === tool.toolId;
                const isLiked = liked[tool.toolId];
                return (
                  <Link key={tool.toolId} href={tool.href} className={`tool-card${isPopular ? ' tool-card--popular' : ''}`}>
                    {isPopular && <div className="popular-ribbon">POPULAR</div>}

                    <div className="tool-card-top">
                      <div className="tool-icon-wrap" style={{ background: tool.iconColor + '22' }}>
                        <i className={tool.icon} style={{ color: tool.iconColor, fontSize: '1.3rem' }} />
                      </div>
                      <div className="tool-info">
                        <div className="tool-name">{tool.label}</div>
                        <div className="tool-desc">{tool.desc}</div>
                      </div>
                    </div>

                    <div className="tool-card-bottom">
                      <button
                        className={`like-btn${isLiked ? ' like-btn--active' : ''}`}
                        onClick={(e) => handleLike(tool.toolId, e)}
                        aria-label="Like"
                      >
                        <i className={`fa-${isLiked ? 'solid' : 'regular'} fa-heart`} />
                      </button>
                      <div className="tool-stats">
                        {s && (
                          <>
                            <span className="tool-stat">
                              <i className="fa-solid fa-users" /> {fmt(s.usage)}
                            </span>
                            <span className="tool-stat">
                              <i className="fa-solid fa-heart" /> {s.likes}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* ── QRIS ── */}
        <div className="qris-section">
          <div className="qris-box">
            <div className="qris-top-label"> SUPPORT MEG </div>
            <h2 className="qris-title">SUKA DENGAN WEBSITE INI?</h2>
            <p className="qris-desc">Semua tools gratis. Kalau terbantu, support via QRIS.</p>
            <div className="qris-img-wrap">
              <img src="/qris.png" alt="QRIS" width={200} height={200} />
            </div>
            <p className="qris-thanks">♥ THANK YOU ♥</p>
          </div>
        </div>

      </div>

      <style jsx>{`
  .page-wrap {
    max-width: 680px;
    margin: 0 auto;
    padding: 80px 16px 60px;
    min-height: 100vh;
  }

  .fab-btn {
    position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 200;
    width: 48px; height: 48px;
    background: var(--text); color: var(--bg);
    border: 1px solid var(--border); border-radius: 50%;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 1rem; transition: all 0.2s; font-family: inherit;
  }
  .fab-btn:hover { transform: scale(1.1); }

  .page-header { margin-bottom: 20px; }
  .page-title {
    font-size: 1.6rem; font-weight: 700;
    color: var(--text); margin-bottom: 4px;
    font-family: var(--font-body);
  }
  .page-subtitle {
    font-size: 0.88rem; color: var(--muted);
    font-family: var(--font-body);
  }

  .video-wrap {
    position: relative;
    width: 100%; height: 180px;
    border-radius: 16px; overflow: hidden;
    margin-bottom: 20px;
    background: var(--border);
  }
  .banner-video {
    width: 100%; height: 100%;
    object-fit: cover;
    filter: grayscale(60%) brightness(0.7);
  }
  .video-overlay {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.1));
  }
  .video-label {
    font-family: var(--font-display);
    font-weight: 900; font-size: 2.2rem;
    letter-spacing: 8px; text-transform: uppercase;
    color: #fff;
    text-shadow: 2px 2px 12px rgba(0,0,0,0.8);
  }

  .stats-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 12px; margin-bottom: 28px;
  }
  .stat-card {
    background: var(--surface);
    border-radius: 12px; padding: 16px;
    border: 1px solid var(--border);
    transition: background 0.3s, border-color 0.3s;
  }
  .stat-top {
    display: flex; align-items: center;
    justify-content: space-between; margin-bottom: 8px;
  }
  .stat-label {
    font-size: 0.78rem; color: var(--muted);
    font-family: var(--font-body);
  }
  .stat-icon { color: var(--muted); font-size: 0.9rem; }
  .stat-value {
    font-size: 2rem; font-weight: 700;
    font-family: var(--font-body);
    line-height: 1; margin-bottom: 4px;
  }
  .stat-value--sm { font-size: 1rem; line-height: 1.3; }
  .stat-sub { font-size: 0.72rem; color: var(--muted); font-family: var(--font-body); }

  .category-section { margin-bottom: 24px; }
  .category-label {
    font-size: 1.1rem; font-weight: 600;
    color: var(--text); margin-bottom: 12px;
    font-family: var(--font-body);
  }
  .tool-list { display: flex; flex-direction: column; gap: 10px; }

  .tool-card {
    display: block;
    background: var(--surface);
    border-radius: 14px; padding: 16px;
    text-decoration: none;
    border: 1px solid var(--border);
    position: relative; overflow: hidden;
    transition: all 0.2s;
  }
  .tool-card:hover { border-color: var(--muted); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
  .tool-card--popular { border-color: #f59e0b; box-shadow: 0 0 0 1px rgba(245,158,11,0.2); }

  .popular-ribbon {
    position: absolute; top: 12px; right: -24px;
    background: #f59e0b; color: #000;
    font-size: 0.52rem; font-weight: 700;
    padding: 3px 30px; transform: rotate(35deg);
    letter-spacing: 1px; font-family: var(--font-body);
  }

  .tool-card-top {
    display: flex; align-items: center; gap: 14px;
    margin-bottom: 14px;
  }
  .tool-icon-wrap {
    width: 48px; height: 48px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .tool-info { flex: 1; min-width: 0; }
  .tool-name {
    font-size: 1rem; font-weight: 600;
    color: var(--text); margin-bottom: 3px;
    font-family: var(--font-body);
  }
  .tool-desc { font-size: 0.8rem; color: var(--muted); font-family: var(--font-body); }

  .tool-card-bottom {
    display: flex; align-items: center; justify-content: space-between;
  }
  .like-btn {
    background: none; border: none; cursor: pointer;
    color: var(--muted); font-size: 1rem; padding: 4px;
    transition: all 0.15s; line-height: 1;
  }
  .like-btn--active { color: #f472b6; }
  .like-btn:hover { color: #f472b6; transform: scale(1.2); }

  .tool-stats { display: flex; align-items: center; gap: 8px; }
  .tool-stat {
    font-size: 0.75rem; color: var(--muted);
    display: flex; align-items: center; gap: 4px;
    font-family: var(--font-body);
    background: var(--bg2); padding: 4px 10px; border-radius: 20px;
  }
  .tool-stat i { font-size: 0.65rem; }

  .qris-section { margin-top: 32px; margin-bottom: 24px; }
  .qris-box {
    background: var(--surface); border-radius: 16px;
    border: 1px solid var(--border); padding: 28px 20px;
    text-align: center; position: relative;
    transition: background 0.3s, border-color 0.3s;
  }
  .qris-top-label {
    position: absolute; top: -11px; left: 50%;
    transform: translateX(-50%);
    background: var(--surface); padding: 0 12px;
    font-size: 0.6rem; color: var(--muted); letter-spacing: 3px;
    font-family: var(--font-mono); white-space: nowrap;
  }
  .qris-title {
    font-family: var(--font-display); font-weight: 900;
    font-size: 1.4rem; letter-spacing: 4px;
    color: var(--text); margin-bottom: 8px;
  }
  .qris-desc { font-size: 0.85rem; color: var(--muted); margin-bottom: 20px; font-family: var(--font-body); }
  .qris-img-wrap {
    display: inline-block; background: #fff;
    padding: 12px; border-radius: 12px; margin-bottom: 14px;
  }
  .qris-img-wrap img { display: block; border-radius: 4px; }
  .qris-thanks { font-size: 0.6rem; color: var(--muted); letter-spacing: 3px; font-family: var(--font-mono); }

  @media (max-width: 400px) {
    .stats-grid { gap: 8px; }
    .stat-value { font-size: 1.6rem; }
    .video-wrap { height: 140px; }
    .video-label { font-size: 1.6rem; }
  }
`}</style>
    </Layout>
  );
}
