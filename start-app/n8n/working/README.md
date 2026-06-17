# ActionNow — n8n working workflows

Simple guide for the three workflows in this folder and how they use your monitor settings.

## Files

| File | Role |
|------|------|
| `whatsapp-wasender-api-proxy.json` | Pair WhatsApp, save/delete config, groups/contacts APIs |
| `whatsapp-receive-hook-flow.json` | Real-time: every incoming WhatsApp message |
| `whatsapp-proactive-notiifcation.json` | Scheduled: batch score + report to boss numbers |

Re-import these JSON files into n8n after any change.

---

## What you save on `/start/main`

All settings go to `actionnow.monitor_settings` via `action-now-save-config/v2`.

| Field | Meaning |
|-------|---------|
| `refresh_seconds` | Check interval (e.g. `900` = 15 min, `3600` = 1 hour) |
| `preferred_method` | `keyword` \| `instructions` \| `common-insights` |
| `what_content_keywords` | Used when method = **keyword** |
| `prompt_instructions_template` | Used when method = **instructions** |
| `insights_suboptions` | Used when method = **common-insights** |
| `from_group_ids` / `from_contact_jids` | Where to watch |
| `to_receipient_phone_ids` | Who gets reports |
| `what_content_types` | `text`, `audio`, `image`, `document` |

**All method fields are kept in the DB.** Switching tabs only changes `preferred_method`; old keywords / prompt / insights are not deleted.

---

## Three monitoring modes

Only **one** mode is active at a time (`preferred_method`). The others stay saved but are ignored at runtime.

### 1. Keywords (`keyword`)

- Watch list: `what_content_keywords`
- Receive flow: media LLM looks for those keywords
- Proactive flow: scores and reports messages matching keywords

### 2. Open LLM (`instructions`)

- Watch list: `prompt_instructions_template` (free text)
- Example: *"find all message on sedan"*
- Receive flow: media interpreted using that instruction
- Proactive flow: scores and reports messages matching that instruction

### 3. Common insights (`common-insights`)

- Watch list: `insights_suboptions` (checkbox slugs), e.g.:
  - `competitor-intelligence`
  - `project-status-bottlenecks`
  - `financial-risk-opportunity`
  - `compliance-safety-risk`
- Proactive flow: scores/reports against those categories (predefined templates in n8n)

---

## Flow A — Receive hook (real time)

```
WhatsApp message → Wasender webhook → receive-hook-flow
    → Load monitor_settings
    → Save to whatsapp_messages
    → Text only? → store (no boss alert)
    → Image / document / audio? → LLM uses active preferred_method
         → Save interpretation to whatsapp_media_interpretations
```

**Does not** send insight reports to boss numbers. It collects and prepares data.

---

## Flow B — Proactive insights (scheduled)

```
Every ~15 min (n8n schedule tick)
    → Load monitor_settings
    → Is a full interval window just finished? (uses refresh_seconds)
    → Already ran for this slot? → skip (dedupe in monitor_attempt_logs)
    → Fetch messages in [window_start, window_end]
    → Build score + report prompts from preferred_method
    → LLM relevance score (0–100)
    → If score > threshold → LLM writes report → WhatsApp to boss numbers (once)
```

### 15-minute example

- Start time: 10:00 AM, interval: **15 min**
- Window 1: 10:00–10:15 → report runs once shortly **after** 10:15
- Window 2: 10:15–10:30 → report runs once shortly **after** 10:30

The schedule tick is only a “wake up” check. **Your interval setting** controls how often reports are sent, not the n8n cron by itself.

### 1-hour example

- `refresh_seconds = 3600`
- One window per hour; one report per hour (if content passes score).

---

## Example: instructions + 15 min + “find all message on sedan”

1. You save: Open LLM tab, prompt *"find all message on sedan"*, 15 min interval, groups, boss number.
2. **All day:** messages stored; photos/docs analyzed with the sedan instruction.
3. **Every ~15 min:** proactive job reads that window, asks LLM “anything about sedan?”, sends **one** WhatsApp report if score is high enough.

Keywords in the DB are **not** used while `preferred_method = instructions`.

---

## Helper code (reference)

Shared prompt logic for method branching is documented in:

- `lib/monitor-method-prompts.js`
- `lib/patch-monitor-method-nodes.cjs` (applied to proactive + receive JSON)
- `lib/patch-proactive-slot-timing.cjs` (once-per-interval + dedupe)

---

## Deploy checklist

1. Run Supabase migrations `012` and `013` (monitoring method + `insights_suboptions`).
2. Re-import all three workflow JSON files into n8n.
3. Build/deploy frontend: `cd start-app && npm run build && npm run deploy`.
