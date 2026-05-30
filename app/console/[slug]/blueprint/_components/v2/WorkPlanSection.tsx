/**
 * Work Plan section renderer (spec §9.11).
 *
 * Per Work Plan:
 *   - title + deliverable_type + covered-capability chips (link to #cap-id)
 *   - 8-stage horizontal sprint stepper (pending/active/complete)
 *   - progress_pct (derived, recomputed here so it's always consistent
 *     with the stage states even if the stored value is stale)
 *   - requirements (context/functional/integrations/non-functional) if any
 *   - dependencies (other work-plan ids)
 *   - progress log (from progress.md)
 *
 * Active Work Plan emphasised (mint inset edge). Completed ones collapse
 * to a summary (header + stepper only). Only rendered in Build/Operate
 * phase by the parent.
 */

import type { WorkPlan } from '@/lib/blueprint/load-v2';
import { deriveProgressPct } from '@/lib/blueprint/load-v2';
import {
  SPRINT_STAGE_ORDER,
  SPRINT_STAGE_LABELS,
} from '@/lib/blueprint/schema-v2';
import { StageStatusControl } from './StageStatusControl';
import s from './v2-sections.module.css';

function SprintStepper({
  plan,
  slug,
  canEdit,
}: {
  plan: WorkPlan;
  slug: string;
  canEdit: boolean;
}) {
  // Build a status map keyed by stage id; default pending.
  const byId = new Map(plan.sprint_stages.map((st) => [st.id, st]));
  return (
    <div className={s.stepper}>
      {SPRINT_STAGE_ORDER.map((id) => {
        const st = byId.get(id);
        const status = st?.status ?? 'pending';
        const dotCls =
          status === 'complete'
            ? `${s.stepDot} ${s.stepDotComplete}`
            : status === 'active'
              ? `${s.stepDot} ${s.stepDotActive}`
              : s.stepDot;
        const labelCls =
          status === 'complete'
            ? `${s.stepLabel} ${s.stepLabelComplete}`
            : status === 'active'
              ? `${s.stepLabel} ${s.stepLabelActive}`
              : s.stepLabel;
        return (
          <div key={id} className={s.step}>
            <span className={dotCls} aria-hidden />
            <span className={labelCls}>{SPRINT_STAGE_LABELS[id]}</span>
            {status === 'active' && st?.note && (
              <span className={s.stepNote}>{st.note}</span>
            )}
            {canEdit && (
              <StageStatusControl
                slug={slug}
                workPlanId={plan.id}
                stageId={id}
                status={status}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Requirements({ plan }: { plan: WorkPlan }) {
  const r = plan.requirements;
  const rows: { key: string; val: string }[] = [];
  if (r.context) rows.push({ key: 'Context', val: r.context });
  if (r.functional) rows.push({ key: 'Functional', val: r.functional });
  if (r.integrations) rows.push({ key: 'Integrations', val: r.integrations });
  if (r.non_functional)
    rows.push({ key: 'Non-functional', val: r.non_functional });
  if (rows.length === 0) return null;
  return (
    <div className={s.wpReqs}>
      {rows.map((row) => (
        <div key={row.key} className={s.wpReqRow}>
          <span className={s.detailKey}>{row.key}</span>
          <span className={s.detailVal}>{row.val}</span>
        </div>
      ))}
    </div>
  );
}

function WorkPlanCard({
  plan,
  progressLog,
  slug,
  canEdit,
}: {
  plan: WorkPlan;
  progressLog: string;
  slug: string;
  canEdit: boolean;
}) {
  const isActive = plan.status === 'in_progress' || plan.status === 'operate';
  const isComplete = plan.status === 'archived';
  const pct = deriveProgressPct(plan);

  const cardCls = `${s.workPlan} ${
    isActive ? s.workPlanActive : ''
  } ${isComplete ? s.workPlanCollapsed : ''}`;

  return (
    <div className={cardCls}>
      <div className={s.wpHead}>
        <div className={s.wpTitleBlock}>
          <h3 className={s.wpTitle}>{plan.title}</h3>
          <span className={s.wpType}>{plan.deliverable_type}</span>
          <div className={s.wpCovers}>
            {plan.covers_capabilities.map((id) => (
              <a key={id} href={`#cap-${id}`} className={s.wpCoverChip}>
                {id}
              </a>
            ))}
          </div>
        </div>
        <div className={s.wpProgress}>
          <span className={s.wpProgressVal}>{Math.round(pct)}%</span>
          <span className={s.wpStatusTag}>{plan.status.replace('_', ' ')}</span>
        </div>
      </div>

      <SprintStepper plan={plan} slug={slug} canEdit={canEdit} />

      {/* Completed (archived) work plans collapse to header + stepper. */}
      {!isComplete && (
        <>
          <Requirements plan={plan} />
          {plan.dependencies.length > 0 && (
            <p className={s.wpDeps}>
              Depends on: {plan.dependencies.join(', ')}
              {plan.depends_on_stage
                ? ` (at stage ${plan.depends_on_stage})`
                : ''}
            </p>
          )}
          {progressLog.trim() && (
            <div className={s.wpProgressLog}>
              <div className={s.wpProgressLogTitle}>Progress log</div>
              <div className={s.wpProgressLogBody}>{progressLog.trim()}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function WorkPlanSection({
  workPlans,
  slug,
  canEdit,
}: {
  workPlans: { plan: WorkPlan; progressLog: string }[];
  slug: string;
  canEdit: boolean;
}) {
  if (workPlans.length === 0) {
    return (
      <p className={s.placeholder}>
        No work plans yet. Work plans are introduced at the Build phase, one
        sprint at a time.
      </p>
    );
  }

  // Order: active first, then not-started, then archived.
  const rank = (status: WorkPlan['status']) =>
    status === 'in_progress' || status === 'operate'
      ? 0
      : status === 'not_started'
        ? 1
        : 2;
  const ordered = [...workPlans].sort(
    (a, b) => rank(a.plan.status) - rank(b.plan.status)
  );

  return (
    <div>
      {ordered.map(({ plan, progressLog }) => (
        <WorkPlanCard
          key={plan.id}
          plan={plan}
          progressLog={progressLog}
          slug={slug}
          canEdit={canEdit}
        />
      ))}
    </div>
  );
}
