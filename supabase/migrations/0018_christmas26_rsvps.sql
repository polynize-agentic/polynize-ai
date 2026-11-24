-- 0018: replies to the Polynize Christmas Party invite at /christmas26 (D128). Safe to run twice.
--
-- Allergies are health information. Row level security is ON with NO policies, so the anon key
-- can neither read nor write this table: only the site's server (the service role) can. The daily
-- purge job (/api/cron/christmas26-purge) deletes every row from 21 December 2026.
--
-- To export: Supabase, Table Editor, christmas26_rsvps, Export, CSV. Filter out is_test first.

create table if not exists christmas26_rsvps (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  coming boolean not null,
  with_partner boolean not null default false,
  partner_name text,
  allergies text,
  note text,
  link_name text,
  is_test boolean not null default false
);

alter table christmas26_rsvps enable row level security;
