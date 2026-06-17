/**
 * Patches working n8n workflows with preferred_method-aware prompt logic.
 * Run: node start-app/n8n/working/lib/patch-monitor-method-nodes.js
 */

const fs = require('fs');
const path = require('path');

const HELPER_BLOCK = `
const INSIGHT_LABELS = {
  'competitor-intelligence': 'Competitor Intelligence — competitor mentions, product updates, service rollouts.',
  'project-status-bottlenecks': 'Project Status & Bottlenecks — progress, delays, milestones, blockers.',
  'financial-risk-opportunity': 'Financial Risk & Opportunity — cost overruns, investment risks, budget impact.',
  'compliance-safety-risk': 'Compliance & Safety — safety protocols, regulatory references, violations.',
};
function normalizeMethod(value) {
  const m = String(value ?? 'keyword').trim().toLowerCase();
  if (m === 'instructions') return 'instructions';
  if (m === 'common-insights') return 'common-insights';
  return 'keyword';
}
function buildMonitoringCriteria(cfg) {
  const method = normalizeMethod(cfg.preferred_method ?? cfg.preferredMethod);
  const keywords = [].concat(cfg.keywords ?? cfg.what_content_keywords ?? []).map((k) => String(k).trim()).filter(Boolean);
  const insights = [].concat(cfg.insights_suboptions ?? cfg.suboptions ?? []).map((k) => String(k).trim()).filter(Boolean);
  const instructions = String(cfg.prompt_instructions_template ?? '').trim();
  if (method === 'instructions' && instructions) {
    return {
      method,
      criteriaLabel: 'Monitoring instructions',
      criteriaText: instructions,
      scoreGuidance: 'Score 0–100 by how well the messages match the owner monitoring instructions (100 = strong match).',
      reportFocus: 'Include only content that matches the owner monitoring instructions.',
    };
  }
  if (method === 'common-insights' && insights.length) {
    const lines = insights.map((id) => INSIGHT_LABELS[id] ?? id);
    return {
      method,
      criteriaLabel: 'Common summary insights',
      criteriaText: lines.map((l) => '- ' + l).join('\\n'),
      scoreGuidance: 'Score 0–100 by relevance to ANY selected insight category below (100 = highly relevant).',
      reportFocus: 'Group findings by the selected insight categories where possible.',
    };
  }
  const kw = keywords.join(', ') || 'none specified';
  return {
    method: 'keyword',
    criteriaLabel: 'Watch keywords',
    criteriaText: kw,
    scoreGuidance: 'Scoring: 100 = nearly all messages relate to keywords/topic; 0 = none relate.',
    reportFocus: 'Only include messages matching keywords or the monitor topic.',
  };
}
function criteriaSnapshotForLog(cfg) {
  const c = buildMonitoringCriteria(cfg);
  if (c.method === 'keyword') {
    return [].concat(cfg.keywords ?? cfg.what_content_keywords ?? []).map((k) => String(k).trim()).filter(Boolean);
  }
  if (c.method === 'common-insights') {
    return [].concat(cfg.insights_suboptions ?? cfg.suboptions ?? []).map((k) => String(k).trim()).filter(Boolean);
  }
  const instr = String(cfg.prompt_instructions_template ?? '').trim();
  return instr ? [instr.slice(0, 200)] : [];
}
function buildMediaMonitorPrompt(monitor, ownerEmail, monitorName, contentTypes, caption, mediaKind) {
  const criteria = buildMonitoringCriteria(monitor);
  const header = 'You are an expert alert manager for "' + monitorName + '" (owner: ' + ownerEmail + ').\\n'
    + 'Monitoring mode: ' + criteria.method + '.\\n'
    + criteria.criteriaLabel + ':\\n' + criteria.criteriaText + '\\n'
    + 'Content types of interest: ' + contentTypes + '.\\n'
    + 'WhatsApp caption/context: ' + (caption || 'n/a') + '\\n';
  if (mediaKind === 'image') {
    return header + '\\nAnalyze this WhatsApp image. Be vividly specific. Return plain text with sections:\\nSCENE: what is shown\\nTEXT: visible text (OCR)\\nALERTS: issues matching the monitoring criteria above';
  }
  return header + '\\nReturn plain text with sections:\\nSUMMARY: main points\\nKEY TEXT: names, dates, amounts\\nALERTS: items matching the monitoring criteria above';
}
`.trim();

