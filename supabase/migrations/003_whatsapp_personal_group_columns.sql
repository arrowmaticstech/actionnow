-- Personal vs group webhook columns (WASender key.* field names)
-- Run after 001 and 002 if those were applied with the older collapsed sender_jid/sender_phone shape.

-- ---------------------------------------------------------------------------
-- monitor_settings: personal/DM chats alongside groups
-- ---------------------------------------------------------------------------
alter table actionnow.monitor_settings
  add column if not exists from_contact_jids text[] not null default '{}';

comment on column actionnow.monitor_settings.from_contact_jids is
  'Personal/DM chat JIDs to watch (e.g. 6010...@s.whatsapp.net or 555...@lid).';

-- ---------------------------------------------------------------------------
-- whatsapp_messages: explicit personal + group sender fields
-- ---------------------------------------------------------------------------
alter table actionnow.whatsapp_messages
  add column if not exists sender_pn text,
  add column if not exists cleaned_sender_pn text,
  add column if not exists sender_lid text,
  add column if not exists participant text,
  add column if not exists participant_pn text,
  add column if not exists cleaned_participant_pn text,
  add column if not exists participant_lid text,
  add column if not exists sender_lid_resolved text;

-- Migrate rows that used the old collapsed columns (if present)
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'actionnow'
      and table_name = 'whatsapp_messages'
      and column_name = 'sender_jid'
  ) then
    update actionnow.whatsapp_messages
    set
      participant = sender_jid,
      participant_lid = sender_jid
    where is_group
      and sender_jid is not null
      and participant is null;

    update actionnow.whatsapp_messages
    set
      sender_lid = sender_jid,
      sender_pn = chat_jid
    where not is_group
      and sender_jid is not null
      and sender_lid is null;

    alter table actionnow.whatsapp_messages
      drop column if exists sender_jid;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'actionnow'
      and table_name = 'whatsapp_messages'
      and column_name = 'sender_phone'
  ) then
    update actionnow.whatsapp_messages
    set cleaned_participant_pn = sender_phone
    where is_group
      and sender_phone is not null
      and cleaned_participant_pn is null;

    update actionnow.whatsapp_messages
    set cleaned_sender_pn = sender_phone
    where not is_group
      and sender_phone is not null
      and cleaned_sender_pn is null;
  end if;
end $$;

-- Backfill normalized columns from explicit fields
update actionnow.whatsapp_messages
set
  sender_phone = coalesce(cleaned_participant_pn, cleaned_sender_pn),
  sender_lid_resolved = coalesce(participant_lid, participant, sender_lid)
where sender_phone is null
   or sender_lid_resolved is null;

comment on column actionnow.whatsapp_messages.event_type is
  'Webhook event: messages-group.received or messages-personal.received.';

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
