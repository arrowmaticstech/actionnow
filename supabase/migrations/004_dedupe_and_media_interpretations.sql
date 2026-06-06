-- Dedupe constraints + media interpretation table + storage bucket default
-- Run after 001, 002, 003

-- ---------------------------------------------------------------------------
-- 1. Deduplicate whatsapp_messages
-- message_id is the primary WhatsApp idempotency key.
-- Secondary key catches retries where message_id differs but content is identical.
-- ---------------------------------------------------------------------------
alter table actionnow.whatsapp_messages
  add column if not exists dedupe_key text;

update actionnow.whatsapp_messages
set dedupe_key = encode(
  digest(
    coalesce(owner_email, '') || '|'
    || coalesce(message_id, '') || '|'
    || coalesce(sender_phone, '') || '|'
    || coalesce(chat_jid, '') || '|'
    || coalesce(message_body, '') || '|'
    || coalesce(whatsapp_timestamp::text, ''),
    'sha256'
  ),
  'hex'
)
where dedupe_key is null;

-- Remove exact duplicates before adding unique indexes (keep oldest row)
delete from actionnow.whatsapp_messages wm
using actionnow.whatsapp_messages wm2
where wm.id > wm2.id
  and wm.dedupe_key = wm2.dedupe_key
  and wm.dedupe_key is not null;

delete from actionnow.whatsapp_messages wm
using actionnow.whatsapp_messages wm2
where wm.id > wm2.id
  and wm.message_id = wm2.message_id;

create unique index if not exists whatsapp_messages_message_id_uidx
  on actionnow.whatsapp_messages (message_id);

create unique index if not exists whatsapp_messages_dedupe_key_uidx
  on actionnow.whatsapp_messages (dedupe_key)
  where dedupe_key is not null;

create unique index if not exists whatsapp_messages_natural_uidx
  on actionnow.whatsapp_messages (
    owner_email,
    message_id,
    coalesce(sender_phone, ''),
    coalesce(message_body, '')
  );

comment on column actionnow.whatsapp_messages.dedupe_key is
  'SHA-256 fingerprint: owner + message_id + sender_phone + chat_jid + body + timestamp.';

create or replace function actionnow.set_whatsapp_messages_dedupe_key()
returns trigger
language plpgsql
as $$
begin
  new.dedupe_key := encode(
    digest(
      coalesce(new.owner_email, '') || '|'
      || coalesce(new.message_id, '') || '|'
      || coalesce(new.sender_phone, '') || '|'
      || coalesce(new.chat_jid, '') || '|'
      || coalesce(new.message_body, '') || '|'
      || coalesce(new.whatsapp_timestamp::text, ''),
      'sha256'
    ),
    'hex'
  );
  return new;
end;
$$;

drop trigger if exists trg_whatsapp_messages_dedupe_key
  on actionnow.whatsapp_messages;

create trigger trg_whatsapp_messages_dedupe_key
  before insert or update of owner_email, message_id, sender_phone, chat_jid, message_body, whatsapp_timestamp
  on actionnow.whatsapp_messages
  for each row
  execute function actionnow.set_whatsapp_messages_dedupe_key();

-- ---------------------------------------------------------------------------
-- 2. Deduplicate whatsapp_message_media (one media row per WhatsApp message)
-- ---------------------------------------------------------------------------
delete from actionnow.whatsapp_message_media m
using actionnow.whatsapp_message_media m2
where m.id > m2.id
  and m.message_id = m2.message_id;

create unique index if not exists whatsapp_message_media_message_id_uidx
  on actionnow.whatsapp_message_media (message_id);

-- Align bucket name with Supabase Storage bucket `action-now`
alter table actionnow.whatsapp_message_media
  alter column storage_bucket set default 'action-now';

-- ---------------------------------------------------------------------------
-- 3. Media interpretations (transcript, caption, document text, etc.)
-- ---------------------------------------------------------------------------
create table if not exists actionnow.whatsapp_media_interpretations (
  id uuid primary key default gen_random_uuid(),

  media_id uuid not null
    references actionnow.whatsapp_message_media (id)
    on delete cascade,

  message_id text not null
    references actionnow.whatsapp_messages (message_id)
    on delete cascade,

  owner_email text not null,
  owner_phone_num text,

  interpretation_type text not null,
  content text,

  model_provider text not null default 'openrouter',
  model_name text,
  prompt_version text,

  status text not null default 'pending',
  error_message text,

  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),

  constraint whatsapp_media_interpretations_type_check
    check (interpretation_type in (
      'transcript',
      'caption',
      'ocr',
      'document_text',
      'video_transcript',
      'summary'
    )),

  constraint whatsapp_media_interpretations_status_check
    check (status in ('pending', 'processing', 'done', 'failed', 'skipped'))
);

comment on table actionnow.whatsapp_media_interpretations is
  'AI-derived text linked to stored media: audio/video transcript, image caption/OCR, PDF/doc content.';

comment on column actionnow.whatsapp_media_interpretations.interpretation_type is
  'transcript=audio, caption/ocr=image, video_transcript=video, document_text=pdf/doc.';

comment on column actionnow.whatsapp_media_interpretations.content is
  'Extracted or generated text used for keyword monitoring and reports.';

create unique index if not exists whatsapp_media_interpretations_media_type_uidx
  on actionnow.whatsapp_media_interpretations (media_id, interpretation_type);

create index if not exists whatsapp_media_interpretations_message_id_idx
  on actionnow.whatsapp_media_interpretations (message_id);

create index if not exists whatsapp_media_interpretations_status_idx
  on actionnow.whatsapp_media_interpretations (status);

create index if not exists whatsapp_media_interpretations_owner_email_idx
  on actionnow.whatsapp_media_interpretations (owner_email);

create or replace function actionnow.set_whatsapp_media_interpretations_updated_date()
returns trigger
language plpgsql
as $$
begin
  new.updated_date = now();
  return new;
end;
$$;

drop trigger if exists trg_whatsapp_media_interpretations_updated_date
  on actionnow.whatsapp_media_interpretations;

create trigger trg_whatsapp_media_interpretations_updated_date
  before update on actionnow.whatsapp_media_interpretations
  for each row
  execute function actionnow.set_whatsapp_media_interpretations_updated_date();

-- Map media_kind -> default interpretation_type (reference for n8n)
comment on table actionnow.whatsapp_media_interpretations is
  'AI text per media. Defaults: audio->transcript, image->caption+ocr, video->video_transcript, document->document_text.';
