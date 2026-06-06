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
