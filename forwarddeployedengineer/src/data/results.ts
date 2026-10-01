export type Result = {
  company: string;
  industry: string;
  deployment: string;
  metrics: { value: string; label: string }[];
  source: string;
};

export const headlineStats = [
  { value: '315%', label: '3-yr ROI on Foundry deployments (Forrester TEI)' },
  { value: '$345M', label: 'benefits vs $83M cost per enterprise (Forrester)' },
  { value: '+33%', label: 'Airbus A350 delivery acceleration' },
  { value: '75%', label: 'enterprises report positive AI ROI (Wharton)' },
];

export const forresterBars = [
  { label: 'Supply chain savings', value: 161 },
  { label: 'Procurement savings', value: 127 },
  { label: 'Legacy retired', value: 24.6 },
  { label: 'Employee efficiency', value: 20.9 },
  { label: 'Production uplift', value: 11.8 },
];

export const results: Result[] = [
  {
    company: 'Airbus',
    industry: 'Aviation and manufacturing',
    deployment: 'FDEs embedded on the A350 line unified schedules, crew shifts, parts, deliveries and defects into one operational picture, then expanded to 20+ use cases and the Skywise industry platform.',
    metrics: [
      { value: '+33%', label: 'A350 delivery acceleration' },
      { value: '$1.7B/yr', label: 'est. Skywise cost savings' },
      { value: '100+', label: 'airlines on platform' },
    ],
    source: 'Palantir Impact and Airbus partnership overview',
  },
  {
    company: 'United Airlines',
    industry: 'Aviation operations',
    deployment: 'Deployed the Chime operations tool on Foundry to catch disruption early across the network.',
    metrics: [
      { value: '~300', label: 'delays saved after launch' },
      { value: '20', label: 'cancellations avoided' },
      { value: '$M', label: 'millions in cost avoidance' },
    ],
    source: 'Palantir Impact, United Airlines quote',
  },
  {
    company: 'Nubank',
    industry: 'Banking and fintech',
    deployment: 'FDE-style deployment with OpenAI: enterprise search, call-center copilot and an AI assistant resolving Tier 1 chats for 114M customers.',
    metrics: [
      { value: '55%', label: 'Tier 1 inquiries resolved by AI' },
      { value: '2M+', label: 'chats handled monthly' },
      { value: '-70%', label: 'chat response time' },
    ],
    source: 'OpenAI customer story, Nubank',
  },
  {
    company: 'BBVA',
    industry: 'Banking, global',
    deployment: 'Scaled from 3,000 to 11,000 employees on governed AI with compliance, legal and security aligned from day one. Peru assistant cut handling time 7.5 min to 1 min.',
    metrics: [
      { value: '3 hrs', label: 'saved per employee per week' },
      { value: '83%', label: 'weekly active usage' },
      { value: '20K+', label: 'custom GPTs created' },
    ],
    source: 'OpenAI customer story, BBVA 2025',
  },
  {
    company: 'AT&T',
    industry: 'Telecom operations',
    deployment: 'Multi-agent platform on Azure OpenAI serving care agents, developers and knowledge workers with full legal, security and finance review per agent.',
    metrics: [
      { value: '71', label: 'GenAI solutions in production' },
      { value: '-33%', label: 'care resolution time' },
      { value: '2x+', label: 'YoY return growth' },
    ],
    source: 'Applied use-case writeup, AT&T 2025',
  },
  {
    company: 'NTT DATA',
    industry: 'IT services and operations',
    deployment: 'Center of Excellence rollout of ChatGPT Enterprise and Codex to 9,000 staff with sandbox rules, data guardrails and human review gates.',
    metrics: [
      { value: '30 min', label: 'incident analysis, was 5 engineers x 3 days' },
      { value: '95%', label: 'staff report productivity gains' },
      { value: '9K', label: 'employees on governed AI' },
    ],
    source: 'OpenAI customer story, NTT DATA',
  },
  {
    company: 'Dai Nippon Printing',
    industry: 'Manufacturing and R&D',
    deployment: 'Enterprise rollout across ten departments with per-employee usage targets: 100 AI uses per week and 50%+ task automation.',
    metrics: [
      { value: '-95%', label: 'patent research time' },
      { value: '90%', label: 'use cases with measurable results' },
      { value: '10x', label: 'processing volume increase' },
    ],
    source: 'OpenAI customer story, DNP 2025',
  },
  {
    company: 'CRED',
    industry: 'Fintech support ops',
    deployment: 'Concierge AI plus agent copilot and SOP tooling, all gated by an internal eval framework before rollout.',
    metrics: [
      { value: '+14pp', label: 'CSAT improvement' },
      { value: '98%', label: 'resolution accuracy' },
      { value: '-31%', label: 'session drop-offs' },
    ],
    source: 'OpenAI customer story, CRED',
  },
];

export const malaysiaStats = [
  { value: '27%', label: 'MY businesses using AI, +35% YoY (AWS 2025)' },
  { value: '73%', label: 'still stuck at basic use, only 10% transformative' },
  { value: '+19%', label: 'avg revenue lift reported by MY AI adopters' },
  { value: '71%', label: 'MY banks run at least one AI app (BNM 2024)' },
  { value: '8x', label: 'growth in bank AI pilots in one year (BNM)' },
  { value: '52%', label: 'cite skills gap as the top blocker (AWS)' },
];

export const malaysiaMaturity = [
  { label: 'Basic use', value: 73 },
  { label: 'Intermediate', value: 17 },
  { label: 'Advanced', value: 10 },
];

export const malaysiaAngles = [
  {
    title: 'Bank compliance copilots (KL)',
    body: 'BNM-regulated pilots cluster in fraud, AML, customer analytics and audit support. FDE work here means PDPA-ready RAG on Malay and English docs, RMiT control mapping and human review gates that supervisors accept.',
  },
  {
    title: 'Telco and manufacturing ops',
    body: 'Care resolution copilots and predictive maintenance mirror the AT&T and Airbus playbooks: unify tickets, sensor and inventory data, then put one live picture in front of operators. Finance leads MY adoption at 42%, manufacturing follows at 39%.',
  },
  {
    title: 'Public sector and GLCs',
    body: '71% of MY businesses say they adopt faster when government leads. Deployments here need on-prem or Malaysia-resident cloud, Bahasa Malaysia eval sets and audit trails a ministry can defend.',
  },
];
