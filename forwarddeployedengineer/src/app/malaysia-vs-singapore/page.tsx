import type { Metadata } from 'next';
import Link from 'next/link';
import Reveal from '../../components/Reveal';
import ContactButton from '../../components/ContactButton';
import EmailCapture from '../../components/EmailCapture';
import { StatCards, HBarChart } from '../../components/ResultCharts';
import { FlagMY, FlagSG } from '../../components/Flags';

export const metadata: Metadata = {
  title: 'Hire FDE in Malaysia vs Singapore: Cost, Salary, Regulation 2026',
  description: 'Malaysia vs Singapore FDE hiring compared: 35-50% cost gap, salary bands in RM and SGD, BNM vs MAS rules, adoption stats. Quotations and match in 2 days.',
  keywords: [
    'hire forward deployed engineer malaysia',
    'forward deployed engineer singapore',
    'forward deployed engineer kuala lumpur',
    'fde salary malaysia',
    'fde salary singapore',
    'forward deployed engineer jobs malaysia',
    'fde malaysia vs singapore cost',
    'hire fde kuala lumpur',
    'ai engineer salary malaysia vs singapore',
  ],
  openGraph: {
    title: 'Hire FDE in Malaysia vs Singapore: Cost, Salary, Regulation 2026',
    description: 'Same region, 40% cost gap. Salary bands, BNM vs MAS rules, and a 2-day matched shortlist.',
    type: 'article',
  },
};

const topStats = [
  { value: '-40%', label: 'typical MY engineering cost vs SG equivalent' },
  { value: '71% vs 56%', label: 'MY banks vs SG finance firms running AI' },
  { value: '52% vs 42%', label: 'MY vs SG firms blocked by skills gap' },
  { value: '2 days', label: 'our match time in either market' },
];

const salaryRows = [
  { level: 'Junior (0-2 yrs)', sg: 'S$80-110K', my: 'RM120-180K' },
  { level: 'Mid (3-5 yrs)', sg: 'S$110-160K', my: 'RM180-280K' },
  { level: 'Senior (6-8 yrs)', sg: 'S$160-220K', my: 'RM280-420K' },
  { level: 'Principal / FDE lead', sg: 'S$220-300K+', my: 'RM420-600K' },
];

const regRows = [
  { d: 'AI rulebook', bnm: 'RMiT plus AI discussion paper, outcome focused', mas: 'Model eval guidelines plus governance handbook' },
  { d: 'Funding push', bnm: 'Regulatory sandbox for novel uses', mas: 'FSTI 3.0, extra $100M for AI and quantum' },
  { d: 'Data law', bnm: 'PDPA 2024: DPO, 72-hr breach notice', mas: 'PDPA SG with established precedent' },
  { d: 'Bank AI depth', bnm: '71% of banks run 1+ app, pilots up 8x', mas: '30+ FIs run AI functions, some global hubs' },
];

const decisionRows = [
  { s: 'Cost-sensitive build, same quality bar', pick: 'Malaysia', why: '35-50% below SG rates, English-strong seniors' },
  { s: 'MAS-supervised entity, regional HQ optics', pick: 'Singapore', why: 'Regulator next door, global AI hub status' },
  { s: 'Need to start this week', pick: 'Malaysia bench', why: '2-day match from our KL bench, SG travel on request' },
  { s: 'Hardest compliance posture', pick: 'Singapore-led, MY-built', why: 'SG governance face, MY engineering muscle' },
  { s: 'Best value overall', pick: 'Hybrid KL plus SG', why: 'MY team ships, SG lead fronts stakeholders' },
];

const faqs = [
  { q: 'Is Malaysia FDE quality lower than Singapore?', a: 'No. The gap is cost, not capability: MY seniors run 40-55% below SG comp with strong English and the same cloud stacks. We validate every match with a paid trial sprint before you commit.' },
  { q: 'Can data move between MY and SG?', a: 'Yes with safeguards. PDPA 2024 requires whitelisted destinations or contractual clauses, and Singapore is on the practical path. Default posture is Malaysia-resident data with SG access under contract.' },
  { q: 'How fast can we start?', a: 'Shortlist in 2 days from the KL bench, interviews in week one, trial sprint in week two. BNM-regulated scopes add 4-6 weeks for review, so we file early.' },
];

