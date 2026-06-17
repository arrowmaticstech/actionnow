create table actionnow.monitor_attempt_logs (
  id uuid not null default gen_random_uuid (),
  monitor_setting_id uuid not null,
  owner_email text not null,
  owner_phone_num text null,
  monitor_name text null,
  matched_slot_at timestamp with time zone null,
  window_start timestamp with time zone not null,
  window_end timestamp with time zone not null,
  relevance_score integer null,
  score_threshold integer not null default 20,
  passes_threshold boolean not null default false,
  score_reason text null,
  score_insights jsonb null,
  message_count integer not null default 0,
  keywords_snapshot text[] not null default '{}'::text[],
  content_types_snapshot text[] not null default '{}'::text[],
  corpus_preview text null,
  outcome text not null default 'scored'::text,
  monitor_result_id uuid null,
  model_provider text not null default 'openrouter'::text,
  model_name text null,
  error_message text null,
  created_date timestamp with time zone not null default now(),
  updated_date timestamp with time zone not null default now(),
  constraint monitor_attempt_logs_pkey primary key (id),
  constraint monitor_attempt_logs_monitor_setting_id_fkey foreign KEY (monitor_setting_id) references actionnow.monitor_settings (id) on delete CASCADE,
  constraint monitor_attempt_logs_monitor_result_id_fkey foreign KEY (monitor_result_id) references actionnow.monitor_results (id) on delete set null,
  constraint monitor_attempt_logs_score_threshold_check check (
    (
      (score_threshold >= 0)
      and (score_threshold <= 100)
    )
  ),
  constraint monitor_attempt_logs_outcome_check check (
    (
      outcome = any (
        array[
          'scored'::text,
          'not_send'::text,
          'below_threshold'::text,
          'passed_score'::text,
          'report_generated'::text,
          'no_messages'::text,
          'slot_skipped'::text,
          'error'::text
        ]
      )
    )
  ),
  constraint monitor_attempt_logs_message_count_check check ((message_count >= 0)),
  constraint monitor_attempt_logs_relevance_score_check check (
    (
      (relevance_score is null)
      or (
        (relevance_score >= 0)
        and (relevance_score <= 100)
      )
    )
  )
) TABLESPACE pg_default;
  
create trigger trg_monitor_attempt_logs_updated_date BEFORE
update on actionnow.monitor_attempt_logs for EACH row
execute FUNCTION actionnow.set_monitor_attempt_logs_updated_date ();

