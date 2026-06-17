/**
 * Fix proactive notification: run once per refresh_seconds interval AFTER window ends.
 * Run: node start-app/n8n/working/lib/patch-proactive-slot-timing.cjs
 */

const fs = require('fs');
const path = require('path');

const GET_DUE_SLOTS = `const dueSlots = [];

for (const item of $input.all()) {
  const config = item.json;
  if (!config?.id || !config.from_date) continue;

  const refreshSeconds = parseInt(config.refresh_seconds, 10) || 3600;
  const fromDate = new Date(config.from_date);
  if (Number.isNaN(fromDate.getTime())) continue;

  const now = new Date();
  if (now < fromDate) continue;

  const intervalMs = refreshSeconds * 1000;
  const elapsedMs = now.getTime() - fromDate.getTime();
  const completedIntervals = Math.floor(elapsedMs / intervalMs);
  if (completedIntervals < 1) continue;

  // Window [slotStart, slotEnd] for the interval that just finished.
  const slotEndMs = fromDate.getTime() + (completedIntervals * intervalMs);
  const slotStartMs = slotEndMs - intervalMs;
  const msSinceSlotEnd = now.getTime() - slotEndMs;

  // Only run AFTER the full interval (e.g. 1h) has elapsed; grace catches the schedule tick.
  const GRACE_MS = Math.min(Math.max(intervalMs / 4, 5 * 60 * 1000), 20 * 60 * 1000);
  if (msSinceSlotEnd < 0 || msSinceSlotEnd > GRACE_MS) continue;

  const gmt8Offset = 8 * 60 * 60 * 1000;
  const slotEnd = new Date(slotEndMs);

  dueSlots.push({
    json: {
      ...config,
      slot_index: completedIntervals,
      refresh_seconds: refreshSeconds,
      timestamp_utc: slotEnd.toISOString(),
      timestamp_gmt8: new Date(slotEnd.getTime() + gmt8Offset).toISOString().replace('Z', '+08:00'),
      matched_slot_utc: slotEnd.toISOString(),
      matched_slot_at: slotEnd.toISOString(),
      window_start: new Date(slotStartMs).toISOString(),
      window_end: slotEnd.toISOString(),
      match_found: true,
      keywords: config.what_content_keywords ?? [],
      content_types: config.what_content_types ?? [],
      group_ids: config.from_group_ids ?? [],
      contact_jids: config.from_contact_jids ?? [],
      recipients: config.to_receipient_phone_ids ?? [],
      preferred_method: config.preferred_method ?? 'keyword',
      insights_suboptions: config.insights_suboptions ?? config.suboptions ?? [],
      prompt_instructions_template: config.prompt_instructions_template ?? null,
      score_threshold: 20,
      model_name: 'google/gemini-2.5-flash-preview',
      ms_since_slot_end: Math.round(msSinceSlotEnd / 1000),
      grace_seconds: Math.round(GRACE_MS / 1000),
    },
  });
}

if (!dueSlots.length) {
  return [{ json: { match_found: false, reason: 'No monitor interval due (wait until interval ends)' } }];
}

return dueSlots;`;

const PASS_DUE_SLOTS = `const due = $input.all().filter((i) => i.json.match_found);
if (!due.length) {
  return [{ json: { match_found: false, reason: 'No due slot in this tick' } }];
}
return due;`;

const MERGE_DEDUPE = `const slot = $('If - slot matched2').first().json;
const row = $input.first().json ?? {};
return [{
  json: {
    ...slot,
    slot_already_processed: !!row.existing_log_id,
    existing_log_id: row.existing_log_id ?? null,
  },
}];`;

const filePath = path.join(__dirname, '..', 'whatsapp-proactive-notiifcation.json');
const wf = JSON.parse(fs.readFileSync(filePath, 'utf8'));

for (const node of wf.nodes) {
  if (node.name === 'Code - get next slots2') {
    node.parameters.jsCode = GET_DUE_SLOTS;
  }
  if (node.name === 'Code - check if within time to execute2') {
    node.parameters.jsCode = PASS_DUE_SLOTS;
  }
  if (node.name === 'Schedule Trigger - check the next runs for reports1') {
    node.parameters.rule = {
      interval: [{ field: 'minutes', minutesInterval: 15 }],
    };
  }
}

const pgCred = {
  postgres: { id: 'Ec1YEJ1N6mAm5CyY', name: 'Arrowmatic Supabase Account' },
};

const dedupePg = {
  parameters: {
    operation: 'executeQuery',
    query: `SELECT mal.id AS existing_log_id
FROM actionnow.monitor_attempt_logs mal
WHERE mal.monitor_setting_id = $1::uuid
  AND mal.matched_slot_at = $2::timestamptz
LIMIT 1;`,
    options: {
      queryReplacement: "={{ [$json.id, $json.matched_slot_at ?? $json.matched_slot_utc] }}",
    },
  },
  name: 'Postgres - slot already processed2',
  type: 'n8n-nodes-base.postgres',
  typeVersion: 2.6,
  position: [1580, 6192],
  id: 'a1b2c3d4-slot-dedupe-pg-0001',
  alwaysOutputData: true,
  credentials: pgCred,
  onError: 'continueRegularOutput',
};

const mergeDedupe = {
  parameters: { jsCode: MERGE_DEDUPE },
  name: 'Code - merge slot dedupe check2',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [1720, 6192],
  id: 'a1b2c3d4-slot-dedupe-code-0002',
};

const ifNotProcessed = {
  parameters: {
    conditions: {
      options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 3 },
      conditions: [{
        id: 'not-processed',
        leftValue: '={{ !$json.slot_already_processed }}',
        rightValue: '',
        operator: { type: 'boolean', operation: 'true', singleValue: true },
      }],
      combinator: 'and',
    },
    looseTypeValidation: true,
    options: {},
  },
  name: 'If - slot not yet processed2',
  type: 'n8n-nodes-base.if',
  typeVersion: 2.3,
  position: [1860, 6192],
  id: 'a1b2c3d4-slot-dedupe-if-0003',
};

const skipDup = {
  parameters: {},
  name: 'No Operation - skip duplicate slot2',
  type: 'n8n-nodes-base.noOp',
  typeVersion: 1,
  position: [1860, 6368],
  id: 'a1b2c3d4-slot-dedupe-skip-0004',
};

const names = new Set(wf.nodes.map((n) => n.name));
for (const n of [dedupePg, mergeDedupe, ifNotProcessed, skipDup]) {
  if (!names.has(n.name)) wf.nodes.push(n);
}

// Rewire: If - slot matched2 (true) -> dedupe chain -> prepare window
wf.connections['If - slot matched2'] = {
  main: [
    [{ node: 'Postgres - slot already processed2', type: 'main', index: 0 }],
    [{ node: 'No Operation - skip run2', type: 'main', index: 0 }],
  ],
};

wf.connections['Postgres - slot already processed2'] = {
  main: [[{ node: 'Code - merge slot dedupe check2', type: 'main', index: 0 }]],
};

wf.connections['Code - merge slot dedupe check2'] = {
  main: [[{ node: 'If - slot not yet processed2', type: 'main', index: 0 }]],
};

wf.connections['If - slot not yet processed2'] = {
  main: [
    [{ node: 'Code - prepare monitor window2', type: 'main', index: 0 }],
    [{ node: 'No Operation - skip duplicate slot2', type: 'main', index: 0 }],
  ],
};

fs.writeFileSync(filePath, JSON.stringify(wf, null, 2));
console.log('Patched', filePath);
