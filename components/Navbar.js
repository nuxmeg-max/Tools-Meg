// components/Navbar.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const navLinks = [
  { href: '/download',    label: 'Download',    icon: 'fa-solid fa-download' },
  { href: '/remove-bg',   label: 'Remove BG',   icon: 'fa-solid fa-wand-magic-sparkles' },
  { href: '/text-styler', label: 'Text Styler', icon: 'fa-solid fa-font' },
];

export default function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('meg-theme');
    if (saved) setDark(saved === 'dark');
    const observer = new MutationObserver(() => {
      const theme = document.documentElement.getAttribute('data-theme');
      setDark(theme !== 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const bg     = dark ? '#0a0a0a' : '#f0f0e8';
  const border = dark ? '#282820' : '#c0c0b8';
  const text   = dark ? '#f0f0e8' : '#0a0a0a';
  const sub    = dark ? '#808078' : '#484840';

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: bg,
        borderBottom: `2px solid ${border}`,
        transition: 'background 0.1s steps(2)',
      }}>
        <div style={{ height: '2px', background: `repeating-linear-gradient(90deg, ${text} 0px, ${text} 8px, transparent 8px, transparent 16px)` }} />
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '52px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', color: text, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ color: sub }}>▶</span> MEG
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.1rem' }} className="desktop-nav">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                fontFamily: 'var(--font-display)',
                fontSize: '0.45rem',
                letterSpacing: '0.08em',
                color: router.pathname.startsWith(link.href) ? bg : sub,
                background: router.pathname.startsWith(link.href) ? text : 'transparent',
                border: `2px solid ${router.pathname.startsWith(link.href) ? text : 'transparent'}`,
                textDecoration: 'none',
                transition: 'all 0.05s steps(1)',
              }}>
                <i className={link.icon} style={{ fontSize: '0.6rem' }} />
                {link.label}
              </Link>
            ))}
          </div>

          <button onClick={() => setOpen(!open)} style={{ color: text, fontSize: '1rem', padding: '0.4rem', background: 'none', border: 'none', cursor: 'pointer' }} className="mobile-menu-btn">
            <i className={`fa-solid ${open ? 'fa-xmark' : 'fa-bars'}`} />
          </button>
        </div>

        {open && (
          <div style={{ background: bg, borderTop: `2px solid ${border}`, padding: '1rem' }}>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.75rem 0.5rem',
                borderBottom: `2px solid ${border}`,
                color: router.pathname.startsWith(link.href) ? text : sub,
                fontFamily: 'var(--font-display)',
                fontSize: '0.5rem',
                letterSpacing: '0.08em',
                textDecoration: 'none',
              }}>
                <span style={{ color: sub }}>▶</span>{link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <style jsx>{`
        .desktop-nav { display: flex; }
        .mobile-menu-btn { display: none; }
        @media (max-width: 640px) {
          .desktop-nav { display: none; }
          .mobile-menu-btn { display: block; }
        }
      `}</style>
    </>
  );
}
