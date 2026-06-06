-- ActionNow WhatsApp message media (WASender decrypt + Supabase Storage)
-- Run after 001_actionnow_monitor_tables.sql
-- Requires: actionnow.whatsapp_messages from migration 001

-- ---------------------------------------------------------------------------
-- actionnow.whatsapp_message_media
-- One row per media attachment (image, audio, video, document, sticker)
-- Works for both group and personal/DM messages on the same parent table
-- ---------------------------------------------------------------------------
create table if not exists actionnow.whatsapp_message_media (
  id uuid primary key default gen_random_uuid(),

  owner_email text not null,
  owner_phone_num text,

  message_id text not null
    references actionnow.whatsapp_messages (message_id)
    on delete cascade,

  media_kind text not null,
  mime_type text,
  file_name text,
  file_size bigint,
  caption text,

  encrypted_url text,
  media_key text,

  decrypt_public_url text,
  decrypt_expires_at timestamptz,

  storage_bucket text not null default 'whatsapp-media',
  storage_path text,
  storage_url text,

  decrypt_status text not null default 'pending',
  error_message text,

  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),

  constraint whatsapp_message_media_kind_check
    check (media_kind in ('text', 'image', 'audio', 'video', 'document', 'sticker', 'unknown')),

  constraint whatsapp_message_media_decrypt_status_check
    check (decrypt_status in ('pending', 'decrypted', 'stored', 'failed', 'skipped'))
);

comment on table actionnow.whatsapp_message_media is
  'Decrypted media files linked to whatsapp_messages. WASender publicUrl is temp (~1h); persist to storage.';

comment on column actionnow.whatsapp_message_media.message_id is
  'FK to parent message (group or personal DM).';

comment on column actionnow.whatsapp_message_media.encrypted_url is
  'Encrypted media URL from webhook imageMessage/audioMessage/etc.';

comment on column actionnow.whatsapp_message_media.media_key is
  'mediaKey from WASender webhook — required for /api/decrypt-media.';

comment on column actionnow.whatsapp_message_media.decrypt_public_url is
  'Temporary URL from WASender POST /api/decrypt-media (expires ~1 hour).';

comment on column actionnow.whatsapp_message_media.storage_path is
  'Permanent object path, e.g. {owner_phone}/{yyyy}/{mm}/{message_id}.jpg';

comment on column actionnow.whatsapp_message_media.decrypt_status is
  'pending → decrypted → stored, or failed/skipped for text-only messages.';

create index if not exists whatsapp_message_media_message_id_idx
  on actionnow.whatsapp_message_media (message_id);

create index if not exists whatsapp_message_media_owner_email_idx
  on actionnow.whatsapp_message_media (owner_email);

create index if not exists whatsapp_message_media_owner_phone_idx
  on actionnow.whatsapp_message_media (owner_phone_num);

create index if not exists whatsapp_message_media_decrypt_status_idx
  on actionnow.whatsapp_message_media (decrypt_status);

create index if not exists whatsapp_message_media_media_kind_idx
  on actionnow.whatsapp_message_media (media_kind);

create index if not exists whatsapp_message_media_created_date_idx
  on actionnow.whatsapp_message_media (created_date desc);

-- ---------------------------------------------------------------------------
-- Optional: track whether parent message has stored media (quick filter)
-- ---------------------------------------------------------------------------
alter table actionnow.whatsapp_messages
  add column if not exists has_media boolean not null default false;

alter table actionnow.whatsapp_messages
  add column if not exists media_processing_status text not null default 'none';

alter table actionnow.whatsapp_messages
  drop constraint if exists whatsapp_messages_media_processing_status_check;

alter table actionnow.whatsapp_messages
  add constraint whatsapp_messages_media_processing_status_check
  check (media_processing_status in ('none', 'pending', 'processing', 'done', 'failed'));

comment on column actionnow.whatsapp_messages.has_media is
  'True when message includes image/audio/video/document/sticker (group or DM).';

comment on column actionnow.whatsapp_messages.media_processing_status is
  'Overall media pipeline status for n8n decrypt + storage workflow.';

create index if not exists whatsapp_messages_has_media_idx
  on actionnow.whatsapp_messages (has_media)
  where has_media = true;

-- ---------------------------------------------------------------------------
-- Keep updated_date in sync on media rows
-- ---------------------------------------------------------------------------
create or replace function actionnow.set_whatsapp_message_media_updated_date()
returns trigger
language plpgsql
as $$
begin
  new.updated_date = now();
  return new;
end;
$$;

drop trigger if exists trg_whatsapp_message_media_updated_date
  on actionnow.whatsapp_message_media;

create trigger trg_whatsapp_message_media_updated_date
  before update on actionnow.whatsapp_message_media
  for each row
  execute function actionnow.set_whatsapp_message_media_updated_date();

-- ---------------------------------------------------------------------------
-- Supabase Storage bucket (run once in dashboard or via storage API)
-- Bucket name: whatsapp-media (private recommended; use signed URLs)
-- ---------------------------------------------------------------------------
-- insert into storage.buckets (id, name, public)
-- values ('whatsapp-media', 'whatsapp-media', false)
-- on conflict (id) do nothing;
