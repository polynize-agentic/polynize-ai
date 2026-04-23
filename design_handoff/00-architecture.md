# 00 · Architecture

## The four surfaces and how they connect

```
  ┌──────────────┐                ┌──────────────┐
  │  / (home)    │ ── CTA ──────▶ │  /agents     │
  │  Homepage B  │                │  3 phases    │
  └──────────────┘                └──────┬───────┘
         ▲                               │
         │                               │ on complete
         │                               ▼
  ┌──────────────┐                ┌──────────────┐
  │  /brand      │                │ /blueprint   │
  │  (reference) │                │  5-page doc  │
  └──────────────┘                └──────────────┘
```

## Data contract

The same object flows through `/agents` → `/blueprint`. Its shape is:

```ts
type Session = {
  phase: 'A' | 'B' | 'C'           // where the user currently is
  answers: {
    name: string                   // from Q00
    q1: string                     // business description
    q1_company: string             // business name (optional)
    q2_role: string                // single-select
    q2_size: string                // single-select (team size)
    q3: string                     // biggest bottleneck (free text)
    q4: string[]                   // multi-select (work area categories)
    q5_volume: string              // single-select
    q6_tools: string[]             // multi-select
    q7_constraint: string          // single-select
    q8_metric: string              // free text (north-star metric)
    q9_urgency: string             // single-select
    q10_stance: string             // single-select (hands-on level)
    email: string                  // capture
  }
  data: {
    shape: string                  // e.g. "Pipeline and Conversion"
    percentages: { human: number, hybrid: number, agent: number }
    rows: Array<{ fn: string, alloc: 'human'|'hybrid'|'agent' }>
    team: Array<{ name: string, role: string }>
  }
}
```

`answers` is produced by Phase A (prototype stores in `localStorage` under key `polynize_agents_state_v1`).
`data` is produced by Phase B's `deriveHeatMap(answers)` — this is where the LLM should live in production.
`/blueprint` consumes both.

## Phase boundaries

### Phase A — `agents/phase-a.jsx`
- State: `{ step, answers, direction: 'in'|'out' }`
- 11 questions, one per screen
- Auto-advance on radio select
- Next button on checkbox / text
- Keyboard: ←/→, Enter, 1–9 on radio options
- `onComplete(answers)` fires after Q11

### Phase B — `agents/phase-b.jsx`
- Stages: `intro (1.4s) → reveal (one-by-one cells) → done (persists) → nudge (4s later)`
- Reads `answers`, calls `deriveHeatMap(answers)` to produce `data`
- `onReady(data)` fires when user clicks the chat nudge

### Phase C — `agents/phase-c.jsx`
- Left: team roster with the human lead at center, agents around
- Right: chat panel
- `window.claude.complete({messages})` for LLM responses
- System prompt built from `answers` + `data`
- `onBack()` returns to Phase B

## State machine (prototype)

```
START → Phase A → (answers) → Phase B → (data) → Phase C → END
                     │                     │             │
                     └─── localStorage ────┴─────────────┘
```

A full reset clears `localStorage.polynize_agents_state_v1`.

## /blueprint loading logic

`Polynize Blueprint.html` on load:

1. If URL has `?demo=1` → use `window.BLUEPRINT_DEFAULT` (Sarah / Keel Operations / Pipeline shape)
2. Else try `localStorage.polynize_agents_state_v1`; if valid session with both `answers` and `data`, use it
3. Else fall back to `window.BLUEPRINT_DEFAULT`

In production this becomes: `/blueprints/[id]` fetches by server-rendered ID. The localStorage dance is prototype-only.

## Reading the JSX

Each component file is self-contained. They rely on:
- `React` (global via UMD)
- `ReactDOM`
- A handful of shared globals they register on `window.*` (e.g. `window.PhaseA`, `window.BlueprintCover`)

Rule: each file ends with `window.ComponentName = ComponentName;` so the Babel-compiled scripts can share components across files without ES modules.

In the target stack, these become normal `import`/`export` modules. No global registry needed.

## Styles

Two patterns, pick per surface:

1. **Inline style objects** (used by `direction-b.jsx`, `phase-*.jsx`): a JS object at the bottom of the file, referenced via `style={dirBStyles.xxx}`. These tend to be component-specific.
2. **External CSS file** (used by `blueprint.css`): referenced via className. Used when the styling has a lot of descendant rules or responsive needs.

Both patterns consume CSS variables from `shared/tokens.css`. Keep those variables centrally, regardless of stack — they drive the brand.

## Brand tokens (source: `shared/tokens.css`)

```css
--bg: #0a0a0f
--surface: #13131a
--surface-2: #1a1a23
--text: #f4ece4          (warm paper)
--text-2: rgba(244, 236, 228, 0.72)
--text-3: rgba(244, 236, 228, 0.42)
--border: rgba(244, 236, 228, 0.12)
--border-soft: rgba(244, 236, 228, 0.08)
--mint: #69fccb          (agent / primary accent)
--blue: #a5c1ec          (secondary)
--gold: #f0e1b6          (human highlight)
--coral: #ff7a6b         (human allocation in heat map)
--amber: #f0b86b         (hybrid allocation in heat map)
```

Heat map allocation mapping is **semantic**, not decorative:
- coral → human (judgment, client-facing, final calls)
- amber → hybrid (human-in-the-loop)
- mint → agent (executable, autonomous)

Do not reassign.
