# full-reports Edge Function — cURL examples

Single Supabase Edge Function with path-based routes.

## Setup

Replace placeholders:

| Variable | Example |
|----------|---------|
| `SUPABASE_URL` | `https://edqhawzttjqhpfflzprb.supabase.co` |
| `SUPABASE_ANON_KEY` | Your project anon key (Settings → API) |
| `OWNER_EMAIL` | Paired user email |
| `OWNER_PHONE` | Paired phone e.g. `+601139415700` |

**PowerShell** (use `` ` `` for line continuation):

```powershell
$SUPABASE_URL = "https://edqhawzttjqhpfflzprb.supabase.co"
$ANON_KEY = "your-anon-key"
$OWNER_EMAIL = "hello@actionnow.my"
$OWNER_PHONE = "+601139415700"
```

**Bash:**

```bash
export SUPABASE_URL="https://edqhawzttjqhpfflzprb.supabase.co"
export ANON_KEY="your-anon-key"
export OWNER_EMAIL="hello@actionnow.my"
export OWNER_PHONE="+601139415700"
```

Every request must use a **connected** device (`user_whatsapp_connections.status = 'connected'`).

**Routing:** POST to the base URL with `"route"` in the JSON body (recommended). Path suffixes like `/messages` also work when deployed.

---

## 1. List messages (no media embedded)

**Bash (body route — recommended):**

```bash
curl -s -X POST "$SUPABASE_URL/functions/v1/full-reports" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"route\": \"/messages\",
    \"owner_email\": \"$OWNER_EMAIL\",
    \"owner_phone_num\": \"$OWNER_PHONE\",
    \"limit\": 20
  }" | jq .
```

**Bash (path suffix — also supported):**

```bash
curl -s -X POST "$SUPABASE_URL/functions/v1/full-reports/messages" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"owner_email\": \"$OWNER_EMAIL\",
    \"owner_phone_num\": \"$OWNER_PHONE\",
    \"limit\": 20
  }" | jq .
```

**Pagination** — pass `cursor` from previous response `next_cursor`:

```bash
curl -s -X POST "$SUPABASE_URL/functions/v1/full-reports/messages" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"owner_email\": \"$OWNER_EMAIL\",
    \"owner_phone_num\": \"$OWNER_PHONE\",
    \"limit\": 20,
    \"cursor\": \"2026-06-08T10:30:00.000Z\"
  }" | jq .
```

**PowerShell:**

```powershell
$body = @{
  owner_email = $OWNER_EMAIL
  owner_phone_num = $OWNER_PHONE
  limit = 20
} | ConvertTo-Json

Invoke-RestMethod -Method POST `
  -Uri "$SUPABASE_URL/functions/v1/full-reports/messages" `
  -Headers @{
    Authorization = "Bearer $ANON_KEY"
    apikey = $ANON_KEY
    "Content-Type" = "application/json"
  } `
  -Body $body
```

---

## 2. Media for one message (linked by `message_id`)

```bash
curl -s -X POST "$SUPABASE_URL/functions/v1/full-reports/messages/media" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"owner_email\": \"$OWNER_EMAIL\",
    \"owner_phone_num\": \"$OWNER_PHONE\",
    \"message_id\": \"3EB0XXXXX\"
  }" | jq .
```

**Batch** (multiple message IDs):

```bash
curl -s -X POST "$SUPABASE_URL/functions/v1/full-reports/messages/media" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"owner_email\": \"$OWNER_EMAIL\",
    \"owner_phone_num\": \"$OWNER_PHONE\",
    \"message_ids\": [\"3EB0AAAA\", \"3EB0BBBB\"]
  }" | jq .
```

---

## 3. Interpretations for one message (linked by `message_id`)

```bash
curl -s -X POST "$SUPABASE_URL/functions/v1/full-reports/messages/interpretations" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"owner_email\": \"$OWNER_EMAIL\",
    \"owner_phone_num\": \"$OWNER_PHONE\",
    \"message_id\": \"3EB0XXXXX\"
  }" | jq .
```

