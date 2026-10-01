import type { Metadata } from 'next';
import EmailCapture from '../../components/EmailCapture';
import ContactButton from '../../components/ContactButton';
import Reveal from '../../components/Reveal';

export const metadata: Metadata = {
  title: 'Forward Deployed Engineer Jobs — Live Board | forwarddeployedengineer',
  description: 'Live Forward Deployed Engineer jobs at Palantir, OpenAI, Anthropic, Anduril, Scale AI. Contact us for quotations and matches.',
};

const jobs = [
  { id: 1, company: 'Palantir', title: 'Forward Deployed Software Engineer', loc: 'New York, NY', tc: '$135–$200K base', tag: 'Delta' },
  { id: 2, company: 'OpenAI', title: 'Forward Deployed Engineer', loc: 'Singapore / 50% travel', tc: '$350–$550K TC', tag: 'Frontier' },
  { id: 3, company: 'Anthropic', title: 'Forward Deployed Engineer', loc: 'San Francisco', tc: '$350–$550K', tag: 'PPU' },
  { id: 4, company: 'Anduril', title: 'Forward Deployed Engineer - Edge Autonomy', loc: 'Costa Mesa / DC', tc: 'Clearance+', tag: 'Defense' },
];

export default function JobsPage() {
  return (
    <div className="page-white">
      <div className="page-hero">
        <div className="container-narrow">
          <Reveal><span className="page-kicker">● Live board — updated weekly</span></Reveal>
          <Reveal delay={0.08}><h1>Forward Deployed <span className="grad">Engineer jobs</span></h1></Reveal>
          <Reveal delay={0.16}><p className="sub">Palantir, OpenAI, Anthropic, Anduril, Scale AI — who&apos;s hiring FDEs right now, where, and for how much.</p></Reveal>
        </div>
      </div>
      <div className="page-body">
        <div className="container-narrow">
          {jobs.map((j, i) => (
            <Reveal key={j.id} delay={Math.min(i * 0.06, 0.3)}>
              <div className="card">
                <div className="mono meta">{j.company} • {j.tag}</div>
                <h3>{j.title}</h3>
                <div>{j.loc}</div>
                <div className="mono fde-salary">{j.tc}</div>
              </div>
            </Reveal>
          ))}
          <Reveal>
            <div className="card">
              <h3>Need FDEs or a deployment quote?</h3>
              <p className="meta">Tell us your needs — get instant quotations and match in 2 days.</p>
              <ContactButton label="Contact" source="jobs-page" />
            </div>
          </Reveal>
          <div style={{ marginTop: 24 }}><EmailCapture source="jobs" /></div>
        </div>
      </div>
    </div>
  );
}
