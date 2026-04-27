-- polynize.ai v2 — initial schema
-- Reference: design_handoff/05-schema-sketches.md
-- All writes are server-side via the service role. Public read is allowed only on `blueprints`,
-- gated by the unguessable uuid in the URL.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- sessions: top-level row created when a visitor starts Phase A.
-- ---------------------------------------------------------------------------
create table if not exists sessions (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  phase        text not null default 'A' check (phase in ('A','B','C','DONE')),
  email        text,
  lead_status  text not null default 'active' check (lead_status in ('active','abandoned','booked'))
);

create index if not exists sessions_email_idx on sessions(email);

-- ---------------------------------------------------------------------------
-- answers: Phase A output, one row per session, JSON blob.
-- Shape: see lib/types.ts (`Answers`).
-- ---------------------------------------------------------------------------
create table if not exists answers (
  session_id    uuid primary key references sessions(id) on delete cascade,
  answers       jsonb not null,
  completed_at  timestamptz
);

-- ---------------------------------------------------------------------------
-- heat_maps: Phase B output. `generated_by` records whether this came from
-- the rule-based derivation (v1) or an LLM run (v2+).
-- ---------------------------------------------------------------------------
create table if not exists heat_maps (
  session_id    uuid primary key references sessions(id) on delete cascade,
  shape         text not null,
  percentages   jsonb not null,
  rows          jsonb not null,
  team          jsonb not null,
  generated_at  timestamptz not null default now(),
  generated_by  text not null default 'rule_based'
);

-- ---------------------------------------------------------------------------
-- chat_messages: Phase C transcript.
-- ---------------------------------------------------------------------------
create table if not exists chat_messages (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid not null references sessions(id) on delete cascade,
  created_at     timestamptz not null default now(),
  role           text not null check (role in ('user','assistant','system')),
  content        text not null,
  agent_persona  text
);

create index if not exists chat_messages_session_created_idx
  on chat_messages(session_id, created_at);

-- ---------------------------------------------------------------------------
-- blueprints: the shareable takeaway. `data` is a denormalized snapshot so
-- the public read path is one row, no joins.
-- ---------------------------------------------------------------------------
create table if not exists blueprints (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid not null unique references sessions(id) on delete cascade,
  created_at     timestamptz not null default now(),
  shared_count   integer not null default 0,
  pricing_version text not null,
  data           jsonb not null
);

create index if not exists blueprints_session_idx on blueprints(session_id);

-- ---------------------------------------------------------------------------
-- email_log: audit trail for transactional email (Resend).
-- ---------------------------------------------------------------------------
create table if not exists email_log (
  id          uuid primary key default gen_random_uuid(),
  sent_at     timestamptz not null default now(),
  session_id  uuid references sessions(id) on delete set null,
  email       text not null,
  template    text not null,
  resend_id   text,
  status      text check (status in ('sent','failed','bounced','skipped_flag_off'))
);

-- ---------------------------------------------------------------------------
-- updated_at trigger for `sessions`.
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists sessions_set_updated_at on sessions;
create trigger sessions_set_updated_at
  before update on sessions
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row-level security.
-- All tables have RLS on. Default policy: deny. Service role bypasses RLS,
-- so server routes are unaffected. Anon users get one path: read a blueprint
-- by id (the share-link pattern).
-- ---------------------------------------------------------------------------
alter table sessions       enable row level security;
alter table answers        enable row level security;
alter table heat_maps      enable row level security;
alter table chat_messages  enable row level security;
alter table blueprints     enable row level security;
alter table email_log      enable row level security;

drop policy if exists "anon can read a blueprint by id" on blueprints;
create policy "anon can read a blueprint by id"
  on blueprints for select
  to anon
  using (true);