---

## 4. Manager agent thinking (list)

```bash
curl -s -X POST "$SUPABASE_URL/functions/v1/full-reports/thinking" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"owner_email\": \"$OWNER_EMAIL\",
    \"owner_phone_num\": \"$OWNER_PHONE\",
    \"limit\": 30
  }" | jq .
```

**Filter by outcome** (e.g. only runs that did not send):

```bash
curl -s -X POST "$SUPABASE_URL/functions/v1/full-reports/thinking" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"owner_email\": \"$OWNER_EMAIL\",
    \"owner_phone_num\": \"$OWNER_PHONE\",
    \"outcome\": \"not_send\"
  }" | jq .
```

Valid outcomes: `scored`, `not_send`, `below_threshold`, `passed_score`, `report_generated`, `no_messages`, `slot_skipped`, `error`.

---

## 5. Thinking detail + linked report (only if `monitor_result_id` set)

```bash
curl -s -X POST "$SUPABASE_URL/functions/v1/full-reports/thinking/detail" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"owner_email\": \"$OWNER_EMAIL\",
    \"owner_phone_num\": \"$OWNER_PHONE\",
    \"attempt_id\": \"550e8400-e29b-41d4-a716-446655440000\"
  }" | jq .
```

Response shape:

```json
{
  "attempt": { "...": "full monitor_attempt_logs row" },
  "linked_report": { "...": "monitor_results row or null" }
}
```

---

## 6. Manager reports (list)

```bash
curl -s -X POST "$SUPABASE_URL/functions/v1/full-reports/reports" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"owner_email\": \"$OWNER_EMAIL\",
    \"owner_phone_num\": \"$OWNER_PHONE\",
    \"limit\": 20,
    \"include_preview\": true
  }" | jq .
```

---

## 7. Report detail + linked attempts

```bash
curl -s -X POST "$SUPABASE_URL/functions/v1/full-reports/reports/detail" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"owner_email\": \"$OWNER_EMAIL\",
    \"owner_phone_num\": \"$OWNER_PHONE\",
    \"report_id\": \"660e8400-e29b-41d4-a716-446655440000\"
  }" | jq .
```

Response shape:

```json
{
  "report": { "...": "full monitor_results row" },
  "linked_attempts": [ "... monitor_attempt_logs rows with monitor_result_id = report.id" ]
}
```

---

## 8. Debug owner scope (email / phone mismatch)

```bash
curl -s -X POST "$SUPABASE_URL/functions/v1/full-reports" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"route\": \"/debug\",
    \"owner_email\": \"$OWNER_EMAIL\",
    \"owner_phone_num\": \"$OWNER_PHONE\"
  }" | jq .
```

Or add `"debug": true` to any route — response includes `_debug` with sample rows, distinct `owner_phone_num` values in DB, and strict vs flexible counts.

---

## Typical flow (matches frontend)

```bash
# 1. Messages
curl ... /messages

# 2. For a message with has_media=true, fetch linked data
curl ... /messages/media       -d '{"message_id":"..."}'
curl ... /messages/interpretations -d '{"message_id":"..."}'

# 3. Thinking list
curl ... /thinking

# 4. If attempt has monitor_result_id, get linked report
curl ... /thinking/detail -d '{"attempt_id":"..."}'

# 5. Reports list
curl ... /reports

# 6. Report full body + linked thinking
curl ... /reports/detail -d '{"report_id":"..."}'
```

---

## Error responses

| Status | Meaning |
|--------|---------|
| `400` | Missing `owner_email` / `owner_phone_num` or required route param |
| `403` | Device not connected for this owner |
| `404` | Unknown route or row not found |
| `500` | Database / server error |

Example:

```json
{ "error": "No connected WhatsApp device for this owner" }
```

---

## Deploy & test locally

```bash
supabase functions serve full-reports --no-verify-jwt
```

Local base URL:

```
http://localhost:54321/functions/v1/full-reports/messages
```

Use the same headers and JSON body as above.
