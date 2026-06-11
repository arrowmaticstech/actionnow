-- Read-only public views over actionnow tables.
-- Use when API "Exposed schemas" only allows public (no actionnow).
-- Edge function full-reports queries these via service_role.

create or replace view public.an_user_whatsapp_connections as
  select * from actionnow.user_whatsapp_connections;

create or replace view public.an_whatsapp_messages as
  select * from actionnow.whatsapp_messages;

create or replace view public.an_whatsapp_message_media as
  select * from actionnow.whatsapp_message_media;

create or replace view public.an_whatsapp_media_interpretations as
  select * from actionnow.whatsapp_media_interpretations;

create or replace view public.an_monitor_attempt_logs as
  select * from actionnow.monitor_attempt_logs;

create or replace view public.an_monitor_results as
  select * from actionnow.monitor_results;

grant select on public.an_user_whatsapp_connections to service_role;
grant select on public.an_whatsapp_messages to service_role;
grant select on public.an_whatsapp_message_media to service_role;
grant select on public.an_whatsapp_media_interpretations to service_role;
grant select on public.an_monitor_attempt_logs to service_role;
grant select on public.an_monitor_results to service_role;
