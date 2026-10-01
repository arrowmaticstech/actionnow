import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <strong style={{ color: '#0E131A' }}>&gt;_forwarddeployedengineer</strong>
            <p className="meta">All FDE jobs, salaries, interviews in one place.</p>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            <div>
              <div className="mono meta">CAREER</div>
              <div><Link href="/jobs">Jobs</Link></div>
              <div><Link href="/salaries/palantir">Salaries</Link></div>
              <div><Link href="/interview/palantir">Interview</Link></div>
            </div>
            <div>
              <div className="mono meta">COMPARE</div>
              <div><Link href="/vs/forward-deployed-engineer-vs-solutions-architect">FDE vs SA</Link></div>
              <div><Link href="/vs/forward-deployed-engineer-vs-sales-engineer">FDE vs SE</Link></div>
              <div><Link href="/locations/new-york">NYC</Link></div>
            </div>
          </div>
        </div>
        <p className="meta" style={{ marginTop: 24 }}>© 2026 forwarddeployedengineer. Research for inspiration — don&apos;t copy listings.</p>
      </div>
    </footer>
  );
}
