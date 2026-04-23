# 05 · Schema Sketches

Suggested Supabase schema. Adjust to your conventions (pluralization, casing, timestamp columns). This is a starting point, not a mandate.

## Tables

### `sessions`
The top-level object for a `/agents` run. Created when a user starts Phase A.

```sql
create table sessions (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  phase           text not null default 'A' check (phase in ('A','B','C','DONE')),
  email           text,                       -- captured in Phase C or later
  lead_status     text default 'active'       -- active | abandoned | booked
);
```

### `answers`
Phase A output. One row per session; `answers` is the JSON blob.

```sql
create table answers (
  session_id      uuid primary key references sessions(id) on delete cascade,
  answers         jsonb not null,             -- shape described below
  completed_at    timestamptz
);
```

Answers JSON shape:
```json
{
  "name": "Sarah",
  "q1": "We run a content studio producing 30 videos/mo for B2B clients",
  "q1_company": "Keel Operations",
  "q2_role": "founder",
  "q2_size": "2_10",
  "q3": "Editorial turnaround keeps slipping. I'm becoming the bottleneck.",
  "q4": ["content", "client_ops", "sales"],
  "q5_volume": "30_per_month",
  "q6_tools": ["notion", "slack", "figma", "airtable"],
  "q7_constraint": "my_time",
  "q8_metric": "videos shipped per month",
  "q9_urgency": "asap",
  "q10_stance": "hands_on"
}
```

### `heat_maps`
Phase B output. One row per session.

```sql
create table heat_maps (
  session_id      uuid primary key references sessions(id) on delete cascade,
  shape           text not null,              -- e.g. "Pipeline and Conversion"
  percentages     jsonb not null,             -- { human, hybrid, agent }
  rows            jsonb not null,             -- array of { fn, alloc }
  team            jsonb not null,             -- array of { name, role }
  generated_at    timestamptz not null default now(),
  generated_by    text not null default 'rule_based'  -- 'rule_based' | 'llm_v1' | ...
);
```

Rows JSON example:
```json
[
  { "fn": "Client onboarding calls", "alloc": "human" },
  { "fn": "Brief intake + spec", "alloc": "hybrid" },
  { "fn": "Draft scripts", "alloc": "agent" },
  { "fn": "Source b-roll", "alloc": "agent" },
  ...
]
```

Team JSON example:
```json
[
  { "name": "Sarah", "role": "Creative director (you)", "type": "human" },
  { "name": "Atlas", "role": "Producer", "type": "agent" },
  { "name": "Kim", "role": "Editor", "type": "agent" }
]
```

### `chat_messages`
Phase C transcript.

```sql
create table chat_messages (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid not null references sessions(id) on delete cascade,
  created_at      timestamptz not null default now(),
  role            text not null check (role in ('user','assistant','system')),
  content         text not null,
  agent_persona   text                        -- which agent "spoke" (when assistant)
);
create index on chat_messages (session_id, created_at);
```

### `blueprints`
The shareable takeaway. Created when a user completes Phase C or explicitly requests one.

```sql
create table blueprints (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid not null unique references sessions(id) on delete cascade,
  created_at      timestamptz not null default now(),
  shared_count    int not null default 0,
  -- denormalized for fast public read (avoids needing a session join on every blueprint view)
  data            jsonb not null              -- full snapshot: answers + heat_map + team
);
```

The `id` in the URL `/blueprints/[id]` is this table's PK. The uuid is the "secret" — treat as unguessable but public once shared.

### `email_log`
Audit trail for transactional email.

```sql
create table email_log (
  id              uuid primary key default gen_random_uuid(),
  sent_at         timestamptz not null default now(),
  session_id      uuid references sessions(id),
  email           text not null,
  template        text not null,              -- 'blueprint_ready' | 'followup_d1' | ...
  resend_id       text,                       -- Resend's message id
  status          text                        -- 'sent' | 'failed' | 'bounced'
);
```

## Row-level security

- `sessions`, `answers`, `heat_maps`, `chat_messages`: **anon users cannot read** — all access via server routes using service role
- `blueprints`: **anon users can SELECT by id** — this is the "share link" pattern; no list access
- Writes: service role only

Example policy for public blueprint read:
```sql
alter table blueprints enable row level security;
create policy "anyone can read a blueprint by id"
  on blueprints for select
  using (true);  -- gated by unguessable uuid in URL
```

## Indexes

Aside from primary keys:
- `chat_messages (session_id, created_at)` — for loading chat history in order
- `sessions (email)` — for looking up a user's past sessions if they return
- `blueprints (session_id)` — already unique, covers lookups from Phase C

## Data flow

```
  Phase A complete  →  INSERT answers
  Phase B complete  →  INSERT heat_maps
  Phase C messages  →  INSERT chat_messages (one per message)
  "Get blueprint"   →  UPDATE sessions.email
                    →  INSERT blueprints (denormalized snapshot)
                    →  INSERT email_log (call Resend)
                    →  redirect to /blueprints/[id]
```

## What NOT to persist

- Partial LLM responses (only final assistant messages)
- The system prompt (it's derivable from `answers` + `heat_map`; don't duplicate)
- Raw form keystrokes (only debounced snapshots of the current answer)

## Shape of the "denormalized blueprint snapshot"

When writing to `blueprints.data`, collapse the session state into a single object the blueprint page can render without any joins:

```json
{
  "name": "Sarah",
  "company": "Keel Operations",
  "shape": "Pipeline and Conversion",
  "percentages": { "human": 32, "hybrid": 29, "agent": 39 },
  "rows": [ ... ],
  "team": [ ... ],
  "metric": "videos shipped per month",
  "generated_at": "2026-04-23T12:34:56Z"
}
```

This keeps the blueprint immutable: if the underlying session changes later, the shared link still shows what was delivered.
