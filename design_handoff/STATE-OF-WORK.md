# polynize.ai · state of work

**Date:** April 2026
**Handoff from:** design (Marrs + Claude)
**Handoff to:** Claude Code (build)
**Read this file first. Then `01-CLAUDE.md`. Then open the HTML files in a browser.**

---

## What has been done

The design layer for polynize.ai v1 is complete. You are receiving a set of high-fidelity, behavior-accurate HTML prototypes that define every user-facing surface the v1 site needs, plus all the docs you need to build them.

### Designed and delivered

| Surface | File | Status |
|---|---|---|
| Homepage | `designs/Polynize Homepage B.html` | ✅ Final. 9 sections. Operator-terminal aesthetic. |
| /agents 3-phase flow | `designs/Polynize Agents.html` | ✅ Final. Phase A (11 questions), Phase B (heat map reveal), Phase C (chat with Claude). |
| /blueprints/[id] | `designs/Polynize Blueprint.html` | ✅ Final. 5 pages. Loads from localStorage or `?demo=1`. |
| /brand | `designs/Polynize Brand.html` | ✅ Final. Semantic reference + machine-readable JSON at `#brand-tokens`. |
| /links | `designs/Polynize Links.html` | ✅ Final. Resources + socials. Matches homepage aesthetic. |
| Email: blueprint ready | `designs/Polynize Email.html` | ✅ Final. Table-based HTML + plain-text fallback. Handlebars tokens for Resend. |

### Underlying design system

- `designs/shared/tokens.css` — single source of truth for colors, spacing, fonts
- `designs/shared/data.js` — example "Pipeline" business payload, matches the data contract
- `designs/Polynize Brand.html#brand-tokens` — JSON export of the brand system for agents/tools

### Three homepage directions explored; one won

I explored Editorial Restrained, Technical Mono, and Bold Display. **You are only getting Technical Mono** (Direction B, the "operator terminal"). The other two are deleted. The file `direction-b.jsx` is the single component tree for the whole homepage.

### All em-dashes swept from user-facing copy

Per brand voice rule. Do not reintroduce.

---

## What has NOT been done (your job)

### Search for `CC-TODO:` across the codebase

Every placeholder, fake, or deferred decision is tagged. Current list:

1. **`blueprints/bp-05-pricing.jsx`** — pricing logic. Current prices are designer placeholders. **Ask Marrs for the real pricing rules before launch.** Build `computePricing(answers, data)` in `lib/pricing.ts`. Persist a `pricing_version` on each blueprint.

2. **`directions/direction-b.jsx` §07 proof.log** — logo strip, metrics (+70% throughput, 5× output, 48h first agent, 0 vendor lock-in), and the AJ Milne / Optio Capital testimonial are **all placeholders**. Get real claims from Marrs with permission to publish. Cut any that can't be backed.

3. **`directions/direction-b.jsx` §08 founders.podcast** — episode titles and guest names are placeholders. Wire real "Think Better" episodes. Consider pulling from the podcast RSS feed dynamically.

4. **All `book_a_call` CTAs** — currently have no href or `#`. Point at `https://calendly.com/marrscoiro` (confirmed) unless Marrs specifies otherwise.

5. **Edge states** — none are designed:
   - Phase C LLM failure / rate-limit / 500 state
   - Blueprint 404 (invalid id)
   - Blueprint loading skeleton
   - Homepage `prefers-reduced-motion` audit
   - Any empty / error state in Phase A/B

6. **OG image + favicon + app icon** — nothing designed. Generate a static 1200×630 OG card using the operator-terminal aesthetic. Favicon from the `[` bracket + dot motif.

7. **Mobile pass** — designs work at 375px but were not designed mobile-first. Dedicated QA pass needed: Phase A keyboard handling, Phase B cell legibility, Phase C keyboard / auto-scroll, blueprint vertical flow.

8. **Accessibility sweep** — keyboard nav works in Phase A; everything else needs: screen reader labels on heat map cells, ARIA roles on chat panel, focus management between phases, `prefers-reduced-motion` support, WCAG AA contrast audit (especially `--text-3` at 42% opacity).

9. **Analytics** — nothing wired. Decide PostHog / Segment / GA and fire events on CTA click, phase transitions, email capture, share, booking click.

