import type { Metadata } from 'next';
import '../styles/globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'forwarddeployedengineer - All FDE Jobs, Salaries, Interviews',
  description: 'Find, become, hire a Forward Deployed Engineer. Live jobs, Palantir OpenAI Anthropic salaries, FDE vs SA vs SE vs Consultant, Malaysia and Singapore hub.',
  keywords: [
    'forward deployed engineer',
    'forward deployed engineer jobs',
    'forward deployed engineer salary',
    'forward deployed engineer interview',
    'forward deployed engineer malaysia',
    'forward deployed engineer singapore',
    'forward deployed engineer kuala lumpur',
    'hire forward deployed engineer',
    'fde vs solutions architect',
    'fde vs consultant',
    'forward deployed AI engineer',
  ],
  metadataBase: new URL('https://forwarddeployedengineer.com'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
