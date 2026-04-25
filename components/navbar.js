// components/Navbar.js
import { useState } from 'react';
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

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(10,10,10,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <span style={{ fontSize: '1.3rem', color: 'var(--white)', fontWeight: 800, letterSpacing: '-0.04em', fontFamily: 'var(--font-display)' }}>
              Meg<span style={{ color: 'var(--gray-400)' }}>.</span>
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
                color: router.pathname.startsWith(link.href) ? 'var(--white)' : 'var(--gray-400)',
                background: router.pathname.startsWith(link.href) ? 'rgba(255,255,255,0.07)' : 'transparent',
                transition: 'all 0.15s ease',
                textDecoration: 'none',
              }}>
                <i className={link.icon} style={{ fontSize: '0.75rem' }} />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(!open)} style={{ color: 'var(--white)', fontSize: '1.1rem', padding: '0.4rem' }} className="mobile-menu-btn">
            <i className={`fa-solid ${open ? 'fa-xmark' : 'fa-bars'}`} />
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div style={{ background: '#0e0e0e', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1rem' }}>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.75rem 0.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                color: router.pathname.startsWith(link.href) ? 'var(--white)' : 'var(--gray-400)',
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
