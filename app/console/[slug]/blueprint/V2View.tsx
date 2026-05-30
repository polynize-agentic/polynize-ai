/**
 * Stage 2 (schema_version: 2.0) Blueprint renderer.
 *
 * This is the new renderer for engagements migrated to the two-layer
 * Blueprint architecture (Engagement section + Work Plan section).
 *
 * Landmark 3 ships this as a STUB that confirms the schema-version
 * branch fires and loads the v2 object. Subsequent landmarks fill in
 * the actual section renderers:
 *
 *   L6  Capability Map (heatmap)
 *   L7  Benchmarking + Uplift + Next Steps
 *   L8  Capability modal
 *   L9  Gap Register (derived)
 *   L10 Work Plan section + sprint stepper
 *   L11 Project timeline (Gantt)
 *   L11.5 Context export button
 *   L12 (no change here)
 *   L13 Editing UIs
 *
 * Existing legacy Blueprints (Newkind, reMYnd, EverStock, Roxbury's
 * pre-migration) keep using LegacyBlueprintView via page.tsx's
 * schema-version branch. This component only renders when
 * blueprint_schema_version === '2.0'.
 */

import Link from 'next/link';
import { loadBlueprintV2, displayAllocation } from '@/lib/blueprint/load-v2';
import { RefreshButton } from './RefreshButton';
import s from './blueprint.module.css';

export async function V2BlueprintView({
  slug,
  isTeamUser,
}: {
  slug: string;
  isTeamUser: boolean;
}) {
  const blueprint = await loadBlueprintV2(slug);

  if (!blueprint) {
    return (
      <>
        <div className={s.bgPattern} aria-hidden />
        <div className={s.container}>
          <header className={s.header}>
            <div className={s.eyebrow}>
              POLYNIZE AGENTIC MANAGEMENT CONSOLE · CLIENT BLUEPRINT
            </div>
            <h1 className={s.title}>{slug}</h1>
            {isTeamUser && (
              <Link href="/console" className={s.backLink}>
                ← All clients
              </Link>
            )}
          </header>
          <p className={s.emptyState}>
            Stage 2 Blueprint not yet populated. Add{' '}
            <code>modelling/capability-map.json</code> to the client repo to
            populate this dashboard.
          </p>
        </div>
      </>
    );
  }

  const { capabilityMap, engagementModel, workPlans, timeline, config } =
    blueprint;
  const clientName =
    config?.client?.display_name ?? config?.client?.name ?? slug;

  // L3 stub body: confirm load succeeded, surface the schema version branch.
  // Real sections land in subsequent landmarks.
  return (
    <>
      <div className={s.bgPattern} aria-hidden />
      <div className={s.container}>
        <header className={s.header}>
          <div className={s.eyebrow}>
            POLYNIZE AGENTIC MANAGEMENT CONSOLE · CLIENT BLUEPRINT · v2.0
          </div>
          <h1 className={s.title}>{clientName}</h1>
          <div className={s.headerActions}>
            {isTeamUser ? (
              <Link href="/console" className={s.backLink}>
                ← All clients
              </Link>
            ) : (
              <span aria-hidden />
            )}
            {isTeamUser && <RefreshButton slug={slug} />}
          </div>
        </header>

        <section id="v2-stub" className={s.section}>
          <div className={s.sectionHeader}>
            <span className={s.sectionNumber}>00</span>
            <h2 className={s.sectionTitle}>Stage 2 renderer · stub</h2>
          </div>
          <div className={s.sectionBody}>
            <p>
              Loaded <strong>{capabilityMap.capabilities.length}</strong>{' '}
              capability rows across{' '}
              <strong>{capabilityMap.clusters.length}</strong> clusters.
            </p>
            <p>
              Allocation summary:{' '}
              {displayAllocation('Agent')}{' '}
              {capabilityMap.allocation_summary.percentages.agent}% ·{' '}
              {displayAllocation('Hybrid')}{' '}
              {capabilityMap.allocation_summary.percentages.hybrid}% ·{' '}
              {displayAllocation('Human')}{' '}
              {capabilityMap.allocation_summary.percentages.human}%
            </p>
            <p>
              Engagement model:{' '}
              {engagementModel
                ? `loaded (${Object.keys(engagementModel.rows).length} rows)`
                : 'not present (Lead / Mapping)'}
            </p>
            <p>Work plans: {workPlans.length}</p>
            <p>Timeline items: {timeline ? timeline.items.length : 'n/a'}</p>
            <p>
              Engagement status:{' '}
              <code>{config?.engagement_status ?? 'unset'}</code> · phase:{' '}
              <code>{config?.engagement_phase ?? 'unset'}</code>
            </p>
            <p style={{ color: 'var(--bp-text-3)', fontSize: 12 }}>
              This stub confirms the schema-version branch is firing. Full
              section renderers land in Landmarks 6 through 11.5.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
