/**
 * Shared monitor prompt helpers — copy into n8n Code nodes (proactive + receive-hook).
 * Branches on monitor_settings.preferred_method; all field values coexist in DB.
 */

const INSIGHT_LABELS = {
  'competitor-intelligence':
    'Competitor Intelligence — competitor mentions, product updates, service rollouts.',
  'project-status-bottlenecks':
    'Project Status & Bottlenecks — progress, delays, milestones, blockers.',
  'financial-risk-opportunity':
    'Financial Risk & Opportunity — cost overruns, investment risks, budget impact.',
  'compliance-safety-risk':
    'Compliance & Safety — safety protocols, regulatory references, violations.',
};

function normalizeMethod(value) {
  const m = String(value ?? 'keyword').trim().toLowerCase();
  if (m === 'instructions') return 'instructions';
  if (m === 'common-insights') return 'common-insights';
  return 'keyword';
}

/** @param {Record<string, unknown>} cfg monitor row or prepared window object */
function buildMonitoringCriteria(cfg) {
  const method = normalizeMethod(cfg.preferred_method ?? cfg.preferredMethod);
  const keywords = []
    .concat(cfg.keywords ?? cfg.what_content_keywords ?? [])
    .map((k) => String(k).trim())
    .filter(Boolean);
  const insights = []
    .concat(cfg.insights_suboptions ?? cfg.suboptions ?? [])
    .map((k) => String(k).trim())
    .filter(Boolean);
  const instructions = String(cfg.prompt_instructions_template ?? '').trim();

  if (method === 'instructions' && instructions) {
    return {
      method,
      criteriaLabel: 'Monitoring instructions',
      criteriaText: instructions,
      scoreGuidance:
        'Score 0–100 by how well the messages match the owner monitoring instructions (100 = strong match).',
      reportFocus: 'Include only content that matches the owner monitoring instructions.',
    };
  }

  if (method === 'common-insights' && insights.length) {
    const lines = insights.map((id) => INSIGHT_LABELS[id] ?? id);
    return {
      method,
      criteriaLabel: 'Common summary insights',
      criteriaText: lines.map((l) => `- ${l}`).join('\n'),
      scoreGuidance:
        'Score 0–100 by relevance to ANY selected insight category below (100 = highly relevant).',
      reportFocus:
        'Group findings by the selected insight categories where possible.',
    };
  }

  const kw = keywords.join(', ') || 'none specified';
  return {
    method: 'keyword',
    criteriaLabel: 'Watch keywords',
    criteriaText: kw,
    scoreGuidance:
      'Scoring: 100 = nearly all messages relate to keywords/topic; 0 = none relate.',
    reportFocus: 'Only include messages matching keywords or the monitor topic.',
  };
}

/** Snapshot for monitor_attempt_logs.keywords_snapshot */
function criteriaSnapshotForLog(cfg) {
  const c = buildMonitoringCriteria(cfg);
  if (c.method === 'keyword') {
    return []
      .concat(cfg.keywords ?? cfg.what_content_keywords ?? [])
      .map((k) => String(k).trim())
      .filter(Boolean);
  }
  if (c.method === 'common-insights') {
    return []
      .concat(cfg.insights_suboptions ?? cfg.suboptions ?? [])
      .map((k) => String(k).trim())
      .filter(Boolean);
  }
  const instr = String(cfg.prompt_instructions_template ?? '').trim();
  return instr ? [instr.slice(0, 200)] : [];
}

module.exports = {
  INSIGHT_LABELS,
  normalizeMethod,
  buildMonitoringCriteria,
  criteriaSnapshotForLog,
};
