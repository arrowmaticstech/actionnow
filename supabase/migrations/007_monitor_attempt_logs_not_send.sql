-- Add not_send outcome (score <= threshold: logged, no report/WhatsApp sent)
-- Run after 006 if 006 was already applied without not_send

alter table actionnow.monitor_attempt_logs
  drop constraint if exists monitor_attempt_logs_outcome_check;

alter table actionnow.monitor_attempt_logs
  add constraint monitor_attempt_logs_outcome_check
  check (outcome in (
    'scored',
    'not_send',
    'below_threshold',
    'passed_score',
    'report_generated',
    'no_messages',
    'slot_skipped',
    'error'
  ));

comment on column actionnow.monitor_attempt_logs.outcome is
  'not_send=score<=threshold, logged but no WhatsApp sent; passed_score=above threshold; report_generated=full report saved.';
