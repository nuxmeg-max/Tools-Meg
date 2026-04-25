// components/Footer.js
export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.06)',
      marginTop: 'auto',
      padding: '2rem 0',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.03em' }}>
          Meg<span style={{ color: 'var(--gray-400)' }}>.</span>
        </span>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--gray-600)' }}>
          © {new Date().getFullYear()} Meg — Free tools, no login.
        </p>
      </div>
    </footer>
  );
}
