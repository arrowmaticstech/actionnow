import Link from 'next/link';
import { comparisons } from '../../../data/directory';

export function generateStaticParams() {
  return comparisons.map(c => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const v = comparisons.find(x => x.slug === params.slug);
  return {
    title: `${v?.a} vs ${v?.b} 2026 | forwarddeployedengineer`,
    description: `${v?.summary} FDE coding 75 vs SA/SE 35. Quota, ownership, salary.`,
  };
}

export default function VsPage({ params }: { params: { slug: string } }) {
  const v = comparisons.find(x => x.slug === params.slug) ?? comparisons[0];
  return (
    <div className="container section">
      <div className="mono meta">{v.keywords.join(' • ')}</div>
      <h1 style={{ fontSize: 'clamp(34px,5vw,56px)', letterSpacing: '-.03em' }}>{v.a} vs {v.b}</h1>
      <p style={{ maxWidth: 720, fontSize: 18 }}>{v.summary}</p>
      <table className="table">
        <thead><tr><th>Dimension</th><th>{v.a}</th><th>{v.b}</th></tr></thead>
        <tbody>
          <tr><td>Lifecycle</td><td>FDE: post-sale until workflow runs</td><td>SE pre-sale / SA design / Consultant SOW</td></tr>
          <tr><td>Writes prod code at customer</td><td>Yes — primary output</td><td>Rarely / demo / scoped only</td></tr>
          <tr><td>Coding intensity</td><td className="mono">75-80</td><td className="mono">35 (SA/SE), 45 (Impl)</td></tr>
          <tr><td>Sales / quota / utilization</td><td className="mono">15, no quota, no utilization</td><td className="mono">SE 75 quota 70/30, SA 65, Consultant 70-80% util</td></tr>
          <tr><td>Owns prod outcome / paged</td><td>Yes — them</td><td>No — hands off</td></tr>
          <tr><td>Scales by</td><td>Product — ships to customer #2</td><td>Demos / reference arch / headcount</td></tr>
          <tr><td>Reports to</td><td>Engineering / Product</td><td>Sales / Services P&amp;L</td></tr>
        </tbody>
      </table>
      <div className="pill-row">
        <Link className="kbd-link" href="/vs/forward-deployed-engineer-vs-solutions-architect-vs-sales-engineer-vs-consultant">Read mega comparison →</Link>
        <Link className="kbd-link" href="/jobs">See who hires each →</Link>
      </div>
    </div>
  );
}
