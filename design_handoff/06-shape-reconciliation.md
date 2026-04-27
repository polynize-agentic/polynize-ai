# 06 · Shape Reconciliation

**Read this before touching `agents/phase-b.jsx` or Blueprint generation.**

---

## The mismatch

The design prototype uses a 5-shape library in `agents/phase-b.jsx`:

- Pipeline
- Studio
- Ops-heavy
- Platform
- Solo-first

The methodology underlying the product (`design_handoff/reference/CWU_Design_System_v0_1.pdf`) defines 8 canonical shapes:

1. Analysis and Judgment
2. Pipeline and Conversion
3. Execution and Delivery
4. Executive Leverage
5. Relationship Continuity
6. High-Volume Operations
7. Creative Direction
8. Learning and Capability Development

**Locked decision:** use all 8 CWU shapes. The prototype's 5 were a design-time simplification to make the UX read cleanly. In production we want full methodology coverage so the Blueprint feels specific to the visitor's actual business, not jammed into one of five buckets.

## The machine-readable source

`config/cwu-shapes.json` (at the repo root, not inside `design_handoff/`) is the machine-readable library. Every shape has:

- `id`, `shape_number`, `display_name`
- `q4_trigger`: the exact Q4 category label that activates this shape
- `what_it_is`, `human_center_type`, `structural_signature`
- `leverage_range`, `leverage_source`
- `rows`: 8 to 9 Heat Map rows with pre-assigned allocations (`human-led` / `hybrid` / `agent-executable`)
- `team_roles`: 5 named agent roles with priority rankings and descriptions, one flagged `first_agent: true` per shape
- `discriminating_signals`, `domain_examples`

The structure is intentionally close to what `SHAPE_LIBRARY` in `phase-b.jsx` looks like, so the port is a data swap, not a rewrite.

## Mapping from the prototype's 5 to the CWU 8

| Prototype shape | CWU shape | Notes |
|---|---|---|
| **Pipeline** | Shape 2: Pipeline and Conversion | Direct match. Use the prototype's Pipeline demo data (Keel Operations, Sarah) as the default demo in Blueprint `?demo=1`. |
| **Studio** | Shape 7: Creative Direction | Direct match. Creative direction / brand / content production. |
| **Ops-heavy** | Shape 6: High-Volume Operations | Direct match. Inverted structure, agents handle volume, human handles exceptions. |
| **Platform** | Shape 3: Execution and Delivery | Match, tighter scope. "Platform" in the prototype implied software/product building; the CWU shape covers software + any spec-to-shipped-thing work. |
| **Solo-first** | Shape 4: Executive Leverage | Match. Solo founders / operators protecting their own attention. |

## The 3 shapes the prototype did not cover

These are the shapes Claude Code needs to add from the methodology PDF:

| CWU shape | Q4 trigger | Why the prototype didn't include it |
|---|---|---|
| **Shape 1: Analysis and Judgment** | "Analysis and research" | SMB visitors rarely self-identify this way; but investment, legal, strategic planning businesses will tick it. |
| **Shape 5: Relationship Continuity** | "Account and relationship management" | Customer success / account management shape; distinct from Pipeline (Shape 2) because there's no close event, work is continuous. |
| **Shape 8: Learning and Capability Development** | "Team learning and development" | L&D / onboarding / capability assessment; this is actually the shape that polynize.io/polynize_acp.html embodies. |

For each of these three shapes, pull the row library and team roles from `config/cwu-shapes.json`. Follow the same pattern the prototype uses for Pipeline / Studio / Ops-heavy / Platform / Solo-first: a clean visual identity, consistent row naming, 5 team roles with priorities.

## What to do in `phase-b.jsx`

Replace the prototype's `SHAPE_LIBRARY` constant with a loader that reads from `config/cwu-shapes.json`. Keep the same export shape so `deriveHeatMap(answers)` works unchanged. The function should:

1. Pick the dominant shape based on the visitor's Q4 answer (first ticked category → shape via `q4_trigger` mapping)
2. Pull the 8-9 rows and their allocations from that shape's config
3. Compute the percentages (count of human / hybrid / agent rows as a fraction of total)
4. Pull the team roles, filter by priority based on team size from Q2 and urgency from Q9
5. Return the `data` object in the same shape the prototype produces

## Team size filtering logic

Shapes in `cwu-shapes.json` each have 5 team roles with priority 1, 2, or 3. Filter at render time based on visitor signals:

| Visitor signal | Roles shown |
|---|---|
| Team size "Just me" OR urgency "Exploring" | Priority 1 only (first agent + one core agent) |
| Team size "2–5" OR urgency "This quarter" | Priority 1 + 2 (4 agents) |
| Team size "6–20" or larger, urgency "This week" or "Within the month" | All 5 agents |

This keeps the Blueprint proportionate to the visitor's real situation. A solo founder seeing 5 agents feels like overkill. A 20-person operation seeing 2 agents feels like we misunderstood them.

## What stays the same

- All Phase B timings (intro 1.4s, per-cell reveal animation, 4s pause before chat nudge)
- The heat map visual design and colour semantics (coral = human, amber = hybrid, mint = agent)
- The data contract between Phase B and Phase C / Blueprint
- The `answers` shape from Phase A (11 questions, unchanged)
- Phase C system prompt construction pattern (see `agents/phase-c.jsx`)
- The Blueprint 5-page structure (cover, heat map, team, day-in-the-life, pricing)

## Compound shapes (v2, not v1)

The CWU methodology PDF Part 2 describes compound shapes (Shape 1 → Shape 3, Shape 4 + Shape 2, Shape 1 + Shape 8). These are out of scope for v1. If a visitor ticks multiple Q4 categories, use the top-ticked as dominant shape and ignore the rest for Heat Map generation. Compound logic lands in a v2 upgrade once we have real usage data on how often multi-select happens.

## What to keep from the prototype's simplification

The prototype's 5 shape names were chosen to be recognisable to SMB owners. The CWU shape names are methodology names. Decision: use the CWU names internally (in code, in the data model, in the Blueprint backend), but consider the prototype's more accessible names for the visitor-facing Heat Map title.

Example:
- Internal: `shape: "Pipeline and Conversion"`
- Visitor-facing on the Heat Map: "Pipeline shape" or just "Pipeline"

This decision is Marrs's call. Default to the CWU names unless Marrs says otherwise. The cwu-shapes.json has both `display_name` (the CWU name) and can be extended with a `short_name` field if we want the accessible version in the UI.
