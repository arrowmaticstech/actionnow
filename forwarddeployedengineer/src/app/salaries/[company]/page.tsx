import { companies } from '../../../data/directory';
import EmailCapture from '../../../components/EmailCapture';
import Reveal from '../../../components/Reveal';

export function generateStaticParams() {
  return companies.map(c => ({ company: c.slug }));
}

export function generateMetadata({ params }: { params: { company: string } }) {
  return {
    title: `${params.company} Forward Deployed Engineer Salary 2026 | forwarddeployedengineer`,
    description: `Forward deployed engineer salary at ${params.company}: median, range, equity, levels. Keyword: ${params.company} fde salary.`,
  };
}

export default function SalaryPage({ params }: { params: { company: string } }) {
  const c = companies.find(x => x.slug === params.company) ?? companies[0];
  return (
    <div className="page-white">
      <div className="page-hero">
        <div className="container-narrow">
          <Reveal><span className="page-kicker">{c.name} • 2026 bands • RSU / PPU heavy</span></Reveal>
          <Reveal delay={0.08}><h1>{c.name} FDE <span className="grad">salary</span></h1></Reveal>
          <Reveal delay={0.16}><p className="sub">Median {c.median}, range {c.range}. Equity does the heavy lifting at frontier labs.</p></Reveal>
        </div>
      </div>
      <div className="page-body">
        <div className="container-narrow">
          <Reveal>
            <table className="table">
              <thead><tr><th>Level</th><th>TC</th><th>Notes</th></tr></thead>
              <tbody>
                <tr><td>Entry / New grad</td><td className="mono">$140–$250K</td><td>Base + equity</td></tr>
                <tr><td>Mid</td><td className="mono">{c.median}</td><td>{c.range}</td></tr>
                <tr><td>Staff</td><td className="mono">$630K+</td><td>Palantir staff clears $630K, OpenAI L6 $1.28M</td></tr>
              </tbody>
            </table>
          </Reveal>
          <div style={{ marginTop: 24 }}><EmailCapture source={`salary-${c.slug}`} /></div>
        </div>
      </div>
    </div>
  );
}
