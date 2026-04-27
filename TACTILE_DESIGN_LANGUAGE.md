# Tactile — A Depth Extension to the Polynize Brand System

> A physical, carved-from-surface design language for Polynize products.
> Companion to the existing Polynize token system (`tokens.css` / `DESIGN.md`).
> This document is a **self-contained handoff** — paste the whole thing into
> another agent (e.g. Claude Code) as the brief for applying Tactile to the
> website.

---

## 1. What "Tactile" is (one paragraph)

Tactile is a **depth style**, not a color reskin. Every surface in the UI
reads as a physical object **milled from a single block of material**:
cards rise from the background with dual-axis shadows, inputs are carved
**into** the surface as recessed wells, buttons feel pressable, and a
subtle felt/noise texture lives on every object so nothing looks
plastic. It keeps Polynize's existing tokens — warm mint (`#69fccb`),
gold (`#f0e1b6`), deep navy (`#0a0a0f`), and the Space Grotesk / Inter
stack — but treats them as the surface *finish* on top of a consistent
**physical substrate** defined by four new tokens and one rigid
shadow recipe.

Think *high-end hi-fi equipment*, *mechanical keyboards*, *Braun
calculators* — not glassmorphism, not neumorphism-lite.

---

## 2. Relationship to the base Polynize system

Tactile **layers on top of** the existing token file. You do not
rewrite colors, type, radii, or spacing. You add:

1. Four new surface tokens (the "substrate").
2. A three-line shadow recipe (the "depth recipe").
3. A texture overlay (the "material").
4. A small set of component rewrites that swap flat borders for carved shadows.

The whole style is scoped under `body[data-depth="tactile"]` so it can
be toggled on/off and shipped alongside the existing flat look. On the
marketing site you can either hard-enable it (`<body data-depth="tactile">`)
or ship it as the default and drop the attribute entirely.

---

## 3. The four substrate tokens

Add these inside a `body[data-depth="tactile"]` block (dark) and a
`body.theme-light[data-depth="tactile"]` block (light). **These are the
only new color tokens.** Everything else — mint, gold, text colors,
borders — comes from the existing Polynize tokens.

```css
/* Dark (default) */
body[data-depth="tactile"] {
  --tac-bg:         #161620;             /* page background, slightly warmer than #0a0a0f */
  --tac-surface:    #1c1c27;             /* raised card, elevation 1 */
  --tac-surface-2:  #22222e;             /* primary/emphasised card, elevation 2 */
  --tac-inset:      #0f0f17;             /* recessed wells — inputs, tracks, channels */

  --tac-edge-light: rgba(255,255,255,0.07); /* top/left highlight on raised surfaces */
  --tac-edge-dark:  rgba(0,0,0,0.55);       /* bottom/right shadow on raised surfaces */
  --tac-rim:        rgba(255,255,255,0.045); /* soft ambient rim, upper-left lift */

  background:
    radial-gradient(ellipse 900px 500px at 80% -10%, rgba(232,184,92,0.05), transparent 60%),
    radial-gradient(ellipse 900px 500px at 20% 110%, rgba(105,252,203,0.04), transparent 60%),
    var(--tac-bg);
}

/* Light */
body.theme-light[data-depth="tactile"] {
  --tac-bg:         #e8dfd3;             /* warm ivory, NOT white */
  --tac-surface:    #efe7dc;
  --tac-surface-2:  #f4ece0;
  --tac-inset:      #d8cfc1;
  --tac-edge-light: rgba(255,255,255,0.90);
  --tac-edge-dark:  rgba(15,40,35,0.14);
  --tac-rim:        rgba(255,255,255,0.60);
  background:
    radial-gradient(ellipse 900px 500px at 80% -10%, rgba(232,184,92,0.2), transparent 60%),
    var(--tac-bg);
}
```

**Three rules, never broken:**

1. **Background is never pure black or pure white.** Dark uses `#161620`
   (warmer than the base `#0a0a0f`). Light uses `#e8dfd3` warm ivory.
2. **There are exactly three surface elevations**: inset (-1), bg (0),
   raised (+1), emphasised (+2). Do not invent more.
3. **Borders are replaced by shadows.** A tactile card has `border: none`.
   Edges are drawn by the inset highlight + dark shadow pair.

---

## 4. The depth recipe (the core idea)

Every raised object has the **same five-layer shadow**. Memorise it —
it is what makes the whole system read as one material.

