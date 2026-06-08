@start-app @start-app/reference-view-only/whatsender/webhook at the top of this page .. today we actually hardcoding the phone number and email..

instead i want you create a form that allow user put their phone number and email..
then when user submit , we can generate qr code and do the pairing..


the flow im thinking our fe--> n8n-->whatsender api
see
@start-app/reference-view-only/whatsender.session.txt@start-app/reference-view-only/whatsender/webhook  

1. make all the api here n8n webhook here wrapper proxy api as closely as possible to whatsender.
@start-app/n8n/n8n-whatsender-api.json

2. make the fe screen with the form allow user key in their phone number, session-device-name, email. the top right of the screen has an unbind feature that will trigger  @whatsender.session.txt (107-124) 

3. the fe screen after submit will generate qr ccode 30seconds. allow user scanned.@start-app/reference-view-only/whatsender.session.txt once scanned then link can update. when we register t

5977|7uDM31wvplnNVh7NqV9MyGm2bu4cmwOzmjT1WFHp9b912027


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
update on user_whatsapp_connections for EACH row
execute FUNCTION update_updated_at_column ();