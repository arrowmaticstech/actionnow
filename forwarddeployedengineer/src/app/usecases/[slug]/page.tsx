import type { Metadata } from 'next';
import Link from 'next/link';
import Reveal from '../../../components/Reveal';
import ContactButton from '../../../components/ContactButton';
import { StatCards } from '../../../components/ResultCharts';
import { usecases } from '../../../data/usecases';

export function generateStaticParams() {
  return usecases.map((u) => ({ slug: u.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const u = usecases.find((x) => x.slug === params.slug);
  return {
    title: `${u?.title} | forwarddeployedengineer`,
    description: u?.intro.slice(0, 155),
    keywords: [...(u?.keywords ?? []), 'forward deployed engineer use cases', 'hire fde malaysia'],
  };
}

export default function UsecasePage({ params }: { params: { slug: string } }) {
  const idx = usecases.findIndex((x) => x.slug === params.slug);
  const u = usecases[idx] ?? usecases[0];
  const prev = usecases[(idx - 1 + usecases.length) % usecases.length];
  const next = usecases[(idx + 1) % usecases.length];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: u.title,
    description: u.intro,
  };
  return (
    <div className="page-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="page-hero">
        <div className="container-narrow">
          <Reveal><span className="page-kicker">{u.kicker}</span></Reveal>
          <Reveal delay={0.08}><h1>{u.title}</h1></Reveal>
          <Reveal delay={0.16}><p className="sub">{u.intro}</p></Reveal>
          <Reveal delay={0.2}><p className="mono meta" style={{ color: '#FF9A3D' }}>{u.keywords.join(' • ')}</p></Reveal>
        </div>
      </div>
      <div className="page-body">
        <div className="container-narrow">
          <Reveal>
            <div className="card">
              <h3>The problem in prod</h3>
              <ul>
                {u.problem.map((p) => (
                  <li key={p.slice(0, 24)} style={{ marginBottom: 8 }}>{p}</li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal>
            <div className="card">
              <h3>Loop engineering</h3>
              <p className="meta">Quality compounds when every failure feeds a named loop with an owner and a metric.</p>
              {u.loops.map((l) => (
                <div key={l.title} style={{ marginTop: 14 }}>
                  <strong>{l.title}</strong>
                  <p style={{ margin: '6px 0 0' }}>{l.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <StatCards stats={u.metrics} />
          <Reveal>
            <div className="card" style={{ marginTop: 18 }}>
              <h3>Production hardening checklist</h3>
              <ul>
                {u.hardening.map((h) => (
                  <li key={h.slice(0, 24)} style={{ marginBottom: 8 }}>{h}</li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal>
            <div className="card">
              <div className="mono meta">Malaysia angle</div>
              <h3>Deploying this in MY</h3>
              <p>{u.myAngle}</p>
              <Link href="/locations/malaysia">Malaysia FDE guide →</Link>
            </div>
          </Reveal>
          <Reveal>
            <div className="card" style={{ textAlign: 'center' }}>
              <h3>Want this running inside your company?</h3>
              <p className="meta">Get instant quotations and match in 2 days.</p>
              <ContactButton label="Find FDE" source={`usecase-${u.slug}`} />
              <p className="meta" style={{ marginTop: 10 }}>Source: {u.source}</p>
            </div>
          </Reveal>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 8 }}>
            <Link href={`/usecases/${prev.slug}`}>← {prev.title}</Link>
            <Link href={`/usecases/${next.slug}`}>{next.title} →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
