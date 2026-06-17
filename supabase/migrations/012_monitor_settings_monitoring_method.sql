-- Monitoring method fields on monitor_settings (keyword / instructions / common-insights).

alter table actionnow.monitor_settings
  add column if not exists preferred_method text not null default 'keyword',
  add column if not exists suboptions text[] not null default '{}'::text[],
  add column if not exists prompt_instructions_template text;

alter table actionnow.monitor_settings
  drop constraint if exists monitor_settings_preferred_method_check;

alter table actionnow.monitor_settings
  add constraint monitor_settings_preferred_method_check
  check (
    preferred_method = any (
      array['keyword'::text, 'instructions'::text, 'common-insights'::text]
    )
  );

comment on column actionnow.monitor_settings.preferred_method is
  'How the monitor decides relevance: keyword, instructions (LLM prompt), or common-insights.';

comment on column actionnow.monitor_settings.suboptions is
  'Common-insight slugs when preferred_method = common-insights (renamed to insights_suboptions in migration 013).';

comment on column actionnow.monitor_settings.prompt_instructions_template is
  'Free-form LLM monitoring instructions when preferred_method = instructions.';
