# Polynize.ai v1 — Complete Design Handoff Brief

**From:** Marrs + Claude (design)
**To:** Claude Code (engineering)
**Date:** April 2026
**Status:** Design complete. Ready to build.
**Format:** Single copy-paste doc. Three sections as requested, plus an appendix of open questions Claude Code needs Marrs to answer.

---

# How to use this brief

1. **Read Section 1** to understand what has been designed and what the tokens are.
2. **Read Section 2** to understand what actually works vs what is a picture of something working.
3. **Read Section 3** to see where the design departed from `CLAUDE.md` and why.
4. **Read the Appendix** for the open questions Marrs needs to answer before Phase 1 build begins.

The design files are in the `designs/` folder of the handoff bundle. Open each `.html` file in a browser to see the live prototype. The JSX files next to them are the component implementations.

---

# SECTION 1 — The design itself

## 1.1 Files delivered

| Surface | File | Purpose |
|---|---|---|
| Homepage | `designs/Polynize Homepage B.html` | Single-page narrative landing. 9 sections. |
| /agents flow | `designs/Polynize Agents.html` | Three-phase diagnostic flow (A → B → C). |
| /blueprints/[id] | `designs/Polynize Blueprint.html` | 5-page shareable artifact. |
| /brand | `designs/Polynize Brand.html` | Machine-readable brand reference. |
| /links | `designs/Polynize Links.html` | Resource / bio-link hub. |
| Transactional email | `designs/Polynize Email.html` | "Blueprint ready" email template. |

Supporting code:

```
designs/
├── shared/
│   ├── tokens.css          # single source of truth for design tokens
│   └── data.js             # sample Pipeline payload used by homepage
├── agents/
│   ├── phase-a.jsx         # 12-question intake flow
│   ├── phase-b.jsx         # heat map reveal + SHAPE_LIBRARY (8 shapes)
│   └── phase-c.jsx         # chat panel, Claude-powered
├── blueprints/
│   ├── blueprint-data.js   # default demo data
│   ├── blueprint.css
│   ├── bp-01-cover.jsx
│   ├── bp-02-heatmap.jsx
│   ├── bp-03-team.jsx
│   ├── bp-04-day.jsx
│   └── bp-05-pricing.jsx
└── directions/
    └── direction-b.jsx     # the entire homepage as one React tree
```

## 1.2 Tech shape of the prototype

- **No build step.** Everything runs via CDN-loaded React 18.3.1 + Babel standalone 7.29.0 from `unpkg`. This matches the brief's "no framework, no build step" rule, but note the prototype uses React to iterate fast. The JSX can be compiled to vanilla JS at deploy time if Marrs wants to keep production dependency-free. See §3.1.
- **State persistence:** `localStorage` under keys `polynize_agents_state_v1` and `polynize_blueprint_state_v1`. Production must replace with Supabase-backed sessions.
- **AI calls:** `window.claude.complete(...)` (a sandboxed helper available in the prototype host). Production must replace with a server-side route that calls Minimax via OpenRouter. **The API key must not be in the browser.**

## 1.3 Design tokens — full dump

From `designs/shared/tokens.css`. These are canonical. Do not remap.

### Colors

```css
:root {
  /* Backgrounds */
  --bg:         #0a0a0f;   /* deep navy-black, page */
  --surface:    #13131a;   /* cards, panels */
  --surface-2:  #1a1a23;   /* nested surfaces, headers */

  /* Accents */
  --mint:       #69fccb;   /* PRIMARY. CTAs, active states, "agent" allocation */
  --blue:       #a5c1ec;   /* supporting / hybrid visual states */
  --gold:       #f0e1b6;   /* numbers, data points */

  /* Text */
  --text:       #f4ece4;   /* primary, ~98% opacity reads */
  --text-2:     #c7b9ac;   /* secondary, body */
  --text-3:     #8a7d72;   /* muted, eyebrows and timestamps — audit for AA */

  /* Borders */
  --border:      rgba(105, 252, 203, 0.18);   /* 1px mint at 18% */
  --border-soft: rgba(244, 236, 228, 0.08);   /* 1px bone at 8% for internal dividers */

  /* Heat map allocations */
  --coral:      #ff7a6b;   /* HUMAN-led (scarce, precious) */
  --amber:      #f0b86b;   /* HYBRID */
  /* --mint is reused for AGENT-executable */
}

/* Heat-map classes */
.alloc-human  { color: var(--coral); --alloc-bg: rgba(255,122,107,0.12); --alloc-bd: rgba(255,122,107,0.38); }
.alloc-hybrid { color: var(--amber); --alloc-bg: rgba(240,184,107,0.12); --alloc-bd: rgba(240,184,107,0.38); }
.alloc-agent  { color: var(--mint);  --alloc-bg: rgba(105,252,203,0.12); --alloc-bd: rgba(105,252,203,0.38); }
```

<!-- DECISION POINT FOR ENGINEERING: The CLAUDE.md brief §5 specified coral/red for "human-critical" and mint for the *agent* column. The brief later described mint as "for the scarce human column." We chose the former (coral = human, mint = agent) because mint is the primary brand accent and should point at the product (agents), not the buyer's existing constraint (humans). Confirm this with Marrs before build. -->

### Typography

```
Headings:  Space Grotesk       weights 400, 500, 600, 700
Body:      Inter               weights 400, 500, 600, 700
Mono:      JetBrains Mono      weights 400, 500
Accent:    Fraunces (italic)   weights 300, 400 — used sparingly on homepage
```

All loaded from Google Fonts with `display=swap`. Example `<link>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Fraunces:ital,wght@0,300;0,400;1,300;1,400&family=JetBrains+Mono:wght@400;500&display=swap">
```

