// components/Footer.js
export default function Footer() {
  return (
    <footer style={{
      borderTop: '2px solid var(--border)',
      marginTop: 'auto',
      padding: '2rem 0',
      background: 'var(--bg)',
      transition: 'background 0.3s, color 0.3s',
    }}>
      {/* Top dashed line */}
      <div style={{
        height: '1px',
        marginBottom: '1.5rem',
        background: 'repeating-linear-gradient(90deg, var(--border) 0px, var(--border) 4px, transparent 4px, transparent 9px)',
        opacity: 0.3,
      }} />

      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: '0.9rem',
          letterSpacing: '5px',
          textTransform: 'uppercase',
          color: 'var(--text)',
          opacity: 0.6,
        }}>
          MEG
        </span>

        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.56rem',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: 'var(--muted)',
          opacity: 0.6,
        }}>
          © {new Date().getFullYear()} MEG — FREE TOOLS. NO LOGIN.
        </p>
      </div>
    </footer>
  );
}
