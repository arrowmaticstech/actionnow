-- Read-only view for monitor_settings (used by full-reports /config route).

create or replace view public.an_monitor_settings as
  select * from actionnow.monitor_settings;

grant select on public.an_monitor_settings to service_role;
