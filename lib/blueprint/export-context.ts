/**
 * Blueprint context export (Amendment 1, Landmark 11.5).
 *
 * assembleContextMarkdown() takes a loaded BlueprintV2 (+ optional narrative
 * sections lifted from blueprint.md) and produces a single, faithful,
 * current markdown snapshot of the whole project, suitable for pasting into
 * another agent or chat as context.
 *
 * Content rules (Amendment 1):
 * - Current state only; the timestamp makes staleness explicit.
 * - Faithful, not lossy: include all capability fields, gaps, benchmark /
 *   uplift text, work plan detail. The progress log is the one place a
 *   sensible tail is acceptable if very long.
 * - Plain markdown, no HTML, no styling.
 * - Respect the no-em-dash house rule (use commas / periods / colons). The
 *   illustrative H1 in the amendment used an em-dash; the explicit content
 *   rule wins, so the title uses a colon.
 * - Graceful absence: omit or mark "Not yet populated" for missing sections.
 *
 * Pure function: the caller passes the timestamp string so this stays
 * deterministic and testable.
 */

import type { BlueprintV2 } from './load-v2';
import { deriveGapRegister, deriveProgressPct } from './load-v2';
import { SPRINT_STAGE_LABELS } from './schema-v2';

export interface ExportNarrative {
  /** Infrastructure section text from blueprint.md, if present. */
  infrastructure?: string | null;
  /** Decisions log text from blueprint.md, if present. */
  decisions?: string | null;
}

const PROGRESS_LOG_TAIL_LINES = 20;

function displayAlloc(a: 'Agent' | 'Hybrid' | 'Human'): string {
  return a === 'Agent' ? 'AGENTIC' : a === 'Hybrid' ? 'HYBRID' : 'HUMAN';
}

