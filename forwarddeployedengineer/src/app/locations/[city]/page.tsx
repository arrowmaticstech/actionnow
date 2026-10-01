import { locations } from '../../../data/directory';
import Reveal from '../../../components/Reveal';

export function generateStaticParams() {
  return locations.map(l => ({ city: l.slug }));
}

export function generateMetadata({ params }: { params: { city: string } }) {
  return {
    title: `Forward Deployed Engineer ${params.city} Jobs + Salary | forwarddeployedengineer`,
    description: `FDE jobs in ${params.city}. Hiring hubs, salary bands, travel expectations.`,
  };
}

export default function LocationPage({ params }: { params: { city: string } }) {
  const l = locations.find(x => x.slug === params.city) ?? locations[0];
  return (
    <div className="page-white">
      <div className="page-hero">
        <div className="container-narrow">
          <Reveal><span className="page-kicker">FDE hub • {l.name}</span></Reveal>
          <Reveal delay={0.08}><h1>FDE in <span className="grad">{l.name}</span></h1></Reveal>
          <Reveal delay={0.16}><p className="sub">{l.note}</p></Reveal>
        </div>
      </div>
      <div className="page-body">
        <div className="container-narrow">
          <Reveal>
            <div className="card">
              <h3>Hiring signal</h3>
              <p className="meta">Look for postings mentioning customer-embedded delivery, on-site deployment weeks, and production ownership — that&apos;s the real FDE loop, whatever the title says.</p>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
