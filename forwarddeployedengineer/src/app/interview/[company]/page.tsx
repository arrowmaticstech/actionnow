import { companies } from '../../../data/directory';
import Reveal from '../../../components/Reveal';

export function generateStaticParams() {
  return companies.map(c => ({ company: c.slug }));
}

export function generateMetadata({ params }: { params: { company: string } }) {
  return {
    title: `${params.company} FDE Interview: Decomposition, Questions | forwarddeployedengineer`,
    description: `Forward deployed engineer interview at ${params.company}: 5 stages, decomposition case (911/ER), client sim, coding. 30+ questions.`,
    keywords: [`${params.company} forward deployed engineer interview`, 'forward deployed engineer interview questions', 'fde decomposition round'],
  };
}

const rounds = [
  { t: 'Decomposition (60 min)', d: '\u201CReduce 911 response times with 911 + traffic + GPS data. Go.\u201D Don\u2019t jump to AI. Scope, stakeholders, MVP dashboard first.' },
  { t: 'Coding (60 min)', d: 'Practical: messy CSV/JSON \u2192 clean API, idempotent webhooks, RAG debug. LeetCode medium fluency is enough.' },
  { t: 'Client sim (45 min)', d: 'Acknowledge \u2192 Diagnose \u2192 Own. Push back without over-promising. This round rejects the most candidates.' },
];

export default function InterviewPage({ params }: { params: { company: string } }) {
  return (
    <div className="page-white">
      <div className="page-hero">
        <div className="container-narrow">
          <Reveal><span className="page-kicker">{params.company} • decomposition • client sim</span></Reveal>
          <Reveal delay={0.08}><h1>{params.company} FDE <span className="grad">interview</span></h1></Reveal>
          <Reveal delay={0.16}><p className="sub">Not LeetCode-hard. Ambiguity, production judgment, and the customer conversation decide it.</p></Reveal>
        </div>
      </div>
      <div className="page-body">
        <div className="container-narrow">
          {rounds.map((r, i) => (
            <Reveal key={r.t} delay={Math.min(i * 0.06, 0.3)}>
              <div className="card"><h3>{i + 1}. {r.t}</h3><p>{r.d}</p></div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
