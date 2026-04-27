// pages/download/index.js
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import TikTokDownloader from '../../components/downloader/TikTokDownloader';
import InstagramDownloader from '../../components/downloader/InstagramDownloader';
import YouTubeDownloader from '../../components/downloader/YouTubeDownloader';
import SpotifyDownloader from '../../components/downloader/SpotifyDownloader';
import ToolStats from '../../components/ToolStats';

const tabs = [
  { id: 'tiktok',    label: 'TIKTOK',    icon: 'fa-brands fa-tiktok' },
  { id: 'instagram', label: 'INSTAGRAM', icon: 'fa-brands fa-instagram' },
  { id: 'youtube',   label: 'YOUTUBE',   icon: 'fa-brands fa-youtube' },
  { id: 'spotify',   label: 'SPOTIFY',   icon: 'fa-brands fa-spotify' },
];

export default function DownloadPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('tiktok');

  // Baca ?tab= dari URL, set activeTab sesuai
  useEffect(() => {
    if (!router.isReady) return;
    const tab = router.query.tab;
    if (tab && tabs.find(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [router.isReady, router.query.tab]);

  return (
    <Layout>
      <Head><title>MEG — Downloader</title></Head>
      <div className="container" style={{ padding: '3rem 1.5rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <p className="tag" style={{ marginBottom: '1rem', display: 'inline-block' }}>downloader</p>
          <h1 className="section-title">DOWNLOAD MEDIA</h1>
          <p className="section-sub">Paste URL → klik Download → selesai.</p>
        </div>

        <div style={{ display: 'flex', gap: '4px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 1rem',
              fontFamily: 'var(--font-display)',
              fontSize: '0.45rem',
              letterSpacing: '0.08em',
              background: activeTab === tab.id ? 'var(--white)' : 'transparent',
              color: activeTab === tab.id ? 'var(--black)' : 'var(--gray-400)',
              border: `2px solid ${activeTab === tab.id ? 'var(--white)' : 'var(--gray-800)'}`,
              boxShadow: activeTab === tab.id ? '3px 3px 0px var(--gray-600)' : '3px 3px 0px var(--gray-800)',
              cursor: 'pointer',
              transition: 'all 0.05s steps(1)',
            }}>
              <i className={tab.icon} style={{ fontSize: '0.7rem' }} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="card">
          {activeTab === 'tiktok'    && <><TikTokDownloader />    <ToolStats toolId="tiktok" /></>}
          {activeTab === 'instagram' && <><InstagramDownloader /> <ToolStats toolId="instagram" /></>}
          {activeTab === 'youtube'   && <><YouTubeDownloader />   <ToolStats toolId="youtube" /></>}
          {activeTab === 'spotify'   && <><SpotifyDownloader />   <ToolStats toolId="spotify" /></>}
        </div>

        <p style={{ marginTop: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--gray-600)' }}>
          <i className="fa-solid fa-circle-info" style={{ marginRight: '0.4rem' }} />
          Meg tidak menyimpan konten yang kamu download.
        </p>
      </div>
    </Layout>
  );
}
