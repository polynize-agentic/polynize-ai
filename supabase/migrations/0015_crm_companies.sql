-- 0015: the company-first CRM (D120).
--
-- AJ's structure, October 2026: companies, the people at them, the deals with them, and the
-- actions that move those deals, plus meeting links on a company and the history of every
-- deal's stage. Replaces the per-person leads lists as the team's CRM; the `leads` table is
-- untouched and keeps receiving website captures.
--
-- Safe to run twice: every statement is "if not exists".

create extension if not exists pgcrypto;

create table if not exists crm_companies (
  id uuid primary key default gen_random_uuid(),
  num bigint generated always as identity,
  name text not null,
  status text not null default 'target',
  tier text,
  owner text,
  website text,
  industry text,
  headquarters text,
  regions text,
  size integer,
  est_users integer,
  use_case text,
  problem text,
  existing_tech text,
  strategic_fit text,
  lead_source text,
  partner_potential text,
  expansion text,
  linkedin text,
  notes text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists crm_companies_name_idx on crm_companies (lower(name));

create table if not exists crm_meetings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references crm_companies (id) on delete cascade,
  title text not null,
  url text not null,
  met_at date,
  fireflies_id text,
  created_by text,
  created_at timestamptz not null default now()
);
create index if not exists crm_meetings_company_idx on crm_meetings (company_id);

create table if not exists crm_contacts (
  id uuid primary key default gen_random_uuid(),
  num bigint generated always as identity,
  company_id uuid not null references crm_companies (id) on delete cascade,
  first_name text not null,
  last_name text,
  title text,
  department text,
  seniority text,
  location text,
  email text,
  phone text,
  linkedin text,
  role text,
  strength text,
  status text not null default 'active',
  preferred text,
  last_contact_at date,
  next_contact_at date,
  owner text,
  notes text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists crm_contacts_company_idx on crm_contacts (company_id);

create table if not exists crm_deals (
  id uuid primary key default gen_random_uuid(),
  num bigint generated always as identity,
  company_id uuid not null references crm_companies (id) on delete cascade,
  contact_id uuid references crm_contacts (id) on delete set null,
  name text not null,
  stage text not null default 'contacted',
  deal_type text,
  offering text,
  value numeric,
  currency text not null default 'AUD',
  arr numeric,
  term text,
  probability integer,
  close_date date,
  proposal_url text,
  procurement text,
  blockers text,
  outcome_reason text,
  closed_at timestamptz,
  owner text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists crm_deals_company_idx on crm_deals (company_id);
create index if not exists crm_deals_stage_idx on crm_deals (stage);

-- Every move between stages, so conversion between stages can be measured (D120).
create table if not exists crm_deal_stages (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references crm_deals (id) on delete cascade,
  stage text not null,
  at timestamptz not null default now(),
  by text
);
create index if not exists crm_deal_stages_deal_idx on crm_deal_stages (deal_id);

create table if not exists crm_actions (
  id uuid primary key default gen_random_uuid(),
  num bigint generated always as identity,
  company_id uuid not null references crm_companies (id) on delete cascade,
  contact_id uuid references crm_contacts (id) on delete set null,
  deal_id uuid references crm_deals (id) on delete set null,
  task text not null,
  owner text,
  due date,
  priority text,
  status text not null default 'todo',
  party text,
  source text not null default 'manual',
  meeting_url text,
  notes text,
  completed_at timestamptz,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists crm_actions_company_idx on crm_actions (company_id);
create index if not exists crm_actions_open_idx on crm_actions (status, due);
