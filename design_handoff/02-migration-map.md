# 02 · Migration Map

Where each design file lands in the target app. Two columns: Next.js / React structure (recommended) and vanilla HTML per original CLAUDE.md. Pick one, not both.

## Routes

| Design file | Next.js path | Vanilla HTML path |
|---|---|---|
| `Polynize Homepage B.html` | `app/page.tsx` | `/index.html` |
| `Polynize Agents.html` | `app/agents/page.tsx` | `/agents/index.html` |
| `Polynize Blueprint.html` | `app/blueprints/[id]/page.tsx` | `/blueprints/[id].html` (or dynamic) |
| `Polynize Brand.html` | `app/brand/page.tsx` | `/brand/index.html` |

## Homepage (`Polynize Homepage B.html` → `directions/direction-b.jsx`)

The whole page is the `DirectionB` component. Ported component tree (use any structure that matches):

```
app/page.tsx
├── components/home/Nav.tsx             (terminal chrome, nav links)
├── components/home/Hero.tsx            (animated terminal, value prop, CTAs)
├── components/home/SectionWhy.tsx      (section 02)
├── components/home/SectionWhat.tsx     (section 03)
├── components/home/SectionHow.tsx      (section 04, 3-phase flow)
├── components/home/SectionTeam.tsx     (section 05, team composition)
├── components/home/SectionPricing.tsx  (section 06, Map/Transform/Operate)
├── components/home/SectionProof.tsx    (section 07, logos + metrics + testimonial)
├── components/home/SectionPodcast.tsx  (section 08, featured ep + 3 side eps)
├── components/home/SectionClose.tsx    (section 09, final CTA)
└── components/home/Footer.tsx
```

Specific moments to preserve exactly:

- **Hero terminal animation**: the blinking `_` cursor, the `> map your business` prompt, and the staged reveal of the three-phase blurb. Timing is load-cheap CSS animation.
- **Heat map mini** in "what": tiny grid showing coral / amber / mint cells at roughly the percentages used throughout the product (43% / 29% / 28%).
- **How flow** (section 04): three-column layout with numbered phases (01 Map / 02 Transform / 03 Operate) and thin arrows between them on desktop.
- **Proof section** waveform / metric strip: do not swap in an icon library. Use the bar sparkline built with CSS.
- **Podcast section** waveform: CSS bars at computed heights; featured card is 2/3, sidebar is 1/3 with 3 stacked episode rows.

## /agents (three phase files)

```
app/agents/page.tsx                     (controller: tracks phase, answers, data)
├── components/agents/PhaseA.tsx        (from phase-a.jsx — 11 questions)
├── components/agents/PhaseB.tsx        (from phase-b.jsx — reveal + shape library)
├── components/agents/PhaseC.tsx        (from phase-c.jsx — chat panel)
└── lib/agents/
    ├── questions.ts                    (the Q data; currently top of phase-a.jsx)
    ├── shape-library.ts                (SHAPE_LIBRARY; currently in phase-b.jsx)
    ├── derive-heatmap.ts               (deriveHeatMap; currently in phase-b.jsx)
    └── system-prompt.ts                (Phase C system prompt builder)
```

Controller responsibilities:
- Owns `{ phase, answers, data, messages }` 
- Persists every change to Supabase (prototype uses localStorage)
- Routes to Phase A / B / C based on `phase`
- Passes callbacks down: `onComplete(answers)`, `onReady(data)`, `onBack()`

## /blueprint (5 JSX pages)

```
app/blueprints/[id]/page.tsx            (controller: loads session by id, renders 5 pages)
├── components/blueprint/Cover.tsx       (bp-01-cover.jsx)
├── components/blueprint/Heatmap.tsx     (bp-02-heatmap.jsx)
├── components/blueprint/Team.tsx        (bp-03-team.jsx)
├── components/blueprint/Day.tsx         (bp-04-day.jsx)
├── components/blueprint/Pricing.tsx     (bp-05-pricing.jsx)
└── styles/blueprint.css                 (keep as a CSS module or port to Tailwind)
```

The prototype loads data three ways (see `00-architecture.md`); production just fetches by id.

## /brand (reference surface)

The Brand page is essentially static. Port the semantic sections (Tokens, Palette, Allocation Semantics, Voice, Type) into a single MDX or JSX page.

**Keep the machine-readable JSON payload** at `#brand-tokens` — it's a contract for any downstream tool (including agents generating polynize-branded output):

```json
{
  "name": "polynize.ai",
  "tagline": "map your business into an agent workforce",
  "tokens": { ... },
  "allocation": { "coral": "human", "amber": "hybrid", "mint": "agent" },
  "voice": { ... }
}
```

The target app should expose this at either `/brand/tokens.json` (static file) or as a JSON-LD script embedded in the page.

## Shared assets

| Prototype | Target |
|---|---|
| `shared/tokens.css` | Ported to Tailwind config (`tailwind.config.ts`) AND a root `globals.css` with CSS variables |
| `shared/data.js` | Used only by the prototype's blueprint demo fallback. In production, seed data lives in DB. |

## Fonts

Google Fonts loaded in every HTML `<head>`. In Next.js use `next/font/google`:

```ts
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
```

Weights used: Space Grotesk 400/500/600/700, Inter 400/500, JetBrains Mono 400/500.
