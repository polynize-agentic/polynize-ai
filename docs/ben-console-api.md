# Ben Console API — Reference & Handoff

**Version:** Stage 2 (blueprint_schema_version 2.0)
**Audience:** the Master Agent Builder wiring Ben's `console-api` skill.
**Source of truth:** `stage2-data-model.md` §8. This doc reflects the
endpoints as built.

Ben reads and writes the unified Capability Blueprint through these HTTP
endpoints. Reads are free. Writes are tiered: Tier 1 is a direct
attributed write; Tier 2 requires a human approval recorded as `approvedBy`.
Engagement-section writes are blocked with **423 Locked** when the
engagement is locked.

---

## Auth

All Ben requests use bearer-token auth plus an agent-name header:

```
Authorization: Bearer $CONSOLE_AGENT_API_KEY
X-Agent-Name: ben-agent
```

- The bearer path resolves to `scope: { type: 'team' }`, so Ben passes the
  `requireTeamScope` gate on every write.
- Reads require auth but not team scope.
- Commit attribution from the bearer path is `Source: Agent`, `Actor:
  <X-Agent-Name>` (defaults to `agent` if the header is absent).
- 401 responses are symmetric and never reveal which auth method failed.
- Cross-client access returns **404** (never 403) so the existence of
  other clients is not leaked. The one exception: a write refused purely
  for lack of team scope returns **403** (the resource is not being hidden,
  the write is being refused).

Base URL: the Console origin (e.g. `https://pam.polynize.ai`).

---

## Read endpoints (no approval, always allowed)

| Method | Path | Returns |
|---|---|---|
| GET | `/api/console/clients` | All engagements Ben can see (team scope = all). Card data + RAG. |
| GET | `/api/console/[slug]/blueprint` | Full Blueprint. For 2.0: `{ schemaVersion, config, capabilityMap, engagementModel, workPlans[], timeline, gaps, lock }`. For legacy 1.x: the markdown-section shape (unchanged). |
| GET | `/api/console/[slug]/capability-map` | The v0.5 envelope (`{ capability_map: {...} }`). |
| GET | `/api/console/[slug]/engagement-model` | `engagement-model.json` (404 if pre-Modelling). |
| GET | `/api/console/[slug]/work-plans` | `{ workPlans: WorkPlan[] }`. |
| GET | `/api/console/[slug]/work-plans/[workPlanId]` | `{ plan: WorkPlan, progressLog: string }`. |
| GET | `/api/console/[slug]/gaps` | `{ gaps: DerivedGapRegister }` (derived from 3 sources). |
| GET | `/api/console/[slug]/timeline` | `ProjectTimeline` (404 if none). |
| GET | `/api/console/[slug]/export` | Complete-context markdown snapshot (text/markdown). Useful when Ben needs full project context in one call. |

---

## Tier 1 write endpoints (direct, attributed, no human confirmation)

Low-stakes, evidence-backed, reversible via git history. **Blocked (423)
if the engagement is locked**, except progress + stage (work plans are not
part of the lock).

