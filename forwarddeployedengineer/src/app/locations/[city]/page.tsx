import { locations } from '../../../data/directory';

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
    <div className="container section">
      <h1>Forward Deployed Engineer {l.name}</h1>
      <p>{l.note}</p>
      <p className="meta">Keyword: forward deployed engineer {l.name.toLowerCase()} jobs, salary</p>
    </div>
  );
}
