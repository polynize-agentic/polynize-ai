# 07 · Opening Prompt for Claude Code

**Paste this verbatim as your first message in your Claude Code session, after you've dropped the files into the repo.**

---

## The prompt

```
You are starting work on polynize.ai v1. This is a fresh Next.js build from a
complete design handoff.

Before you write any code, do the following in order:

1. Read CLAUDE.md at the repo root.
2. Read design_handoff/STATE-OF-WORK.md.
3. Read design_handoff/README.md.
4. Read design_handoff/00-architecture.md.
5. Read design_handoff/06-shape-reconciliation.md. This is critical, the
   prototype uses 5 shapes but we're shipping 8.
6. Skim design_handoff/reference/CWU_Design_System_v0_1.pdf so you understand
   the methodology behind the 8 shapes.
7. Look at config/cwu-shapes.json so you understand the data layer for the
   Heat Map.
8. Open design_handoff/designs/Polynize Homepage B.html in a browser.
9. Open design_handoff/designs/Polynize Agents.html?demo=1 in a browser and
   walk through all three phases.
10. Open design_handoff/designs/Polynize Blueprint.html?demo=1 in a browser.

Once you've done all of that, do not write code yet. Respond with:

a. A one-paragraph summary of what polynize.ai is and who it's for, in your
   own words.

b. The four locked decisions (stack, LLM, shape library, pricing bands), to
   confirm you read CLAUDE.md.

c. Your proposed Phase 1 scope. Phase 1 should be the minimum shippable site:
   homepage, /agents 3-phase flow with rule-based Heat Map (not LLM-generated
   yet), /blueprints/[id] renderer with placeholder content, Supabase schema,
   email delivery via Resend, basic bucket routing. Do not include Minimax
   Blueprint generation, kit.com sync, or the /console page in Phase 1.

d. Three questions about anything in the handoff that's ambiguous or
   contradictory. If you have zero questions, tell me that instead. Do not
   invent questions.

After I respond, we'll proceed to scaffolding Next.js and starting the build.
```

---

## Why this prompt is structured this way

**It forces reading first.** Claude Code will otherwise jump straight into scaffolding Next.js. That's fine for a green-field project with no context, but this isn't green-field. The design handoff is the project. Reading it first is the work.

**It asks for a summary back.** This catches misunderstandings before any code is written. If Claude Code's one-paragraph summary is wrong, you correct it before it bakes the misunderstanding into the codebase.

**It asks for Phase 1 scope back.** My earlier brief structured the build in four phases. Claude Code may propose a different breakdown that makes more sense given the handoff docs. Let it propose, then adjust.

**It asks for questions.** And specifically tells it not to invent questions. If it has real ambiguities, you want to resolve them now, not three hours into the build. If it has no real ambiguities, it should say so.

**It tells it not to write code yet.** The temptation is strong. Resist.

---

## Expected shape of Claude Code's response

It should look something like:

> (a) polynize.ai is a narrative-led lead qualification site for SMB owners considering agent teams. The visitor reads the Cognitive Work Unit thesis on the homepage, takes a 11-question diagnostic, sees a personalised Heat Map showing which parts of their work are human-critical vs agent-executable, chats with a Polynize agent, and receives a shareable Agent Team Blueprint by email.
>
> (b) Stack: Next.js App Router. LLM: Minimax via OpenRouter for v1, Anthropic API as upgrade path. Shape library: 8 CWU shapes from config/cwu-shapes.json. Pricing: Map from $5k, Transform from $10k, Operate from $999/mo, baseline placeholders pending refinement.
>
> (c) Proposed Phase 1:
> - Next.js App Router scaffold with design tokens from tokens.css
> - Homepage component tree ported from direction-b.jsx
> - /agents page with Phase A (11 questions), Phase B (rule-based Heat Map from cwu-shapes.json), Phase C (Minimax-backed chat)
> - /blueprints/[id] dynamic renderer using blueprint-data.js fallback content
> - Supabase schema per 05-schema-sketches.md
> - Resend email integration for Blueprint delivery
> - Bucket routing logic in /api/lead-notify
> - /brand page ported for machine-readability
> - /links page ported
>
> Out of Phase 1: Minimax Blueprint generation, kit.com sync, /console, analytics, admin dashboard.
>
> (d) Three questions:
> 1. The prototype's SHAPE_LIBRARY has 5 shapes, cwu-shapes.json has 8. Should I expand phase-b.jsx to handle all 8 in Phase 1, or ship with the prototype's 5 and expand in Phase 2?
> 2. Do you want the console route reserved as a simple "coming soon" placeholder, or left unrouted until the design arrives?
> 3. The Optio.ai testimonial: do you have the source URL or image from the prior site, or should I pull the quote text and find the visual treatment during Phase 1?

If the response looks roughly like that, you're good to proceed. If it skips any of (a) through (d), push back. If it starts writing code, stop it.

---

## Your response to Claude Code's questions

For reference, you can pre-plan these. When Claude Code asks the three kinds of questions above, the answers are:

**Q about shape library (5 vs 8):** Ship all 8 in Phase 1. The reconciliation doc (`06-shape-reconciliation.md`) tells you how.

**Q about /console route:** Reserve as placeholder. Simple page at /console with "Coming soon" copy in the brand style. Design will arrive separately.

**Q about Optio.ai testimonial:** Marrs has the quote text, will provide. For v1 you can use a plain-text treatment in the brand style (no logo needed if a clean logo isn't available).

**Q about Supabase project:** Marrs has an existing Supabase project. New schema goes into a new project, don't mix with the prior site's data. Marrs will provide connection details when scaffolding starts.

**Q about kit.com API access:** Out of Phase 1. Tag leads with their bucket (A/B/C) in Supabase and build the kit.com sync as a separate serverless function in Phase 2.

**Q about any copy decisions:** Copy is locked. Don't paraphrase. If something reads wrong, flag it and Marrs will decide.

---

## What to do if Claude Code wants to change something

Sometimes a capable model will read the brief and spot a real problem. If Claude Code says "I think X in the handoff is wrong because Y," do not dismiss it. Think about Y. If Y is a real issue, let me know and we'll adjust the brief. If Y is a preference dressed up as an issue, redirect to "the design handoff wins, execute it as specified."

The line: the design is final, but the implementation approach is open.