### Type scale (fluid where used)

| Token / use | Size | Font | Weight | Letter-spacing | Line-height |
|---|---|---|---|---|---|
| Hero H1 (homepage) | `clamp(56px, 8vw, 96px)` | Space Grotesk | 700 | `-0.035em` | `0.95` |
| Page title (agents, brand, blueprint) | `clamp(40px, 6vw, 72px)` | Space Grotesk | 700 | `-0.035em` | `1.0` |
| Section title | `clamp(28px, 3.6vw, 44px)` | Space Grotesk | 500–600 | `-0.02em` | `1.15` |
| Phase A question | `clamp(26px, 3.6vw, 44px)` | Space Grotesk | 500 | `-0.025em` | `1.15` |
| Feature title | 24–28px | Space Grotesk | 600 | `-0.015em` | `1.2` |
| Body large | 18–20px | Inter | 400 | default | `1.55–1.6` |
| Body | 15–16px | Inter | 400 | default | `1.5–1.6` |
| Body small | 13–14px | Inter | 400 | default | `1.45` |
| Eyebrow / tag | 10–11px | JetBrains Mono | 500 | `0.15–0.2em` | `1.0` (uppercase) |
| Caption / meta | 11–12px | JetBrains Mono | 400 | `0.08–0.12em` | `1.3` |

### Spacing

No formal token scale. Numbers used consistently across files:

```
4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 120px
```

Engineering team should formalise as a 4px-based scale: `[0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 120]`.

### Radii

```
Sharp corners (2px):     chips, buttons, inputs, cards on /agents
Soft (4–6px):            blueprints cards, homepage section containers
Rounded (10–12px):       email CTA button, links cards
Pill (999px):            nudge toast, badge tags
Circle (50%):            avatars, status dots
```

### Shadows

```css
/* Card shadow (blueprints) */
box-shadow: 0 2px 8px rgba(0,0,0,0.3);

/* Elevated panel (chat nudge) */
box-shadow: 0 20px 60px rgba(0,0,0,0.6);

/* Glow on hover (mint CTAs) */
box-shadow: 0 0 24px rgba(105,252,203,0.4);

/* Cell activation in heat map */
box-shadow: 0 0 32px {coral|amber|mint}66, inset 0 0 20px {coral|amber|mint}22;

/* Pulse ring on nudge */
0 20px 60px rgba(0,0,0,0.6), 0 0 0 0–22px rgba(105,252,203,0.55→0)
```

### Animation timings and easings

| Animation | Duration | Easing | Trigger |
|---|---|---|---|
| Phase A card slide | 500ms | `ease` (default) | question advance |
| Phase B intro scan bars | 1200ms loop | linear | stage=intro |
| Phase B scan → reveal | 1400ms hold | — | mount timer |
| Phase B row light-up | 220ms per cell, sequential | `all .5s` transition | stage=reveal |
| Phase B reveal → done | 500ms pause after last cell | — | — |
| Phase B done → nudge | 3800ms linger | — | stage=done |
| Phase B nudge pulse | 2000ms loop, 600ms delay | linear | showNudge=true |
| Phase B percentage bars | 1000ms width fill | ease | mount (+200ms) |
| Phase C message slide-up | 400ms | `ease` | message append |
| Phase C typing dots | 1200ms loop | — | loading=true |
| Phase C live dot pulse | 2000ms loop, 50% keyframe | — | always |
| Homepage reveal-on-scroll | 700ms | ease | IntersectionObserver, threshold 0.15 |
| Homepage terminal cursor | 1100ms steps(2) | — | always |
| Homepage terminal tick | 1200ms setInterval | — | mount |

All animations should respect `prefers-reduced-motion: reduce` in production. **This is not implemented in the prototype — see §2.**

### Breakpoints

Single primary breakpoint: **640px**. Secondary: **860px** for /agents chat panel.

```css
@media (max-width: 640px) { /* mobile */ }
@media (max-width: 860px) { /* tablet, used only in phase-c.jsx */ }
```

| Component | Desktop behavior | Mobile (<640px) behavior |
|---|---|---|
| Homepage nav | 4 links right-aligned | collapses (currently hidden on narrow, no mobile menu yet) |
| Homepage hero | 2-col: copy + terminal panel | stacks vertical |
| Homepage sections | 1100–1200px max-width container, 80–120px vertical padding | 32px horizontal padding, 48–64px vertical |
| Heat map (homepage) | 3-col grid, full cells | stacked rows, smaller cells, 1.4fr/1fr/1fr/1fr |
| Heat map (Phase B) | Full 2D grid, 8 rows × 4 cols | Same grid but compressed cells (24px tall, 2px margin) |
| Phase A card | 720px max, centered | Full-width with 20px side padding |
| Phase C chat | 320px sidebar + flex chat | Sidebar becomes top-scroll strip, chat fills below |
| Blueprint pages | 5 pages vertical-flow, 920px wide | Single column, 16–20px padding |
| Email | 600px wrapper | 100%-width container, reduced padding |
| Links page | 540px column | 100%-width, tighter gutters |

**The prototype was designed desktop-first and later adapted for mobile.** Brief §16 requires mobile-first. Engineering team should audit all breakpoints and rebuild mobile-specific layouts as needed — the Phase B heat map in particular needs a dedicated mobile design (brief §9 says "stacked rows, each row is a horizontal card"). Our mobile version keeps the grid, compressed.

## 1.4 Component inventory

### Homepage (`directions/direction-b.jsx`, single-file React tree)

