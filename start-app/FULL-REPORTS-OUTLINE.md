# Full Reports — `/full-reports` outline

Route: `/start/full-reports` (basename `/start/`)

Layout: same **Navbar** + **Footer** as home. Content is **scoped to the currently paired & connected WhatsApp device** only (`owner_email` + `owner_phone_num`).

---

## Page sections

### 1. Messages Received

**Purpose:** Show what the WhatsApp session actually received.

| UI (planned) | DB |
|--------------|-----|
| Message text, sender, chat/group, time | `actionnow.whatsapp_messages` |
| Media file / storage URL | `actionnow.whatsapp_message_media` |
| Transcript, caption, OCR, doc text | `actionnow.whatsapp_media_interpretations` |

Filter: `owner_email` + `owner_phone_num` = current device.

---

### 2. Manager Agent Thinking

**Purpose:** Show pre-send reasoning — score, threshold, hold vs proceed.

| UI (planned) | DB |
|--------------|-----|
| Score, threshold, pass/fail | `monitor_attempt_logs.relevance_score`, `score_threshold`, `passes_threshold` |
| Why / insights | `score_reason`, `score_insights` |
| Outcome (not send, etc.) | `outcome` — `not_send`, `below_threshold`, `passed_score`, `no_messages` |
| Window & monitor name | `window_start`, `window_end`, `monitor_name` |

Filter: same owner. Order: `created_date DESC`.

---

### 3. Manager Reports

**Purpose:** Show when the agent **actually sent** insight reports.

| UI (planned) | DB |
|--------------|-----|
| Full report markdown | `monitor_results.actual_results` |
| When generated | `monitor_results.created_date` |
| Link to thinking row | `monitor_attempt_logs.monitor_result_id` |

Filter: same owner. Optionally join attempts where `outcome = 'report_generated'`.

---

## API — Supabase Edge Function `full-reports`

Base: `{SUPABASE_URL}/functions/v1/full-reports`

| Path | Returns |
|------|---------|
| `POST /messages` | messages only (paginated) |
| `POST /messages/media` | media by `message_id` |
| `POST /messages/interpretations` | interpretations by `message_id` |
| `POST /thinking` | `monitor_attempt_logs` list |
| `POST /thinking/detail` | attempt + linked report if `monitor_result_id` |
| `POST /reports` | `monitor_results` list |
| `POST /reports/detail` | report + linked attempts |

Client: `start-app/src/api/fullReports.js`

Body always includes `{ owner_email, owner_phone_num }` — verified against connected device.

---

## Current status (v0)

- [x] Route + page shell
- [x] Three section headers
- [x] Connected-device guard
- [x] Supabase Edge Function (`supabase/functions/full-reports`)
- [x] Frontend API client (`src/api/fullReports.js`)
- [x] Live data in FullReports UI (`MessagesReceivedSection`, `AgentThinkingSection`, `ManagerReportsSection`)
- [x] cURL examples — `supabase/functions/full-reports/CURL-EXAMPLES.md`
