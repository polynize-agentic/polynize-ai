-- polynize.ai v2 — capability map rename.
-- The Phase B output is no longer a multi-team heat map; it's a single-team
-- capability map decomposed from a specific bottleneck. This migration renames
-- the table and tightens the legacy column set down to just the bits we need.

alter table if exists heat_maps rename to capability_maps;

-- Drop legacy single-team columns. The full payload now lives in `data` jsonb.
alter table capability_maps drop column if exists rows;
alter table capability_maps drop column if exists team;

-- Rename the legacy `shape` column to `shape_internal` to match the new spec.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'capability_maps' and column_name = 'shape'
  ) then
    alter table capability_maps rename column shape to shape_internal;
  end if;
end$$;

-- Rename the constraint that referenced the old name.
alter table capability_maps
  drop constraint if exists heat_maps_generated_by_check;

alter table capability_maps
  add constraint capability_maps_generated_by_check
  check (generated_by in ('rule_based', 'llm'));