```css
box-shadow:
  0 1px 0   var(--tac-edge-light) inset,   /* 1. top highlight (the bevel) */
  0 -1px 0  var(--tac-edge-dark)  inset,   /* 2. bottom shadow (the bevel) */
  -6px -6px 14px var(--tac-rim),           /* 3. soft upper-left ambient lift */
  8px  8px  20px rgba(0,0,0,0.40),         /* 4. main cast shadow, lower-right */
  14px 14px 36px rgba(0,0,0,0.25);         /* 5. far ambient shadow */
```

**Light-source convention:** a single, imaginary sun in the **upper left**.
Highlights point up/left, cast shadows fall down/right. This is
**invariant** — every tactile component in the product obeys it.

### 4a. Recessed variant (for inputs, tracks, progress bars, slider channels)

Invert the recipe. The object is carved *into* the surface instead of
rising out of it:

```css
background: var(--tac-inset);
border: none;
box-shadow:
  2px 2px 5px   rgba(0,0,0,0.45) inset,    /* dark falling into the well from upper-left */
  -1px -1px 3px var(--tac-rim)    inset;    /* faint highlight at the well's lower-right */
```

### 4b. Pressed variant (for `:active` states on buttons)

Swap elevation: the button sinks when you press it.

```css
transform: translate(0, 1px);
box-shadow:
  2px 2px 5px   rgba(0,0,0,0.5) inset,
  -1px -1px 3px rgba(255,255,255,0.1) inset;
```

### 4c. Hover (for primary buttons / interactive cards)

Nudge the object 1px toward the light source and deepen the cast shadow
by ~1–2px. Do **not** brighten the fill.

```css
transform: translate(-1px, -1px);
/* add +1px to shadow offsets and +4px to blur */
```

---

## 5. The material (texture)

Every large surface — body, cards, the tweaks panel — gets a **very
faint noise overlay** blended via `mix-blend-mode: overlay`. Without
this, the style looks plasticky. With it, surfaces feel like brushed
aluminium or dense felt.

### 5a. Body-level "felt" — applied once on `body::before`

```css
body[data-depth="tactile"]::before {
  content: '';
  position: fixed; inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='5' numOctaves='2' stitchTiles='stitch' seed='5'/><feColorMatrix values='0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  opacity: 0.22;
  mix-blend-mode: overlay;
}
body.theme-light[data-depth="tactile"]::before { opacity: 0.3; }
```

### 5b. Card-level "brushed metal" — applied on `::after` of each card

```css
.card::after {
  content: '';
  position: absolute; inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='2' numOctaves='2' stitchTiles='stitch' seed='3'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.45 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  opacity: 0.18;
  mix-blend-mode: overlay;
}
```

The noise is inline SVG so it costs nothing and ships in the CSS
itself. Do not replace with a PNG — you lose the `overlay` blend
interacting with accent colors.

---

## 6. Component recipes

These are the minimum set to convert a page. Each is stated as "replace
the flat version's borders with the tactile equivalent." All share the
same shadow recipe from §4.

### 6a. Card / Panel / Container

Any surface that was `border: 1px solid var(--color-border)` becomes:

```css
.card {
  background: var(--tac-surface);
  border: none;
  border-radius: 18px;                    /* up from 16 — tactile reads softer */
  box-shadow:
    0 1px 0 var(--tac-edge-light) inset,
    0 -1px 0 var(--tac-edge-dark) inset,
    -6px -6px 14px var(--tac-rim),
    8px 8px 20px rgba(0,0,0,0.4),
    14px 14px 36px rgba(0,0,0,0.25);
  position: relative;                     /* for the ::after texture layer */
}
```

### 6b. Primary button (mint)

Keep the mint, add gradient + pressed/hover states:

```css
.btn-primary {
  background: linear-gradient(180deg, #7fffd2, #3fc99a);
  color: #0a1a14;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  box-shadow:
    0 1px 0 rgba(255,255,255,0.55) inset,
    0 -1px 0 rgba(0,0,0,0.25) inset,
    -2px -2px 5px rgba(255,255,255,0.08),
    3px 3px 8px rgba(0,0,0,0.45),
    0 0 18px rgba(105,252,203,0.35);      /* mint ambient glow */
}
.btn-primary:hover { /* hover rule from §4c */ }
.btn-primary:active { /* pressed rule from §4b */ }
```

### 6c. Secondary / ghost button

Raised-from-surface chicklet, no color fill:

```css
.btn, .btn-sm {
  background: var(--tac-surface);
  border: none;
  color: var(--color-text-primary);
  box-shadow:
    0 1px 0 var(--tac-edge-light) inset,
    -2px -2px 4px var(--tac-rim),
    3px 3px 6px rgba(0,0,0,0.4);
}
```

