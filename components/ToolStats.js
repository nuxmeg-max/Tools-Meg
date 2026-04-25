// components/ToolStats.js
// Komponen like button + usage counter + popular badge
// Dipakai di setiap halaman tool (download, remove-bg, text-styler)

import { useState, useEffect } from 'react';

export default function ToolStats({ toolId, onUse }) {
  const [likes, setLikes]       = useState(0);
  const [usage, setUsage]       = useState(0);
  const [liked, setLiked]       = useState(false);
  const [popular, setPopular]   = useState(false);
  const [loading, setLoading]   = useState(true);
  const [likeAnim, setLikeAnim] = useState(false);

  // Fetch stats saat mount
  useEffect(() => {
    fetchStats();
    // Cek apakah user sudah like sebelumnya (simpan di localStorage)
    const likedTools = JSON.parse(localStorage.getItem('meg-liked') || '[]');
    setLiked(likedTools.includes(toolId));
  }, [toolId]);

  // Track usage saat komponen mount (artinya user buka halaman tool ini)
  useEffect(() => {
    trackUsage();
  }, [toolId]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.stats?.[toolId]) {
        setLikes(data.stats[toolId].likes);
        setUsage(data.stats[toolId].usage);
      }
      setPopular(data.popular === toolId);
    } catch {
      // Gagal fetch — tampilkan 0
    } finally {
      setLoading(false);
    }
  };

  const trackUsage = async () => {
    try {
      await fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: toolId, action: 'use' }),
      });
    } catch { /* silent fail */ }
  };

  const handleLike = async () => {
    const newLiked = !liked;
    const action = newLiked ? 'like' : 'unlike';

    // Optimistic UI update
    setLiked(newLiked);
    setLikes(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 400);

    // Simpan ke localStorage
    const likedTools = JSON.parse(localStorage.getItem('meg-liked') || '[]');
    if (newLiked) {
      localStorage.setItem('meg-liked', JSON.stringify([...likedTools, toolId]));
    } else {
      localStorage.setItem('meg-liked', JSON.stringify(likedTools.filter(t => t !== toolId)));
    }

    // Kirim ke server
    try {
      await fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: toolId, action }),
      });
    } catch { /* silent fail */ }
  };

  const formatNumber = (n) => {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return n.toString();
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 0',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      marginTop: '1.5rem',
      flexWrap: 'wrap',
    }}>
      {/* Popular badge */}
      {popular && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
          borderRadius: '100px',
          padding: '0.25rem 0.7rem',
          fontSize: '0.7rem',
          fontWeight: 700,
          fontFamily: 'var(--font-display)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: '#fff',
        }}>
          <i className="fa-solid fa-fire" style={{ fontSize: '0.65rem' }} />
          Popular
        </div>
      )}

      {/* Usage count */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.78rem',
        color: 'var(--gray-400)',
      }}>
        <i className="fa-solid fa-users" style={{ fontSize: '0.72rem' }} />
        {loading ? '...' : formatNumber(usage)} pengguna
      </div>

      {/* Separator */}
      <span style={{ color: 'var(--gray-600)', fontSize: '0.7rem' }}>·</span>

      {/* Like button */}
      <button
        onClick={handleLike}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.78rem',
          color: liked ? '#ff6060' : 'var(--gray-400)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0.25rem 0.5rem',
          borderRadius: '100px',
          transition: 'all 0.15s ease',
          transform: likeAnim ? 'scale(1.3)' : 'scale(1)',
        }}
      >
        <i className={`fa-${liked ? 'solid' : 'regular'} fa-heart`} style={{ fontSize: '0.85rem' }} />
        {loading ? '...' : formatNumber(likes)}
      </button>
    </div>
  );
}
