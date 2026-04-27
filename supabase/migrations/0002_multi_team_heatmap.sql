-- polynize.ai v2 — multi-team heat map migration.
-- The Phase B reveal now stores the full LLM-generated MultiTeamHeatMap
-- structure, not just a single team. We add a `data` jsonb column that
-- holds the canonical payload and relax the legacy NOT NULLs so old single-team
-- columns can be dropped or left empty.

alter table heat_maps
  add column if not exists data jsonb;

alter table heat_maps
  alter column rows drop not null,
  alter column team drop not null,
  alter column percentages drop not null;

-- Allow `generated_by` to record the new origin set.
alter table heat_maps
  drop constraint if exists heat_maps_generated_by_check;

alter table heat_maps
  add constraint heat_maps_generated_by_check
  check (generated_by in ('rule_based', 'llm'));
