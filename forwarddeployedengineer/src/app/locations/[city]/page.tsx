import Link from 'next/link';
import { locations } from '../../../data/directory';
import { malaysiaStats, malaysiaMaturity } from '../../../data/results';
import { StatCards, HBarChart } from '../../../components/ResultCharts';
import { FlagMY, FlagSG } from '../../../components/Flags';
import Reveal from '../../../components/Reveal';

export function generateStaticParams() {
  return locations.map(l => ({ city: l.slug }));
}

export function generateMetadata({ params }: { params: { city: string } }) {
  return {
    title: `Forward Deployed Engineer ${params.city} Jobs + Salary | forwarddeployedengineer`,
    description: `FDE jobs in ${params.city}. Hiring hubs, salary bands, travel expectations.`,
    keywords: [`forward deployed engineer ${params.city}`, `fde jobs ${params.city}`, `fde salary ${params.city}`, 'hire forward deployed engineer'],
  };
}

export default function LocationPage({ params }: { params: { city: string } }) {
  const l = locations.find(x => x.slug === params.city) ?? locations[0];
  return (
    <div className="page-white">
      <div className="page-hero">
        <div className="container-narrow">
          <Reveal><span className="page-kicker">FDE hub • {l.name} {(params.city === 'malaysia' || params.city === 'kuala-lumpur') && <FlagMY />} {params.city === 'singapore' && <FlagSG />}</span></Reveal>
          <Reveal delay={0.08}><h1>FDE in <span className="grad">{l.name}</span></h1></Reveal>
          <Reveal delay={0.16}><p className="sub">{l.note}</p></Reveal>
        </div>
      </div>
      <div className="page-body">
        <div className="container-narrow">
          <Reveal>
            <div className="card">
              <h3>Hiring signal</h3>
              <p className="meta">Look for postings mentioning customer-embedded delivery, on-site deployment weeks, and production ownership. That is the real FDE loop, whatever the title says.</p>
            </div>
          </Reveal>
          {params.city === 'malaysia' && (
            <>
              <Reveal>
                <div className="card">
                  <h3>MY adoption stats (AWS, BNM, CPA)</h3>
                  <StatCards stats={malaysiaStats} />
                </div>
              </Reveal>
              <Reveal>
                <div className="card">
                  <h3>MY maturity split (% of adopters)</h3>
                  <HBarChart data={malaysiaMaturity} unit="%" />
                  <div style={{ marginTop: 12 }}><Link href="/results">Full results with Malaysia angles →</Link></div>
                </div>
              </Reveal>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
