/**
 * Heartbeat scheduler for proactive notifications.
 * - n8n wakes every 5 min (not tied to refresh_seconds)
 * - Each tick emits completed interval windows still within catch-up range
 * - monitor_attempt_logs dedupe prevents double-send
 *
 * Run: node start-app/n8n/working/lib/patch-proactive-slot-timing.cjs
 */

const fs = require('fs');
const path = require('path');

const GET_DUE_SLOTS = `const dueSlots = [];

// Heartbeat model: schedule tick every 5 min is only a wake-up.
// refresh_seconds defines report WINDOWS; we pick up any completed window
// that is not yet in monitor_attempt_logs (dedupe downstream).
const HEARTBEAT_MINUTES = 5;
const MAX_LOOKBACK_SLOTS = 48;

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

  // Catch up missed ticks: keep recent slots eligible for several heartbeats.
  const CATCHUP_MS = Math.max(intervalMs * 2, 30 * 60 * 1000);
  const lookbackStart = Math.max(1, completedIntervals - MAX_LOOKBACK_SLOTS + 1);
  const gmt8Offset = 8 * 60 * 60 * 1000;

  for (let slotIndex = lookbackStart; slotIndex <= completedIntervals; slotIndex++) {
    const slotEndMs = fromDate.getTime() + (slotIndex * intervalMs);
    if (slotEndMs > now.getTime()) continue;

    const slotStartMs = slotEndMs - intervalMs;
    const msSinceSlotEnd = now.getTime() - slotEndMs;
    const isLatestCompleted = slotIndex === completedIntervals;

    // Always check the latest finished window; also retry recent windows inside catch-up.
    if (!isLatestCompleted && msSinceSlotEnd > CATCHUP_MS) continue;

    const slotEnd = new Date(slotEndMs);

    dueSlots.push({
      json: {
        ...config,
        slot_index: slotIndex,
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
        catchup_seconds: Math.round(CATCHUP_MS / 1000),
        heartbeat_minutes: HEARTBEAT_MINUTES,
        scheduler_model: 'heartbeat',
      },
    });
  }
}

if (!dueSlots.length) {
  return [{ json: { match_found: false, reason: 'No completed monitor window in catch-up range' } }];
}

return dueSlots;`;

const PASS_DUE_SLOTS = `const due = $input.all().filter((i) => i.json.match_found);
if (!due.length) {
  return [{ json: { match_found: false, reason: 'No due slot in this heartbeat' } }];
}
return due;`;

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
      interval: [{ field: 'minutes', minutesInterval: 5 }],
    };
  }
}

fs.writeFileSync(filePath, JSON.stringify(wf, null, 2));
console.log('Patched heartbeat scheduler:', filePath);
