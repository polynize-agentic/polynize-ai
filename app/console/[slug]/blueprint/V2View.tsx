/**
 * Stage 2 (schema_version: 2.0) Blueprint renderer.
 *
 * Renders the two-layer Blueprint as a single page, sections top to
 * bottom (spec §9.2):
 *   1. Engagement summary       (blueprint.md, future)
 *   2. Team                     (future)
 *   3. Infrastructure           (future)
 *   4. Capability Map           (L6 — this landmark)
 *   5. Benchmarking Analysis    (L7)
 *   6. Uplift Plan              (L7)
 *   7. Next Steps               (L7)
 *   8. Gap Register             (L9)
 *   9. Work Plan(s)             (L10)
 *  10. Project Timeline         (L11)
 *
 * This component only renders when blueprint_schema_version === '2.0'.
 * Legacy engagements use LegacyBlueprintView.
 */

import Link from 'next/link';
import { loadBlueprintV2 } from '@/lib/blueprint/load-v2';
import { RefreshButton } from './RefreshButton';
import { CapabilityMap } from './_components/v2/CapabilityMap';
import s from './blueprint.module.css';

function SectionShell({
  number,
  title,
  id,
  children,
}: {
  number: string;
  title: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={s.section}>
      <div className={s.sectionHeader}>
        <span className={s.sectionNumber}>{number}</span>
        <h2 className={s.sectionTitle}>{title}</h2>
      </div>
      <div className={s.sectionBody}>{children}</div>
    </section>
  );
}

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

  const { capabilityMap, config } = blueprint;
  const clientName =
    config?.client?.display_name ?? config?.client?.name ?? slug;
  const statusLabel = config?.engagement_status ?? 'client';

  return (
    <>
      <div className={s.bgPattern} aria-hidden />
      <div className={s.container}>
        <header className={s.header}>
          <div className={s.eyebrow}>
            POLYNIZE AGENTIC MANAGEMENT CONSOLE · CLIENT BLUEPRINT ·{' '}
            {statusLabel.toUpperCase()}
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

        {capabilityMap.interpretation && (
          <div className={s.intro}>{capabilityMap.interpretation}</div>
        )}

        <SectionShell number="04" title="Capability map" id="capability-map">
          <CapabilityMap map={capabilityMap} />
        </SectionShell>
      </div>
    </>
  );
}
