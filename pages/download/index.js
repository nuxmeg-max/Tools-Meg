// pages/download/index.js
import Head from 'next/head';
import { useState } from 'react';
import Layout from '../../components/Layout';
import TikTokDownloader from '../../components/downloader/TikTokDownloader';
import ToolStats from '../../components/ToolStats';
import InstagramDownloader from '../../components/downloader/InstagramDownloader';
import YouTubeDownloader from '../../components/downloader/YouTubeDownloader';

const tabs = [
  { id: 'tiktok', label: 'TikTok', icon: 'fa-brands fa-tiktok' },
  { id: 'instagram', label: 'Instagram', icon: 'fa-brands fa-instagram' },
  { id: 'youtube', label: 'YouTube', icon: 'fa-brands fa-youtube' },
];

export default function DownloadPage() {
  const [activeTab, setActiveTab] = useState('tiktok');

  return (
    <Layout>
      <Head><title>Meg — Downloader</title></Head>
      <div className="container" style={{ padding: '3rem 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <p className="tag" style={{ marginBottom: '1rem' }}>downloader</p>
          <h1 className="section-title">Download Media</h1>
          <p className="section-sub">Paste URL → klik Download → selesai. Tanpa watermark.</p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '4px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '6px',
          padding: '4px',
          width: 'fit-content',
          marginBottom: '2rem',
        }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 1.1rem',
              borderRadius: '4px',
              fontSize: '0.85rem',
              fontWeight: 600,
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.02em',
              background: activeTab === tab.id ? 'var(--white)' : 'transparent',
              color: activeTab === tab.id ? 'var(--black)' : 'var(--gray-400)',
              transition: 'all 0.15s ease',
              border: 'none',
              cursor: 'pointer',
            }}>
              <i className={tab.icon} style={{ fontSize: '0.9rem' }} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="card">
          {activeTab === 'tiktok' && <><TikTokDownloader /><ToolStats toolId="tiktok" /></>}
          {activeTab === 'instagram' && <><InstagramDownloader /><ToolStats toolId="instagram" /></>}
          {activeTab === 'youtube' && <><YouTubeDownloader /><ToolStats toolId="youtube" /></>}
        </div>

        {/* Info */}
        <p style={{ marginTop: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--gray-600)' }}>
          <i className="fa-solid fa-circle-info" style={{ marginRight: '0.4rem' }} />
          Meg tidak menyimpan konten yang kamu download. Semua diproses langsung via API pihak ketiga.
        </p>
      </div>
    </Layout>
  );
}