10. **Backend** — nothing exists:
    - Supabase tables (see `05-schema-sketches.md`)
    - Server routes for Phase C LLM calls (don't expose key in browser)
    - Resend email sending (template is designed, see `designs/Polynize Email.html`)
    - Booking integration (Cal.com or Calendly embed)

---

## Read in this order

1. **This file** (state of work) — you are here
2. **`01-CLAUDE.md`** — drop at the root of the target repo; this is your working brief
3. **`00-architecture.md`** — data contracts, state flow, phase boundaries
4. **`02-migration-map.md`** — each design file's target location
5. **`03-acceptance-criteria.md`** — what "done" looks like per surface
6. **`04-gotchas.md`** — things the prototype fakes
7. **`05-schema-sketches.md`** — Supabase shapes
8. **`designs/uploads/CLAUDE.md`** — the original product brief (source of truth for intent)

### Then open in a browser, in this order

1. `designs/Polynize Homepage B.html` — the vibe
2. `designs/Polynize Agents.html?demo=1` — walk the 3 phases (auto-fills)
3. `designs/Polynize Blueprint.html?demo=1` — the takeaway
4. `designs/Polynize Brand.html` — the system
5. `designs/Polynize Links.html` — the link-hub page
6. `designs/Polynize Email.html` — the transactional email

---

## Key contracts to honour

### Brand tokens (from `shared/tokens.css`)

Coral = human. Amber = hybrid. Mint = agent. **Do not remap.** Any inconsistency between `/brand` and the product will erode trust.

### Copy

Every piece of user-facing copy in the prototypes is final. Do not paraphrase. If something feels off, flag it to Marrs — don't silently rewrite.

### No em-dashes in user-facing text

Already swept. Keep it that way.

### The /agents flow is a narrative

Phase B's reveal must include the one-cell-at-a-time animation and the ~4s pause before the chat nudge. Phase C's system prompt must condition Claude on the user's answers + derived team. Don't shortcut.

### State persistence

All state (Phase A answers, Phase B derived data, Phase C messages) must survive reload. Prototype uses `localStorage`; production must use Supabase-backed sessions.

---

## Stack guidance

Original brief (`designs/uploads/CLAUDE.md`) specified vanilla HTML + inline CSS + Supabase + Resend + Minimax. That's still the recommended stack. If you deviate to Next.js / React, the JSX in `designs/directions/*.jsx`, `designs/agents/*.jsx`, and `designs/blueprints/*.jsx` ports nearly 1:1.

Do NOT introduce a CSS framework without porting `tokens.css` as a theme layer. Do NOT add unneeded dependencies — the prototype has zero npm deps.

---

## Contact / escalation

If the design file disagrees with this README, the design file wins.
If the design file disagrees with `designs/uploads/CLAUDE.md`, ask Marrs.
If something is ambiguous, ask Marrs.

---

## Files in this bundle

```
handoff/
├── STATE-OF-WORK.md              (this file, read first)
├── README.md                     (overview)
├── 00-architecture.md            (data contracts, state flow)
├── 01-CLAUDE.md                  (drop-in CLAUDE.md for target repo)
├── 02-migration-map.md           (file → target location)
├── 03-acceptance-criteria.md     (what "done" looks like)
├── 04-gotchas.md                 (prototype fakes)
├── 05-schema-sketches.md         (Supabase shapes)
└── designs/
    ├── Polynize Homepage B.html
    ├── Polynize Agents.html
    ├── Polynize Blueprint.html
    ├── Polynize Brand.html
    ├── Polynize Links.html
    ├── Polynize Email.html
    ├── agents/phase-a.jsx
    ├── agents/phase-b.jsx
    ├── agents/phase-c.jsx
    ├── blueprints/blueprint-data.js
    ├── blueprints/blueprint.css
    ├── blueprints/bp-01-cover.jsx
    ├── blueprints/bp-02-heatmap.jsx
    ├── blueprints/bp-03-team.jsx
    ├── blueprints/bp-04-day.jsx
    ├── blueprints/bp-05-pricing.jsx
    ├── directions/direction-b.jsx
    ├── shared/tokens.css
    ├── shared/data.js
    └── uploads/CLAUDE.md         (original product brief)
```

Good luck. Build it well.