const BUILD_CORPUS_BODY = `
const data = $input.first().json;
const cfg = data;
const rows = data.messages ?? [];

function formatGmt8(value) {
  if (!value) return 'unknown time';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('en-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }) + ' (GMT+8)';
}

const allowedTypes = (cfg.content_types ?? []).map((t) => String(t).toLowerCase());
const typeMap = {
  text: ['text'],
  audio: ['audio'],
  images: ['image', 'sticker'],
  image: ['image', 'sticker'],
  documents: ['document'],
  document: ['document'],
  video: ['video'],
};
const allowed = new Set();
for (const t of allowedTypes) {
  for (const x of (typeMap[t] ?? [t])) allowed.add(x);
}
const filtered = allowed.size
  ? rows.filter((r) => allowed.has(String(r.content_type ?? '').toLowerCase()))
  : rows;

const lines = filtered.map((r) => {
  const body = [r.message_body, r.media_text].filter(Boolean).join(' | ');
  const tag = r.source_kind === 'media_interpretation' ? 'media' : 'text';
  const when = formatGmt8(r.received_at ?? r.message_at);
  const who = r.sender_phone ?? r.chat_jid ?? 'unknown sender';
  return \`• \${when} | \${who} | (\${r.content_type}/\${tag}) \${body || '(empty)'}\`;
});

let message_corpus = lines.join('\\n') || '(no messages in this window)';
if (message_corpus.length > 12000) {
  message_corpus = message_corpus.slice(0, 12000) + '\\n...(truncated)';
}

const criteria = buildMonitoringCriteria(cfg);
const types = (cfg.content_types ?? []).join(', ') || 'all';
const groups = (cfg.group_ids ?? []).join(', ') || 'none';
const contacts = (cfg.contact_jids ?? []).join(', ') || 'none';
const owner = cfg.owner_email ?? 'unknown';
const phone = cfg.connection_phone ?? cfg.owner_phone_num ?? 'unknown';
const monitorName = cfg.monitor_name ?? 'Untitled';
const windowLabel = \`\${formatGmt8(cfg.window_start)} → \${formatGmt8(cfg.window_end)}\`;

const WA_RULES = [
  'WHATSAPP OUTPUT RULES (strict):',
  '- Write for WhatsApp plain text only — NOT markdown.',
  '- Use *single asterisks* for bold titles and labels. Never use ## headers or **double asterisks**.',
  '- Every timestamp must be friendly GMT+8, e.g. "Sun, 8 Jun 8:52 AM (GMT+8)". Never use ISO like 2026-06-08T00:52:28.000Z.',
  '- Keep lines short. Use • for bullets. One alert per bullet.',
  '- Do NOT repeat the monitor title or window — those are added in the message header.',
  '- Skip empty sections entirely.',
].join('\\n');

const score_prompt = [
  'You score WhatsApp monitor relevance for ActionNow.',
  '',
  \`Owner: \${owner} (paired WhatsApp: \${phone})\`,
  \`Monitor name: \${monitorName}\`,
  \`Monitoring mode: \${criteria.method}\`,
  \`\${criteria.criteriaLabel}:\`,
  criteria.criteriaText,
  \`Allowed content types: \${types}\`,
  \`Monitored group JIDs: \${groups}\`,
  \`Monitored contact JIDs: \${contacts}\`,
  \`Window (GMT+8): \${windowLabel}\`,
  \`Message count: \${filtered.length}\`,
  '',
  'Messages:',
  message_corpus,
  '',
  'Return ONLY valid JSON (no markdown):',
  '{"relevance_score": <integer 0-100>, "brief_reason": "<one sentence>"}',
  '',
  criteria.scoreGuidance,
].join('\\n');

const report_prompt = [
  'You write ActionNow WhatsApp monitoring alerts.',
  '',
  WA_RULES,
  '',
  \`Monitor: \${monitorName}\`,
  \`Monitoring mode: \${criteria.method}\`,
  \`\${criteria.criteriaLabel}:\`,
  criteria.criteriaText,
  \`Content types: \${types}\`,
  \`Window (GMT+8): \${windowLabel}\`,
  '',
  'Source messages:',
  message_corpus,
  '',
  'Output EXACTLY this structure (omit a section if nothing to show):',
  '',
  '*📌 SUMMARY*',
  '<2-3 short sentences, plain language>',
  '',
  '*🚨 ALERTS*',
  '• *<short alert label>* — "<key quote>" — *From:* +60… — *When:* Sun, 8 Jun 8:52 AM (GMT+8)',
  '',
  '*💬 MESSAGES*',
  '• *From:* +60… — *When:* Sun, 8 Jun 8:42 AM (GMT+8) — (<type>) "<quote or summary>"',
  '',
  'Be specific. ' + criteria.reportFocus,
].join('\\n');

return [{
  json: {
    ...cfg,
    preferred_method: criteria.method,
    monitoring_criteria_label: criteria.criteriaLabel,
    messages: filtered,
    message_count: filtered.length,
    message_corpus,
    score_prompt,
    report_prompt,
    keywords_snapshot: criteriaSnapshotForLog(cfg),
    window_label_gmt8: windowLabel,
    model_name: cfg.model_name ?? 'google/gemini-2.5-flash-preview',
  },
}];
`.trim();

