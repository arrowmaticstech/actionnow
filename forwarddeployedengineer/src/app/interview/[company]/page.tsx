import { companies } from '../../../data/directory';

export function generateStaticParams() {
  return companies.map(c => ({ company: c.slug }));
}

export function generateMetadata({ params }: { params: { company: string } }) {
  return {
    title: `${params.company} FDE Interview: Decomposition, Questions | forwarddeployedengineer`,
    description: `Forward deployed engineer interview at ${params.company}: 5 stages, decomposition case (911/ER), client sim, coding. 30+ questions.`,
  };
}

export default function InterviewPage({ params }: { params: { company: string } }) {
  return (
    <div className="container section">
      <h1>{params.company} Forward Deployed Engineer interview</h1>
      <p className="meta">Keywords: {params.company} fde interview questions, decomposition round, client simulation</p>
      <div className="grid-3">
        <div className="card"><h3>1. Decomposition (60 min)</h3><p>“Reduce 911 response times with 911 + traffic + GPS data. Go.” Don&apos;t jump to AI. Scope, stakeholders, MVP dashboard first.</p></div>
        <div className="card"><h3>2. Coding (60 min)</h3><p>Practical: messy CSV/JSON → clean API, idempotent webhooks, RAG debug. LeetCode medium fluency enough.</p></div>
        <div className="card"><h3>3. Client sim (45 min)</h3><p>Acknowledge → Diagnose → Own. Push back without over-promising.</p></div>
      </div>
    </div>
  );
}