export function assembleContextMarkdown(
  blueprint: BlueprintV2,
  timestampLabel: string,
  narrative: ExportNarrative = {}
): string {
  const { capabilityMap: cm, engagementModel, workPlans, timeline, config } =
    blueprint;
  const out: string[] = [];
  const push = (line = '') => out.push(line);

  const displayName =
    config?.client?.display_name ??
    config?.client?.name ??
    cm.scope_brief.name ??
    blueprint.slug;

  const status = config?.engagement_status ?? 'client';
  const phase = config?.engagement_phase ?? 'unknown';
  const schema = config?.blueprint_schema_version ?? '2.0';
  const lock = config?.lock;

  // ---- Header ----
  push(`# ${displayName}: Complete Project Context`);
  push(`> Snapshot generated ${timestampLabel}. Source: PAM Console.`);
  push(
    `> Engagement status: ${status} · Phase: ${phase} · Schema: ${schema}`
  );
  if (lock) {
    const lockLine = lock.locked
      ? `> Lock state: locked (version ${lock.lock_version}${
          lock.locked_at ? `, locked at ${lock.locked_at}` : ''
        })`
      : `> Lock state: unlocked (version ${lock.lock_version})`;
    push(lockLine);
  } else {
    push(`> Lock state: unlocked`);
  }
  push();

  // ---- Engagement Summary ----
  push(`## Engagement Summary`);
  push(cm.interpretation || 'Not yet populated.');
  push();

  // ---- Team ----
  push(`## Team`);
  push(
    `Human owner: ${cm.team.human_owner.name} (${cm.team.human_owner.role})`
  );
  push();
  for (const agent of cm.team.agents) {
    push(`- ${agent.name} (${agent.role}): ${agent.short_desc}`);
  }
  push();

  // ---- Infrastructure ----
  push(`## Infrastructure`);
  push(
    narrative.infrastructure?.trim()
      ? narrative.infrastructure.trim()
      : 'Not yet populated.'
  );
  push();

  // ---- Scope Brief ----
  push(`## Scope Brief`);
  push(`- Statement: ${cm.scope_brief.statement}`);
  if (cm.scope_brief.scope_inclusions.length) {
    push(`- Included:`);
    for (const inc of cm.scope_brief.scope_inclusions) push(`  - ${inc}`);
  }
  if (cm.scope_brief.scope_exclusions.length) {
    push(`- Excluded:`);
    for (const exc of cm.scope_brief.scope_exclusions) push(`  - ${exc}`);
  }
  push();

  // ---- Capability Map ----
  push(`## Capability Map`);
  push();
  const clusters = [...cm.clusters].sort((a, b) => a.order - b.order);
  for (const cluster of clusters) {
    const rows = cm.capabilities.filter((c) => c.cluster_id === cluster.id);
    if (!rows.length) continue;
    push(`### Cluster ${cluster.id}: ${cluster.name} (${cluster.cluster_type})`);
    push();
    for (const cap of rows) {
      push(
        `#### ${cap.id} · ${cap.name}  [${displayAlloc(cap.allocation)}] [${cap.completeness}] [risk: ${cap.failure_cost}] [confidence: ${cap.confidence}]`
      );
      push(`- Description: ${cap.description}`);
      if (cap.allocation_detail) {
        push(`- Allocation detail: ${cap.allocation_detail}`);
      }
      push(`- Reason: ${cap.reason}`);
      push(
        `- Work shape: ${cap.work_shape.type} · inputs: ${cap.work_shape.inputs.join(', ')} · output: ${cap.work_shape.output} · trigger: ${cap.work_shape.trigger}`
      );
      if (cap.edge_cases.length) {
        push(`- Edge cases: ${cap.edge_cases.join('; ')}`);
      }
      if (cap.evidence.length) {
        push(`- Evidence:`);
        for (const e of cap.evidence) {
          push(`  - ${e.source_id}: "${e.quote}"`);
        }
      }
      if (cap.human_handoff) {
        push(
          `- Human handoff: emit ${cap.human_handoff.emit_artifact}; on completion ${cap.human_handoff.completion_action}${
            cap.human_handoff.feedback_signals.length
              ? `; signals: ${cap.human_handoff.feedback_signals.join(', ')}`
              : ''
          }`
        );
      } else {
        push(`- Human handoff: Agent, no handoff`);
      }
      if (cap.gaps_to_close.length) {
        push(`- Gaps to close:`);
        for (const g of cap.gaps_to_close) {
          push(
            `  - ${g.gap_type}: ${g.question} (${g.blocking ? 'blocking' : 'non-blocking'})`
          );
        }
      }
      push();
    }
  }

  // ---- Allocation Summary ----
  const as = cm.allocation_summary;
  push(`## Allocation Summary`);
  push(
    `- By row count: agent ${as.by_row_count.agent} / hybrid ${as.by_row_count.hybrid} / human ${as.by_row_count.human} (total ${as.row_count_total}, ghosts ${as.ghost_count})`
  );
  push(
    `- Percentages: agent ${as.percentages.agent}% / hybrid ${as.percentages.hybrid}% / human ${as.percentages.human}%`
  );
  push(`- Leverage estimate: ${cm.leverage_estimate} · ${cm.leverage_rationale}`);
  if (as.notes) push(`- Notes: ${as.notes}`);
  push();

  // ---- Benchmarking Analysis ----
  if (engagementModel) {
    push(`## Benchmarking Analysis`);
    push();
    const ordered = [...cm.capabilities].sort((a, b) => a.id.localeCompare(b.id));
    for (const cap of ordered) {
      const er = engagementModel.rows[cap.id];
      push(`### ${cap.id} · ${cap.name}`);
      push(`- Allocation: ${displayAlloc(cap.allocation)}`);
      push(`- Current state: ${er?.current_state || 'Not yet populated.'}`);
      push(`- Benchmark: ${er?.benchmark || 'Not yet populated.'}`);
      if (er) {
        push(`- Uplift needed: ${er.uplift_needed}`);
        push(`- Held: ${er.held ? 'yes' : 'no'}`);
        push(`- Row status: ${er.row_status}`);
      }
      push();
    }
  } else {
    push(`## Benchmarking Analysis`);
    push('Not yet populated (pending Modelling phase).');
    push();
  }

  // ---- Uplift Plan ----
  if (engagementModel) {
    const ordered = [...cm.capabilities].sort((a, b) => a.id.localeCompare(b.id));
    const withMoves = ordered.filter((cap) => {
      const er = engagementModel.rows[cap.id];
      if (!er) return false;
      return (
        er.held ||
        er.uplift_moves.people_train ||
        er.uplift_moves.process_transform ||
        er.uplift_moves.ai_deploy
      );
    });
    if (withMoves.length) {
      push(`## Uplift Plan`);
      push();
      for (const cap of withMoves) {
        const er = engagementModel.rows[cap.id]!;
        push(`### ${cap.id} · ${cap.name}`);
        if (er.held) {
          push(`- Held: working correctly today, redesign around it, no moves.`);
        } else {
          push(
            `- People (Train): ${er.uplift_moves.people_train ?? 'no move'}`
          );
          push(
            `- Process (Transform): ${er.uplift_moves.process_transform ?? 'no move'}`
          );
          push(`- AI (Deploy): ${er.uplift_moves.ai_deploy ?? 'no move'}`);
        }
        push();
      }
    }
  }

  // ---- Next Steps (Motions) ----
  if (engagementModel && engagementModel.motions.length) {
    push(`## Next Steps (Motions)`);
    push();
    for (const motion of engagementModel.motions) {
      push(`### ${motion.label}`);
      push(`- Description: ${motion.description}`);
      const covers: string[] = [];
      if (motion.covers.capability_ids.length) {
        covers.push(`capabilities ${motion.covers.capability_ids.join(', ')}`);
      }
      if (motion.covers.cluster_ids.length) {
        covers.push(`clusters ${motion.covers.cluster_ids.join(', ')}`);
      }
      if (motion.covers.cross_cutting.length) {
        covers.push(motion.covers.cross_cutting.join(', '));
      }
      if (covers.length) push(`- Covers: ${covers.join(' · ')}`);
      push();
    }
  }

  // ---- Gap Register (derived) ----
  const gaps = deriveGapRegister({ capabilityMap: cm });
  push(`## Gap Register (current, derived)`);
  if (gaps.openCount === 0) {
    push('No open gaps.');
  } else {
    if (gaps.blocking.length) {
      push(`- Blocking gaps:`);
      for (const g of gaps.blocking) {
        push(
          `  - ${g.source_capability_id ? `${g.source_capability_id} · ` : ''}${g.gap_type ?? ''}: ${g.question}`
        );
      }
    }
    if (gaps.nonBlockingByCapability.length) {
      push(`- Non-blocking gaps:`);
      for (const group of gaps.nonBlockingByCapability) {
        for (const g of group.gaps) {
          push(`  - ${group.capabilityId} · ${g.gap_type ?? ''}: ${g.question}`);
        }
      }
    }
    if (gaps.scopeUncertainties.length) {
      push(`- Scope uncertainties:`);
      for (const g of gaps.scopeUncertainties) {
        push(`  - ${g.topic ?? ''}: ${g.question}`);
      }
    }
    if (gaps.decisionsDeferred.length) {
      push(`- Decisions deferred:`);
      for (const g of gaps.decisionsDeferred) {
        push(`  - ${g.topic ?? ''}: ${g.reason ?? ''}`);
      }
    }
  }
  push();

  // ---- Work Plans ----
  if (workPlans.length) {
    push(`## Work Plans`);
    push();
    for (const { plan, progressLog } of workPlans) {
      push(
        `### ${plan.title} [${plan.deliverable_type}] · covers capabilities ${plan.covers_capabilities.join(', ')}`
      );
      push(
        `- Status: ${plan.status} · Current stage: ${plan.current_stage ?? 'none'} · Progress: ${Math.round(deriveProgressPct(plan))}%`
      );
      push(`- Sprint stages:`);
      for (const st of plan.sprint_stages) {
        push(
          `  - ${SPRINT_STAGE_LABELS[st.id]}: ${st.status}${st.note ? ` (${st.note})` : ''}`
        );
      }
      const reqs = plan.requirements;
      const reqLines: string[] = [];
      if (reqs.context) reqLines.push(`context: ${reqs.context}`);
      if (reqs.functional) reqLines.push(`functional: ${reqs.functional}`);
      if (reqs.integrations) reqLines.push(`integrations: ${reqs.integrations}`);
      if (reqs.non_functional)
        reqLines.push(`non-functional: ${reqs.non_functional}`);
      if (reqLines.length) {
        push(`- Requirements:`);
        for (const r of reqLines) push(`  - ${r}`);
      }
      if (plan.dependencies.length) {
        push(
          `- Dependencies: ${plan.dependencies.join(', ')}${
            plan.depends_on_stage ? ` (at stage ${plan.depends_on_stage})` : ''
          }`
        );
      }
      if (progressLog.trim()) {
        push(`- Recent progress log:`);
        const lines = progressLog.trim().split('\n');
        const tail =
          lines.length > PROGRESS_LOG_TAIL_LINES
            ? lines.slice(-PROGRESS_LOG_TAIL_LINES)
            : lines;
        if (lines.length > PROGRESS_LOG_TAIL_LINES) {
          push(`  (showing last ${PROGRESS_LOG_TAIL_LINES} lines)`);
        }
        for (const l of tail) push(`  ${l}`);
      }
      push();
    }
  }

  // ---- Project Timeline ----
  if (timeline && timeline.items.length) {
    push(`## Project Timeline (current)`);
    const ordered = [...timeline.items].sort((a, b) => a.lane - b.lane);
    for (const item of ordered) {
      push(
        `- ${item.label} [${item.item_type}] · start ${item.start} · ${item.duration_days}d · status ${item.status} · ${item.progress_pct}%${
          item.dependencies.length
            ? ` · depends on ${item.dependencies.join(', ')}`
            : ''
        }`
      );
    }
    push();
  }

  // ---- Excluded Capabilities ----
  if (cm.excluded_capabilities.length) {
    push(`## Excluded Capabilities`);
    for (const ex of cm.excluded_capabilities) {
      push(`- ${ex.name}: ${ex.reason}`);
    }
    push();
  }

  // ---- Decisions Log ----
  push(`## Decisions Log`);
  push(
    narrative.decisions?.trim()
      ? narrative.decisions.trim()
      : 'Not yet populated.'
  );
  push();

  // ---- Footer ----
  push(`---`);
  push(
    `_End of context snapshot. This document reflects the Blueprint state at the timestamp above and may be stale if the Blueprint has since changed._`
  );

  return out.join('\n');
}