const PREPARE_WINDOW = `
const row = $input.first().json;
const refreshSeconds = parseInt(row.refresh_seconds, 10) || 3600;
const slotEnd = new Date(row.matched_slot_utc ?? row.timestamp_utc);
const slotStart = new Date(slotEnd.getTime() - refreshSeconds * 1000);

const keywords = row.what_content_keywords ?? row.keywords ?? [];
const contentTypes = row.what_content_types ?? row.content_types ?? [];
const groupIds = row.from_group_ids ?? row.group_ids ?? [];
const contactJids = row.from_contact_jids ?? row.contact_jids ?? [];
const recipients = row.to_receipient_phone_ids ?? row.recipients ?? [];
const preferredMethod = normalizeMethod(row.preferred_method);
const insightsSuboptions = [].concat(row.insights_suboptions ?? row.suboptions ?? []);
const promptTemplate = row.prompt_instructions_template ?? null;

return [{
  json: {
    ...row,
    owner_email: 'hello@actionnow.my',
    window_start: slotStart.toISOString(),
    window_end: slotEnd.toISOString(),
    matched_slot_at: slotEnd.toISOString(),
    group_ids: groupIds,
    contact_jids: contactJids,
    keywords,
    content_types: contentTypes,
    recipients,
    preferred_method: preferredMethod,
    insights_suboptions: insightsSuboptions,
    prompt_instructions_template: promptTemplate,
    api_key: row.api_key ?? null,
    connection_phone: row.connection_phone ?? row.owner_phone_num ?? null,
    score_threshold: row.score_threshold ?? 20,
    model_name: row.model_name ?? 'google/gemini-2.5-flash-preview',
  },
}];
`.trim();

const GET_SLOTS_PATCH = `
        keywords: config.what_content_keywords ?? [],
        content_types: config.what_content_types ?? [],
        group_ids: config.from_group_ids ?? [],
        contact_jids: config.from_contact_jids ?? [],
        recipients: config.to_receipient_phone_ids ?? [],
        preferred_method: config.preferred_method ?? 'keyword',
        insights_suboptions: config.insights_suboptions ?? config.suboptions ?? [],
        prompt_instructions_template: config.prompt_instructions_template ?? null,
        score_threshold: 20,
`.trim();

