# n8n credentials setup (do NOT commit secrets)

## OpenRouter — two different credential types

| Use case | Credential type | Works? |
|----------|-------------------|--------|
| **Basic LLM Chain** / OpenRouter Chat Model | **OpenRouter API** (`openRouterApi`) | ✅ Use this for images |
| **HTTP Request** to `openrouter.ai/api/...` | **Header Auth** | ⚠️ Easy to misconfigure → **401** |

If your LLM Chain works but HTTP Request gets **401**, you are almost certainly using **OpenRouter API** credential on the chain but **Header Auth** on HTTP — they are not the same.

### OpenRouter API (for Basic LLM Chain + OpenRouter Chat Model)

1. Credentials → **OpenRouter API**
2. Paste API key: `sk-or-v1-...` (key only, no `Bearer` prefix)
3. On **OpenRouter Chat Model (image)** node, select this credential

### Header Auth (only if you use HTTP Request)

| Field | Value |
|-------|--------|
| Name | `Authorization` |
| Value | `Bearer sk-or-v1-...` (**must** include `Bearer `) |

Common 401 mistakes:
- Value is only `sk-or-...` without `Bearer `
- Header name is wrong (must be exactly `Authorization`)
- Using Header Auth on HTTP but OpenRouter API on LLM Chain (different keys/credentials)

---

## Attach image in Basic LLM Chain (vision)

After **HTTP - download decrypted media** (binary field must be named `data`):

```
If is image → Code - pass image binary to LLM → Basic LLM Chain - decode image → Postgres
                      ↑                                    ↑
                 keeps binary `data`              OpenRouter Chat Model (sub-node)
```

### Basic LLM Chain settings

| Setting | Value |
|---------|--------|
| Source for Prompt | **Define below** |
| Prompt (User Message) | Your SCENE / TEXT / ALERTS prompt |
| **Chat Messages** → Add message | Type: **Human** |
| Message Type | **Image (Binary)** |
| Image Data Field Name | `data` (plain text, **no** `{{ }}`) |
| Image Details | **High** (for OCR) |

### OpenRouter Chat Model (image) sub-node

- Connect to **Basic LLM Chain** via **AI Language Model** input (diamond connector)
- Model: `google/gemini-2.5-flash-preview` or `openai/gpt-4o`
- Credential: **OpenRouter API** (same as your working LLM chain)

### Manual test in n8n

1. Pin output from **HTTP - download** with binary `data`
2. Run **Code - pass image binary to LLM** → should show binary tab with file
3. Run **Basic LLM Chain** → output `{ "text": "SCENE: ..." }`

If you see **No binary data set**: field name is not `data`, or Code node dropped binary (use `Code - pass image binary to LLM` which preserves `binary: item.binary`).

---

## Supabase S3 — bucket `action-now`

Use **S3** node (not AWS S3). Custom endpoint:

`https://edqhawzttjqhpfflzprb.storage.supabase.co/storage/v1/s3`

Force Path Style: **ON**

---

## Audio — Chirp 3 (HTTP Request)

Uses **Header Auth** + dedicated endpoint:

```
POST https://openrouter.ai/api/v1/audio/transcriptions
```

Chirp does **not** use OpenRouter API credential type — only Header Auth with `Bearer` token.
