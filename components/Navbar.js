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
  const [open, setOpen]   = useState(false);
  const [dark, setDark]   = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('meg-theme');
    if (saved) setDark(saved === 'dark');
    const observer = new MutationObserver(() => {
      const theme = document.documentElement.getAttribute('data-theme');
      setDark(theme === 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'var(--bg)',
        borderBottom: '2px solid var(--border)',
        transition: 'background 0.3s, color 0.3s',
      }}>
        {/* Top dashed stripe */}
        <div style={{
          height: '3px',
          background: 'repeating-linear-gradient(90deg, var(--border) 0px, var(--border) 6px, transparent 6px, transparent 12px)',
          opacity: 0.5,
        }} />

        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '52px' }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: '1.1rem',
              letterSpacing: '5px',
              textTransform: 'uppercase',
              color: 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}>
              MEG
            </span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="desktop-nav">
            {navLinks.map(link => {
              const active = router.pathname.startsWith(link.href);
              return (
                <Link key={link.href} href={link.href} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.85rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  color: active ? 'var(--bg)' : 'var(--muted)',
                  background: active ? 'var(--text)' : 'transparent',
                  border: '2px solid',
                  borderColor: active ? 'var(--border)' : 'transparent',
                  boxShadow: active ? 'var(--shadow)' : 'none',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                }}>
                  <i className={link.icon} style={{ fontSize: '0.6rem' }} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            style={{
              color: 'var(--text)',
              fontSize: '1rem',
              padding: '0.4rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
            className="mobile-menu-btn"
          >
            <i className={`fa-solid ${open ? 'fa-xmark' : 'fa-bars'}`} />
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div style={{
            background: 'var(--bg)',
            borderTop: '2px solid var(--border)',
            padding: '1rem',
          }}>
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.75rem 0.5rem',
                  borderBottom: '1px solid var(--border)',
                  color: router.pathname.startsWith(link.href) ? 'var(--text)' : 'var(--muted)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  opacity: router.pathname.startsWith(link.href) ? 1 : 0.7,
                }}
              >
                <i className={link.icon} style={{ fontSize: '0.65rem', opacity: 0.6 }} />
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
