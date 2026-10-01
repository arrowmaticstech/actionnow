export type Usecase = {
  slug: string;
  title: string;
  kicker: string;
  keywords: string[];
  intro: string;
  problem: string[];
  loops: { title: string; body: string }[];
  metrics: { value: string; label: string }[];
  hardening: string[];
  myAngle: string;
  source: string;
};

export const usecases: Usecase[] = [
  {
    slug: "rag-production-failure-modes",
    title: "RAG Works in Demo, Dies in Prod: 6 Failure Modes",
    kicker: "Loop engineering: retrieval evals",
    keywords: ["RAG deployment failure modes", "RAG production issues", "retrieval eval FDE"],
    intro: "Most RAG pilots answer correctly on ten test docs and fail on the ten thousand real ones. The fix is loop engineering: retrieval evals, chunk regression sets, and a weekly failure review that feeds back into parsing and ranking.",
    problem: [
      "Chunking destroys tables, scanned PDFs and multi-column layouts common in bank statements and SOP docs.",
      "Top-k retrieval returns plausible but stale versions: policy v3 instead of v9.",
      "No ground truth, so nobody can tell whether a wrong answer is a retrieval miss, a ranking miss, or a generation hallucination.",
      "Latency budget blows up once rerankers and cross-encoders stack on every query.",
    ],
    loops: [
      { title: "Golden set loop", body: "Collect 200 real questions with known-good answers from support tickets and auditors. Run them nightly. Track grounded-answer rate, not vibes." },
      { title: "Failure triage loop", body: "Every wrong answer gets labeled: parse, retrieve, rank, or generate. The label decides the fix. Parsing issues go to the ingestion team, ranking issues to the reranker config." },
      { title: "Chunk regression loop", body: "Freeze 50 hard documents (tables, scans, mixed Malay and English). Any chunking change must keep table-cell recall above 95% on this set before shipping." },
      { title: "Freshness loop", body: "Version every source doc. Retrieval filters to current versions by default and cites the version in the answer so auditors can verify." },
    ],
    metrics: [
      { value: "95%", label: "table-cell recall gate on hard docs" },
      { value: "200", label: "golden questions in nightly eval" },
      { value: "-70%", label: "Nubank chat response time with prod RAG" },
    ],
    hardening: [
      "Hybrid retrieval (dense plus BM25) so exact account numbers and policy codes still match.",
      "Rerank only top-30, cache embeddings, stream first token before rerank completes.",
      "PII redaction at ingestion plus role-based retrieval filters for PDPA scope.",
      "Canary new indexes on 5% of traffic with automatic rollback on grounded-rate drop.",
    ],
    myAngle: "Malaysian banks hold Malay plus English policy docs, Jawi-adjacent scanned forms, and stamped PDFs. English benchmarks never cover this mix, so build the golden set from real Maybank and CIMB style support queries and test both languages on every run.",
    source: "Field pattern plus OpenAI Nubank story (55% Tier 1 resolved, 2M chats monthly)",
  },
  {
    slug: "eval-harness-regression",
    title: "Eval Harnesses That Catch Model Errors Before Users Do",
    kicker: "Loop engineering: model regression",
    keywords: ["LLM eval harness", "AI regression testing", "model eval framework enterprise"],
    intro: "Swapping models without evals is how production breaks quietly. Intercom ships eval results within 48 hours of a new model and rolls out in days. That speed comes from a harness, not heroics.",
    problem: [
      "New model versions change tone, refusal behavior and tool-call accuracy in ways unit tests never catch.",
      "Offline vibes disagree with live A/B results, so launches become arguments instead of decisions.",
      "Nobody owns the eval set, so it rots while the product moves on.",
    ],
    loops: [
      { title: "Offline gate loop", body: "Benchmark every candidate model on transcripts of real support and ops interactions. Score instruction following, tool-call accuracy and brand voice. Nothing ships without beating the incumbent." },
      { title: "Live A/B loop", body: "Roll winners to 5% of traffic with resolution rate and CSAT guardrails. Auto-rollback on regression, same as any deploy." },
      { title: "Dead-end loop", body: "Queries the system cannot answer flow back into the knowledge base as new eval cases and doc gaps. CRED runs this to keep SOPs current in real time." },
      { title: "Cost check loop", body: "Score cost per resolved task alongside quality. Intercom found GPT-4.1 beat expectations at 20% lower cost, which changed their architecture." },
    ],
    metrics: [
      { value: "48 hrs", label: "Intercom eval turnaround on new models" },
      { value: "-20%", label: "cost found by testing before assuming" },
      { value: "98%", label: "CRED resolution accuracy with eval gating" },
    ],
    hardening: [
      "Pin model versions in prod. Never float on latest without a gate run.",
      "Separate evals for each locale and language, including Bahasa Malaysia.",
      "Log every prompt, retrieval set and tool call for replay when incidents hit.",
      "Review the eval set quarterly and retire cases the product outgrew.",
    ],
    myAngle: "BNM-supervised teams need model validation evidence, not just accuracy claims. An eval harness doubles as the audit artifact: versioned sets, pass rates, reviewer sign-off, all exportable for supervisory review.",
    source: "OpenAI Intercom and CRED stories plus BNM model validation expectations",
  },
  {
    slug: "human-in-the-loop-regulator",
    title: "Human-in-the-Loop Design Regulators Actually Accept",
    kicker: "Loop engineering: approval gates",
    keywords: ["human in the loop AI design", "AI approval workflow bank", "agentic AI guardrails enterprise"],
    intro: "Full autonomy is rarely the right answer in enterprise, especially in banks. The design skill is deciding exactly where a human must approve, and making that approval fast enough that ops teams do not bypass it.",
    problem: [
      "Agents that draft compliance reports, move money logic, or touch customer records cannot fail silently.",
      "Review queues designed by engineers get skipped by operators under time pressure.",
      "Regulators ask who approved what, and clickwrap logs do not count as evidence.",
    ],
    loops: [
      { title: "Risk-tier loop", body: "Classify every agent action: auto-approved (read-only summaries), one-click approve (drafts, flags), committee review (external effects). BBVA runs thousands of GPTs inside exactly this kind of tiered trust." },
      { title: "Reviewer feedback loop", body: "Every override or edit by a reviewer becomes a labeled training and eval case. Override rate per action type is the metric that tells you when to widen or narrow autonomy." },
      { title: "Audit evidence loop", body: "Each approval records who, what version, what evidence was shown, and the policy cited. Exportable per case for BNM or internal audit." },
    ],
    metrics: [
      { value: "3", label: "autonomy tiers instead of all-or-nothing" },
      { value: "1 min", label: "BBVA Peru query handling, was 7.5 min" },
      { value: "250+", label: "BBVA leaders trained including CEO" },
    ],
    hardening: [
      "Default deny on external actions. Agent proposes, human disposes.",
      "Show the reviewer the exact retrieved sources, never just the draft.",
      "Time-box approvals with escalation, so queues cannot stall operations.",
      "Simulate reviewer absence: deputy routing and break-glass with full logging.",
    ],
    myAngle: "Malaysian compliance teams run Shariah review cycles on top of standard control checks. Design the approval chain with both gates visible from day one, plus explainability notes for credit and underwriting-adjacent drafts.",
    source: "OpenAI BBVA story plus FDE field pattern for regulated deployments",
  },
  {
    slug: "webhook-idempotency-hardening",
    title: "Webhooks at Scale: Idempotency, Retries, Out-of-Order",
    kicker: "Hardness engineering: integration reliability",
    keywords: ["webhook idempotency", "webhook retry out of order", "integration reliability enterprise"],
    intro: "Every FDE inherits a customer ERP that sends nightly batch files and webhooks that arrive twice, late, or scrambled. Production hardening here is unglamorous and decides whether finance trusts the system.",
    problem: [
      "Duplicate deliveries double-post payments, shipments, or compliance events.",
      "Out-of-order events apply cancellations before bookings.",
      "Nightly batch files change schema without notice and break morning syncs.",
    ],
    loops: [
      { title: "Duplicate detection loop", body: "Idempotency keys on every inbound event, stored before processing. Replays return the original result instead of re-executing." },
      { title: "Ordering loop", body: "Sequence numbers per source entity with a reorder buffer. Late events reconcile against current state instead of overwriting it." },
      { title: "Schema drift loop", body: "Validate batch files against a contract on arrival. Quarantine unknown columns to a review queue and alert, never silently drop." },
    ],
    metrics: [
      { value: "0", label: "double-posts after idempotency keys" },
      { value: "1", label: "canonical event log every sync writes to" },
      { value: "-34%", label: "procurement delays in a Foundry supply rollout" },
    ],
    hardening: [
      "Exponential backoff with jitter on outbound calls, dead-letter queue after max retries.",
      "Poison-message isolation so one bad record never blocks the whole batch.",
      "Daily reconciliation report against source totals, signed off by ops.",
      "Contract tests against customer sandbox on every release, not just go-live week.",
    ],
    myAngle: "GLCs and banks run core systems that only expose batch files plus DuitNow and FPX callbacks with strict timeouts. Design for batch-first with webhook fast-path, and keep all personal data on Malaysia-resident infra per PDPA cross-border rules.",
    source: "FDE integration field pattern plus Palantir supply chain deployment notes",
  },
  {
    slug: "sre-slis-for-ai",
    title: "From SRE to FDE: SLIs for AI Systems",
    kicker: "Hardness engineering: AI reliability",
    keywords: ["AI SLI SLO", "LLM observability production", "AI incident response SRE"],
    intro: "AI systems fail differently: slow drift instead of hard down. SRE discipline ports directly across: define service-level indicators for groundedness, latency and cost, then page on burn rate like any other service.",
    problem: [
      "Silent quality decay as documents, user phrasing and models drift apart.",
      "P99 latency spikes from rerankers and long contexts that averages hide.",
      "Nobody knows the cost per resolved task, so a usage surge becomes a budget incident.",
    ],
    loops: [
      { title: "Quality SLI loop", body: "Track grounded-answer rate on the golden set plus live sampled thumbs signals. Alert on 7-day drift, review weekly with the customer team." },
      { title: "Latency SLI loop", body: "Separate time-to-first-token from full-completion time. Users forgive slow finishes, never slow starts. NTT DATA proved fast incident loops build trust." },
      { title: "Cost SLI loop", body: "Budget per resolved task with per-team quotas and auto-throttle. Report cost next to quality in the same dashboard." },
    ],
    metrics: [
      { value: "30 min", label: "NTT DATA incident analysis, was 3 days" },
      { value: "96%", label: "NTT DATA staff satisfied with governed AI" },
      { value: "9B", label: "tokens per day under AT&T SLI discipline" },
    ],
    hardening: [
      "Canary model and prompt changes with automatic rollback on SLI burn.",
      "Runbooks for the top five AI failure modes, rehearsed with the client team.",
      "On-call rotation that includes a customer-side owner, not just vendor staff.",
      "Postmortems feed new eval cases, closing the loop back into the harness.",
    ],
    myAngle: "For MY rollouts, add PDPA breach-notification timing (72 hours) to the incident runbook and keep log retention windows aligned with BNM expectations before the first incident, not after.",
    source: "OpenAI NTT DATA and AT&T stories plus SRE practice adapted for AI",
  },
  {
    slug: "bank-compliance-copilot-my",
    title: "Bank Compliance Copilots in Malaysia: BNM-Ready by Design",
    kicker: "Malaysia: regulated deployment",
    keywords: ["bank AI compliance Malaysia", "BNM RMiT AI deployment", "compliance copilot bank"],
    intro: "Malaysian banks want copilots for audit support, policy QnA and report drafting. BNM expects proportionate controls, model validation and clear accountability. Build those in from week one and supervisory review becomes routine.",
    problem: [
      "Policy answers cite outdated circulars because retrieval has no version filter.",
      "Audit prep takes weeks of manual comparison across manuals and past findings.",
      "Shadow AI spreads because official tools are too slow, creating unseen risk.",
    ],
    loops: [
      { title: "Policy currency loop", body: "Ingest BNM policy documents, RMiT updates and internal manuals with version stamps. Answers cite exact clause and version. Stale sources auto-flag for refresh." },
      { title: "Audit assist loop", body: "DNP cut audit comparison from 30 minutes to 5 and crypto-suite selection from 3 hours to 1. Same pattern ports to BNM audit prep: structured comparison, reviewer sign-off, evidence export." },
      { title: "Shadow AI loop", body: "BBVA killed shadow AI by giving staff a safe platform plus training. Track official vs unofficial usage and close the gap with better tools, not bans." },
    ],
    metrics: [
      { value: "71%", label: "MY banks with at least one AI app (BNM 2024)" },
      { value: "8x", label: "growth in bank AI pilots in one year" },
      { value: "30 to 5", label: "minutes for audit comparison (DNP pattern)" },
    ],
    hardening: [
      "Map every use case to BNM RMiT controls by week three of the engagement.",
      "Model validation pack: eval sets, pass rates, reviewer sign-off, change log.",
      "PDPA DPO appointed, breach playbook rehearsed, cross-border transfers whitelisted or contracted.",
      "Sandbox path ready for novel uses where rules are still forming.",
    ],
    myAngle: "Over a third of FSPs now run institution-wide AI strategies with Centers of Excellence. Enter through the CoE with a validation-first pitch and you skip a year of pilot purgatory.",
    source: "BNM AI in Financial Sector paper, OpenAI DNP and BBVA stories",
  },
  {
    slug: "bahasa-evals-my",
    title: "Bahasa Malaysia Evals: Why English Benchmarks Lie",
    kicker: "Malaysia: language quality",
    keywords: ["Bahasa Malaysia LLM eval", "Malay RAG evaluation", "multilingual AI deployment Malaysia"],
    intro: "A copilot that scores 90% on English benchmarks can fail half its Malay queries: code-switching, formal versus colloquial forms, Jawi loanwords, and translated policy terms it never saw in training.",
    problem: [
      "Mixed Malay and English queries (Manglish) break intent classification trained on clean English.",
      "Translated banking terms differ from the Malay customers actually type.",
      "No public benchmark covers Malaysian banking Malay, so vendors report English scores and hope.",
    ],
    loops: [
      { title: "Local golden set loop", body: "Mine real support chats and branch queries for 300 Malay, 200 English and 100 mixed questions with verified answers. This set is the product spec." },
      { title: "Code-switch loop", body: "Every model or prompt change runs the mixed-language slice separately. Regressions here block release even when English scores rise." },
      { title: "Reviewer loop", body: "Native-speaking reviewers grade a weekly sample for tone and correctness. Formal Malay for official letters, natural mix for chat. Wrong register counts as a defect." },
    ],
    metrics: [
      { value: "600", label: "questions in a starter MY golden set" },
      { value: "2", label: "registers tested: formal and conversational" },
      { value: "0", label: "English-only releases to MY users" },
    ],
    hardening: [
      "Detect language per query and route to the right prompt template and glossary.",
      "Lock banking term translations in a glossary the model must cite, not invent.",
      "Log language distribution in prod to catch demographic drift early.",
      "Re-recruit reviewer panels yearly so phrasing stays current.",
    ],
    myAngle: "This is the single highest-leverage MY differentiator. Every global vendor demos in English. The team that ships verified Malay quality wins bank RFPs, because procurement teams test in Malay.",
    source: "FDE multilingual deployment pattern plus MY support-data practice",
  },
  {
    slug: "support-copilot-scale",
    title: "Support Copilots That Deflect Half of Tier 1: The Nubank Pattern",
    kicker: "Industry: banking support ops",
    keywords: ["AI support copilot bank", "Tier 1 deflection AI", "customer service AI deployment"],
    intro: "Nubank resolves 55% of Tier 1 inquiries with AI across 2M monthly chats at 70% faster response. The pattern ports directly to Malaysian banks and telcos drowning in repetitive WISMO, balance and statement queries.",
    problem: [
      "Agents answer the same twenty questions while complex cases queue.",
      "Bot answers feel robotic, so CSAT drops even as deflection rises.",
      "Knowledge base rots, so the copilot confidently cites retired promos.",
    ],
    loops: [
      { title: "Deflect and learn loop", body: "AI handles Tier 1 with human handoff inside five turns. Every escalation labels the gap: missing doc, wrong doc, or tone fail. Gaps feed the knowledge backlog weekly." },
      { title: "Copilot assist loop", body: "Agents get reply suggestions plus chat summaries. Nubank keeps 45% of agents on copilot features, with 2.3x faster resolution and steady tNPS." },
      { title: "Promo freshness loop", body: "Tie answers to the live promo and rate catalog. Retired offers auto-expire from retrieval the day they end." },
    ],
    metrics: [
      { value: "55%", label: "Tier 1 resolved without humans (Nubank)" },
      { value: "2.3x", label: "faster query resolution" },
      { value: "+14pp", label: "CSAT lift in the CRED deployment" },
    ],
    hardening: [
      "Never let the bot confirm balances or transactions without a verified API read.",
      "CSAT guardrail on every release: deflection gains that cost satisfaction get rolled back.",
      "Fraud handoff rules: any scam or dispute signal routes to a human immediately.",
      "Load-test Ramadan and payday peaks, not average Tuesdays.",
    ],
    myAngle: "MY banks face payday, festive and MyFintech-season spikes plus scam-report surges. Size the handoff bench for peaks, run scam-detection evals in Malay and English, and keep all PII on Malaysia-resident infra.",
    source: "OpenAI Nubank and CRED stories",
  },
];
