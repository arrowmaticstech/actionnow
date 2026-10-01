import Link from 'next/link';
import EmailCapture from '../components/EmailCapture';
import GradientHero from '../components/GradientHero';
import { companies, comparisons, locations, faqs, malaysiaContext } from '../data/directory';

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'forwarddeployedengineer',
    url: 'https://forwarddeployedengineer.com',
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="hero">
        <GradientHero />
        <div className="container hero-content">
          <div className="hero-badges">
            <span className="fde-badge fde-badge--live">● 2,400+ roles tracked</span>
            <span className="fde-badge">PALANTIR • OPENAI • ANTHROPIC • MALAYSIA HUB</span>
          </div>
          <h1>Every <span className="grad">Forward Deployed Engineer</span> job, salary & interview — in one place.</h1>
          <p className="sub">FDE = the engineer embedded with customers who ships production AI on their data. Median $174K base, Palantir $215K TC, OpenAI $555K. Including FDE vs SA vs SE vs Consultant breakdowns and the Malaysia / KL track.</p>
          <div style={{ marginTop: 28, maxWidth: 640 }}><EmailCapture source="hero" /></div>
          <div className="hero-stats">
            <div className="hero-stat"><b>800%</b><span>listing spike</span></div>
            <div className="hero-stat"><b>$140K–$630K+</b><span>TC range</span></div>
            <div className="hero-stat"><b>NYC 35%</b><span>top hub, KL growing</span></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>FDE salaries 2026</h2>
          <p className="meta">The table everyone screenshots. Frontier-lab packages are RSU/PPU-heavy.</p>
          <table className="table">
            <thead><tr><th>Company</th><th>Median TC</th><th>Range</th><th>Hub</th></tr></thead>
            <tbody>
              {companies.map(c => (
                <tr key={c.slug}>
                  <td><Link href={`/companies/${c.slug}`}>{c.name}</Link></td>
                  <td className="mono fde-salary">{c.median}</td>
                  <td>{c.range}</td>
                  <td>{c.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container">
          <h2>FDE vs SA vs SE vs Consultant</h2>
          <p className="meta">Titles lie. Check reporting line + comp plan. FDE: coding 75-80, sales 15, no quota. SA/SE: coding 35, sales 65-75. Consultant: utilization 70-80%.</p>
          <div className="grid-3">
            {comparisons.map(v => (
              <div key={v.slug} className="card">
                <div className="mono meta">{v.keywords[0]}</div>
                <h3><Link href={`/vs/${v.slug}`}>{v.a} vs {v.b}</Link></h3>
                <p className="meta" style={{ color: '#C7CDD8' }}>{v.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>{malaysiaContext.title}</h2>
          {malaysiaContext.body.map(p => <p key={p.slice(0, 24)} style={{ maxWidth: 760 }}>{p}</p>)}
          <div className="pill-row">
            <Link className="kbd-link" href="/locations/malaysia">FDE Malaysia guide →</Link>
            <Link className="kbd-link" href="/locations/kuala-lumpur">FDE Kuala Lumpur jobs →</Link>
            <Link className="kbd-link" href="/vs/forward-deployed-engineer-vs-consultant">FDE vs Consultant →</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Browse by company & city</h2>
          <div className="grid-3">
            <div className="card"><h3>Companies</h3>{companies.map(c => <div key={c.slug}><Link href={`/companies/${c.slug}`}>{c.name} FDE</Link> · <Link href={`/interview/${c.slug}`}>interview</Link> · <Link href={`/salaries/${c.slug}`}>salary</Link></div>)}</div>
            <div className="card"><h3>Cities</h3>{locations.map(l => <div key={l.slug}><Link href={`/locations/${l.slug}`}>FDE {l.name}</Link></div>)}</div>
            <div className="card"><h3>Start here</h3><div><Link href="/jobs">All FDE jobs →</Link></div><div><Link href="/vs/forward-deployed-engineer-vs-solutions-architect-vs-sales-engineer-vs-consultant">Mega comparison →</Link></div></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>FAQ</h2>
          {faqs.map(f => <div key={f.q} className="card" style={{ marginBottom: 12 }}><strong>{f.q}</strong><p style={{ color: '#0E131A', fontSize: 15 }}>{f.a}</p></div>)}
          <EmailCapture source="footer" />
        </div>
      </section>
    </>
  );
}
