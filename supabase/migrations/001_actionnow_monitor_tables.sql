-- ActionNow monitor settings & results
-- Run in Supabase SQL Editor or via: supabase db push

create schema if not exists actionnow;

-- ---------------------------------------------------------------------------
-- actionnow.monitor_settings
-- ---------------------------------------------------------------------------
create table if not exists actionnow.monitor_settings (
  id uuid primary key default gen_random_uuid(),

  owner_email text not null,
  owner_phone_num text,

  monitor_name text not null,

  from_group_ids text[] not null default '{}',
  from_contact_jids text[] not null default '{}',
  to_receipient_phone_ids text[] not null default '{}',
  what_content_keywords text[] not null default '{}',
  what_content_types text[] not null default '{}',

  from_date timestamptz,
  to_date timestamptz,
  refresh_seconds integer not null default 900
    check (refresh_seconds > 0),

  created_date timestamptz not null default now(),

  constraint monitor_settings_date_range_check
    check (from_date is null or to_date is null or from_date <= to_date)
);

comment on table actionnow.monitor_settings is
  'WhatsApp monitor configuration per owner.';

comment on column actionnow.monitor_settings.from_group_ids is
  'WhatsApp group ids to watch (e.g. 120363...@g.us).';

comment on column actionnow.monitor_settings.from_contact_jids is
  'Personal/DM chat JIDs to watch (e.g. 6010...@s.whatsapp.net or 555...@lid).';

comment on column actionnow.monitor_settings.to_receipient_phone_ids is
  'Recipient phone numbers or WhatsApp ids to send reports to.';

comment on column actionnow.monitor_settings.what_content_keywords is
  'Keywords to match in monitored content.';

comment on column actionnow.monitor_settings.what_content_types is
  'Content types to include, e.g. text, audio, images, documents.';

comment on column actionnow.monitor_settings.refresh_seconds is
  'How often the monitor runs, in seconds.';

create index if not exists monitor_settings_owner_email_idx
  on actionnow.monitor_settings (owner_email);

create index if not exists monitor_settings_owner_phone_idx
  on actionnow.monitor_settings (owner_phone_num);

create index if not exists monitor_settings_created_date_idx
  on actionnow.monitor_settings (created_date desc);

-- ---------------------------------------------------------------------------
-- actionnow.monitor_results
-- ---------------------------------------------------------------------------
create table if not exists actionnow.monitor_results (
  id uuid primary key default gen_random_uuid(),

  monitor_setting_id uuid not null
    references actionnow.monitor_settings (id)
    on delete cascade,

  owner_email text not null,
  owner_phone_num text,

  actual_results text not null,

  created_date timestamptz not null default now()
);

comment on table actionnow.monitor_results is
  'Generated monitor report output (markdown) per run.';

comment on column actionnow.monitor_results.actual_results is
  'Long-form markdown summary of matched content for this run.';

create index if not exists monitor_results_monitor_setting_id_idx
  on actionnow.monitor_results (monitor_setting_id);

create index if not exists monitor_results_owner_email_idx
  on actionnow.monitor_results (owner_email);

create index if not exists monitor_results_created_date_idx
  on actionnow.monitor_results (created_date desc);

-- ---------------------------------------------------------------------------
-- actionnow.whatsapp_messages
-- Inbound WhatsApp webhook messages for group/DM monitoring & keyword retrieval
-- ---------------------------------------------------------------------------
create table if not exists actionnow.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),

  owner_email text not null,
  owner_phone_num text,

  event_type text not null,
  received_at timestamptz not null default now(),
  whatsapp_timestamp bigint,

  message_id text not null unique,
  from_me boolean not null default false,

  chat_jid text not null,
  is_group boolean not null default false,
  addressing_mode text,

  -- messages-personal.received (DM): key.senderPn / senderLid
  sender_pn text,
  cleaned_sender_pn text,
  sender_lid text,

  -- messages-group.received: key.participant* (pn = participant number)
  participant text,
  participant_pn text,
  cleaned_participant_pn text,
  participant_lid text,

  -- normalized for queries (set at ingest: coalesce participant vs sender fields)
  sender_phone text,
  sender_lid_resolved text,

  message_body text,
  content_type text not null default 'text',

  raw_payload jsonb not null,

  created_date timestamptz not null default now()
);