| Method | Path | Body | Locked behaviour |
|---|---|---|---|
| POST | `/api/console/[slug]/capability/[capId]/current-state` | `{ current_state: string }` | 423 if locked |
| POST | `/api/console/[slug]/capability/[capId]/uplift` | `{ people_train?, process_transform?, ai_deploy?, uplift_needed?, held? }` (only provided keys change; move fields nullable) | 423 if locked |
| POST | `/api/console/[slug]/work-plans/[workPlanId]/stage` | `{ stageId: SprintStageId, status: 'pending'\|'active'\|'complete', note? }` | always allowed |
| POST | `/api/console/[slug]/work-plans/[workPlanId]/progress` | `{ entry: string }` (appended to progress.md, timestamped) | always allowed |
| POST | `/api/console/[slug]/gaps/[gapRef]/status` | `{ addressed: boolean, note? }` — `addressed:true` removes the gap from capability-map.json. `gapRef` forms: `cap.<capId>.<idx>`, `scope.<idx>`, `decision.<idx>` (from the Gap Register's `ref`). | 423 if locked |

`stage` recomputes `progress_pct` and `current_stage` from the stage
states and returns the new `progress_pct`.

---

## Tier 2 write endpoints (draft-then-confirm via Slack)

High-stakes (contractual, commercial, structural). Ben does NOT write
directly. Ben posts a proposed change to Slack, a human approves, THEN the
endpoint is called with the approver recorded as `approvedBy`. Endpoints
that take `approvedBy` reject the write without it.

| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/api/console/[slug]/capability/[capId]/benchmark` | `{ benchmark: string, approvedBy: string(email), proposedBy? }` | 423 if locked. `approvedBy` required (contractual field). |
| POST | `/api/console/[slug]/motion/[motionId]` | `{ description: string }` | 423 if locked. `motionId` ∈ {agent_deploy, training, transform}. (Tier 1 in practice — plan content — but reviewed with the engagement.) |
| POST | `/api/console/[slug]/config/status` | `{ rag: 'red'\|'amber'\|'green', reason?, setBy: string(email) }` | Allowed even when locked (operational, not contractual). |
| POST | `/api/console/[slug]/seed` | `{ displayName, approvedBy(email), prospectEmail?, prospectFirstName?, prospectBlueprintId?, envelope? }` | Creates a Lead Blueprint. Fetches the v0.5 envelope from polynize.ai (or accepts it inline). `approvedBy` required. 422 (with a manual `gh repo create` hint) if the repo doesn't exist and the App can't create it. |
| POST | `/api/console/[slug]/capability/[capId]/allocation` | (not yet built — allocation changes go via unlock + capability-map edit) | Structural; requires unlock first. See "Deferred". |
| POST | `/api/console/[slug]/convert` | (none) | Lead → Client. Team-scope. Manual conversion. |
| POST | `/api/console/[slug]/timeline` | `{ items: TimelineItem[] }` | Full-array replace. Validates dependency ids. Not lock-gated (operational). |
| POST | `/api/console/[slug]/lock` | `{ lockedBy: string }` | Locks the Engagement section. Increments `lock_version`. Ben MAY lock. |
| POST | `/api/console/[slug]/unlock` | `{ unlockedBy: string, unlockReason: string }` | **HUMAN ONLY.** The agent (bearer) path is rejected with 403. Records `unlock_reason`. |

---

## Lock semantics (spec §6)

- The canonical lock lives in `client-config.yaml`'s `lock` block and is
  mirrored into `engagement-model.json`.
- On lock: `locked: true`, `locked_at`, `locked_by`, `lock_version++`,
  `unlock_reason: null`; all engagement rows → `row_status: locked`.
- When locked, these return **423**: current-state, benchmark, uplift,
  motion, gap-status. These stay writable: progress, stage, RAG status,
  timeline.
- Only a human can unlock. Ben cannot. Unlock requires a Change Request
  reason and is a commercial event.

---

## The seed flow (Discovery call → Lead Blueprint)

1. Ben classifies a Fireflies transcript as a Discovery call.
2. Ben extracts prospect email + first name.
3. Ben calls the lookup on the **canonical host** `www.polynize.ai`:
   `GET https://www.polynize.ai/api/blueprints/lookup?email=&firstName=`
   with `Authorization: Bearer $POLYNIZE_LOOKUP_KEY`. Returns
   `{ uuid, v05Envelope, answers, generatedAt }` (404 if none; 422 if the
   matched row is a legacy pre-v0.5 intake that cannot seed a 2.0 Lead).
   **Use `www.`, not the apex `polynize.ai`** — the apex 307-redirects to
   `www`, and `fetch` drops the `Authorization` header across that
   cross-origin redirect, which would 401. `firstName` is not optional in
   practice: a shared inbox can hold multiple prospects, and without it
   the lookup returns the most-recent row regardless of who it belongs to.
   The `v05Envelope` is always the normalised `{ capability_map: {...} }`
   form even though Supabase stores the bare map internally.
4. Ben proposes the seed in Slack with a suggested slug.
5. On human confirmation, Ben calls `POST /api/console/[slug]/seed` with
   `approvedBy` (the confirming human). The Console fetches the envelope
   (or uses the inline one), validates it, ensures the repo exists, and
   writes `client-config.yaml` (lead/mapping/2.0), `capability-map.json`,
   and a minimal `blueprint.md`.
6. The Lead appears in the Console dashboard Leads section.

---

## Attribution

Every write commit ends with:

```
Actor: <email or agent-name>
Source: Console UI | Agent
```

Tier 2 writes additionally record `ApprovedBy:` (and `ProposedBy:` for
benchmark) in the commit body.

---

## Deferred (not in this surface yet)

- `POST /capability/[capId]/allocation` — allocation changes are
  structural and must go through unlock + a capability-map edit. Build
  when the allocation-change flow is specified.
- `delta_summary` auto-update on re-lock after a CR (lock_version
  increments correctly today; the structured delta is not yet computed).

---

*Built across Stage 2 Landmarks 4, 5, 11, 11.5, 13, 14, 15. This is the
handoff artefact for Ben's cognition update (out of scope for the Stage 2
Console build).*