create table actionnow.monitor_results (
  id uuid not null default gen_random_uuid (),
  monitor_setting_id uuid not null,
  owner_email text not null,
  owner_phone_num text null,
  actual_results text not null,
  created_date timestamp with time zone not null default now(),
  constraint monitor_results_pkey primary key (id),
  constraint monitor_results_monitor_setting_id_fkey foreign KEY (monitor_setting_id) references actionnow.monitor_settings (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists monitor_results_monitor_setting_id_idx on actionnow.monitor_results using btree (monitor_setting_id) TABLESPACE pg_default;

create index IF not exists monitor_results_owner_email_idx on actionnow.monitor_results using btree (owner_email) TABLESPACE pg_default;

create index IF not exists monitor_results_created_date_idx on actionnow.monitor_results using btree (created_date desc) TABLESPACE pg_default;


create table actionnow.monitor_settings (
  id uuid not null default gen_random_uuid (),
  owner_email text not null,
  owner_phone_num text null,
  monitor_name text not null,
  from_group_ids text[] not null default '{}'::text[],
  to_receipient_phone_ids text[] not null default '{}'::text[],
  what_content_keywords text[] not null default '{}'::text[],
  what_content_types text[] not null default '{}'::text[],
  from_date timestamp with time zone null,
  to_date timestamp with time zone null,
  refresh_seconds integer not null default 900,
  created_date timestamp with time zone not null default now(),
  from_contact_jids text[] not null default '{}'::text[],
  preferred_method text not null default 'keyword',
  insights_suboptions text[] not null default '{}'::text[],
  prompt_instructions_template text null,
  constraint monitor_settings_pkey primary key (id),
  constraint monitor_settings_date_range_check check (
    (
      (from_date is null)
      or (to_date is null)
      or (from_date <= to_date)
    )
  ),
  constraint monitor_settings_refresh_seconds_check check ((refresh_seconds > 0))
) TABLESPACE pg_default;

create index IF not exists monitor_settings_owner_email_idx on actionnow.monitor_settings using btree (owner_email) TABLESPACE pg_default;

create index IF not exists monitor_settings_owner_phone_idx on actionnow.monitor_settings using btree (owner_phone_num) TABLESPACE pg_default;

create index IF not exists monitor_settings_created_date_idx on actionnow.monitor_settings using btree (created_date desc) TABLESPACE pg_default;


create table actionnow.user_whatsapp_connections (
  id bigint generated always as identity not null,
  owner_email text not null,
  name text not null,
  phone_number text not null,
  status text not null default 'disconnected'::text,
  account_protection boolean not null default true,
  log_messages boolean not null default true,
  read_incoming_messages boolean not null default false,
  webhook_url text null,
  webhook_enabled boolean not null default false,
  webhook_events text[] not null default '{}'::text[],
  api_key text null,
  webhook_secret text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  wasender_session_id bigint null,
  constraint user_whatsapp_connections_pkey primary key (id),
  constraint user_whatsapp_connections_owner_phone_unique unique (owner_email, phone_number),
  constraint user_whatsapp_connections_status_check check (
    (
      status = any (
        array[
          'connected'::text,
          'disconnected'::text,
          'pending'::text,
          'error'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_user_whatsapp_connections_owner_email on actionnow.user_whatsapp_connections using btree (owner_email) TABLESPACE pg_default;

create index IF not exists idx_user_whatsapp_connections_status on actionnow.user_whatsapp_connections using btree (owner_email, status) TABLESPACE pg_default;

create index IF not exists idx_user_whatsapp_connections_wasender_session_id on actionnow.user_whatsapp_connections using btree (wasender_session_id) TABLESPACE pg_default
where
  (wasender_session_id is not null);

create trigger update_user_whatsapp_connections_updated_at BEFORE
update on actionnow.user_whatsapp_connections for EACH row
execute FUNCTION update_updated_at_column ();

create table actionnow.whatsapp_media_interpretations (
  id uuid not null default gen_random_uuid (),
  media_id uuid not null,
  message_id text not null,
  owner_email text not null,
  owner_phone_num text null,
  interpretation_type text not null,
  content text null,
  model_provider text not null default 'openrouter'::text,
  model_name text null,
  prompt_version text null,
  status text not null default 'pending'::text,
  error_message text null,
  created_date timestamp with time zone not null default now(),
  updated_date timestamp with time zone not null default now(),
  constraint whatsapp_media_interpretations_pkey primary key (id),
  constraint whatsapp_media_interpretations_media_id_fkey foreign KEY (media_id) references actionnow.whatsapp_message_media (id) on delete CASCADE,
  constraint whatsapp_media_interpretations_message_id_fkey foreign KEY (message_id) references actionnow.whatsapp_messages (message_id) on delete CASCADE,
  constraint whatsapp_media_interpretations_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'processing'::text,
          'done'::text,
          'failed'::text,
          'skipped'::text
        ]
      )
    )
  ),
  constraint whatsapp_media_interpretations_type_check check (
    (
      interpretation_type = any (
        array[
          'transcript'::text,
          'caption'::text,
          'ocr'::text,
          'document_text'::text,
          'video_transcript'::text,
          'summary'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;
 
create trigger trg_whatsapp_media_interpretations_updated_date BEFORE
update on actionnow.whatsapp_media_interpretations for EACH row
execute FUNCTION actionnow.set_whatsapp_media_interpretations_updated_date ();

create table actionnow.whatsapp_message_media (
  id uuid not null default gen_random_uuid (),
  owner_email text not null,
  owner_phone_num text null,
  message_id text not null,
  media_kind text not null,
  mime_type text null,
  file_name text null,
  file_size bigint null,
  caption text null,
  encrypted_url text null,
  media_key text null,
  decrypt_public_url text null,
  decrypt_expires_at timestamp with time zone null,
  storage_bucket text not null default 'action-now'::text,
  storage_path text null,
  storage_url text null,
  decrypt_status text not null default 'pending'::text,
  error_message text null,
  created_date timestamp with time zone not null default now(),
  updated_date timestamp with time zone not null default now(),
  constraint whatsapp_message_media_pkey primary key (id),
  constraint whatsapp_message_media_message_id_fkey foreign KEY (message_id) references actionnow.whatsapp_messages (message_id) on delete CASCADE,
  constraint whatsapp_message_media_decrypt_status_check check (
    (
      decrypt_status = any (
        array[
          'pending'::text,
          'decrypted'::text,
          'stored'::text,
          'failed'::text,
          'skipped'::text
        ]
      )
    )
  ),
  constraint whatsapp_message_media_kind_check check (
    (
      media_kind = any (
        array[
          'text'::text,
          'image'::text,
          'audio'::text,
          'video'::text,
          'document'::text,
          'sticker'::text,
          'unknown'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

 
create trigger trg_whatsapp_message_media_updated_date BEFORE
update on actionnow.whatsapp_message_media for EACH row
execute FUNCTION actionnow.set_whatsapp_message_media_updated_date ();

create table actionnow.whatsapp_messages (
  id uuid not null default gen_random_uuid (),
  owner_email text not null,
  owner_phone_num text null,
  event_type text not null,
  received_at timestamp with time zone not null default now(),
  whatsapp_timestamp bigint null,
  message_id text not null,
  from_me boolean not null default false,
  chat_jid text not null,
  is_group boolean not null default false,
  sender_phone text null,
  addressing_mode text null,
  message_body text null,
  content_type text not null default 'text'::text,
  raw_payload jsonb not null,
  created_date timestamp with time zone not null default now(),
  has_media boolean not null default false,
  media_processing_status text not null default 'none'::text,
  sender_pn text null,
  cleaned_sender_pn text null,
  sender_lid text null,
  participant text null,
  participant_pn text null,
  cleaned_participant_pn text null,
  participant_lid text null,
  sender_lid_resolved text null,
  dedupe_key text null,
  content_fingerprint text null,
  constraint whatsapp_messages_pkey primary key (id),
  constraint whatsapp_messages_message_id_key unique (message_id),
  constraint whatsapp_messages_media_processing_status_check check (
    (
      media_processing_status = any (
        array[
          'none'::text,
          'pending'::text,
          'processing'::text,
          'done'::text,
          'failed'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;
 
create trigger trg_whatsapp_messages_dedupe_key BEFORE INSERT
or
update OF owner_email,
message_id,
sender_phone,
chat_jid,
message_body,
whatsapp_timestamp on actionnow.whatsapp_messages for EACH row
execute FUNCTION actionnow.set_whatsapp_messages_dedupe_key ();



====


{"idx":0,"id":"40fe0882-58a9-4340-bde8-123459aa87df","monitor_setting_id":"fccf898c-c98a-416a-8d30-faf7ec5dd180","owner_email":"bensonlok@gmail.com","owner_phone_num":"+60122112522","monitor_name":"Untitled supervision","matched_slot_at":"2026-06-11 02:23:00+00","window_start":"2026-06-11 02:08:00+00","window_end":"2026-06-11 02:23:00+00","relevance_score":null,"score_threshold":20,"passes_threshold":false,"score_reason":"No relevant info found in monitoring window","score_insights":"{\"reason\": \"No relevant info found in monitoring window\", \"message_count\": 0}","message_count":0,"keywords_snapshot":["deadline","urgent","Q4 report","@boss","Rosak","Order","Breakdown","Accident"],"content_types_snapshot":["text","audio","image","images","documents"],"corpus_preview":null,"outcome":"no_messages","monitor_result_id":null,"model_provider":"openrouter","model_name":"google/gemini-2.5-flash-preview","error_message":null,"created_date":"2026-06-11 02:21:26.77276+00","updated_date":"2026-06-11 02:21:26.77276+00"}

{"idx":0,"id":"0494df01-d0d6-4ffd-bfa8-6b77d0c306d8","monitor_setting_id":"fccf898c-c98a-416a-8d30-faf7ec5dd180","owner_email":"bensonlok@gmail.com","owner_phone_num":"+60122112522","actual_results":"*📌 SUMMARY*\nA severe road accident involving a black car, possibly a Perodua Myvi, has occurred in Rawang. The vehicle is heavily damaged, confirming \"Rosak\" and \"Breakdown\" alerts. Police tape is present, indicating an ongoing investigation.\n\n*🚨 ALERTS*\n• *Accident* — \"Country home rawang xciden.\" — *From:* +60166667223 — *When:* Wed, 10 Jun 4:49 PM (GMT+8)\n• *Rosak* — The car is clearly \"Rosak\" (damaged/broken down) due to the severe accident. — *From:* +60166667223 — *When:* Wed, 10 Jun 4:48 PM (GMT+8)\n• *Breakdown* — The vehicle has experienced a severe \"Breakdown\" as a result of the collision. — *From:* +60166667223 — *When:* Wed, 10 Jun 4:48 PM (GMT+8)\n• *Breakdown* — The visual evidence strongly implies a \"Breakdown\" and \"Rosak\" (damaged/broken) scenario for the vehicle. — *From:* +60166667223 — *When:* Wed, 10 Jun 4:48 PM (GMT+8)\n\n*💬 MESSAGES*\n• *From:* +60166667223 — *When:* Wed, 10 Jun 4:49 PM (GMT+8) — (text) \"Country home rawang xciden.\"\n• *From:* +60166667223 — *When:* Wed, 10 Jun 4:48 PM (GMT+8) — (image) \"SCENE: The image displays a severely damaged black car, likely a Perodua Myvi, on a public road... The roof is heavily crumpled and partially detached, and the side panels are caved in and ripped open... road signs are visible, indicating directions to \"Rawang\", \"Kundang Jaya\", and \"Btg. Berjuntai\".\"\n• *From:* +60166667223 — *When:* Wed, 10 Jun 4:48 PM (GMT+8) — (image) \"SCENE: The image depicts a black car that has been severely damaged in what appears to be a road accident... A yellow \"POLICE LINE DO NOT CROSS\" tape is draped across the back of the car... The ground around the car is littered with debris...\"","created_date":"2026-06-10 08:51:34.447326+00"}

{"idx":3,"id":"fccf898c-c98a-416a-8d30-faf7ec5dd180","owner_email":"bensonlok@gmail.com","owner_phone_num":"+60122112522","monitor_name":"Untitled supervision","from_group_ids":["120363408726684527@g.us","601126455515-1587826132@g.us"],"to_receipient_phone_ids":["01139415700"],"what_content_keywords":["deadline","urgent","Q4 report","@boss","Rosak","Order","Breakdown","Accident"],"what_content_types":["text","audio","image","images","documents"],"from_date":"2026-06-10 08:08:00+00","to_date":null,"refresh_seconds":900,"created_date":"2026-06-10 08:50:04.246715+00","from_contact_jids":[]}

{"idx":1,"id":45,"owner_email":"bensonlok@gmail.com","name":"Main","phone_number":"+60122112522","status":"connected","account_protection":true,"log_messages":true,"read_incoming_messages":true,"webhook_url":"https://n8n.srv1756144.hstgr.cloud/webhook/actionnow-receive-whatsapp","webhook_enabled":true,"webhook_events":["messages.received","group-participants.update","qrcode.updated","message.sent","messages-personal.received","messages-group.received","message-receipt.update","messages.reaction"],"api_key":"65d6b939e27fc0f38742a374f76cf391beaf30ea2bcfce84c2dc4f5ba84cad42","webhook_secret":"42072c43f4a78a88f23151169b5ef2c6","created_at":"2026-06-10 07:57:43.044109+00","updated_at":"2026-06-10 08:08:48.484345+00","wasender_session_id":91992}

{"idx":3,"id":"08de3852-5d74-4ff7-b4fd-ffd576d65646","media_id":"8f695f6a-d71e-446e-b854-49b2eb28baff","message_id":"ACC1967F1B7502F3C9A22B305241EA32","owner_email":"bensonlok@gmail.com","owner_phone_num":"+60122112522","interpretation_type":"ocr","content":"SCENE:\nThe image shows a well-dressed man, appearing to be in his 50s or 60s, standing proudly indoors, holding an award. He is wearing a dark blue suit with a tie, sunglasses, and patterned slip-on shoes. In his left hand, he holds a framed certificate or award, and in his right hand, a small golden trophy. He is smiling and looking towards the camera. The background features a stage or event area with tables covered in red tablecloths and a decorative backdrop. The backdrop includes a large screen displaying what appears to be another person's image and text related to an \"MBA Award.\" The foreground shows a patterned red and white carpet.\n\nTEXT:\n- \"MBA Award\" (on the screen in the background)\n- \"MALAYSIA BUSINESS AWARD\" (on the framed certificate)\n- \"CERTIFICATE OF APPRECIATION\" (on the framed certificate)\n- \"Presented to\" (on the framed certificate)\n- \"DATUK SERI\" (partially visible on the framed certificate)\n- \"DR. K. MOHAN\" (visible on the framed certificate)\n- \"FOUNDER / CHAIRMAN\" (visible on the framed certificate)\n\nALERTS:\nNone. No keywords such as \"deadline\", \"urgent\", \"Q4 report\", \"@boss\", \"Rosak\", \"Order\", \"Breakdown\", \"Accident\" were found in the visible text or implied by the image content. The image depicts a celebratory event, likely an awards ceremony, with no clear indication of issues, hazards, or complaints relevant to the specified monitoring context.","model_provider":"openrouter","model_name":"google/gemini-2.5-flash-preview","prompt_version":null,"status":"done","error_message":null,"created_date":"2026-06-10 08:52:59.381275+00","updated_date":"2026-06-10 08:53:24.959036+00"}

{"idx":1,"id":"05c94bfb-151d-4272-b388-fe69d921ed4a","owner_email":"bensonlok@gmail.com","owner_phone_num":"+60122112522","message_id":"AC35E86BB8E0FBF48D9C986EC9A3D501","media_kind":"image","mime_type":"image/jpeg","file_name":null,"file_size":212403,"caption":null,"encrypted_url":"https://mmg.whatsapp.net/v/t62.7118-24/564520085_1349427607094605_2102474030490511795_n.enc?ccb=11-4&oh=01_Q5Aa4wF3xOMdkmbHNaQ71W2EdMDeSOuHGyycy-NDzX6_RVW7bw&oe=6A510101&_nc_sid=5e03e0&mms3=true","media_key":"l+3C9QPgquJ6ntmKAxaWdsxMiWm0VnNPAs/p5ObevHs=","decrypt_public_url":"https://www.wasenderapi.com/decrypted-media/AC35E86BB8E0FBF48D9C986EC9A3D501","decrypt_expires_at":"2026-06-10 15:30:12.5901+00","storage_bucket":"action-now","storage_path":"60122112522/2026/06/AC35E86BB8E0FBF48D9C986EC9A3D501_00vkv203.jpg","storage_url":"https://edqhawzttjqhpfflzprb.supabase.co/storage/v1/object/action-now/60122112522/2026/06/AC35E86BB8E0FBF48D9C986EC9A3D501_00vkv203.jpg","decrypt_status":"stored","error_message":null,"created_date":"2026-06-10 14:30:11.996864+00","updated_date":"2026-06-10 14:30:14.684677+00"}

{"idx":0,"id":"9b2082e8-dda0-431e-9674-cc1397fd2eea","owner_email":"bensonlok@gmail.com","owner_phone_num":"+60122112522","event_type":"messages.received","received_at":"2026-06-11 02:00:23.431193+00","whatsapp_timestamp":1781143220,"message_id":"AC03A14E3CF9BC7DE8E1DE38CEBC6ADA","from_me":false,"chat_jid":"601126455515-1587826132@g.us","is_group":true,"sender_phone":"60123949517","addressing_mode":"lid","message_body":"Nak buat apa","content_type":"text","raw_payload":"{\"data\": {\"messages\": {\"id\": \"AC03A14E3CF9BC7DE8E1DE38CEBC6ADA\", \"key\": {\"id\": \"AC03A14E3CF9BC7DE8E1DE38CEBC6ADA\", \"fromMe\": false, \"remoteJid\": \"601126455515-1587826132@g.us\", \"participant\": \"78340606173269@lid\", \"participantPn\": \"60123949517@s.whatsapp.net\", \"addressingMode\": \"lid\", \"participantLid\": \"78340606173269@lid\", \"cleanedParticipantPn\": \"60123949517\"}, \"message\": {\"conversation\": \"Nak buat apa\", \"messageContextInfo\": {\"messageSecret\": \"JSWTNXCkRnmnHkPRVlZCWClFoiKVEEIh4MhSytmc4Oo=\"}, \"senderKeyDistributionMessage\": {\"groupId\": \"601126455515-1587826132@g.us\", \"axolotlSenderKeyDistributionMessage\": \"MwjKoriRARAAGiC/PBRVWIGsWunHa8sqT4PjaketjgOoY4evDgGztlcd9iIhBUAYK8GLYK7MrbDfuQERX6u5Z9kVk0JmnyHOIcPIAKxa\"}}, \"pushName\": \"hassanharon218\", \"broadcast\": false, \"remoteJid\": \"601126455515-1587826132@g.us\", \"messageBody\": \"Nak buat apa\", \"messageTimestamp\": 1781143220}}, \"event\": \"messages.received\", \"sessionId\": \"65d6b939e27fc0f38742a374f76cf391beaf30ea2bcfce84c2dc4f5ba84cad42\", \"timestamp\": 1781143220656}","created_date":"2026-06-11 02:00:23.431193+00","has_media":false,"media_processing_status":"none","sender_pn":null,"cleaned_sender_pn":null,"sender_lid":null,"participant":"78340606173269@lid","participant_pn":"60123949517@s.whatsapp.net","cleaned_participant_pn":"60123949517","participant_lid":"78340606173269@lid","sender_lid_resolved":"78340606173269@lid","dedupe_key":"573eed17b9f6e003ced947f8629a0752ad36ea90aa0f8e531ee761be66183e7c","content_fingerprint":null}