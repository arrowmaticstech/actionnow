import type { Metadata } from 'next';
import Link from 'next/link';
import Reveal from '../../components/Reveal';
import { usecases } from '../../data/usecases';

export const metadata: Metadata = {
  title: 'FDE Use Cases: RAG, Evals, HITL, Hardening, MY Deployments | forwarddeployedengineer',
  description: 'Deep deployment playbooks: RAG failure modes, eval harnesses, regulator-accepted human review, webhook hardening, AI SLIs, BNM-ready copilots, Bahasa evals.',
  keywords: ['RAG production deployment', 'LLM eval harness', 'human in the loop AI banking', 'AI SLI SLO', 'Bahasa Malaysia LLM eval', 'BNM AI deployment'],
};

export default function UsecasesPage() {
  return (
    <div className="page-white">
      <div className="page-hero">
        <div className="container-narrow">
          <Reveal><span className="page-kicker">Field playbooks • loop engineering • hardening</span></Reveal>
          <Reveal delay={0.08}><h1>Use cases, <span className="grad">engineered deep</span></h1></Reveal>
          <Reveal delay={0.16}><p className="sub">Not feature lists. Each playbook covers the loops that keep quality up and the hardening that keeps prod alive, with Malaysia angles throughout.</p></Reveal>
        </div>
      </div>
      <div className="page-body">
        <div className="container-narrow">
          {usecases.map((u, i) => (
            <Reveal key={u.slug} delay={Math.min(i * 0.05, 0.25)}>
              <div className="card">
                <div className="mono meta">{u.kicker}</div>
                <h3><Link href={`/usecases/${u.slug}`}>{u.title}</Link></h3>
                <p>{u.intro}</p>
                <Link href={`/usecases/${u.slug}`}>Read the playbook →</Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
