# Send WhatsApp Message (Wasender)

`POST https://www.wasenderapi.com/api/send-message`

Suarify proxy: `POST https://vawotddxhsjchzbszbzd.supabase.co/functions/v1/wasender-send-message`

## Required body fields

| Field | Description |
|---|---|
| `tophone` | Recipient E.164 number, e.g. `+1234567890` |
| `whatsapp-api-key` | Wasender session API key |

## Content fields (at least one required)

| Field | Aliases | Description |
|---|---|---|
| `text` | `message` | Caption or plain text |
| `imageurl` | `image_url`, `imageUrl` | Public image URL |
| `videourl` | `video_url`, `videoUrl` | Public video URL (MP4, 3GPP) |
| `audiourl` | `audio_url`, `audioUrl` | Public audio URL (MP3, OGG, etc.) |
| `documenturl` | `document_url`, `documentUrl` | Public document URL (PDF, DOCX, etc.) |
| `filename` | `file_name`, `fileName` | Optional display name when sending a document |

Wasender accepts **one media type per request** (image, video, audio, or document).

## Direct Wasender curl

```bash
curl -X POST "https://www.wasenderapi.com/api/send-message" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+1234567890",
    "text": "Check out this image!",
    "imageUrl": "https://wasenderapi.com/logo.png"
  }'
```

## Suarify proxy curl

```bash
curl -X POST "https://vawotddxhsjchzbszbzd.supabase.co/functions/v1/wasender-send-message" \
  -H "Content-Type: application/json" \
  -d '{
    "tophone": "+1234567890",
    "text": "Quarterly report",
    "documenturl": "https://example.com/report.pdf",
    "filename": "report-02-2025.pdf",
    "whatsapp-api-key": "YOUR_WHATSAPP_SESSION_API_KEY"
  }'
```

Video example:

```bash
curl -X POST "https://vawotddxhsjchzbszbzd.supabase.co/functions/v1/wasender-send-message" \
  -H "Content-Type: application/json" \
  -d '{
    "tophone": "+1234567890",
    "text": "Training video!",
    "videourl": "https://example.com/training-video.mp4",
    "whatsapp-api-key": "YOUR_WHATSAPP_SESSION_API_KEY"
  }'
```

Audio example:

```bash
curl -X POST "https://vawotddxhsjchzbszbzd.supabase.co/functions/v1/wasender-send-message" \
  -H "Content-Type: application/json" \
  -d '{
    "tophone": "+1234567890",
    "audiourl": "https://example.com/announcement.mp3",
    "whatsapp-api-key": "YOUR_WHATSAPP_SESSION_API_KEY"
  }'
```

## Success response

```json
{
  "success": true,
  "data": {
    "msgId": 100000,
    "jid": "+123456789",
    "status": "in_progress"
  }
}
```
