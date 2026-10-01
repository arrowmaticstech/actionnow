import type { Metadata } from 'next';
import Link from 'next/link';
import EmailCapture from '../../components/EmailCapture';

export const metadata: Metadata = {
  title: 'Forward Deployed Engineer Jobs — Live Board | forwarddeployedengineer',
  description: 'Live Forward Deployed Engineer jobs at Palantir, OpenAI, Anthropic, Anduril, Scale AI. Post a job $299, get weekly alerts.',
};

const jobs = [
  { id: 1, company: 'Palantir', title: 'Forward Deployed Software Engineer', loc: 'New York, NY', tc: '$135–$200K base', tag: 'Delta' },
  { id: 2, company: 'OpenAI', title: 'Forward Deployed Engineer', loc: 'Singapore / 50% travel', tc: '$350–$550K TC', tag: 'Frontier' },
  { id: 3, company: 'Anthropic', title: 'Forward Deployed Engineer', loc: 'San Francisco', tc: '$350–$550K', tag: 'PPU' },
  { id: 4, company: 'Anduril', title: 'Forward Deployed Engineer - Edge Autonomy', loc: 'Costa Mesa / DC', tc: 'Clearance+', tag: 'Defense' },
];

export default function JobsPage() {
  return (
    <div className="container section">
      <span className="fde-badge fde-badge--live">● LIVE</span>
      <h1>Forward Deployed Engineer jobs</h1>
      <p className="meta">Keywords: forward deployed engineer jobs, fde hiring, palantir openai anthropic hiring</p>
      <div className="grid-3">
        {jobs.map(j => (
          <div key={j.id} className="card">
            <div className="mono meta">{j.company} • {j.tag}</div>
            <h3>{j.title}</h3>
            <div>{j.loc}</div>
            <div className="mono fde-salary">{j.tc}</div>
          </div>
        ))}
      </div>
      <div id="post" style={{ marginTop: 24 }} className="card">
        <h3>Employers: post a job $299</h3>
        <p className="meta">Reach FDE candidates. Featured for 30 days + newsletter.</p>
        <Link href="#signup" className="btn btn-employer">Post a job</Link>
      </div>
      <div style={{ marginTop: 24 }}><EmailCapture source="jobs" /></div>
    </div>
  );
}
