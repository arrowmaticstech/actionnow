import { companies } from '../../../data/directory';
import Reveal from '../../../components/Reveal';

export function generateStaticParams() {
  return companies.map(c => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const c = companies.find(x => x.slug === params.slug);
  return {
    title: `${c?.name} Forward Deployed Engineer Jobs, Salary, Interview | forwarddeployedengineer`,
    description: `${c?.name} FDE: ${c?.salary}, range ${c?.range}. Jobs, interview decomposition, locations. Keywords: ${c?.keywords.join(', ')}`,
    keywords: [...(c?.keywords ?? []), 'forward deployed engineer jobs', 'forward deployed engineer salary'],
  };
}

export default function CompanyPage({ params }: { params: { slug: string } }) {
  const c = companies.find(x => x.slug === params.slug) ?? companies[0];
  return (
    <div className="page-white">
      <div className="page-hero">
        <div className="container-narrow">
          <Reveal><span className="page-kicker">{c.keywords.join(' • ')}</span></Reveal>
          <Reveal delay={0.08}><h1>{c.name} <span className="grad">Forward Deployed Engineer</span></h1></Reveal>
          <Reveal delay={0.16}><p className="sub">{c.description}</p></Reveal>
        </div>
      </div>
      <div className="page-body">
        <div className="container-narrow">
          <Reveal>
            <div className="card"><h3>Salary</h3><div className="mono fde-salary">{c.salary}</div><div>{c.range}</div></div>
          </Reveal>
          <Reveal>
            <div className="card"><h3>Locations</h3><div>{c.location}</div></div>
          </Reveal>
          <Reveal>
            <div className="card"><h3>Interview</h3><p className="meta">Decomposition + coding + client sim. See /interview/{c.slug}</p></div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
