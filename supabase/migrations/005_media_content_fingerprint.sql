-- Fix dedupe for media-only messages (empty caption / no messageBody)
-- Run after 004

alter table actionnow.whatsapp_messages
  add column if not exists content_fingerprint text;

comment on column actionnow.whatsapp_messages.content_fingerprint is
  'Media: hash tag from mediaKey/url/fileLength. Text: null (use message_body).';

-- natural_uidx treated empty-body images as interchangeable; message_id alone is enough
drop index if exists actionnow.whatsapp_messages_natural_uidx;

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
      || coalesce(new.content_type, '') || '|'
      || coalesce(
        nullif(new.content_fingerprint, ''),
        nullif(new.message_body, ''),
        ''
      ) || '|'
      || coalesce(new.whatsapp_timestamp::text, ''),
      'sha256'
    ),
    'hex'
  );
  return new;
end;
$$;

-- Recompute existing rows (media rows with empty body get distinct keys via content_type + fingerprint if set)
update actionnow.whatsapp_messages
set dedupe_key = encode(
  digest(
    coalesce(owner_email, '') || '|'
    || coalesce(message_id, '') || '|'
    || coalesce(sender_phone, '') || '|'
    || coalesce(chat_jid, '') || '|'
    || coalesce(content_type, '') || '|'
    || coalesce(nullif(content_fingerprint, ''), nullif(message_body, ''), '') || '|'
    || coalesce(whatsapp_timestamp::text, ''),
    'sha256'
  ),
  'hex'
);

comment on column actionnow.whatsapp_messages.dedupe_key is
  'SHA-256: owner + message_id + sender + chat + content_type + fingerprint/body + timestamp.';