export default function MyVsSgPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Hire FDE in Malaysia vs Singapore',
    description: 'Cost, salary, regulation and adoption compared for FDE hiring.',
  };
  return (
    <div className="page-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="page-hero">
        <div className="container-narrow">
          <Reveal><span className="page-kicker"><FlagMY /> Hiring guide • Malaysia vs Singapore • 2026 bands <FlagSG /></span></Reveal>
          <Reveal delay={0.08}><h1>Hire FDE in <span className="grad">Malaysia or Singapore?</span></h1></Reveal>
          <Reveal delay={0.16}><p className="sub">Same region, 40% cost gap. Compare forward deployed engineer salary bands in RM and SGD, BNM vs MAS rules, bank adoption depth and hiring speed, then get a fixed quote and a matched shortlist in 2 days.</p></Reveal>
          <Reveal delay={0.2}><p className="mono meta" style={{ color: '#FF9A3D' }}>hire fde malaysia • fde singapore jobs • fde kuala lumpur • ai engineer salary malaysia vs singapore</p></Reveal>
          <Reveal delay={0.22}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
              <ContactButton label="Find FDE" source="my-vs-sg-hero" />
            </div>
          </Reveal>
        </div>
      </div>
      <div className="page-body">
        <div className="container-narrow">
          <StatCards stats={topStats} />
          <Reveal>
            <div className="card" style={{ marginTop: 18 }}>
              <h3>Indicative FDE salary bands 2026</h3>
              <p className="meta">SG ranges from published market guides. MY bands market-mapped at 35-50% below SG. FDE roles price above generic AI engineer rates. Request the full report for your exact stack and we verify per search.</p>
              <table className="table">
                <thead><tr><th>Level</th><th>Singapore</th><th>Malaysia</th></tr></thead>
                <tbody>
                  {salaryRows.map((r) => (
                    <tr key={r.level}><td>{r.level}</td><td className="mono">{r.sg}</td><td className="mono">{r.my}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
          <div className="grid-2" style={{ marginTop: 18 }}>
            <Reveal>
              <div className="card">
                <h3>Finance AI adoption (%)</h3>
                <HBarChart data={[{ label: 'SG finance firms', value: 56.4 }, { label: 'MY finance firms', value: 42 }]} unit="%" />
                <p className="meta">Sources: MOM 2026, AWS MY study.</p>
              </div>
            </Reveal>
            <Reveal>
              <div className="card">
                <h3>Deeply embedded AI (%)</h3>
                <HBarChart data={[{ label: 'SG businesses', value: 18 }, { label: 'MY businesses', value: 11 }]} unit="%" />
                <p className="meta">Sources: CPA Australia 2025 business tech reports.</p>
              </div>
            </Reveal>
          </div>
          <Reveal>
            <div className="card" style={{ marginTop: 18 }}>
              <h3>Regulator comparison</h3>
              <table className="table">
                <thead><tr><th>Dimension</th><th>Malaysia (BNM)</th><th>Singapore (MAS)</th></tr></thead>
                <tbody>
                  {regRows.map((r) => (
                    <tr key={r.d}><td>{r.d}</td><td>{r.bnm}</td><td>{r.mas}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
          <Reveal>
            <div className="card" style={{ marginTop: 18 }}>
              <h3>Decision matrix: where should your FDE sit?</h3>
              <table className="table">
                <thead><tr><th>Your situation</th><th>Pick</th><th>Why</th></tr></thead>
                <tbody>
                  {decisionRows.map((r) => (
                    <tr key={r.s}><td>{r.s}</td><td><strong>{r.pick}</strong></td><td>{r.why}</td></tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 14 }}><ContactButton label="Find FDE" source="my-vs-sg-mid" /></div>
            </div>
          </Reveal>
          <Reveal>
            <div className="card" style={{ marginTop: 18 }}>
              <h3>How the 2-day match works</h3>
              <p>Day 0: tell us the outcome, stack and regulator. Day 2: shortlist with verified builds plus a fixed quote. Week 2: paid trial sprint inside your environment. No bench warming, no CV spam.</p>
              <EmailCapture source="my-vs-sg" />
            </div>
          </Reveal>
          {faqs.map((f) => (
            <Reveal key={f.q}>
              <div className="card" style={{ marginTop: 12 }}><strong>{f.q}</strong><p style={{ fontSize: 15 }}>{f.a}</p></div>
            </Reveal>
          ))}
          <Reveal>
            <div className="card" style={{ marginTop: 18, textAlign: 'center' }}>
              <h3>MY cost, SG polish, one contract</h3>
              <p className="meta">Get instant quotations and match in 2 days.</p>
              <ContactButton label="Find FDE" source="my-vs-sg-end" />
              <div style={{ marginTop: 12 }}><Link href="/locations/malaysia">Malaysia guide →</Link> · <Link href="/locations/singapore">Singapore guide →</Link></div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