function patchProactive(filePath) {
  const wf = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let changed = 0;

  for (const node of wf.nodes) {
    if (node.name === 'Code - build message corpus2') {
      node.parameters.jsCode = `${HELPER_BLOCK}\n\n${BUILD_CORPUS_BODY}`;
      changed++;
    }
    if (node.name === 'Code - prepare monitor window2') {
      node.parameters.jsCode = `${HELPER_BLOCK}\n\n${PREPARE_WINDOW}`;
      changed++;
    }
    if (node.name === 'Code - get next slots2' && node.parameters.jsCode.includes('score_threshold: 20')) {
      node.parameters.jsCode = node.parameters.jsCode.replace(
        /        keywords: config\.what_content_keywords \?\? \[\],\n        content_types: config\.what_content_types \?\? \[\],\n        group_ids: config\.from_group_ids \?\? \[\],\n        contact_jids: config\.from_contact_jids \?\? \[\],\n        recipients: config\.to_receipient_phone_ids \?\? \[\],\n        score_threshold: 20,/,
        GET_SLOTS_PATCH,
      );
      changed++;
    }
    if (node.name === 'Code - prepare no messages log2') {
      node.parameters.jsCode = `${HELPER_BLOCK}\n\nconst data = $('Code - combine message sources2').first().json;
return [{
  json: {
    ...data,
    relevance_score: null,
    score_threshold: 20,
    passes_threshold: false,
    score_reason: 'No relevant info found in monitoring window',
    message_corpus: '',
    log_outcome: 'no_messages',
    model_name: 'google/gemini-2.5-flash-preview',
    keywords: criteriaSnapshotForLog(data),
  },
}];`;
      changed++;
    }
  }

  // Patch attempt log insert to use keywords_snapshot from corpus when present
  for (const node of wf.nodes) {
    if (node.name === 'Postgres - insert attempt log scored2' || node.parameters?.query?.includes('keywords_snapshot')) {
      // skip unless we find the right node name
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(wf, null, 2));
  console.log(filePath, 'patched nodes:', changed);
}

function patchReceiveHook(filePath) {
  const wf = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let changed = 0;

  for (const node of wf.nodes) {
    if (node.name === 'Code - pass image binary to LLM2') {
      node.parameters.jsCode = `${HELPER_BLOCK}

const storage = $('Code - prepare storage & decrypt2').first().json;
const parsed = $('Code - parse message & media type3').first().json;
const monitor = parsed.monitor_settings ?? $('Postgres - get monitor settings for owner3').first()?.json ?? {};
const item = $input.first();

if (!item.binary?.data) {
  return [{ json: { skipped: true, reason: 'No image binary on item — check HTTP download outputPropertyName=data' } }];
}

const monitorName = monitor.monitor_name ?? 'monitoring';
const contentTypes = (monitor.what_content_types ?? []).filter(Boolean).join(', ') || 'all';
const caption = parsed.message_body ?? '';
const llm_prompt = buildMediaMonitorPrompt(monitor, storage.owner_email, monitorName, contentTypes, caption, 'image');

return [{
  json: {
    message_id: storage.message_id,
    owner_email: storage.owner_email,
    owner_phone_num: storage.owner_phone_num,
    model_name: 'google/gemini-2.5-flash-preview',
    llm_prompt,
    preferred_method: normalizeMethod(monitor.preferred_method),
  },
  binary: item.binary,
}];`;
      changed++;
    }
    if (node.name === 'Code - pass document text to LLM2') {
      node.parameters.jsCode = `${HELPER_BLOCK}

const reader = $('Code - read document text2').first().json;
const parsed = $('Code - parse message & media type3').first().json;
const monitor = parsed.monitor_settings ?? $('Postgres - get monitor settings for owner3').first()?.json ?? {};
const item = $input.first().json;

let plain_text = reader.plain_text ?? '';
if (reader.needs_extract) {
  plain_text = String(item.text ?? item.data ?? '').trim();
}
if (!plain_text) {
  return [{
    json: {
      skipped: true,
      reason: 'No text extracted — PDF may be scanned/image-only; try OpenRouter file fallback or OCR',
      message_id: reader.message_id,
      file_name: reader.file_name,
    },
  }];
}

const monitorName = monitor.monitor_name ?? 'monitoring';
const contentTypes = (monitor.what_content_types ?? []).filter(Boolean).join(', ') || 'all';
const caption = parsed.message_body ?? '';
const llm_prompt = buildMediaMonitorPrompt(monitor, reader.owner_email, monitorName, contentTypes, caption, 'document')
  + '\\n\\n--- DOCUMENT ---\\n' + plain_text;

return [{
  json: {
    message_id: reader.message_id,
    owner_email: reader.owner_email,
    owner_phone_num: reader.owner_phone_num,
    plain_text,
    model_name: reader.model_name,
    source: reader.source,
    llm_prompt,
    preferred_method: normalizeMethod(monitor.preferred_method),
  },
}];`;
      changed++;
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(wf, null, 2));
  console.log(filePath, 'patched nodes:', changed);
}

const root = path.join(__dirname, '..');
patchProactive(path.join(root, 'whatsapp-proactive-notiifcation.json'));
patchReceiveHook(path.join(root, 'whatsapp-receive-hook-flow.json'));
