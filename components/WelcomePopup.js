// components/WelcomePopup.js
import { useState, useEffect } from 'react';

const CHANNELS = [
  {
    id: 'wa-channel',
    label: 'Channel WhatsApp',
    desc: 'Follow channel untuk update terbaru',
    icon: 'fa-brands fa-whatsapp',
    color: '#25d366',
    href: 'https://whatsapp.com/channel/0029VbCD4Uf9xVJbc463p91R',
  },
  {
    id: 'wa-group',
    label: 'Grup WhatsApp',
    desc: 'Join grup & diskusi bareng',
    icon: 'fa-brands fa-whatsapp',
    color: '#128c7e',
    href: 'https://chat.whatsapp.com/L43EkQ91uUx0Q0IcgKRBP0',
  },
];

export default function WelcomePopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('meg-welcome-seen');
    if (!seen) setVisible(true);
  }, []);

  const handleSkip = () => {
    localStorage.setItem('meg-welcome-seen', '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      <div className="wp-backdrop" onClick={handleSkip} />
      <div className="wp-box">
        <div className="wp-tag">SELAMAT DATANG</div>
        <h2 className="wp-title">JOIN KOMUNITAS</h2>
        <p className="wp-desc">
          Gabung & follow biar nggak ketinggalan update tools terbaru.
        </p>

        <div className="wp-channels">
          {CHANNELS.map(ch => (
            <a
              key={ch.id}
              href={ch.href}
              target="_blank"
              rel="noopener noreferrer"
              className="wp-channel"
              style={{ '--ch-color': ch.color }}
            >
              <div className="wp-channel-icon">
                <i className={ch.icon} />
              </div>
              <div className="wp-channel-info">
                <div className="wp-channel-label">{ch.label}</div>
                <div className="wp-channel-desc">{ch.desc}</div>
              </div>
              <i className="fa-solid fa-arrow-right wp-channel-arrow" />
            </a>
          ))}
        </div>

        <button className="wp-skip" onClick={handleSkip}>
          Lewati
        </button>
      </div>

      <style jsx>{`
        .wp-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          z-index: 1000;
        }

        .wp-box {
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 480px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-bottom: none;
          border-radius: 20px 20px 0 0;
          padding: 28px 20px 36px;
          z-index: 1001;
          animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes slideUp {
          from { transform: translateX(-50%) translateY(100%); }
          to   { transform: translateX(-50%) translateY(0); }
        }

        .wp-tag {
          display: inline-block;
          font-family: var(--font-mono);
          font-size: 0.6rem;
          letter-spacing: 3px;
          color: var(--muted);
          border: 1px solid var(--border);
          padding: 3px 10px;
          margin-bottom: 12px;
        }

        .wp-title {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 900;
          letter-spacing: 4px;
          color: var(--text);
          margin-bottom: 8px;
          line-height: 1;
        }

        .wp-desc {
          font-family: var(--font-body);
          font-size: 0.85rem;
          color: var(--muted);
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .wp-channels {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 16px;
        }

        .wp-channel {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.15s;
        }
        .wp-channel:hover {
          border-color: var(--ch-color);
          transform: translateY(-1px);
        }

        .wp-channel-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: color-mix(in srgb, var(--ch-color) 15%, transparent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          color: var(--ch-color);
          flex-shrink: 0;
        }

        .wp-channel-info {
          flex: 1;
          min-width: 0;
        }

        .wp-channel-label {
          font-family: var(--font-body);
          font-size: 0.92rem;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 2px;
        }

        .wp-channel-desc {
          font-family: var(--font-body);
          font-size: 0.75rem;
          color: var(--muted);
        }

        .wp-channel-arrow {
          color: var(--muted);
          font-size: 0.8rem;
          flex-shrink: 0;
        }

        .wp-skip {
          width: 100%;
          padding: 12px;
          background: none;
          border: 1px solid var(--border);
          border-radius: 10px;
          font-family: var(--font-mono);
          font-size: 0.78rem;
          letter-spacing: 1px;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.15s;
        }
        .wp-skip:hover {
          color: var(--text);
          border-color: var(--muted);
        }
      `}</style>
    </>
  );
}
