export type Company = {
  slug: string;
  name: string;
  salary: string;
  median: string;
  range: string;
  location: string;
  keywords: string[];
  description: string;
};

export const companies: Company[] = [
  { slug: 'palantir', name: 'Palantir', salary: '$215K TC median', median: '$215K', range: '$171K–$415K, Staff $630K+', location: 'NYC / DC / London', keywords: ['palantir forward deployed engineer salary', 'palantir fdse interview decomposition'], description: 'Origin of FDE. Delta org embeds engineers with customers until the workflow runs in production. Product-formation, not billable-hours consulting.' },
  { slug: 'openai', name: 'OpenAI', salary: '$555K TC median', median: '$555K', range: '$249K–$1.28M, mid-senior $350K–$550K', location: 'SF / NYC / London / Singapore / Zurich', keywords: ['openai forward deployed engineer jobs', 'openai fde interview'], description: 'Frontier-model deployments: discovery, scoping, system design, rollout with strategic customers. 50% travel, evals + agents in prod.' },
  { slug: 'anthropic', name: 'Anthropic', salary: '$350K–$550K', median: '$450K', range: 'Up to ~$900K senior+, PPU-heavy', location: 'SF / NYC / London', keywords: ['anthropic forward deployed engineer salary'], description: 'High-agency, customer-facing deployments with mission bar. Firm offers, equity-heavy.' },
  { slug: 'anduril', name: 'Anduril', salary: '$200K–$400K+', median: '$280K', range: 'Defense premium + clearance', location: 'Costa Mesa / DC / Seattle', keywords: ['anduril forward deployed engineer'], description: 'Edge autonomy + government deployments. FDE owns outcome in high-stakes ops.' },
  { slug: 'scale-ai', name: 'Scale AI', salary: '$250K–$475K', median: '$320K', range: '$180K–$600K startup dispersion', location: 'SF / NYC', keywords: ['scale ai forward deployed engineer'], description: 'Data pipelines + eval suites that make models work on customer data.' },
  { slug: 'databricks', name: 'Databricks', salary: '$300K–$500K', median: '$380K', range: 'Strong equity component', location: 'SF / NYC / Seattle', keywords: ['databricks forward deployed engineer'], description: 'Lakehouse, Spark, and LLM apps deployed inside enterprise data estates.' },
];

export const comparisons = [
  { slug: 'forward-deployed-engineer-vs-solutions-architect', a: 'Forward Deployed Engineer', b: 'Solutions Architect', keywords: ['forward deployed engineer vs solutions architect'], summary: 'SA draws blueprints and hands off. FDE pours concrete on customer infra and stays until it runs. Coding 75 vs 35.' },
  { slug: 'forward-deployed-engineer-vs-sales-engineer', a: 'Forward Deployed Engineer', b: 'Sales Engineer', keywords: ['forward deployed engineer vs sales engineer'], summary: 'SE wins the deal pre-sale with demos. FDE ships production post-sale embedded 1:1. SE carries quota 70/30 OTE, FDE base+equity no quota.' },
  { slug: 'forward-deployed-engineer-vs-software-engineer', a: 'Forward Deployed Engineer', b: 'Software Engineer', keywords: ['forward deployed engineer vs software engineer'], summary: 'SWE builds product at HQ. FDE builds last-mile on customer data, permissions, and politics.' },
  { slug: 'forward-deployed-engineer-vs-consultant', a: 'Forward Deployed Engineer', b: 'Consultant', keywords: ['forward deployed engineer vs consultant', 'fde vs implementation consultant'], summary: 'Consultant bills hours against an SOW. FDE ships product that must run at customer #2. Meter is license/retention, not utilization. FDE can say no to bespoke that will not generalize.' },
  { slug: 'solutions-architect-vs-consultant', a: 'Solutions Architect', b: 'Consultant', keywords: ['solutions architect vs consultant'], summary: 'SA owns design quality and time-to-value. Consultant owns scoped deliverable acceptance. Both hand off; FDE stays paged.' },
  { slug: 'forward-deployed-engineer-vs-solutions-architect-vs-sales-engineer-vs-consultant', a: 'Forward Deployed Engineer', b: 'SA vs SE vs Consultant', keywords: ['fde vs sa vs se vs consultant'], summary: 'Lifecycle test: SE pre-signature, SA design decision, Consultant SOW delivery, FDE until workflow runs. Check reporting line + comp plan - titles lie.' },
];

export const locations = [
  { slug: 'new-york', name: 'New York', note: '35% of FDE postings. Fintech + regulated industries. Surpassed SF in 2026.' },
  { slug: 'san-francisco', name: 'San Francisco', note: '11% of postings. AI labs HQ, frontier-model deployments.' },
  { slug: 'london', name: 'London', note: 'UK government + Palantir Delta hub.' },
  { slug: 'singapore', name: 'Singapore', note: 'OpenAI FDE hub, hybrid 3 days in office, 50% APAC travel.' },
  { slug: 'kuala-lumpur', name: 'Kuala Lumpur', note: 'Growing MY hub: fintech, telco, government AI pilots. Remote-first for SG/MY accounts, on-site for bank/government deployments.' },
  { slug: 'malaysia', name: 'Malaysia', note: 'FDE in Malaysia: banks, telcos, and public sector need last-mile AI deployment - RAG on Bahasa Malaysia + English docs, PDPA compliance, on-prem/VPC patterns. Most roles remote with KL/Singapore travel.' },
];

export const malaysiaContext = {
  title: 'Forward Deployed Engineer in Malaysia',
  body: [
    'Malaysia demand clusters in Kuala Lumpur and Penang: banks (Maybank, CIMB), telcos (CelcomDigi, Maxis), and government-linked companies piloting LLM support, compliance drafting, and RAG over Malay + English documents.',
    'Work pattern: discovery in KL, deployment on customer VPC or on-prem for PDPA and Bank Negara compliance. Common stack: Python, TypeScript, AWS/Azure, Docker/Kubernetes, RAG pipelines, eval harnesses, Bahasa Malaysia eval sets.',
    'Hiring signal: look for postings mentioning customer-embedded delivery, Bahasa Malaysia data, PDPA, Shariah-compliance review loops, and 25–50% travel across KL–Singapore–Jakarta.',
  ],
  keywords: ['forward deployed engineer malaysia', 'forward deployed engineer kuala lumpur', 'fde jobs malaysia', 'fde salary malaysia'],
};

export const faqs = [
  { q: 'What is a Forward Deployed Engineer?', a: 'Software engineer embedded with customers to scope, build, and run production software in the customer environment. Coding 75-80, sales 15, owns prod outcome until renewal/expansion.' },
  { q: 'How much does a Forward Deployed Engineer make?', a: 'Palantir ~$215K TC median, OpenAI ~$555K, Anthropic $350K-$550K. Entry $140K-$250K. Staff $630K+. Malaysia/Singapore bands lower cash, equity varies by stage.' },
  { q: 'FDE vs Solutions Architect vs Sales Engineer vs Consultant?', a: 'SE sells pre-deal (quota 70/30). SA designs and hands off. Consultant delivers SOW on utilization. FDE writes prod code post-sale and stays paged until the customer workflow runs - comp base+equity, no quota, no utilization target.' },
  { q: 'Is there Forward Deployed Engineer work in Malaysia?', a: 'Yes - KL banks, telcos, and public-sector AI pilots need PDPA-compliant RAG and agent deployments on VPC/on-prem, often covering Singapore travel. See /locations/malaysia.' },
];
