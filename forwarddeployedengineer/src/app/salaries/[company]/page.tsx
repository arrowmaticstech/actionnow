import { companies } from '../../../data/directory';
import EmailCapture from '../../../components/EmailCapture';

export function generateStaticParams() {
  return companies.map(c => ({ company: c.slug }));
}

export function generateMetadata({ params }: { params: { company: string } }) {
  return {
    title: `${params.company} Forward Deployed Engineer Salary 2026 | forwarddeployedengineer`,
    description: `Forward deployed engineer salary at ${params.company}: median, range, equity, levels. Keyword: ${params.company} fde salary.`,
  };
}

export default function SalaryPage({ params }: { params: { company: string } }) {
  const c = companies.find(x => x.slug === params.company) ?? companies[0];
  return (
    <div className="container section">
      <h1>{c.name} Forward Deployed Engineer salary</h1>
      <table className="table">
        <thead><tr><th>Level</th><th>TC</th><th>Notes</th></tr></thead>
        <tbody>
          <tr><td>Entry / New grad</td><td className="mono">$140–$250K</td><td>Base + equity</td></tr>
          <tr><td>Mid</td><td className="mono">{c.median}</td><td>{c.range}</td></tr>
          <tr><td>Staff</td><td className="mono">$630K+</td><td>Palantir staff clears $630K, OpenAI L6 $1.28M</td></tr>
        </tbody>
      </table>
      <EmailCapture source={`salary-${c.slug}`} />
    </div>
  );
}
