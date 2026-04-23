# 04 · Gotchas

Things the prototype fakes, hardcodes, or sidesteps. Every item here needs real engineering work.

## 1. `window.claude.complete` is not a real API

The prototype calls `window.claude.complete({messages})` in Phase C. This is an artifact-runtime helper that uses `claude-haiku-4-5` with a 1024-token cap. **Do not ship this as your LLM.**

Replace with:
- Anthropic SDK (`@anthropic-ai/sdk`) server-side route, streaming responses back to the client
- OR Minimax, per original brief §13

Server-side is required because you cannot expose an API key to the browser.

## 2. State persistence is localStorage-only

Key: `polynize_agents_state_v1`. Value: `{ phase, answers, data, messages }`.

This means:
- A user on a different device starts over
- A user who clears cache loses progress
- You can't email a link mid-flow

Fix: Supabase session-backed persistence from step one. Generate a session uuid as soon as a user starts Phase A; store in a cookie; all writes go through the server.

## 3. Email is not wired

Nothing actually sends an email. The "email me my blueprint" CTA resolves instantly.

Original brief specifies **Resend**. Wire that. Template needs:
- Subject: custom per shape ("Your Operations blueprint is ready")
- Body: short, linked to `/blueprints/[id]`, plain-text friendly
- From: `blueprints@polynize.ai` (set up DNS before launch)

## 4. "Book a call" is `#`

Every booking CTA is a dead link. Pick Cal.com or Calendly, set up a 20-min discovery call event, wire it. Consider an inline embed on the blueprint so the user doesn't leave the site.

## 5. Heat map derivation is preset-based

`agents/phase-b.jsx` exports:
- `SHAPE_LIBRARY`: five hardcoded shape templates (Pipeline, Studio, Ops-heavy, Platform, Solo-first)
- `deriveHeatMap(answers)`: simple rules that pick a template and tweak it

**This is intentionally simple.** Production should call an LLM with the answers to synthesize:
1. The shape name (a label specific to this business)
2. The functions / rows for the heat map
3. The human / hybrid / agent allocation per row
4. The resulting percentages

Keep `SHAPE_LIBRARY` as a fallback if the LLM fails.

## 6. Blueprint role descriptions are static

`blueprints/blueprint-data.js` has `AGENT_DETAIL`, a keyed map of role → description. This covers ~10 common roles. Any shape that produces an unknown role will fall through.

Options:
- LLM-generate role descriptions at blueprint creation time, cache in DB
- OR expand `AGENT_DETAIL` to cover 30+ roles and fall back to a generic template
- OR both (LLM first, cached; static fallback for known roles for cost)

## 7. Analytics are not implemented

No PostHog, no Segment, no GA. Decide and wire. Events worth tracking:
- Homepage section visibility (scroll depth)
- CTA clicks (which CTA, which section)
- Phase A dropout (at which question)
- Phase B completion
- Phase C message count
- Email capture
- Blueprint share
- Booking click

## 8. Mobile is good, not great

The prototype works on mobile but nothing is mobile-first. Before launch:
- Test Phase A on a real iPhone — the keyboard behavior on text inputs matters
- Test Phase B reveal on mobile — the heat map cells may be too small
- Test Phase C chat — input should behave like a real messaging app (keyboard handling, auto-scroll on new message)
- Test Blueprint scrolling on a phone — the 5 pages stack vertically; make sure the visual rhythm holds

## 9. Accessibility has gaps

What's good: keyboard nav in Phase A, semantic HTML in most places.
What's missing:
- Screen reader labels on the heat map cells
- ARIA roles on the chat panel
- Focus management between phases (focus should move to the new phase's primary element)
- Reduced motion: the Phase B reveal animations should respect `prefers-reduced-motion`
- Color contrast on `--text-3` (42% opacity) may fail WCAG AA; audit all uses

## 10. The JSX-in-browser structure won't scale

The prototype loads React + Babel via `<script>` tags and registers components on `window`. This is unmaintainable for production. Port to a real build system (Next.js, Vite + React, Remix, whatever fits) from day one.

## 11. Copy has real claims that need real data

- "70% throughput lift" in the proof section — back this up with a real case study or pull it before launch
- "5× output" — same
- "48h to first agent" — make sure this is operationally true
- "0 vendor lock-in" — make sure the sales pitch matches what's contracted

If you can't back a number, cut it.

## 12. The hero terminal animation runs forever

Intentional — it's ambient — but it does chew a tiny amount of CPU. Use `@media (prefers-reduced-motion: reduce)` to pause the blink + typing loop for users who opted out.

## 13. Heat map color semantics are easy to get wrong

Coral = human. Amber = hybrid. Mint = agent. **Memorize this.** Any mismatch between the Brand page and the product will erode trust instantly. Consider a unit test that asserts the mapping at build time.

## 14. The brand page is public but should not be indexed

Ship with `<meta name="robots" content="noindex, nofollow">`. It's a reference doc for internal and partner use, not SEO surface.
