# 03 · Acceptance Criteria

What "done" looks like, by surface. Each item is binary — it works or it doesn't.

## Homepage (`/`)

- [ ] All 9 sections render in order: Hero, Why, What, How, Team, Pricing, Proof, Podcast, Close
- [ ] Hero terminal animation loops smoothly (no flash of unstyled content, no layout shift)
- [ ] Every CTA that says "map your business" links to `/agents`
- [ ] "Book a call" buttons link to real booking URL (Cal.com / Calendly)
- [ ] Podcast section episode links go to YouTube/Spotify/Apple/RSS (or `#` with a clear TODO)
- [ ] Mobile layout works at 375px wide: no horizontal scroll, no overlapping, all copy readable
- [ ] Brand tokens match `shared/tokens.css` exactly (use devtools to spot-check `--mint`, `--coral`, etc.)
- [ ] No em-dashes in user-facing copy
- [ ] Lighthouse: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95
- [ ] Page loads in < 1.5s on 4G
- [ ] Fonts don't FOIT — Space Grotesk and Inter use `font-display: swap` or next/font

## /agents — Phase A

- [ ] 11 questions render one at a time, in the order defined in `phase-a.jsx`
- [ ] Progress indicator shows `step / 11`
- [ ] Keyboard works: ←/→ to nav, Enter to submit, 1–9 to pick radio option
- [ ] Radio questions auto-advance on select (with a 300ms satisfying pause)
- [ ] Checkbox questions require a "next" button press
- [ ] Text input questions validate (non-empty) before advancing
- [ ] State persists across reload — mid-flow refresh resumes at the same question with the same answers
- [ ] Going back via ← preserves previously entered answers

## /agents — Phase B

- [ ] Intro screen renders for ~1.4s, then transitions to reveal
- [ ] Heat map cells animate in one-at-a-time (coral → amber → mint order or similar)
- [ ] The reveal completes; percentages settle; shape name appears
- [ ] After reveal, the "talk to your team" CTA pulses in ~4s later (not immediately)
- [ ] Derived `data` matches what `deriveHeatMap(answers)` would produce given the input
- [ ] State persists — reload during reveal resumes appropriately
- [ ] On clicking CTA, transitions to Phase C with data intact

## /agents — Phase C

- [ ] Team roster shows human lead at center + 4–6 agents around
- [ ] Agent names match what's in `data.team`
- [ ] Chat input is always focused when idle
- [ ] Sending a message shows a typing indicator
- [ ] LLM response renders with streaming if API supports it
- [ ] System prompt conditions the model on `answers` + `data` (verify in logs or debug panel)
- [ ] Back button returns to Phase B with all state intact
- [ ] Chat history persists across reload
- [ ] "Get my blueprint" CTA captures email, writes session to DB, emails the link, redirects to `/blueprints/[id]`

## /blueprints/[id]

- [ ] Valid id loads the session and renders 5 pages
- [ ] Invalid id shows a clean 404 (not a crash)
- [ ] `?demo=1` loads the Sarah / Keel Operations sample
- [ ] All 5 pages render visibly in one scrolling document (no pagination JS required)
- [ ] Page 1 (Cover): minimap matches the real heat map from Page 2
- [ ] Page 2 (Heatmap): cells and percentages match `data.rows` and `data.percentages`
- [ ] Page 3 (Team): human lead name = `answers.name`; agents match `data.team`
- [ ] Page 4 (Day): timeline reflects the user's `q5_volume` and metric focus
- [ ] Page 5 (Pricing): three tiers render with current pricing (Map / Transform / Operate)
- [ ] Print preview (Cmd+P) produces a shareable, clean 5-page PDF
- [ ] URL is shareable: opening in an incognito window shows the same blueprint
- [ ] Social preview card (OG) shows the blueprint cover

## /brand

- [ ] Every design token from `shared/tokens.css` is visible on the page
- [ ] Allocation semantics (coral=human / amber=hybrid / mint=agent) are explicit
- [ ] JSON payload at `#brand-tokens` parses as valid JSON
- [ ] Voice/tone rules render, including the "no em-dashes" rule
- [ ] Page is SEO-noindex (this is internal reference)

## Cross-cutting

- [ ] No console errors on any surface
- [ ] No React hydration mismatches
- [ ] All copy in the prototype appears verbatim in the build
- [ ] Color contrast passes WCAG AA for all body text on `--bg` and `--surface`
- [ ] Analytics events fire on: CTA click, phase transitions, blueprint share, booking click
- [ ] Email delivery works end-to-end (receive the blueprint link within 60s of requesting)