| Component | Props | State | Variants |
|---|---|---|---|
| `DirectionB` | — | `tick` (interval) | root |
| `Nav` (inline) | — | — | — |
| `TerminalPanel` | `tick` | internal | — |
| `EqTerm` | `num`, `label`, `color`, `emph?` | — | emphasised / plain |
| `SectionHeader` | `n`, `title`, `subtitle` | — | — |
| `ComparisonBar` | `label`, `ratio` (0-1), `tone` | animated width | `muted` / `mint` / `gold` |
| `CWUTable` | — | — | — |
| `CWUSchematicB` | — | — | — |
| `HeatMapGrid` | `rows` | — | — |
| `Artifact` | `k`, `name`, `body` | — | — |
| `Metric` (inline) | — | — | — |
| `Pod`Card`, `PodCardMini` (inline) | — | — | `featured` / `mini` |

Tweaks panel wraps `DirectionB` in `Polynize Homepage B.html`. Three knobs:

```json
{
  "headline": "shape" | "unit" | "team",
  "cta": "map" | "agentify",
  "accent": "mint" | "blue"
}
```

### /agents flow

Top-level controller in `Polynize Agents.html`, phases in `agents/*.jsx`.

**Phase A** (`PhaseA`, props: `{ onComplete }`):
- **12 questions** (Q00 name → Q11 email). See §3.2 for the scope expansion from brief's "4 to 6."
- Input types: `text` (short), `text` (long, textarea), `business` (textarea + company field), `role_size` (two chip groups), `multi` (multi-select cards), `single` (single-select cards with auto-advance), `email`.
- State: `step` (0…11), `answers` (object with all 12 keys), `direction` (1|−1 for animation direction).
- Advance rules in `canAdvance()` — min length 2 on name, min length 3 on text questions, regex on email.
- Keyboard: Enter advances (text: ⌘/Ctrl+Enter), single-select auto-advances after 260ms.

**Phase B** (`PhaseB`, props: `{ answers, onReady }`):
- Stages: `intro` → `reveal` → `done` → (nudge shown).
- Uses `SHAPE_LIBRARY` object in the same file — 8 shapes (see §3.4). `deriveHeatMap(answers)` picks the library row from `answers.q4[0]`, returns `{ shape, rows, team, percentages }`.
- Renders: header → 2D grid → percentage bars → caption → floating nudge toast.
- `Pct` subcomponent: animated bar.

**Phase C** (`PhaseC`, props: `{ data, answers, onBack }`):
- Left sidebar (320px): team list with selectable agents.
- Right: chat head + messages list + starters (shown only before first reply) + composer.
- State: `messages[]`, `input`, `activeAgent`, `loading`.
- `send(text)` calls `window.claude.complete(...)` with a per-agent system prompt that bakes in the user's answers.

### Blueprint (`Polynize Blueprint.html` + `blueprints/*.jsx`)

Five page components, each rendered vertically as a `<section class="bp-page">`:

| File | Component | Purpose |
|---|---|---|
| `bp-01-cover.jsx` | `BlueprintCover` | Your shape, at a glance |
| `bp-02-heatmap.jsx` | `BlueprintHeatmap` | Full heat map grid |
| `bp-03-team.jsx` | `BlueprintTeam` | Named agents |
| `bp-04-day.jsx` | `BlueprintDay` | Day-in-the-life timeline |
| `bp-05-pricing.jsx` | `BlueprintPricing` | Map / Transform / Operate |

Loads state: `?demo=1` → default; otherwise `localStorage['polynize_agents_state_v1']`; otherwise default.

### /brand, /links, email

Single-file HTML each. No shared components beyond tokens.css and fonts.

## 1.5 Assets not embedded

The prototype uses **zero external images, icons, or GIFs**. Everything is CSS, SVG drawn inline, or text. That means:

- **No favicon designed.** Need a 32×32 + 180×180 Apple touch icon. Motif: the `[` bracket with mint dot.
- **No OG / Twitter card.** Need 1200×630 PNG. Aesthetic = operator-terminal hero.
- **No Agent Team Console GIF embed.** Brief mentions lifting it from the existing polynize.ai. Path deferred to engineering; drop it somewhere after §03 or §05.
- **No customer logos** on homepage §07. Current names (Optio Capital, Merrick Holdings, Westfield Labs, Keel Operations, Tollworth & Co) are placeholders set as plain type. Replace with real logos if Marrs gets permission, otherwise keep as-is or cut.
- **No agent avatar images.** Phase C and blueprint use initials rendered in a colored circle.
- **No podcast thumbnails.** Wave-bar SVG pattern is generated inline. If real thumbnails exist on YouTube, fetch via oEmbed or cache a rendered PNG.

## 1.6 Fonts as assets

Only Google Fonts, loaded from CDN. If the engineering team wants to self-host:

- Inter: https://fonts.google.com/specimen/Inter
- Space Grotesk: https://fonts.google.com/specimen/Space+Grotesk
- JetBrains Mono: https://fonts.google.com/specimen/JetBrains+Mono
- Fraunces (italic only, optional): https://fonts.google.com/specimen/Fraunces

All are OFL-licensed, fine to self-host.

---

# SECTION 2 — Interactive vs static annotations

**Short answer for the status of key elements (requested list):**

| Element | Status |
|---|---|
| Heat Map grid | **Partial — real logic, limited data.** See §2.2 |
| /agents question flow | **Real and working.** See §2.1 |
| Agent chat panel | **Partial — real LLM call, prototype host only.** See §2.3 |
| /blueprints/[id] | **Partial — templated, renders from localStorage or demo default.** See §2.4 |
| Transitions between steps | **Real.** See §2.5 |

Full element-by-element below.

## 2.1 Phase A — question flow

**Real and working:**
- All 12 question steps render and advance correctly.
- Every input stores into the `answers` state object and persists to `localStorage`.
- `canAdvance()` validation per-question type.
- Keyboard shortcuts (Enter, ⌘/Ctrl+Enter, auto-advance on single-select) work.
- Progress bar fills based on step index.
- Back button returns to prior question with answers preserved.
- Browser refresh preserves answers and current step.

**Visual mockup only:**
- **Nothing on Phase A is a mockup.** It is fully functional.

**Not yet wired:**
- There is no `POST /api/submit-lead.js` call. On completion, the flow transitions client-side to Phase B with `answers` in memory. **Engineering must add server submission on `onComplete`.**
- There is no rate-limiting / abuse protection on the form.
- There is no "save and resume with a link" option — only localStorage persistence.
- **Mobile input handling (on-screen keyboard overlap, autofocus on touch devices) has not been QA'd.**

## 2.2 Phase B — Heat Map + reveal

**Real and working:**
- The grid **does render dynamically from data**, not a static image.
- `deriveHeatMap(answers)` computes the shape, rows, team, and percentages purely from user answers.
- 8 shapes are implemented in `SHAPE_LIBRARY` with rows + team + allocations per shape.
- Cells light up sequentially (220ms interval), driven by `revealIdx` state.
- Percentage bars animate to their computed values.
- Caption text uses the computed percentages in prose.
- Floating chat nudge appears after a 3800ms linger.

**Partial:**
- `deriveHeatMap` only reads `answers.q4[0]` (the first-ticked category) to pick a shape. **It ignores secondary Q4 picks, Q5 volume, Q2 team size, and Q1 business description.** The brief §9 says secondary shapes should inform team composition and percentages should reflect "roughly X%" based on the *visitor's specific answers*. Currently every visitor who picks the same primary Q4 gets the same grid.
- **Engineering must replace `deriveHeatMap` with a real composition function** that weights by multi-select, adjusts team count by team size (brief says "3 to 5 agents"), and varies allocations by Q5 volume.

**Visual mockup only:**
- Nothing on this screen is a fake render.

**Not yet wired:**
- No `POST /api/heat-map.js` call. All logic is client-side. **Engineering must move `SHAPE_LIBRARY` to `/config/cwu-shapes.json` on the server and call a serverless function.** The brief §13 requires this so the shape logic is not exposed to the browser.
- No error state if the server is down.
- The "team preview" in the nudge only shows `data.team[0]`. Full team preview is shown on Phase C sidebar.

## 2.3 Phase C — agent chat panel

**Real and working:**
- Chat panel renders with full team in sidebar.
- Clicking an agent switches `activeAgent` and the chat head updates.
- Sending a message calls `window.claude.complete(...)` with a **real system prompt** that includes the user's answers, business description, team role, and the selected agent's identity.
- LLM responses stream back and render in a chat bubble.
- Starter prompts work (pre-populated quick actions).
- Typing indicator shows during LLM call.
- Auto-scroll to bottom on new messages.
- Sidebar "Back to heat map" button works.

**Partial:**
- `window.claude.complete` is a **prototype-host helper, not production infrastructure.** It only works in this sandbox. Engineering **must** replace with a server-side route that:
  1. Proxies to Minimax via OpenRouter (per brief §13).
  2. Injects the brand voice and no-em-dashes rule in the system prompt.
  3. Never exposes the API key.
  4. Adds per-session rate limiting.
- The **tag-based communication pattern** from brief §9 (`|||EMAIL|||…|||EMAIL|||`, `|||CONTEXT|||…|||CONTEXT|||`, `|||COMPLETE|||`) is **not implemented.** There is no email capture, no context extraction, no end-of-conversation signal. Messages simply go back and forth until the user closes the tab.
- **Bucket routing is not implemented.** No A/B/C classification. No conditional Calendly prominence.
- **Claude's system prompt is per-agent, but Phase C is supposed to be a single "Polynize voice"** (brief §9). We went team-aware instead. See §3.6 below.

**Visual mockup only:**
- Nothing on this screen is a fake render, but:
- The "agent is typing" dot animation is hardcoded — it shows whenever `loading=true`, regardless of whether the LLM is actually streaming.

**Not yet wired:**
- No LLM failure state (network error, rate limit, 500).
- No `prefers-reduced-motion` on the message-slide animation.
- No keyboard navigation between agents in sidebar.
- No ARIA live region on the chat log (screen reader hostile).
- No save-conversation flow. If the user closes the tab, messages are in localStorage but not sent to Supabase.
- No `|||EMAIL|||` capture → no email on lead row → no Resend trigger → no blueprint generation. **Engineering must add this.**

## 2.4 Blueprint `/blueprints/[id]`

**Real and working:**
- 5 pages render vertically from `{answers, data}` passed into each component.
- `?demo=1` loads a default payload.
- Without `?demo=1`, loads from `localStorage['polynize_agents_state_v1']` — so if you complete the /agents flow then open /blueprints, you see YOUR data.
- Page numbers, labels, and the heat map re-render from the same `data.rows` used in Phase B.
- Team list on page 3 maps from `data.team`.
- Pricing table computes team count interpolated into copy.

**Partial:**
- The "day in the life" narrative on page 4 is **hardcoded copy** — not AI-generated per user. Brief §10 says this must be Minimax-generated fresh for every blueprint using the user's actual business context. **Engineering must wire `/api/lead-notify.js` to call Minimax and write JSON to `blueprints.content`, then read from that JSON instead of hardcoded strings.**
- Heat map percentages and team composition use the Phase B `data`, so those are real-per-user — but the *narrative copy* around them is not per-user.
- Agent names in the prototype come from `SHAPE_LIBRARY` as fixed per-shape (Nora, Arlo, Sena, etc.). Brief §10 says they should be Minimax-generated "to feel like colleagues" and match the user's industry tone. **Engineering must replace the fixed names with generation output.**
- Pricing copy: the $2,500 / $8-15k / $699 numbers are **designer placeholders.** See §3.7 and Appendix Q on pricing logic.

**Visual mockup only:**
- The Calendly CTA on page 5 is a plain anchor, not an embedded booking widget. That's fine — Calendly embeds break email preview anyway.

**Not yet wired:**
- No URL routing. The prototype is a single HTML file at `/blueprints/[id]`. **Engineering must build the dynamic route, fetch by slug, return 404 if missing.**
- No "still generating" state for blueprints with `generation_status = pending`. Brief §13 specifies this should show a message and auto-refresh. **Not designed — engineer as a simple terminal-styled placeholder (see Appendix Q).**
- No view-count tracking.
- No `noindex` meta (blueprints shouldn't be public-indexed).

## 2.5 Transitions between steps

**Real and working:**
- Phase A → B: controlled by the App-level state machine in `Polynize Agents.html`. `onComplete(answers)` transitions state, Phase B mounts with answers.
- Phase B → C: same pattern. `onReady(data)` transitions. `data` includes the derived heat map.
- C → back to B: `onBack()` transitions, but Phase B re-runs its intro scan animation (cosmetic — not ideal, but fine).
- Homepage reveal-on-scroll: IntersectionObserver, threshold 0.15. Real and working.

**Visual mockup only:**
- The terminal cursor blink and interval "tick" on the homepage are pure CSS / setInterval — no real data flowing.
- The scan-bar intro on Phase B (`generating heat_map…`) is purely cosmetic — the computation is instant, the animation is there to feel earned.

## 2.6 Homepage elements

**Real and working:**
- Reveal-on-scroll fade-in for all sections via IntersectionObserver.
- Tweaks panel (headline / CTA / accent) — updates React state, writes to parent via `__edit_mode_set_keys` postMessage, persists to disk via the EDITMODE markers.
- Terminal "tick" animation (typing cursor).
- Podcast thumbnail waveform (SVG bars).
- All `<a>` tags to external URLs (polynize.io, socials).

**Visual mockup only:**
- The **terminal hero panel** at top-right is a static composition. It looks like a live process but emits no data and takes no input.
- **Logo strip (§07)** — plain text set in mono. No real logos, no links.
- **Metrics strip (§07)** — hardcoded numbers (+70%, 5×, 48h, 0). See §3.7.
- **Testimonial (§07)** — hardcoded AJ Milne quote. Lifted from existing polynize.ai per brief §8.
- **Podcast cards (§08)** — hardcoded episode titles. YouTube/Spotify/Apple/RSS links are anchors pointing nowhere. See Appendix Q.
- **CTAs labeled "map_your_business"** — currently no `href`. Must point to `/agents`.
- **`book_a_call` links** — currently no `href`. Must point to `https://calendly.com/marrscoiro/meeting30`.

**Not yet wired:**
- No analytics events. Every CTA click is a dead zone for measurement.
- No OG image / Twitter card.
- No sitemap, no robots.txt.
- No 404 page designed.

## 2.7 /brand

**Real and working:**
- Every section has semantic HTML (`<section id="…">`, `<h2>`, plain paragraph text).
- Machine-readable JSON payload embedded at `<script id="brand-tokens" type="application/json">` — agents can fetch and parse directly.
- All color swatches are real CSS-variable-backed blocks.

**Visual mockup only:**
- None.

## 2.8 /links

**Real and working:**
- All `<a>` tags point at real URLs (Instagram, TikTok, YouTube, LinkedIn, Calendly, polynize.io).
- Hover states, keyboard focus styles.

**Visual mockup only:**
- None.

## 2.9 Email template

**Real and working:**
- Table-based HTML. Tested structure against Gmail, Outlook 2016+, iOS Mail compatibility rules.
- Handlebars tokens marked (`{{ firstName }}`, `{{ shape }}`, `{{ teamCount }}`, etc.) — must be interpolated at send time by Resend or a server function.
- Plain-text fallback provided in a comment block at the bottom.
- Dark color scheme declared via `<meta name="color-scheme" content="light dark">`.
- UTM params baked into the primary CTA URL.

**Visual mockup only:**
- Email has not been sent through Litmus / Email on Acid for a real cross-client render test.
- No DKIM / SPF / DMARC configured yet (out of scope for design).

---

# SECTION 3 — Decisions that changed during design

This section walks through every material departure from `CLAUDE.md`. Format: *what the brief said* → *what we built* → *why*.

## 3.1 Tech stack: vanilla → React-in-prototype

- **Brief §6:** "Plain static HTML with inlined CSS and JS. No framework. No build step."
- **Designed:** React 18 + Babel standalone, loaded from CDN, no build step, with JSX component files.
- **Why:** We iterated through 3 homepage directions, a 12-question flow with conditional logic, a dynamic heat map, and a stateful chat panel in roughly 72 hours. Vanilla JS would have 2-3× the code and 10× the iteration cost. The prototype's React has **zero build tooling** (same deployment model as vanilla — just HTML files served from Vercel).
- **For engineering:** You have two options:
  1. **Ship as-is.** Pros: zero rework. Cons: 200KB of React + Babel on every page.
  2. **Rewrite to vanilla.** Pros: matches brief, smaller bundle. Cons: 3-5 days of engineering work, more code to maintain.
  Marrs should pick. If you ship as-is, pin the CDN versions and add SRI hashes (already done in the prototype).

## 3.2 Number of questions: 4-6 → 12

- **Brief §9:** "Phase A: 4 to 6 questions" (Q1 business, Q2 role/team, Q3 outcome, Q4 bottleneck, Q5 urgency, Q6 build stance).
- **Designed:** 12 questions. Q00 name, Q01 business + company, Q02 role + team size, Q03 outcome, Q04 bottleneck (multi), Q05 volume, Q06 tools, Q07 constraint, Q08 success metric, Q09 urgency, Q10 stance, Q11 email.
- **Why:** Four insights emerged during design:
  1. **A name up front unlocks warmth.** The entire flow (and blueprint) uses `firstName` conversationally. Massive gain for <5 seconds of friction.
  2. **Tools (Q6) and volume (Q5) are needed to right-size the agent team.** Without them, Phase B output is generic. Adding them costs 10 seconds and makes the blueprint materially more specific.
  3. **Success metric (Q8) and constraint (Q7) dramatically sharpen the qualifying signal.** A lead who can state a measurable outcome and name their specific blocker is a Bucket A lead. A lead who can't is Bucket C.
  4. **Email comes last, not during chat.** Capturing email as the final question of Phase A (instead of mid-chat in Phase C) is a cleaner UX — no "give me your email to see your results" extortion. The user sees the heat map because they completed the flow, and they already know we'll email the blueprint.
- **For engineering:** Keep all 12. If you must cut, cut Q07 (constraint) first — lowest info density. Do not cut Q05, Q06, Q08.
- **Trade-off accepted:** The 4-minute brief claim is now closer to **6 minutes**. Accept this; the qualification quality gain is worth the drop-off risk.

## 3.3 Heat Map layout: "2D grid with three allocation columns" → kept

- **Brief §9:** 2D grid, rows = work functions, cols = Human / Hybrid / Agent zones.
- **Designed:** Same structure, with one cell lit per row (not a full cell density heatmap).
- **Why:** We prototyped a multi-cell density version where each row shows *percentages* across the three columns. It was visually richer but hurt legibility and scanability. The single-lit-cell version is more decisive, which matches the brand voice (direct, not hedging). If a function is "mostly hybrid with some human," the visual compromise is to call it hybrid and let the narrative nuance it. The brief implied this: "each work function gets one cell highlighted."
- **Rejected approach:** multi-cell density grid. Do not rebuild.

## 3.4 CWU Shape Library: 8 shapes → 8 shapes (complete)

- **Brief §11:** 8 canonical shapes, each with a row library and a team roster.
- **Designed:** All 8 shapes implemented in `SHAPE_LIBRARY` object in `agents/phase-b.jsx`:
  1. Pipeline and Conversion
  2. Analysis and Judgment
  3. Execution and Delivery
  4. Executive Leverage
  5. Relationship Continuity
  6. High-Volume Operations
  7. Creative Direction
  8. Learning and Capability
- **Each shape has:** 7–8 rows (function + allocation), 4 team agents (name + role).
- **For engineering:** The prototype keeps this client-side. Per brief §11 and §13, move `SHAPE_LIBRARY` to `config/cwu-shapes.json`, serve via `/api/heat-map.js`, add secondary-shape logic (combining multiple Q4 picks into a composite grid).

## 3.5 Agent chat UX: "side-sliding panel over heat map" → full screen takeover

- **Brief §9:** "A chat panel slides in from the right side of the screen (desktop) or slides up from the bottom (mobile). The Heat Map stays visible."
- **Designed:** Full-screen takeover with the team sidebar + chat area. Heat map is not visible in Phase C; user must click "← heat_map" to return.
- **Why:** We prototyped the side-panel version first. Three problems:
  1. On 1280px laptops (our baseline), the heat map + 400px chat panel = heat map labels truncated and chat too narrow for multi-line replies.
  2. The heat map is a *reveal moment*. Once seen, its role is done. Keeping it visible during chat adds visual noise without adding comprehension.
  3. The chat is supposed to feel like *meeting the team*. A focused full-screen interaction sells that metaphor better than a small side panel.
- **Mitigation for losing the heat map:** the "reset / back to heat_map" button is always visible top-right, and the shape name appears in the chat sidebar footer.
- **Rejected approach:** side-sliding panel. Do not rebuild.

## 3.6 Chat voice: "single generic Polynize voice" → team of named agents

- **Brief §9:** "The agent is a single generic Polynize voice. Not a persona the visitor designed. One agent, one voice, consistent across every lead. Opens with: 'I'm the Polynize agent…'"
- **Designed:** A **team** of 3-5 named agents. The user can click any agent in the sidebar to chat with them. Each agent's system prompt is their specific role in the CWU.
- **Why:** During design, the single-voice version felt flat. The whole site argues for the CWU model — *your business becomes a team of specialists* — and then the chat is a generic Polynize bot. That's a dissonance. Letting the visitor click "Nora" and have Nora respond as the Targeting Specialist makes the CWU tangible, not abstract. It's the single biggest UX insight of the design phase.
- **For engineering:** This is a material deviation from the brief. Marrs has tentatively approved but flagged it for review. Before build, confirm: should Phase C be multi-agent (as designed) or single-voice (as briefed)?
- **Trade-off:** multi-agent means 3-5× the Minimax tokens per conversation (each agent gets its own system prompt). Cost implication — see Appendix Q on cost cap for Bucket C.
- **Also note:** the tag-based communication pattern (`|||EMAIL|||`, `|||CONTEXT|||`) is still required. We moved email capture from chat to Phase A (Q11), which **removes the need for `|||EMAIL|||`.** But `|||CONTEXT|||` (qualifying signals) and `|||COMPLETE|||` (end of conversation) are still needed — Phase C currently doesn't extract either. Engineering must implement.

## 3.7 Pricing: indicative bands → designer placeholders

- **Brief §10:** "Map: from $2,500 AUD. Transform: $8,000 to $15,000 AUD. Operate: from $699 AUD / month."
- **Designed:** Same numbers, same copy. **These are still designer placeholders, not real pricing logic.**
- **Why:** The brief gave us the numbers to use *as anchors*, but didn't specify what inputs change them. A founder-with-20-team pricing the same as a solo operator doesn't pass the sniff test. Need real rules: does Transform scale with team count? Does Operate scale with agent count? Are there volume/complexity tiers?
- **For engineering:** Blocker. Do not launch without real pricing logic. See Appendix Q.

## 3.8 Proof section: "1-2 panels" → logos + 4 metrics + testimonial

- **Brief §7:** "One proof panel. Lift the 70% uplift example from polynize.io. Keep the AJ Milne / Optio Capital testimonial. One or two proof panels maximum."
- **Designed:** Logo strip (5 placeholder company names) + 4 metrics panel (+70%, 5×, 48h, 0) + AJ Milne testimonial as a feature quote.
- **Why:** The brief said "one or two." We built three bits (logos + metrics + quote). Felt too thin at "one." Each is small — together they occupy one screen's worth of scroll.
- **For engineering:** If Marrs doesn't have permission for real logos, **cut the logo strip entirely** (don't leave placeholders live). The metrics should map to real claims Marrs can back; any that can't be backed should also be cut. See Appendix Q.

## 3.9 Homepage narrative: 9 sections (as specified)

- **Brief §8:** Sections 1-9 specified.
- **Designed:** Same 9 sections, same order. Copy is ours but follows the thesis directly.
- **Notable copy decisions:**
  - Hero H1: we went with **"The new shape of a working business."** (option 3 from brief).
  - Hero subhead: followed the thesis sentences from brief §3.
  - No em-dashes anywhere (brief §4, §16).
  - "1 human + 4 agents = 5× output" shown as an equation with colored terms, not prose.

## 3.10 Productivity curve (§2) and CWU diagram (§3): cut

- **Brief §8 Section 2:** "productivity curve" visual (traditional vs CWU output curves).
- **Brief §8 Section 3:** "CWU diagram" — human side / AI side / business fit / CWU in centre.
- **Designed:** Neither.
- **Why:** Marrs explicitly deprioritised both during design review for v1. **Do not rebuild for this release.** Both may return in v2.
- **Substitute:** §2 uses `ComparisonBar` rows (simple animated bars) for visual contrast. §3 uses `CWUTable` + `CWUSchematicB` (a text-heavy schematic). These are lighter and ship faster.

## 3.11 Pages page structure: "two pages + Blueprint" → "two pages + Blueprint + Brand + Links + Email"

- **Brief §7:** Homepage, /agents, /brand, /blueprints/[id]. /links and email called out as separate.
- **Designed:** All 4 + /links + transactional email = 6 surfaces.
- **Why:** During design, Marrs flagged that /links needs a v1 refresh (bio-link page for socials) and the blueprint-ready transactional email template needed a design pass before Resend wire-up. Scope expanded mid-project. No trade-offs — everything is done.

## 3.12 Voice: "founder-to-founder direct" → unchanged, with added character

- **Brief §4:** Direct, punchy, business-literate. No hype. Short sentences.
- **Designed:** Same, with one stylistic flavour layer: the "operator terminal" vocabulary (`$ ls`, `cwu.v0.1`, `§ 07 · proof.log`, `map_your_business()`). This is a visual and copy device borrowed from developer tools.
- **Why:** Plain founder-to-founder voice was working but risked reading as generic. The terminal layer gives the brand a **specific operator-class posture** — it's the difference between "consultant slideware" and "this team is serious about engineering."
- **Risk:** May alienate non-technical founders. The prototype mitigates by keeping the terminal flavour in eyebrows and labels, not in body copy or CTAs. Body remains plain English.
- **For engineering:** If reviewer feedback says "too technical," the first lever is softening the eyebrows (change `§ 07 · proof.log` to `Proof`). Don't touch the body.

## 3.13 Brand page: rebuilt for machine-readability

- **Brief §5:** "Rebuild `brand.html` so that every section has clear semantic HTML structure … machine-readable (AI agents currently can't parse it properly)."
- **Designed:** Every section uses `<section id="…">`, `<h2>`, plain paragraph text. An embedded `<script type="application/json" id="brand-tokens">` block dumps the full token set as JSON for agents to fetch and parse.
- **For engineering:** Preserve this structure. If you restyle, keep the semantic tree intact.

## 3.14 Rejected approaches (do not rebuild)

1. **Three homepage directions explored, two rejected.**
   - *Direction A (Editorial Restrained):* Elegant, magazine-ish. Felt too soft for "we will rearchitect your business." Rejected.
   - *Direction C (Bold Display):* Giant type, minimal content. Felt brash and unqualified. Rejected.
   - *Direction B (Technical Mono, aka "Operator Terminal"):* Shipped. See §3.12.

2. **Multi-cell heatmap density grid.** Rejected for legibility. See §3.3.

3. **Side-sliding chat panel.** Rejected for focus and laptop-width constraints. See §3.5.

4. **Single Polynize voice in chat.** Rejected for CWU resonance. See §3.6. Flagged for Marrs confirmation.

5. **Multi-email onboarding sequence baked into the prototype.** The brief §14 mentions kit.com sequences (hot/warm/cold). We designed the first transactional email only — the nurture sequence copy and cadence is out of design scope and belongs in kit.com's dashboard.

6. **PDF export of blueprint.** Brief §10 explicitly rules this out. Not designed. The blueprint HTML prints cleanly (Cmd+P works) if someone asks for PDF, but no dedicated download button.

7. **Admin dashboard.** Brief §15 Phase 4. Not designed. Scope for a later project.

---

# APPENDIX — Open questions for Marrs

These are the design-blockers Claude Code cannot answer without Marrs input. Gather before Phase 1 build.

## Q1. Pricing logic (§3.7 above)
- What are the real pricing rules?
- Does Transform scale with team count, agent count, or complexity tier?
- Does Operate scale linearly with agent count, or is it tiered?
- Any discounts (annual commit, bundle, pilot, nonprofit)?
- Need: a spec document or pricing matrix.

## Q2. Proof claims (§3.8 above)
- Which of "+70%", "5×", "48h", "0 vendor lock-in" can you back with a source?
- Which companies on the logo strip have given written permission to be named?
- Is the AJ Milne / Optio Capital quote still current and approved?
- Which claims should be cut from the homepage entirely?

## Q3. Podcast content
- Real episode titles and durations for the "Think Better" podcast section.
- Public feed URL (RSS) so engineering can pull dynamically.
- Or a list of the top 4 episodes to hardcode for v1.
- YouTube channel handle (is it `@polynize-labs` per the /links page, or `@polynize.agentic` per brief §8?).

## Q4. Chat voice: single Polynize or multi-agent team (§3.6 above)
- The design chose multi-agent. The brief says single voice.
- **Which ships?**
- If single voice: the prototype needs a simplification. Remove the team sidebar; open with the Polynize voice line; run the qualifying conversation.
- If multi-agent (as designed): confirm the token-cost implications are OK.

## Q5. Bucket routing UX
- When a lead is classified Bucket A mid-chat, should the Calendly link appear inline in the conversation, or pinned at the bottom?
- What's the exact copy for the A/B/C close messages?
- Who is notified for Bucket A? Just Marrs? Team alias?

## Q6. Conditional Calendly prominence
- Bucket A: prominent. Bucket B: de-emphasised. Bucket C: hidden?
- Confirm the specific CTA treatments per bucket.
- Calendly URL for A leads: `https://calendly.com/marrscoiro/meeting30` (per brief §8) or a different "30-min" slug?

## Q7. Blueprint "still generating" state
- When a lead finishes Phase C, the blueprint is async. What does the user see if they click the link in the email before it's ready?
- Suggested: terminal-styled placeholder saying "Your blueprint is compiling. This page will auto-refresh in ~30s." Matches the /agents aesthetic.
- Confirm copy and refresh interval.

## Q8. Tag-based communication (`|||CONTEXT|||`, `|||COMPLETE|||`)
- The brief §9 specifies this pattern for Phase C. The prototype doesn't implement it (we removed email capture from chat).
- What qualifying signals should Phase C capture?
- Acceptable list: confirmed urgency, confirmed budget willingness, team size verification, decision-maker status.
- What triggers `|||COMPLETE|||` — a specific number of exchanges, or a prompt rule?

## Q9. Mobile heat map
- Brief §9: "stacked rows, each row is a horizontal card showing the work function name, its allocation, and a coloured indicator. Single-column scroll. Consider an optional 'tap to see all three zones' expand interaction."
- The prototype keeps the 2D grid on mobile (compressed). **This should be re-designed** as specified in the brief before launch.
- Who owns the mobile heatmap redesign — Claude Code with guidance, or a follow-up design pass?

## Q10. Footer socials
- Brief §8 lists: LinkedIn `/company/polynize`, YouTube `@polynize.agentic`, Instagram `@polynize.labs`, TikTok `@polynize.labs`, `hello@polynize.io`, Calendly `meeting30`.
- /links page uses `@polynize-labs` for YouTube (hyphen, not dot).
- **Which is correct?** The homepage footer (currently minimal) should match /links once resolved.

## Q11. Cost cap for Bucket C
- Brief §10: "only Bucket A and B leads get the full AI-generated Blueprint. Bucket C leads get a simpler templated Blueprint."
- What does "templated" look like?
- Suggestion: Bucket C gets the same 5-page shell but page 4 (day-in-the-life) uses a generic narrative keyed off their shape, not their business specifics.
- Confirm.

## Q12. Edge states (LLM failure, 404, empty)
- Phase C LLM 500: generic retry button? Fallback to "your blueprint is still on its way by email" line?
- /blueprints/[id] invalid slug: terminal-styled 404 saying "This blueprint doesn't exist. Map your business at polynize.ai/agents."?
- Any branded 500 page needed for server errors?

## Q13. OG image, favicon, app icon
- Motif: the `[` bracket with the mint dot is clean. Confirm direction.
- Need approved by Marrs before engineering wires them.

## Q14. Accessibility targets
- WCAG AA or AAA?
- `--text-3` (#8a7d72) on `--bg` (#0a0a0f) — audit shows 4.2:1 contrast. Passes AA for large text, fails for body. We use it only for eyebrows (uppercase 10-11px) which is a grey zone.
- Confirm AA is the target, and audit `--text-3` usage accordingly.

## Q15. Analytics
- PostHog, Segment, GA4, Plausible?
- Events to fire: CTA clicks, phase transitions, email capture, blueprint view, share click, booking click.
- Who owns measurement plan definition?

## Q16. Rate limiting and abuse
- Phase A form is unprotected. What's the abuse model?
- Captcha on Q11 (email step)?
- LLM rate limit per IP in Phase C?

## Q17. Quality assurance
- Who owns cross-browser testing (Safari, Firefox, Chrome, mobile Safari)?
- Who owns email client testing (Litmus / Email on Acid)?
- Who owns the pre-launch end-to-end test of the full lead funnel?

---

**End of brief.**

For everything in the appendix that Marrs answers, update this document with the decisions. Engineering builds against the updated doc, not this version.

Good luck.
