import Link from 'next/link';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link href="/" className="logo">
          <span className="logo-mark">&gt;_</span>forwarddeployedengineer
        </Link>
        <nav className="nav">
          <Link href="/jobs">Jobs</Link>
          <Link href="/companies/palantir">Companies</Link>
          <Link href="/salaries/palantir">Salaries</Link>
          <Link href="/interview/palantir">Interview</Link>
          <Link href="/vs/forward-deployed-engineer-vs-solutions-architect">FDE vs SA</Link>
        </nav>
        <div className="header-ctas">
          <Link href="#signup" className="btn btn-primary">Find jobs</Link>
          <Link href="/jobs#post" className="btn btn-employer">Post a job $299</Link>
        </div>
      </div>
    </header>
  );
}
