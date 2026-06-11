# Full Reports API — cURL quick reference

Edge function: `full-reports`  
Docs: [`supabase/functions/full-reports/CURL-EXAMPLES.md`](../../supabase/functions/full-reports/CURL-EXAMPLES.md)

```
BASE = https://edqhawzttjqhpfflzprb.supabase.co/functions/v1/full-reports
```

All routes are **POST** with JSON body including `owner_email` and `owner_phone_num`.

| Route | Purpose |
|-------|---------|
| `/messages` | List inbound messages |
| `/messages/media` | Media by `message_id` |
| `/messages/interpretations` | AI text by `message_id` |
| `/thinking` | Agent scoring attempts |
| `/thinking/detail` | One attempt + linked report |
| `/reports` | Sent insight reports |
| `/reports/detail` | Full report + linked attempts |

See full cURL examples (bash + PowerShell) in the Supabase functions folder.
