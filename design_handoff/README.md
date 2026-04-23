# Handoff: Polynize.ai v1 — homepage, /agents flow, /blueprint, /brand, /links, email

## Overview

This bundle is the complete **design reference** for polynize.ai v1. It covers six user-facing surfaces:

| Surface | File | Purpose |
|---|---|---|
| **Homepage** | `designs/Polynize Homepage B.html` | 9-section narrative landing page, "operator terminal" aesthetic |
| **/agents** | `designs/Polynize Agents.html` | Three-phase diagnostic: questions → heat map reveal → agent chat |
| **/blueprint** | `designs/Polynize Blueprint.html` | The 5-page shareable artifact a lead takes away |
| **/brand** | `designs/Polynize Brand.html` | Machine-readable brand system (tokens, rules, voice) |
| **/links** | `designs/Polynize Links.html` | Resource hub (bio-link surface for socials) |
| **Email** | `designs/Polynize Email.html` | Transactional "blueprint ready" email, HTML + plain-text |

## About these files

**They are design references, not production code.** They run in a browser via Babel-in-the-browser (React 18 + inline JSX). They are intentionally framework-light so the JSX reads like a spec, and the copy/layout/behavior is exact.

**The job is to recreate these designs in the target stack**, not to copy the HTML verbatim. Pick whichever of these matches your situation:

- **Claude Code + vanilla HTML** (what CLAUDE.md originally called for): treat the JSX as a description of DOM + behavior, port to server-rendered HTML with inlined CSS, wire the state with vanilla JS + `localStorage`.
- **Claude Code + Next.js/React**: the JSX translates to Next.js components almost directly. `<style>` blocks become Tailwind classes or CSS modules. `localStorage` becomes client state or server sessions.
- **A human dev**: use the HTML files as pixel reference alongside the migration map in `02-migration-map.md`.

## Fidelity

**High-fidelity.** Every color, type size, spacing value, animation duration, and piece of copy is intentional. Design tokens are in `designs/shared/tokens.css` and mirrored in `designs/Polynize Brand.html` as a semantic reference + a JSON payload at `#brand-tokens`.

## Read in this order

1. `00-architecture.md` — system overview, data contracts between the surfaces, which pieces are faked in the prototype
2. `01-CLAUDE.md` — Claude Code-ready instruction file for the rebuild (drop this into the target repo root). Contains the four locked decisions.
3. `02-migration-map.md` — HTML file → target-app location, component by component
4. `03-acceptance-criteria.md` — what "done" looks like, by surface
5. `04-gotchas.md` — things the prototype fakes that need real implementations (`window.claude`, Supabase, Minimax, email, etc.)
6. `05-schema-sketches.md` — suggested Supabase table shapes + the answer/data contract shape
7. `06-shape-reconciliation.md` — how the prototype's 5 shapes map to the 8 CWU shapes (critical before touching phase-b.jsx)
8. `07-opening-prompt.md` — exact prompt to paste into Claude Code to start the build
9. `reference/CWU_Design_System_v0_1.pdf` — the methodology underlying the 8-shape library

Then open the HTML files in order:
1. `designs/Polynize Homepage B.html` — the vibe
2. `designs/Polynize Agents.html?demo=1` — walk through the three phases
3. `designs/Polynize Blueprint.html?demo=1` — the takeaway
4. `designs/Polynize Brand.html` — the system

## Key files inside `designs/`

```
designs/
  Polynize Homepage B.html        Entry point: homepage
  Polynize Agents.html            Entry point: /agents (uses localStorage)
  Polynize Blueprint.html         Entry point: /blueprint (reads /agents state)
  Polynize Brand.html             Entry point: /brand (semantic reference)

  shared/
    tokens.css                    All design tokens (colors, spacing, fonts)
    data.js                       Example data shape for a "Pipeline" business

  directions/
    direction-b.jsx               The whole homepage component tree

  agents/
    phase-a.jsx                   Typeform-style questions (11 total)
    phase-b.jsx                   Heat map reveal + SHAPE_LIBRARY + deriveHeatMap()
    phase-c.jsx                   Chat panel (uses window.claude.complete)

  blueprints/
    blueprint-data.js             Fallback demo data + AGENT_DETAIL keyed by role
    blueprint.css                 All blueprint-specific styles
    bp-01-cover.jsx               Page 1: editorial cover + minimap
    bp-02-heatmap.jsx             Page 2: full heat map + percentages
    bp-03-team.jsx                Page 3: human lead + agent cards
    bp-04-day.jsx                 Page 4: timeline / day-in-the-life
    bp-05-pricing.jsx             Page 5: Map / Transform / Operate
```

## What the prototype fakes (see `04-gotchas.md` for detail)

- **LLM calls**: Phase C uses `window.claude.complete`, the artifact's built-in helper. Swap for real Claude (Anthropic SDK) or Minimax per `uploads/CLAUDE.md` §13.
- **State persistence**: `localStorage` only. Real app needs Supabase or equivalent, keyed by session/lead.
- **Email**: none. Real app needs Resend per original brief.
- **Booking**: every "book a call" link is `#`. Wire to Cal.com/Calendly.
- **Heat map shaping**: `deriveHeatMap()` in `phase-b.jsx` returns preset templates from `SHAPE_LIBRARY`. Real app should call Minimax/Claude with the answers to generate the shape, per `uploads/CLAUDE.md` §6.
- **Blueprint generation**: `blueprints/blueprint-data.js` holds the shape-to-team mapping as a static map. Real app should generate team + agent descriptions via LLM from the answers.

## Assets

All visual elements are rendered with CSS + SVG. No image dependencies, no icon libraries. Fonts are Google Fonts: **Space Grotesk** (display), **Inter** (body), **JetBrains Mono** (chrome/code). Fraunces and Instrument Serif are referenced in `/brand` as supporting families.

## Original brief

`uploads/CLAUDE.md` (original polynize.ai build brief) is the source of truth for product intent. This handoff is the design layer on top of it.