comment on table actionnow.whatsapp_messages is
  'Raw WhatsApp messages ingested from WASender webhooks.';

comment on column actionnow.whatsapp_messages.event_type is
  'Webhook event: messages-group.received or messages-personal.received.';

comment on column actionnow.whatsapp_messages.message_id is
  'Maps to data.messages.key.id; prevents duplicate processing.';

comment on column actionnow.whatsapp_messages.chat_jid is
  'Maps to key.remoteJid — user JID or group @g.us.';

comment on column actionnow.whatsapp_messages.addressing_mode is
  'key.addressingMode — pn (phone) or lid (linked id).';

comment on column actionnow.whatsapp_messages.sender_pn is
  'Personal DM only: key.senderPn (e.g. 6010...@s.whatsapp.net).';

comment on column actionnow.whatsapp_messages.cleaned_sender_pn is
  'Personal DM only: key.cleanedSenderPn (digits only).';

comment on column actionnow.whatsapp_messages.sender_lid is
  'Personal DM only: key.senderLid (e.g. 555...@lid).';

comment on column actionnow.whatsapp_messages.participant is
  'Group only: key.participant (often @lid JID of sender in group).';

comment on column actionnow.whatsapp_messages.participant_pn is
  'Group only: key.participantPn (@s.whatsapp.net).';

comment on column actionnow.whatsapp_messages.cleaned_participant_pn is
  'Group only: key.cleanedParticipantPn (digits only).';

comment on column actionnow.whatsapp_messages.participant_lid is
  'Group only: key.participantLid (@lid).';

comment on column actionnow.whatsapp_messages.sender_phone is
  'Normalized phone: cleaned_participant_pn (group) or cleaned_sender_pn (DM).';

comment on column actionnow.whatsapp_messages.sender_lid_resolved is
  'Normalized LID: participant_lid / participant / sender_lid.';

comment on column actionnow.whatsapp_messages.message_body is
  'Normalized text from messageBody; null for media-only messages.';

comment on column actionnow.whatsapp_messages.content_type is
  'text, audio, image, document, etc. — derived at ingest time.';

comment on column actionnow.whatsapp_messages.raw_payload is
  'Full original webhook JSON for debugging and media parsing.';

create index if not exists whatsapp_messages_owner_email_idx
  on actionnow.whatsapp_messages (owner_email);

create index if not exists whatsapp_messages_owner_phone_idx
  on actionnow.whatsapp_messages (owner_phone_num);

create index if not exists whatsapp_messages_chat_jid_idx
  on actionnow.whatsapp_messages (chat_jid);

create index if not exists whatsapp_messages_sender_phone_idx
  on actionnow.whatsapp_messages (sender_phone);

create index if not exists whatsapp_messages_cleaned_participant_pn_idx
  on actionnow.whatsapp_messages (cleaned_participant_pn);

create index if not exists whatsapp_messages_cleaned_sender_pn_idx
  on actionnow.whatsapp_messages (cleaned_sender_pn);

create index if not exists whatsapp_messages_participant_lid_idx
  on actionnow.whatsapp_messages (participant_lid);

create index if not exists whatsapp_messages_sender_lid_idx
  on actionnow.whatsapp_messages (sender_lid);

create index if not exists whatsapp_messages_is_group_idx
  on actionnow.whatsapp_messages (is_group);

create index if not exists whatsapp_messages_chat_received_idx
  on actionnow.whatsapp_messages (chat_jid, received_at desc);

create index if not exists whatsapp_messages_created_date_idx
  on actionnow.whatsapp_messages (created_date desc);

create index if not exists whatsapp_messages_content_type_idx
  on actionnow.whatsapp_messages (content_type);

