```create whatsapp session

curl -X POST "https://www.wasenderapi.com/api/whatsapp-sessions"
  -H "Authorization: Bearer YOUR_PERSONAL_ACCESS_TOKEN"
  -H "Content-Type: application/json"
  -d '{
    "name": "Sample Name",
    "phone_number": "Sample Phone_number",
    "account_protection": true,
    "log_messages": true,
    "read_incoming_messages": false,
    "webhook_url": "Sample Webhook_url",
    "webhook_enabled": true,
    "webhook_events": [
        "messages.received",
        "session.status",
        "messages.update"
    ]
  }'
  
  --syccess
  {
  "success": true,
  "data": {
    "id": 1,
    "name": "Business WhatsApp",
    "phone_number": "+1234567890",
    "status": "connected",
    "account_protection": true,
    "log_messages": true,
    "read_incoming_messages": false,
    "webhook_url": "https://example.com/webhook",
    "webhook_enabled": true,
    "webhook_events": [
      "messages.received",
      "session.status",
      "messages.update"
    ],
    "api_key": "75075a7bf6417bff59e76fb7205382c2dc74cf1769e76f382c2dc74cf176c0bf",
    "webhook_secret": "fb61be92ddb7935e0cedcec58e470f6c",
    "created_at": "2025-04-01T12:00:00Z",
    "updated_at": "2025-05-08T15:30:00Z"
  }
}

-- fail
{
    "success": false,
    "error": "You have reached your WhatsApp session limit. Please upgrade your plan to add more sessions."
}
  ```



  ```
  get all whatsapp sesion

  curl "https://www.wasenderapi.com/api/whatsapp-sessions"
  -H "Authorization: Bearer YOUR_PERSONAL_ACCESS_TOKEN"


  {
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Business WhatsApp",
            "phone_number": "+1234567890",
            "status": "connected",
            "account_protection": true,
            "log_messages": true,
            "webhook_url": "https:\/\/example.com\/webhook",
            "webhook_enabled": true,
            "webhook_events": [
                "message",
                "group_update"
            ],
            "created_at": "2025-04-01T12:00:00Z",
            "updated_at": "2025-05-08T15:30:00Z"
        },
        {
            "id": 2,
            "name": "Support WhatsApp",
            "phone_number": "+9876543210",
            "status": "DISCONNECTED",
            "account_protection": false,
            "log_messages": false,
            "webhook_url": null,
            "webhook_enabled": false,
            "webhook_events": null,
            "created_at": "2025-04-15T09:45:00Z",
            "updated_at": "2025-05-07T11:20:00Z"
        }
    ]
}

```

get whatsapp session specific det
```
curl "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}"
  -H "Authorization: Bearer YOUR_PERSONAL_ACCESS_TOKEN"
{
    "success": true,
    "data": {
        "id": 1,
        "name": "Business WhatsApp",
        "phone_number": "+1234567890",
        "status": "connected",
        "account_protection": true,
        "log_messages": true,
        "webhook_url": "https://example.com/webhook",
        "webhook_enabled": true,
        "webhook_events": [
            "message",
            "group_update"
        ],
        "api_key": "75075a7bf6417bff59e76fb7205382c2dc74cf1769e76f382c2dc74cf176c0bf",
        "webhook_secret": "fb61be92ddb7935e0cedcec58e470f6c",
        "created_at": "2025-04-01T12:00:00Z",
        "updated_at": "2025-05-08T15:30:00Z"
    }
}```

disconnect whatsapp ses
```
curl -X POST "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/disconnect"
  -H "Authorization: Bearer YOUR_PERSONAL_ACCESS_TOKEN"
  -H "Content-Type: application/json"

{
    "success": true,
    "data": {
        "status": "disconnected",
        "message": "WhatsApp session disconnected successfully"
    }
}

  ```

  regen api key
  ```
  curl -X POST "https://www.wasenderapi.com/api/whatsapp-sessions/{whatsappSession}/regenerate-key"
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"



{
    "success": true,
    "api_key": "new_whatsapp_api_key_abc456"
}
  ```

  sequenceDiagram
  participant FE as Frontend
  participant EF as wasender-create-session
  participant WA as Wasender API
  participant DB as Supabase DB

  FE->>EF: create_and_pair (name, phone)
  EF->>WA: POST /whatsapp-sessions
  EF->>DB: save connection + api_key
  EF->>WA: GET /whatsapp-sessions/{id} (check status)
  alt already connected
    EF->>DB: sync status
    EF-->>FE: already_connected
  else needs pairing
    EF->>WA: POST /connect
    EF->>WA: GET /qrcode
    EF-->>FE: qr_code + 30s TTL
    loop every 5s
      FE->>EF: poll_status
      EF->>WA: GET /whatsapp-sessions/{id}
      EF->>DB: sync status
      EF-->>FE: status
    end
  end
