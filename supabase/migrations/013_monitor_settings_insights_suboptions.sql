-- Rename suboptions → insights_suboptions; backward-compat view exposes suboptions alias.

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'actionnow'
      and table_name = 'monitor_settings'
      and column_name = 'suboptions'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'actionnow'
      and table_name = 'monitor_settings'
      and column_name = 'insights_suboptions'
  ) then
    alter table actionnow.monitor_settings
      rename column suboptions to insights_suboptions;
  end if;
end $$;

alter table actionnow.monitor_settings
  add column if not exists insights_suboptions text[] not null default '{}'::text[];

comment on column actionnow.monitor_settings.insights_suboptions is
  'Common-insight category slugs when preferred_method = common-insights. Coexists with keyword/LLM fields.';

comment on column actionnow.monitor_settings.what_content_keywords is
  'Keyword list when preferred_method = keyword. Retained when switching methods.';

comment on column actionnow.monitor_settings.prompt_instructions_template is
  'LLM prompt when preferred_method = instructions. Retained when switching methods.';

-- Backward-compat view inside actionnow schema (suboptions alias).
create or replace view actionnow.monitor_settings_compat as
select
  ms.*,
  ms.insights_suboptions as suboptions
from actionnow.monitor_settings ms;

comment on view actionnow.monitor_settings_compat is
  'monitor_settings plus suboptions alias for legacy readers.';

-- Public read view used by full-reports /config (includes suboptions alias).
create or replace view public.an_monitor_settings as
select
  ms.*,
  ms.insights_suboptions as suboptions
from actionnow.monitor_settings ms;

grant select on public.an_monitor_settings to service_role;
