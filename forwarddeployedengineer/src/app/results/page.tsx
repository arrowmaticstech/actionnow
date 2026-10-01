import type { Metadata } from 'next';
import Link from 'next/link';
import Reveal from '../../components/Reveal';
import ContactButton from '../../components/ContactButton';
import { StatCards, HBarChart } from '../../components/ResultCharts';
import { headlineStats, forresterBars, results, malaysiaStats, malaysiaMaturity, malaysiaAngles } from '../../data/results';

export const metadata: Metadata = {
  title: 'FDE Results: ROI, Savings, Compliance Wins by Industry | forwarddeployedengineer',
  description: 'Real deployment outcomes: 315% ROI, Airbus +33%, bank copilots, MY adoption stats with charts. Savings, returns, compliance and risk cuts by industry.',
};

export default function ResultsPage() {
  return (
    <div className="page-white">
      <div className="page-hero">
        <div className="container-narrow">
          <Reveal><span className="page-kicker">Field results • savings • compliance • risk</span></Reveal>
          <Reveal delay={0.08}><h1>Deployed results, <span className="grad">not pilot slides</span></h1></Reveal>
          <Reveal delay={0.16}><p className="sub">What production FDE-style deployments returned across aviation, banking, telecom, manufacturing and IT services, plus what it means for Malaysia.</p></Reveal>
        </div>
      </div>
      <div className="page-body">
        <div className="container-narrow">
          <StatCards stats={headlineStats} />
          <Reveal>
            <div className="card" style={{ marginTop: 18 }}>
              <h3>Forrester TEI: $345M benefits breakdown (3-yr, $M)</h3>
              <p className="meta">Composite 100K-employee enterprise. Supply chain and procurement each cut 30%. Source: Forrester Total Economic Impact of Foundry.</p>
              <HBarChart data={forresterBars} unit="M" />
            </div>
          </Reveal>
          {results.map((r) => (
            <Reveal key={r.company}>
              <div className="card">
                <div className="mono meta">{r.industry}</div>
                <h3>{r.company}</h3>
                <p>{r.deployment}</p>
                <div className="grid-3">
                  {r.metrics.map((m) => (
                    <div key={m.label}>
                      <div className="mono fde-salary" style={{ fontSize: 22 }}>{m.value}</div>
                      <div className="meta">{m.label}</div>
                    </div>
                  ))}
                </div>
                <div className="meta" style={{ marginTop: 10 }}>Source: {r.source}</div>
              </div>
            </Reveal>
          ))}
          <Reveal>
            <div className="card">
              <div className="mono meta">Malaysia context</div>
              <h3>What this means for MY deployments</h3>
              <StatCards stats={malaysiaStats} />
              <div style={{ marginTop: 18 }}>
                <h3>MY maturity split (% of adopters)</h3>
                <HBarChart data={malaysiaMaturity} unit="%" />
              </div>
              {malaysiaAngles.map((a) => (
                <div key={a.title} style={{ marginTop: 14 }}>
                  <strong>{a.title}</strong>
                  <p className="meta" style={{ color: '#0E131A', fontSize: 15 }}>{a.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal>
            <div className="card" style={{ textAlign: 'center' }}>
              <h3>Want these numbers inside your company?</h3>
              <p className="meta">Get instant quotations and match in 2 days.</p>
              <ContactButton label="Find FDE" source="results-page" />
              <div style={{ marginTop: 12 }}><Link href="/usecases">Deep playbooks →</Link> · <Link href="/locations/malaysia">Malaysia FDE guide →</Link></div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
