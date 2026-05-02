-- polynize.ai v2 — restore the missing `data` jsonb column on capability_maps.
-- Migration 0003 dropped the old `rows`/`team` columns and noted in a comment
-- that "the full payload now lives in `data` jsonb" — but never actually added
-- that column. The result has been silent failure for weeks: every Phase B
-- write returns PGRST204 ("Could not find the 'data' column"), so no
-- capability_maps rows have been written and no blueprints have been created.
--
-- This adds the column back. Existing rows (there is exactly one, from before
-- 0003 ran) get NULL — that's fine, they won't be re-read.

alter table capability_maps
  add column if not exists data jsonb;

comment on column capability_maps.data is
  'Full Phase B payload (capabilities, team, percentages, leverage, interpretation, pricing, hiring_comparison, shape metadata). Mirrors the shape consumed by /api/blueprints when snapshotting into blueprints.data.';
