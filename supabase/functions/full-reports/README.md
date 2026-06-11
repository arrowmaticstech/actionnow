# full-reports Edge Function

Single Supabase Edge Function with **path-based routes** for the `/full-reports` frontend.

## Deploy (required — CORS/404 until this is done)

From repo root, logged into the **edqhawzttjqhpfflzprb** project:

```bash
npx supabase login
npx supabase link --project-ref edqhawzttjqhpfflzprb
npx supabase functions deploy full-reports --no-verify-jwt
```

Or deploy via Supabase Dashboard → Edge Functions → New function → paste `index.ts`.

Run migration **`010_public_actionnow_read_views.sql`** in the SQL editor (creates `public.an_*` views over `actionnow` tables). This avoids needing to add `actionnow` to **API → Exposed schemas**.

Optional: migration `009` + expose `actionnow` in Dashboard if you prefer direct schema access elsewhere.

**Verify:**

```bash
curl.exe -s -o NUL -w "%{http_code}" -X OPTIONS "https://edqhawzttjqhpfflzprb.supabase.co/functions/v1/full-reports"
```

Should return `204` (not `404`).

## Base URL

```
POST https://<project>.supabase.co/functions/v1/full-reports/<route>
```

Headers:
```
Authorization: Bearer <SUPABASE_ANON_KEY>
apikey: <SUPABASE_ANON_KEY>
Content-Type: application/json
```

Every request body must include:
```json
{
  "owner_email": "user@example.com",
  "owner_phone_num": "+60123456789"
}
```

The function verifies `user_whatsapp_connections.status = 'connected'` before returning data.

## Routes

| Path | Returns | Notes |
|------|---------|-------|
| **`/bundle`** | messages + attempts + reports + media + interpretations | **Use this** — one call, filter by `owner_email` only |
| `/messages` | `whatsapp_messages` | Paginated; `cursor` = `received_at` |
| `/messages/media` | `whatsapp_message_media` | Requires `message_id` or `message_ids[]` |
| `/messages/interpretations` | `whatsapp_media_interpretations` | Requires `message_id` or `message_ids[]` |
| `/thinking` | `monitor_attempt_logs` | List only; optional `outcome` filter |
| `/thinking/detail` | attempt + `linked_report` | Report only if `monitor_result_id` set |
| `/reports` | `monitor_results` | List; `include_preview: true` for snippet |
| `/reports/detail` | report + `linked_attempts` | Attempts linked via `monitor_result_id` |

## Design: separate fetches unless linked ID

- **Messages** never embed media or interpretations.
- **Media** / **interpretations** fetched by `message_id` FK only.
- **Thinking** list excludes report body; use `/thinking/detail` when `monitor_result_id` exists.
- **Reports** list excludes attempt data; use `/reports/detail` for reverse link.

## cURL examples

See [CURL-EXAMPLES.md](./CURL-EXAMPLES.md) — all routes with bash and PowerShell samples.

## Frontend

See `start-app/src/api/fullReports.js`

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```
