-- polynize.ai v2 — rename Richie webhook to Scout webhook in email_log.
-- The Richie/Scout switch is purely a name change; nothing else about the
-- dispatch mechanism changed. We need to (1) drop the old constraint,
-- (2) rewrite any historical rows with richie_* statuses + template, and
-- (3) re-add the constraint with only the new scout_* values allowed.

alter table email_log
  drop constraint if exists email_log_status_check;

-- Backfill: anything emitted under the old names becomes the new names.
-- Safe even when there are no historical rows.
update email_log
   set status = 'sent_to_scout'
 where status = 'sent_to_richie';

update email_log
   set status = 'scout_unavailable'
 where status = 'richie_unavailable';

update email_log
   set status = 'scout_skipped'
 where status = 'richie_skipped';

update email_log
   set template = 'scout_webhook'
 where template = 'richie_webhook';

alter table email_log
  add constraint email_log_status_check
  check (status in (
    'sent',
    'failed',
    'bounced',
    'skipped_flag_off',
    'sent_to_scout',
    'scout_unavailable',
    'scout_skipped'
  ));

comment on column email_log.template is
  'Template identifier. Conventional values: blueprint_ready (direct Resend send), scout_webhook (handed off to Scout via webhook).';
