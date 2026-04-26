// components/Footer.js
export default function Footer() {
  return (
    <footer style={{ borderTop: '2px solid var(--gray-800)', marginTop: 'auto', padding: '2rem 0' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.55rem', letterSpacing: '0.1em' }}>
          <span style={{ color: 'var(--gray-400)' }}>▶</span> MEG
        </span>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--gray-600)' }}>
          © {new Date().getFullYear()} MEG — FREE TOOLS. NO LOGIN.
        </p>
      </div>
    </footer>
  );
}
