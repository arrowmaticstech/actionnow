-- Monitor prevalidation attempt logs (keyword score / insights before full report)
-- Run after 001_actionnow_monitor_tables.sql

-- ---------------------------------------------------------------------------
-- actionnow.monitor_attempt_logs
-- One row per scheduled monitor run that reached the LLM keyword-score step.
-- Logs score, threshold pass/fail, and short insights even when no report is sent.
-- ---------------------------------------------------------------------------
create table if not exists actionnow.monitor_attempt_logs (
  id uuid primary key default gen_random_uuid(),

  monitor_setting_id uuid not null
    references actionnow.monitor_settings (id)
    on delete cascade,

  owner_email text not null,
  owner_phone_num text,

  monitor_name text,

  matched_slot_at timestamptz,
  window_start timestamptz not null,
  window_end timestamptz not null,

  relevance_score integer
    check (relevance_score is null or (relevance_score >= 0 and relevance_score <= 100)),

  score_threshold integer not null default 20
    check (score_threshold >= 0 and score_threshold <= 100),

  passes_threshold boolean not null default false,

  score_reason text,
  score_insights jsonb,

  message_count integer not null default 0
    check (message_count >= 0),

  keywords_snapshot text[] not null default '{}',
  content_types_snapshot text[] not null default '{}',

  corpus_preview text,

  outcome text not null default 'scored',

  monitor_result_id uuid
    references actionnow.monitor_results (id)
    on delete set null,

  model_provider text not null default 'openrouter',
  model_name text,

  error_message text,

  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),

  constraint monitor_attempt_logs_outcome_check
    check (outcome in (
      'scored',
      'not_send',
      'below_threshold',
      'passed_score',
      'report_generated',
      'no_messages',
      'slot_skipped',
      'error'
    ))
);

comment on table actionnow.monitor_attempt_logs is
  'Prevalidation log per monitor run: keyword relevance score, insights, and whether threshold was met.';

comment on column actionnow.monitor_attempt_logs.relevance_score is
  'LLM keyword relevance score 0–100 from prevalidation chain.';

comment on column actionnow.monitor_attempt_logs.score_reason is
  'One-line explanation from the score LLM (brief_reason).';

comment on column actionnow.monitor_attempt_logs.score_insights is
  'Optional structured extras from score step, e.g. raw LLM JSON or matched keyword hints.';

comment on column actionnow.monitor_attempt_logs.corpus_preview is
  'Truncated message corpus sample used for scoring (audit/debug).';

comment on column actionnow.monitor_attempt_logs.outcome is
  'not_send=score<=threshold, logged but no WhatsApp sent; passed_score=above threshold; report_generated=full report saved.';

comment on column actionnow.monitor_attempt_logs.monitor_result_id is
  'Set when a full report row is created in monitor_results for this attempt.';

create index if not exists monitor_attempt_logs_monitor_setting_id_idx
  on actionnow.monitor_attempt_logs (monitor_setting_id);

create index if not exists monitor_attempt_logs_owner_email_idx
  on actionnow.monitor_attempt_logs (owner_email);

create index if not exists monitor_attempt_logs_created_date_idx
  on actionnow.monitor_attempt_logs (created_date desc);

create index if not exists monitor_attempt_logs_passes_threshold_idx
  on actionnow.monitor_attempt_logs (passes_threshold, created_date desc);

create index if not exists monitor_attempt_logs_window_idx
  on actionnow.monitor_attempt_logs (window_start, window_end);

create or replace function actionnow.set_monitor_attempt_logs_updated_date()
returns trigger
language plpgsql
as $$
begin
  new.updated_date = now();
  return new;
end;
$$;

drop trigger if exists trg_monitor_attempt_logs_updated_date
  on actionnow.monitor_attempt_logs;

create trigger trg_monitor_attempt_logs_updated_date
  before update on actionnow.monitor_attempt_logs
  for each row
  execute function actionnow.set_monitor_attempt_logs_updated_date();
