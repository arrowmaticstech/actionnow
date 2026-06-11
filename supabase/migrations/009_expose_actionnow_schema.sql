-- Expose actionnow schema to PostgREST / Edge Functions service role
-- Dashboard: Settings → API → Exposed schemas → add "actionnow"

grant usage on schema actionnow to service_role;
grant select on all tables in schema actionnow to service_role;
grant usage, select on all sequences in schema actionnow to service_role;

alter default privileges in schema actionnow
  grant select on tables to service_role;
