-- polynize.ai v2 — extend email_log.status to include the Richie webhook outcomes.
-- Original constraint (from 0001_init.sql): ('sent','failed','bounced','skipped_flag_off')
-- Adds:
--   'sent_to_richie'      — webhook POST succeeded; Richie owns the actual send
--   'richie_unavailable'  — webhook POST failed (network error, 4xx/5xx, timeout)
--   'richie_skipped'      — RICHIE_WEBHOOK_URL not configured; trigger no-op'd

alter table email_log
  drop constraint if exists email_log_status_check;

alter table email_log
  add constraint email_log_status_check
  check (status in (
    'sent',
    'failed',
    'bounced',
    'skipped_flag_off',
    'sent_to_richie',
    'richie_unavailable',
    'richie_skipped'
  ));

-- Add a `template` value covering the Richie path so existing analytics queries
-- can group cleanly. (No constraint on template, just a documented convention.)
comment on column email_log.template is
  'Template identifier. Conventional values: blueprint_ready (direct Resend send), richie_webhook (handed off to Richie via webhook).';
