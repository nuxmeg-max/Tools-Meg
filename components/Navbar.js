// components/Navbar.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const navLinks = [
  { href: '/download', label: 'Download', icon: 'fa-solid fa-download' },
  { href: '/remove-bg', label: 'Remove BG', icon: 'fa-solid fa-wand-magic-sparkles' },
  { href: '/text-styler', label: 'Text Styler', icon: 'fa-solid fa-font' },
];

export default function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);

  // Baca tema dari localStorage supaya navbar ikut tema
  useEffect(() => {
    const saved = localStorage.getItem('meg-theme');
    if (saved) setDark(saved === 'dark');

    // Listen perubahan tema dari halaman lain
    const observer = new MutationObserver(() => {
      const theme = document.documentElement.getAttribute('data-theme');
      setDark(theme !== 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const bg   = dark ? 'rgba(10,10,10,0.92)'    : 'rgba(245,245,240,0.92)';
  const border = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const textColor = dark ? '#f5f5f0' : '#0a0a0a';
  const subColor  = dark ? '#888888' : '#555555';
  const activeColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const mobileBg  = dark ? '#0e0e0e' : '#ebebeb';

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: bg,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${border}`,
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <span style={{ fontSize: '1.3rem', color: textColor, fontWeight: 800, letterSpacing: '-0.04em', fontFamily: 'var(--font-display)', transition: 'color 0.3s' }}>
              Meg<span style={{ color: subColor }}>.</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="desktop-nav">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.4rem 0.9rem',
                borderRadius: '3px',
                fontSize: '0.82rem',
                fontWeight: 600,
                letterSpacing: '0.02em',
                color: router.pathname.startsWith(link.href) ? textColor : subColor,
                background: router.pathname.startsWith(link.href) ? activeColor : 'transparent',
                transition: 'all 0.15s ease',
                textDecoration: 'none',
              }}>
                <i className={link.icon} style={{ fontSize: '0.75rem' }} />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(!open)} style={{ color: textColor, fontSize: '1.1rem', padding: '0.4rem', background: 'none', border: 'none', cursor: 'pointer' }} className="mobile-menu-btn">
            <i className={`fa-solid ${open ? 'fa-xmark' : 'fa-bars'}`} />
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div style={{ background: mobileBg, borderTop: `1px solid ${border}`, padding: '1rem', transition: 'background 0.3s' }}>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.75rem 0.5rem',
                borderBottom: `1px solid ${border}`,
                color: router.pathname.startsWith(link.href) ? textColor : subColor,
                fontSize: '0.9rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}>
                <i className={link.icon} style={{ width: '16px' }} />
                {link.label}
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