### 6d. Input / textarea / select

All inputs become **recessed wells**:

```css
input, textarea, select {
  background: var(--tac-inset);
  border: none;
  border-radius: 12px;
  padding: 14px 16px;
  color: var(--color-text-primary);
  box-shadow:
    2px 2px 5px rgba(0,0,0,0.45) inset,
    -1px -1px 3px var(--tac-rim) inset;
}
input:focus {
  outline: none;
  box-shadow:
    2px 2px 5px rgba(0,0,0,0.45) inset,
    -1px -1px 3px var(--tac-rim) inset,
    0 0 0 2px var(--color-mint);           /* focus ring lives outside the well */
}
```

### 6e. Segmented control / tabs

Carved channel (`--tac-inset` well) containing raised active pill:

```css
.seg {
  background: var(--tac-inset);
  border-radius: 12px;
  padding: 4px;
  box-shadow:
    2px 2px 5px rgba(0,0,0,0.5) inset,
    -1px -1px 3px var(--tac-rim) inset;
}
.seg > button { background: transparent; border: none; padding: 8px 14px; }
.seg > button.on {
  background: linear-gradient(180deg, #7fffd2, #3fc99a);
  color: #0a1a14;
  box-shadow:
    0 1px 0 rgba(255,255,255,0.45) inset,
    0 -1px 0 rgba(0,0,0,0.2) inset,
    2px 2px 4px rgba(0,0,0,0.45);
}
```

### 6f. Navigation / topbar

Recessed **channel** at the top of the viewport — the opposite of a
floating nav:

```css
.topbar {
  background: var(--tac-inset);
  border-bottom: 1px solid var(--tac-edge-dark);
  box-shadow:
    0 1px 0  var(--tac-edge-light) inset,
    0 -10px 24px rgba(0,0,0,0.35);
}
```

### 6g. Accent rails (project cards, category chips)

When a card had a color accent stripe, replace the flat rail with a
**3D raised pill** using the accent color:

```css
.project-card::before {
  content: '';
  position: absolute;
  left: 18px; top: 14px;
  width: 44px; height: 6px;
  border-radius: 999px;
  background: var(--project-color, var(--color-mint));
  box-shadow:
    0 1px 0 rgba(255,255,255,0.45) inset,
    0 -1px 0 rgba(0,0,0,0.35) inset,
    0 2px 4px rgba(0,0,0,0.4);
}
```

---

## 7. Typography (unchanged)

**Do not invent new type choices.** Keep the Polynize stack exactly:

- Display / headings → `Space Grotesk`, 600–800, tight tracking
- Body → `Inter`, 400–500, 1.65 line-height
- Accent / signature → `Caveat`

The only Tactile-specific note: **never use pure-white text on the
dark background.** Use `--color-text-primary` (`#f4ece4`, warm
off-white) — it blends with the noise overlay and looks like ink on
felt instead of LCD glow.

---

## 8. Motion

Tactile motion is **weighty but quick**. Three rules:

1. Transitions are **100–150ms**, ease-out. Never 300ms+ — heavy things
   move fast when snapped.
2. Buttons **translate** on hover (`translate(-1px,-1px)`) and on press
   (`translate(0, 1px)`). They do **not** scale.
3. No spring bounces. No bobbing. No parallax. The material is solid.

---

## 9. Iconography and illustration

- **Line icons only**, 1.5px stroke, `currentColor`. No filled icons,
  no duotone.
- Icon containers are **recessed wells** using the same `--tac-inset`
  treatment as inputs (so the icon sits in a little hole).
- Illustrations: treat every element as a physical object with the same
  light source. No flat vector clip-art.

---

## 10. What NOT to do (anti-patterns)

These are the most common ways an agent will accidentally break the
language. Please avoid all of them.

1. ❌ **Glassmorphism.** No `backdrop-filter: blur` on cards. (The
   tweaks panel is the single exception in the app prototype; on the
   website, skip it entirely.)
2. ❌ **Pastel neumorphism.** Do not lighten card backgrounds toward
   the page background. Surfaces are *darker* than the carved wells
   they contain.
3. ❌ **Flat 1px borders** on cards or buttons. Edges come from the
   bevel shadows, full stop.
4. ❌ **Gradient backgrounds** on panels. The only gradients live on
   the primary button and the segmented-control active pill.
5. ❌ **Pure black (`#000`) or pure white (`#fff`).** Always the warm
   `--tac-bg` ivory / navy.
