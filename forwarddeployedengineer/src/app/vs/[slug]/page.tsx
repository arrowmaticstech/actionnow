import { comparisons } from '../../../data/directory';
import Reveal from '../../../components/Reveal';

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
    <div className="page-white">
      <div className="page-hero">
        <div className="container-narrow">
          <Reveal><span className="page-kicker">{v.keywords.join(' • ')}</span></Reveal>
          <Reveal delay={0.08}><h1>{v.a} <span className="grad">vs</span> {v.b}</h1></Reveal>
          <Reveal delay={0.16}><p className="sub">{v.summary}</p></Reveal>
        </div>
      </div>
      <div className="page-body">
        <div className="container-narrow">
          <Reveal>
            <table className="table">
              <thead><tr><th>Dimension</th><th>{v.a}</th><th>{v.b}</th></tr></thead>
              <tbody>
                <tr><td>Lifecycle</td><td>FDE: post-sale until workflow runs</td><td>SE pre-sale / SA design / Consultant SOW</td></tr>
                <tr><td>Writes prod code at customer</td><td>Yes - primary output</td><td>Rarely / demo / scoped only</td></tr>
                <tr><td>Coding intensity</td><td className="mono">75-80</td><td className="mono">35 (SA/SE), 45 (Impl)</td></tr>
                <tr><td>Sales / quota / utilization</td><td className="mono">15, no quota, no utilization</td><td className="mono">SE 75 quota 70/30, SA 65, Consultant 70-80% util</td></tr>
                <tr><td>Owns prod outcome / paged</td><td>Yes - them</td><td>No - hands off</td></tr>
                <tr><td>Scales by</td><td>Product - ships to customer #2</td><td>Demos / reference arch / headcount</td></tr>
                <tr><td>Reports to</td><td>Engineering / Product</td><td>Sales / Services P&amp;L</td></tr>
              </tbody>
            </table>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
