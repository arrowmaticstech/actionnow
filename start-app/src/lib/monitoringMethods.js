/** monitor_settings.preferred_method values */
export const PREFERRED_METHODS = {
  KEYWORD: 'keyword',
  INSTRUCTIONS: 'instructions',
  COMMON_INSIGHTS: 'common-insights',
};

export const PREFERRED_METHOD_OPTIONS = [
  { value: PREFERRED_METHODS.KEYWORD, label: 'By Keywords', shortLabel: 'Keywords' },
  { value: PREFERRED_METHODS.INSTRUCTIONS, label: 'Open Instruction (LLM)', shortLabel: 'Open Instructions' },
  { value: PREFERRED_METHODS.COMMON_INSIGHTS, label: 'Common Summary Insights', shortLabel: 'Common Insights' },
];

/** monitor_settings.insights_suboptions slugs (common-insights method only; stored regardless of active method). */
export const COMMON_INSIGHT_SUBOPTIONS = [
  {
    id: 'competitor-intelligence',
    label: 'Competitor Intelligence',
    description:
      'Track and analyze competitor mentions and activities.',
    example:
      "E.g., 'Search for mentions of Apex Solutions, product updates, and service rollouts.'",
  },
  {
    id: 'project-status-bottlenecks',
    label: 'Project Status & Bottlenecks',
    description:
      'Synthesize project progress, delays, and milestones.',
    example: "E.g., 'Focus on Q3 rollout status and key steps.'",
  },
  {
    id: 'financial-risk-opportunity',
    label: 'Financial Risk & Opportunity',
    description:
      'Detect and summarize financial discussions with high impact.',
    example: "E.g., 'Identify cost overruns or new investment risks.'",
  },
  {
    id: 'compliance-safety-risk',
    label: 'Compliance & Safety Logger',
    description:
      'Log specific safety protocol discussions and potential violations.',
    example: "E.g., 'Track references to specific industry regulations.'",
  },
];

export const DEFAULT_INSTRUCTIONS_PROMPT =
  'Scan messages for any specific mention of competitor activity regarding Apex Solutions, or any complaints about service delays linked to the new software release. Flag discussions implying financial risks.';

export const DEFAULT_COMMON_SUBOPTIONS = [
  'competitor-intelligence',
  'project-status-bottlenecks',
  'financial-risk-opportunity',
];

export function normalizePreferredMethod(value) {
  const v = String(value ?? '').trim().toLowerCase();
  if (v === PREFERRED_METHODS.INSTRUCTIONS) return PREFERRED_METHODS.INSTRUCTIONS;
  if (v === PREFERRED_METHODS.COMMON_INSIGHTS) return PREFERRED_METHODS.COMMON_INSIGHTS;
  return PREFERRED_METHODS.KEYWORD;
}

export function normalizeInsightsSuboptions(value) {
  const allowed = new Set(COMMON_INSIGHT_SUBOPTIONS.map((o) => o.id));
  const raw = Array.isArray(value) ? value : [];
  return raw.map((v) => String(v).trim()).filter((v) => allowed.has(v));
}

/** @deprecated use normalizeInsightsSuboptions */
export const normalizeSuboptions = normalizeInsightsSuboptions;