6. ❌ **Symmetric box-shadows** (e.g. `0 8px 24px rgba(0,0,0,.4)` by
   itself). Tactile shadows always have a directional offset — they
   fall down-right — and they're always paired with an upper-left
   highlight.
7. ❌ **Emoji, stock icons, generic SaaS illustrations.** Polynize
   doesn't use them; Tactile definitely doesn't.
8. ❌ **More than three elevations.** Inset, raised, emphasised. That's
   it.

---

## 11. Checklist for converting a page

When applying Tactile to a new page on the website, walk the page once
and make these swaps in order:

- [ ] Set `<body data-depth="tactile">` and load a CSS file that
      imports the four substrate tokens from §3.
- [ ] Replace the page background with the radial-gradient + `--tac-bg`
      fill from §3.
- [ ] Inject the `body::before` noise overlay from §5a **once**, globally.
- [ ] For every **card / panel / container**: strip `border`, apply the
      raised shadow from §4, add the `::after` noise layer from §5b.
- [ ] For every **input**: strip `border`, swap to `--tac-inset`
      background + inset shadow from §4a.
- [ ] For every **primary CTA**: apply the gradient + mint glow from §6b.
- [ ] For every **secondary button**: apply the raised chicklet from §6c.
- [ ] For every **segmented control / tab bar / toggle**: carve a
      channel around the raised active pill (§6e).
- [ ] Topbar → recessed channel (§6f).
- [ ] Remove any `backdrop-filter: blur` declarations on content surfaces.
- [ ] Confirm the light-source convention: upper-left highlight,
      down-right shadow, on **every** raised element.

---

## 12. Agent brief — paste this to Claude Code

> You are adding a depth design language called **Tactile** to the
> Polynize marketing website. Read `TACTILE_DESIGN_LANGUAGE.md` first
> (sections 1–11). Do **not** alter the existing Polynize color,
> typography, or spacing tokens — Tactile layers *on top of* them.
>
> **Scope:** convert every content surface (hero, feature cards,
> pricing tiles, testimonial cards, footer, forms, nav) to use the
> Tactile recipes. Marketing imagery and copy stay as-is.
>
> **Deliverables:**
> 1. A new stylesheet `tactile.css` that adds the four substrate tokens
>    (§3), the `body::before` noise layer (§5a), and component overrides
>    (§6) scoped under `body[data-depth="tactile"]`. Load it **after**
>    the existing Polynize stylesheet so specificity wins.
> 2. Set `<body data-depth="tactile">` on every page.
> 3. Walk the conversion checklist in §11 page by page.
> 4. Honor the anti-patterns in §10 — if you're tempted to add a 1px
>    border, a `backdrop-filter: blur`, or a fourth elevation, stop
>    and re-read §4.
>
> **How to verify:** screenshot each page at 1440×900 dark theme and
> confirm (a) no flat borders visible on cards, (b) every raised
> element has an upper-left highlight AND a down-right shadow, (c)
> inputs sit *below* the page surface, (d) the primary CTA has the
> mint gradient + glow, (e) the page background is `#161620` tinted
> by the two radial gradients from §3 — never plain black.
>
> **If unsure** whether an element should be raised, recessed, or flat:
> interactive → raised; editable → recessed; decorative → flat.

---

## 13. Reference values (copy-paste cheat sheet)

```
Dark tokens
  --tac-bg:         #161620
  --tac-surface:    #1c1c27
  --tac-surface-2:  #22222e
  --tac-inset:      #0f0f17
  --tac-edge-light: rgba(255,255,255,0.07)
  --tac-edge-dark:  rgba(0,0,0,0.55)
  --tac-rim:        rgba(255,255,255,0.045)

Light tokens
  --tac-bg:         #e8dfd3
  --tac-surface:    #efe7dc
  --tac-surface-2:  #f4ece0
  --tac-inset:      #d8cfc1
  --tac-edge-light: rgba(255,255,255,0.90)
  --tac-edge-dark:  rgba(15,40,35,0.14)
  --tac-rim:        rgba(255,255,255,0.60)

Radii
  cards 18px   buttons 12px   inputs 12px   pills 999px

Motion
  transitions  120ms ease-out
  hover        translate(-1px, -1px) + shadow +1/+4
  pressed      translate(0, 1px) + inset shadow

Light source
  always upper-left → shadow falls lower-right
```

---

*Document version 1.0 — authored to accompany the Apex OS / Agent Team
Console prototype. Any change to the substrate tokens or the five-layer
shadow recipe is a breaking change; version-bump this file.*
