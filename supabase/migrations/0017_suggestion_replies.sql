-- 0017: the morning build's answer on each suggestion (D123). Safe to run twice.
alter table console_requests add column if not exists reply text;
alter table console_requests add column if not exists built_commit text;
alter table console_requests add column if not exists built_at timestamptz;
