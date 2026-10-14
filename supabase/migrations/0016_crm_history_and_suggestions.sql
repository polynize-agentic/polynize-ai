-- 0016: the CRM's History notes, and the console's suggestions board (D121).
--
-- crm_notes: dated notes on a company, optionally tied to a deal or a contact. A linked Fireflies
-- meeting writes one too, holding its summary and action items, dated on the meeting day.
-- console_requests and console_request_likes: what the team suggests, who agrees, and Marrs's verdict.
--
-- Safe to run twice. Row level security on with no policies, as every other table: the console
-- reaches these only through the server's service key.

create extension if not exists pgcrypto;

create table if not exists crm_notes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references crm_companies (id) on delete cascade,
  deal_id uuid references crm_deals (id) on delete set null,
  contact_id uuid references crm_contacts (id) on delete set null,
  meeting_id uuid references crm_meetings (id) on delete cascade,
  kind text not null default 'note',
  title text,
  body text not null,
  occurred_at date not null default current_date,
  source text not null default 'manual',
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists crm_notes_company_idx on crm_notes (company_id, occurred_at desc);
create index if not exists crm_notes_deal_idx on crm_notes (deal_id);

create table if not exists console_requests (
  id uuid primary key default gen_random_uuid(),
  body text not null,
  status text not null default 'open',
  created_by text not null,
  approved_at timestamptz,
  done_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists console_requests_status_idx on console_requests (status, created_at desc);

create table if not exists console_request_likes (
  request_id uuid not null references console_requests (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  primary key (request_id, email)
);

alter table crm_notes             enable row level security;
alter table console_requests      enable row level security;
alter table console_request_likes enable row level security;
