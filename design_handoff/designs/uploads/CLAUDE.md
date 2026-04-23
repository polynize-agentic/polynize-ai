# CLAUDE.md — polynize.ai

**Persistent project context and build brief. Read this at the start of every session.**

Last updated: April 21, 2026
Status: Greenfield rebuild. The prior polynize.ai codebase is reference only, not authoritative. Build from this document.

---

## 1. What this project is

Polynize.ai is the agentic arm of Polynize (polynize.io). It sells productised AI agent teams to small and mid-size business owners. The site has two jobs:

1. **Tell a narrative** that convinces a business owner that the unit of work has changed, and that their business should be organised into Cognitive Work Units rather than stretched humans.
2. **Qualify leads** through an interactive Heat Map diagnostic that maps which parts of a visitor's business are human-critical versus agent-executable, then generates a personalised Agent Team Blueprint.

The site is not a product catalogue. It is a narrative-led lead qualification engine. Everything downstream (the Blueprint, the email sequences, the booked calls) depends on the Heat Map doing the first layer of qualification automatically.

## 2. Who this is for

**Primary ICP:** SMB founders, operators, or team leads. Businesses with a team (or a solo operator who wants to scale without hiring). Feeling a bottleneck in their working processes. Know AI is part of the answer but don't know how to apply it. Serious buyers, not tinkerers.

**Wrong visitor:** someone looking for a personal AI assistant, someone curious about AI tools generally, someone who wants to build their own agent for fun. The site is designed to make those visitors self-select out.

Enterprise buyers (PwC, Aldi, etc.) live on polynize.io, not here. Do not cross the streams.

## 3. The narrative spine

Three ideas, drawn from Polynize's position paper on Cognitive Productivity and the CWU Design System. They must come through in plain business-owner language.

**One. Execution is no longer the constraint.** AI has made execution cheap. What's scarce now is judgment, direction, and alignment. The business owner's problem is no longer "how do I get more work done" but "how do I get more of the right work done without personally being in every decision."

**Two. The unit of work has changed.** The old unit was the employee, the team, the department. The new unit is the Cognitive Work Unit: one human holding judgment, three to seven agents holding execution, shaped around one real outcome. Early evidence shows roughly 5x throughput versus traditional team structures.

**Three. You can't redesign what you can't see.** Before a business owner can move to this model, they need to see which parts of their work are human-critical and which are agent-executable. The Heat Map makes that visible. It's the recognition step before any agent team is designed.

**The site sells the shift, not the product.** The product (an agent team) is the natural next step after the visitor sees the shift clearly in their own business.

## 4. Language and tone

Direct, punchy, business-literate. Short sentences. No hype, no AI buzzword salad, no sales-pitch voice. Respectful of the reader. Founder-to-founder voice.

**Words to use:** team, work unit, judgment, execution, capability, outcome, bottleneck, leverage, throughput, agent team, cognitive work unit, human lead, install, deploy, connector, blueprint.

**Words to avoid:** revolutionize, transform (as a verb in hero copy), unleash, supercharge, ninja, rockstar, "the future of work," assistant (use agent), hosting (use service fee).

**Hard rule: never use em-dashes anywhere on the site or in any generated content.** Use commas, colons, periods, or en-dashes for ranges. This rule applies to AI-generated Blueprint content as well and must be enforced in the Minimax prompts.

## 5. Brand, design direction, and visual identity

The canonical brand document lives at `polynize.ai/brand`. It must remain accessible in the new site and must be restructured to be both human-readable and machine-readable (AI agents currently can't parse it properly, which is a blocker). Rebuild `brand.html` so that every section has clear semantic HTML structure (`<section id="...">`, `<h2>`, plain paragraph text, no reliance on visual positioning to convey meaning).

**Colour palette:**
- Background: `#0a0a0f` (deep navy-black)
- Surface: `#13131a` (slightly lifted)
- Surface 2: `#1a1a23`
- Primary accent: `#69fccb` (mint)
- Supporting accent: `#a5c1ec` (electric blue)
- Numbers and data: `#f0e1b6` (gold/cream)
- Text primary: `#f4ece4`
- Text secondary: `#c7b9ac`
- Text muted: `#8a7d72`
- Border: `rgba(105, 252, 203, 0.18)` (mint at 18%)

**Typography:**
- Headings: Space Grotesk (weights 400, 500, 700)
- Body: Inter (weights 400, 500, 600)
- Load both from Google Fonts with `display=swap`

**Visual vocabulary:**
- Dark navy backgrounds with subtle gradient surfaces
- 1px mint borders on cards, no thick edge accents
- Generous whitespace, clean grid layouts
- No stock photography
- Low-poly or line-art illustration where illustration is needed
- Numbers and data points in the gold/cream accent
- Mint for CTAs, active states, and the "scarce human" column in the Heat Map
- Blue for supporting/hybrid states
- Amber for hybrid allocations in the Heat Map
- Red or deep coral for human-critical allocations in the Heat Map

Reference polynize.io and polynize.io/polynize_acp.html for sibling design direction. This site should feel like a smaller, founder-facing cousin of those pages, built with the same design vocabulary.

## 6. Tech stack

**Locked decisions, do not deviate without explicit approval:**

- **Frontend:** Plain static HTML with inlined CSS and JS. No framework. No build step. Each page is a self-contained `.html` file. This matches the existing Vercel deployment pattern.
- **Hosting:** Vercel, auto-deploy from GitHub `main`.
- **Database:** Supabase (PostgreSQL). Clean schema, designed in this document. Old `agent_builds` table is being replaced, not extended.
- **Serverless API:** Vercel serverless functions under `/api/`. Pattern follows existing `/api/chat.js`.
- **AI provider:** Minimax (via OpenRouter) for all AI work in this build. Conversation agent and Blueprint generator both use Minimax. Locked for now because of capped pricing plan.
- **Email platform:** Kit.com. Used for email sequencing only. Supabase is source of truth.
- **Transactional email (Blueprint delivery):** Resend.
- **Domain:** polynize.ai via GoDaddy, DNS through Cloudflare.

**Asset strategy:** base64-embed critical assets inline in HTML. Separate assets folder for anything used on multiple pages. Mobile first, test on narrow viewports before anything else.

## 7. Site architecture

Two new pages plus one rebuilt reference page. The proposals namespace is preserved.

| URL | Page | Status |
|---|---|---|
| `/` | Homepage (narrative) | **NEW — rebuild from scratch** |
| `/agents` | Heat Map diagnostic flow | **NEW — rebuild from scratch, replaces Agent Designer entirely** |
| `/brand` | Brand guidelines | **REBUILD for machine-readability, content preserved** |
| `/blueprints/[id]` | Dynamic Agent Team Blueprint page | **NEW** |
| `/proposals/[slug]` | Client proposals (wildcard) | **PRESERVE as-is** |
| `/live-proposals/[clientId]` | Live client proposals Marrs generates post-meeting | **PRESERVE pattern** |
| `/pricing` | Pricing page | **OUT OF SCOPE for this redesign, handled separately** |
| `/links` | Linktree-style hub | **PRESERVE as-is, active marketing infrastructure** |
| `/console` | Agent Team Console standalone | **OUT OF SCOPE, leave as-is** |

**Proposals vs Blueprints — critical distinction:**
- **Blueprints** are auto-generated from the Heat Map flow. They live at `/blueprints/[id]`. They are qualification artefacts, not quotes. Show pricing in bands, not exact figures.
- **Proposals** are manually crafted by Marrs after a discovery meeting. They live at `/proposals/[slug]` (unlisted shares) or `/live-proposals/[clientId]` (live client proposals). They contain exact pricing, specific agent names, locked scope. This is a separate workflow and must be preserved in full.

## 8. Page one: Homepage (/)

### Structure

Sections in order, single long-scrolling page:

**Section 1 — Hero.** Section tag "The Cognitive Work Unit." Headline states the shift. Subhead is two sentences on the thesis. Single primary CTA: "Map Your Business" or "See What You Can Agentify" (pick one during build, A/B later). CTA sends to `/agents`. No secondary CTA.

Generate two or three headline options during build. Starting territory: "Your team is no longer the unit of work." "One human. Three to seven agents. One outcome." "The new shape of a working business."

**Section 2 — The Shift.** Two or three short paragraphs on why execution is no longer the constraint. SMB translation of polynize.io/polynize_acp.html's "The shift" section. Visual: simple productivity curve, traditional model (cost grows with output) vs CWU model (output compounds without proportional cost growth). Directional, not precise.

**Section 3 — The Cognitive Work Unit.** The hero concept explained. "One human holds the judgment. Three to seven agents hold the execution. The unit is shaped around one real outcome, not a job title." Visual: the CWU diagram from the Cognitive Productivity paper. Human judgment (frame, decide, steer) on one side, AI leverage (execute, iterate, scale) on the other, Business fit anchoring below, CWU in the centre. Include "1 human : 3 to 7 agents ≈ 5x throughput" with a light footnote noting early pilot data.

**Section 4 — You Can't Redesign What You Can't See.** Bridges into the CTA. Most business owners sense they should be using agents but don't know where. They bolt AI onto legacy workflows and wonder why it doesn't compound. The Heat Map makes it visible. Build tension that the Heat Map resolves.

**Section 5 — What You Get.** Three cards, each describing one thing the visitor walks away with after the Heat Map flow:
- Card 1: "A Heat Map of your business." What's human-critical, what's agent-executable, colour-coded across the work you do.
- Card 2: "A suggested agent team." Shaped around your specific work, using Polynize's Cognitive Work Unit design methodology.
- Card 3: "A written Agent Team Blueprint emailed to you." Yours to keep, share with a partner, or bring to a conversation with us.

**Section 6 — How We Work.** Condensed Map → Train → Engineer → Deploy pipeline from polynize.io. Four steps, one sentence each. Low visual weight. Establishes credibility.

**Section 7 — Proof.** One proof panel. Lift the "70% uplift, global technology company" example from polynize.io homepage. Keep the AJ Milne / Optio Capital testimonial from the existing polynize.ai if the quote still reads well. One or two proof panels maximum.

**Section 8 — From the Founders.** Preserve the podcast section from the existing site. Thumbnail + play button linking to youtube.com/@polynize.agentic. This section is working, don't break it.

**Section 9 — Final CTA.** Same CTA as the hero. Copy above: "Take the 4-minute diagnostic. No email required until the end." Mirror the CTA visual from Section 1.

**Footer.** Standard footer matching polynize.io style. Links to polynize.io, LinkedIn (linkedin.com/company/polynize), YouTube (@polynize.agentic), Instagram (@polynize.labs), TikTok (@polynize.labs), Email (hello@polynize.io). Secondary "Book a call" link to Calendly (https://calendly.com/marrscoiro/meeting30).

## 9. Page two: Heat Map flow (/agents)

This is the core functional page. It replaces the Agent Designer entirely. The spawn-an-agent, first-person-agent, single-agent-blueprint narrative is dead. What replaces it:

**Phase A:** 4 to 6 questions.
**Phase B:** Heat Map renders on screen. Suggested agent team preview renders below it.
**Phase C:** Generic Polynize agent appears in a chat panel. Captures email. Runs short qualifying conversation. Routes to bucket.

The chat agent in Phase C is a single Polynize voice. Not a custom persona designed by the visitor. One agent, one voice, consistent across every lead.

### Phase A: The questions

Four to six questions, one at a time, spacious layout, progress indicator at top. Refine wording during build; structural logic below is fixed.

**Q1: Business context.** "In one or two sentences, what does your business do?" Short free text. Feeds the Heat Map row library and the Blueprint's day-in-the-life narrative.

**Q2: Role and team.** "What's your role, and how big is your team?" Two dropdowns. Role: Founder / CEO / Operator / Team Lead / Other. Team size: Just me / 2-5 / 6-20 / 20+.

**Q3: The primary outcome.** "What's the one outcome you most need your team to deliver better right now?" Short free text. CWU anchor. Soft qualifier, tire-kickers struggle to answer.

**Q4: Where the bottleneck is.** Multi-select. Categories:
- Analysis and research
- Sales and pipeline
- Building and delivery
- Managing my own time and attention
- Account and relationship management
- High-volume operations
- Creative and content production
- Team learning and development

These map directly to the eight canonical CWU shapes (see Section 11). Top-ticked category determines dominant shape. If multi-select, secondary shapes inform the team composition.

**Q5: Urgency and intent.** Single select: "I need to fix this now" / "I'm actively exploring solutions" / "I'm curious about what's possible."

**Q6: Build stance.** Single select: "Build and deploy for me" / "I want to build it myself" / "Not sure yet."

Questions 1-4 generate the Heat Map. Questions 5-6 qualify the lead. All answers store as JSON in the `leads` table (see Section 12).

### Phase B: The Heat Map

Renders immediately when Q6 submits. This is the visual centrepiece of the entire site.

**Structure:** 2D grid.
- Rows: 6 to 10 work functions inferred from Q1, Q2, and Q4 answers, using the CWU Shape library (Section 11).
- Columns: three allocation zones. "Human-led" (red/coral), "Hybrid / Cognitive Work Unit" (amber), "Agent-executable" (mint/green).
- Each cell is colour-coded. Each work function gets one cell highlighted, indicating its dominant allocation.

**Visual design:**
- Dark navy background, grid sits on surface-2 colour
- Rounded cells, 1px borders, clear labels
- Mint for the "Human-led" column (scarce/precious)
- Amber for "Hybrid"
- Green for "Agent-executable"
- Subtle animation as cells light up (staggered, ~300ms total)

**Desktop layout:** full 2D grid, all rows and columns visible simultaneously.

**Mobile layout:** stacked rows, each row is a horizontal card showing the work function name, its allocation, and a coloured indicator. Single-column scroll. Consider an optional "tap to see all three zones" expand interaction, but prioritise simplicity.

**Caption below grid:** plain-language summary. "Based on what you've shared, roughly X% of your current workload should stay human, Y% belongs inside a Cognitive Work Unit, and Z% should not be consuming your team's time at all." Percentages calculated from the grid.

**Suggested team preview below caption:** panel labelled "Here's the shape of the agent team we'd design for you." 3 to 5 named agent functions using the naming convention from the CWU Design System (e.g., "Meeting Prep Specialist," "Pipeline Coordinator," "Client Health Monitor"). Partial preview. Full team with rationale goes in the Blueprint.

### Phase C: The Polynize agent conversation

As the Heat Map finishes rendering, a chat panel slides in from the right side of the screen (desktop) or slides up from the bottom (mobile). The Heat Map stays visible.

The agent is a single generic Polynize voice. Not a persona the visitor designed. Opens with:

> "I'm the Polynize agent. I've just generated your Heat Map based on what you shared. Before we go deeper, want me to send you your full Agent Team Blueprint? It includes every agent we'd build for you, a day-in-the-life scenario specific to your business, and indicative pricing."

Visitor says yes → agent asks for email → email captured → short qualifying conversation, 2-3 exchanges max.

**Sample exchanges:**

> "Got it, I'll send that over. While I put it together, what's making you look at this right now? Something specific going on?"

Free text. Stores as qualitative context in `leads.conversation_context`.

> "And if we were to build this team for you, when would you ideally want it running?"

Free text or quick buttons: "Now" / "Next few months" / "Just exploring." Sharpens urgency signal.

> "Last one. Is there anyone else in the business who'd need to be part of this decision?"

Free text. Exposes decision-making stance.

**Close:**

> "Perfect. Your Blueprint is generating and will arrive within a few minutes. If you're in the 'need this now' camp, here's a link to book a call directly: [Calendly]. Otherwise, I'll stay in touch."

Calendly link is shown conditionally. Prominent for Bucket A leads, de-emphasised for others.

**Agent implementation:**
- Uses `/api/chat.js` Minimax proxy
- System prompt includes the Polynize brand rules, the no-em-dashes rule, the visitor's Heat Map data as context, and instructions on the qualifying flow
- Uses tag-based communication pattern: `|||EMAIL|||address|||EMAIL|||`, `|||CONTEXT|||q:urgency|a:now|||CONTEXT|||`, `|||COMPLETE|||` to signal end of conversation
- Client-side JS parses tags, strips them from display, writes captured data to Supabase

### Bucket routing (A = hot, B = warm, C = cold)

Computed at end of Phase C. Standard convention: A = best lead.

**Bucket A (hot):** "I need to fix this now" on Q5 AND "Build and deploy for me" on Q6. Or strong urgency signal in conversation combined with specific bottleneck language in Q3. Calendly link prominent. Marrs gets internal notification within minutes. Email sequence: hot lead drip with direct booking CTAs.

**Bucket B (warm):** "Actively exploring solutions" on Q5. Or Bucket A signals but "Not sure yet" or "Build it myself" on Q6. Calendly link available but de-emphasised. Email sequence: nurture over 4-8 weeks with CWU case studies and practical how-tos, designed to convert to Bucket A.

**Bucket C (cold):** "Curious about what's possible" on Q5, or any vague/exploratory answers. Email sequence: general newsletter with educational content.

Bucket logic lives in a single pure function in `/api/lead-notify.js` so it can be tested and iterated independently.

## 10. The Agent Team Blueprint

The Blueprint is the core deliverable of the Heat Map flow. It is a 4-page HTML document served at `/blueprints/[id]`.

### Delivery model

**Hybrid.** Heat Map and team preview render immediately on screen in Phase B. The full Blueprint is generated async via Minimax after Phase C completes. Delivered by email within a few minutes with a link to `/blueprints/[id]`.

**No PDF conversion.** The Blueprint lives as a web page. Shareable by link. Mobile-responsive. Renders cleanly for email previews.

### Structure (4 pages within one scrolling document)

**Page 1 — Your Heat Map.** The full grid, the caption, the narrative of what the Heat Map means for this specific visitor's business (generated by Minimax using Q1 and Q3 context). One or two paragraphs of "here's what we see." Uses the visitor's business language from Q1.

**Page 2 — Your Agent Team.** 3 to 5 named agents, each with:
- Name (human-sounding, generated by Minimax based on the visitor's industry and tone)
- Role title (from the CWU Design System naming convention)
- What they do (one paragraph, specific to the visitor's business)
- Which capabilities from the Heat Map they own

Plus a statement of who the human lead is (almost always "you"), citing the CWU principle of one accountable human at the centre.

**Page 3 — A day in the life.** A narrative scenario showing what a typical workday looks like with the agent team in place. Chat-style snippets where appropriate, showing how the agents interact with the human lead and with each other. Specific to the visitor's business context from Q1. This is the emotional hook. Minimax generates this fresh for every Blueprint using the visitor's actual business.

**Page 4 — How we'd build this.** Map → Transform → Operate staged engagement. Indicative price bands, not exact figures:
- **Map:** from $2,500 AUD. Sets up the cognitive layer, delivers the first agent live.
- **Transform:** typically $8,000 to $15,000 AUD depending on team size. Full team built, trained, deployed.
- **Operate:** from $699 AUD per month. Service fee scales with team size.

Prominent Calendly CTA: "Lock the real numbers in a 30-minute call." Link: https://calendly.com/marrscoiro/meeting30.

### Generation logic

When Phase C completes, a Supabase webhook fires `/api/lead-notify.js`. That function:

1. Reads the lead row from Supabase
2. Calls Minimax once with a structured prompt that generates the full Blueprint content as JSON (agent names, agent descriptions, day-in-the-life narrative, Heat Map narrative)
3. Writes the JSON to `blueprints.content` column
4. Sends the email via Resend with a link to `/blueprints/[id]`
5. Syncs the lead to kit.com with the appropriate bucket tag

`/blueprints/[id]` is a simple renderer: fetches the JSON, templates it into the HTML shell.

**Cost control:** only Bucket A and B leads get the full AI-generated Blueprint. Bucket C leads get a simpler templated Blueprint without custom Minimax generation (saves money on low-intent leads). Configurable via a column in Supabase.

### Tone and content rules for Minimax generation

Pass these rules as part of the system prompt every time Minimax generates Blueprint content:

- No em-dashes. Use commas, colons, or restructured sentences.
- Short sentences. Founder-to-founder voice.
- No hype language. No "revolutionize," "unleash," "supercharge."
- Use the visitor's business language from Q1 and Q3. Don't substitute generic terms.
- Name agents with human-sounding names (not "Agent 1" or "Marketing Assistant"). Names should feel like colleagues.
- Agent descriptions should say what the agent does for THIS business, not what agents do in general.
- Day-in-the-life should be specific. Real numbers, real times, real tasks pulled from the visitor's context.

## 11. The CWU Shape Library (backend logic)

The eight canonical Cognitive Work Unit shapes from the CWU Design System drive the Heat Map row generation and the suggested team composition. Shapes are backend logic only — never shown to the visitor.

### Shape to Q4 category mapping

| Q4 ticked category | Dominant CWU Shape |
|---|---|
| Analysis and research | Shape 1: Analysis and Judgment |
| Sales and pipeline | Shape 2: Pipeline and Conversion |
| Building and delivery | Shape 3: Execution and Delivery |
| Managing my own time and attention | Shape 4: Executive Leverage |
| Account and relationship management | Shape 5: Relationship Continuity |
| High-volume operations | Shape 6: High-Volume Operations |
| Creative and content production | Shape 7: Creative Direction |
| Team learning and development | Shape 8: Learning and Capability |

If the visitor ticks multiple categories, the top one is dominant and others are secondary. Team composition reflects the dominant shape with optional roles added from secondary shapes.

### Heat Map row library per shape

Each shape has a predefined set of work function rows that populate the Heat Map grid. Build this as a config file (`/config/cwu-shapes.json`) so it can be refined over time without code changes.

**Example for Shape 2 (Pipeline and Conversion):**

```json
{
  "shape": "Pipeline and Conversion",
  "rows": [
    { "function": "Prospecting and qualification", "allocation": "agent-executable" },
    { "function": "Meeting preparation and intel briefs", "allocation": "agent-executable" },
    { "function": "Live client conversations", "allocation": "human-led" },
    { "function": "Proposal drafting and customisation", "allocation": "hybrid" },
    { "function": "Objection handling and negotiation", "allocation": "human-led" },
    { "function": "Follow-through and pipeline state tracking", "allocation": "agent-executable" },
    { "function": "Close and commitment management", "allocation": "human-led" },
    { "function": "Post-sale handoff and documentation", "allocation": "agent-executable" }
  ],
  "team_roles": [
    { "title": "Targeting and Qualification Specialist", "priority": 1 },
    { "title": "Meeting Prep and Intelligence Analyst", "priority": 1 },
    { "title": "Proposal Specialist", "priority": 2 },
    { "title": "Pipeline Coordinator", "priority": 2 },
    { "title": "Outreach Coordinator", "priority": 3 }
  ]
}
```

Build the same structure for all eight shapes during Phase 1 of the build. Source material: the CWU Design System document's Shape Library section, Part 2 of the PDF Marrs will provide. Each shape in that document specifies typical task clusters, agent functions, and human center type. Translate those into row and team configs.

### Allocation rules

Every row has a default allocation drawn from the CWU Design System's Human Criticality and Risk Sensitivity logic:

- **Human-led:** requires trust, accountability, live decisions, or high failure cost. Examples: live client conversations, strategic decisions, final judgment calls.
- **Hybrid:** needs human direction but agents can execute within that direction. Examples: proposal drafting, content creation, briefing.
- **Agent-executable:** structured, repeatable, pattern-based. Examples: research, scheduling, monitoring, coordination, follow-through.

## 12. Supabase schema (clean rebuild)

Fresh schema. Do not carry over the old `agent_builds` table. Design goals: one source of truth, clean relations, easy to query for both the website and downstream agent teams.

### Tables

**`leads`** — every visitor who completes Phase A

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `created_at` | timestamp | |
| `email` | text | Nullable until Phase C captures it |
| `name` | text | Optional, captured in Phase C if offered |
| `role` | text | From Q2 |
| `team_size` | text | From Q2 |
| `business_description` | text | From Q1 |
| `primary_outcome` | text | From Q3 |
| `bottleneck_categories` | text[] | From Q4, array of ticked categories |
| `urgency` | text | From Q5 |
| `build_stance` | text | From Q6 |
| `conversation_context` | jsonb | Q&A from Phase C conversation |
| `bucket` | text | 'A', 'B', or 'C' |
| `kit_com_synced` | boolean | default false |
| `kit_com_synced_at` | timestamp | nullable |

**`heat_maps`** — one per lead

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `lead_id` | uuid FK → leads.id | |
| `dominant_shape` | text | One of the eight CWU shapes |
| `secondary_shapes` | text[] | Other shapes from multi-select Q4 |
| `grid_data` | jsonb | Array of {function, allocation} objects |
| `percentages` | jsonb | {human: 30, hybrid: 50, agent: 20} |
| `created_at` | timestamp | |

**`agent_teams`** — one per lead, the suggested team

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `lead_id` | uuid FK → leads.id | |
| `agents` | jsonb | Array of {name, role_title, description, capabilities} |
| `human_lead_description` | text | Who holds judgment in this unit |
| `created_at` | timestamp | |

**`blueprints`** — one per lead

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `lead_id` | uuid FK → leads.id | |
| `slug` | text unique | Used in the URL `/blueprints/[slug]` |
| `content` | jsonb | Full Blueprint content generated by Minimax |
| `generation_status` | text | 'pending', 'generating', 'complete', 'failed' |
| `generated_at` | timestamp | nullable |
| `email_sent_at` | timestamp | nullable |
| `view_count` | integer | default 0, incremented on each `/blueprints/[slug]` GET |
| `last_viewed_at` | timestamp | nullable |
| `created_at` | timestamp | |

**Slug generation:** short hash (e.g. 10-char) so the URL is unguessable but readable. Don't use the UUID directly in URLs.

### RLS (Row Level Security)

- All tables: anon role has INSERT on `leads` (via the Phase A form) and SELECT on `blueprints` by slug only.
- Everything else locked to service role.
- Supabase anon key stays client-side for INSERT and single-blueprint SELECT. All other operations go through serverless functions using service role key.

### Realtime

Not used in the new architecture. Replaced by Supabase Database Webhooks pointing at serverless functions. More reliable, no persistent connection needed.

## 13. Serverless functions (/api/)

**`/api/chat.js`** — existing pattern, modify for Minimax-only. Takes `{system, messages}`, returns Minimax response in a consistent shape. Client-side code stays unchanged.

**`/api/heat-map.js`** — receives Q1-Q4 answers, returns Heat Map data. Logic:
1. Determine dominant CWU shape from Q4
2. Fetch row library from `/config/cwu-shapes.json`
3. Return grid data for rendering
4. Server-side only, so the shape logic isn't exposed to the client

**`/api/submit-lead.js`** — called at end of Phase A, creates the `leads` row with the initial questionnaire data. Returns the lead ID so subsequent calls can reference it.

**`/api/capture-email.js`** — called mid-conversation when the chat agent captures email. Updates the `leads` row. Triggers the Blueprint generation pipeline.

**`/api/lead-notify.js`** — webhook handler. Fired by Supabase when a lead completes Phase C (bucket assigned). Orchestrates:
1. Compute bucket if not already set
2. Generate Blueprint content via Minimax
3. Store in `blueprints.content`
4. Send email via Resend with link to `/blueprints/[slug]`
5. Sync to kit.com with bucket tag
6. Send internal notification to Marrs (email for Bucket A, silent log for B and C)

**`/api/blueprint/[id].js`** — dynamic page renderer. Fetches blueprint by slug, renders the HTML template, increments view count. If blueprint is still `generating`, shows a simple "your blueprint is still being prepared, check back in a moment" page with auto-refresh.

**`/api/sync-kit.js`** — utility function for pushing leads to kit.com. Takes lead ID, constructs the kit.com subscriber payload, applies the bucket tag, returns sync status. Called from `/api/lead-notify.js`.

### Environment variables

Set in Vercel dashboard, never in code:

```
MINIMAX_API_KEY=
OPENROUTER_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
EMAIL_FROM=team@polynize.ai
KIT_COM_API_KEY=
KIT_COM_FORM_ID_BUCKET_A=
KIT_COM_FORM_ID_BUCKET_B=
KIT_COM_FORM_ID_BUCKET_C=
WEBHOOK_SECRET=
INTERNAL_NOTIFY_EMAIL=marrs@polynize.io
```

## 14. kit.com integration

**Supabase is the source of truth. kit.com is the email executor only.**

Every lead with a captured email gets pushed to kit.com as a subscriber. The only data synced: email, first name (if captured), bucket tag.

The three bucket tags correspond to three kit.com sequences (set up in kit.com dashboard, referenced by form ID in env vars):

- `polynize-hot-lead` → Bucket A sequence
- `polynize-warm-lead` → Bucket B sequence
- `polynize-cold-lead` → Bucket C sequence

Agent teams (Richie, Sage, etc.) query Supabase directly for full lead context. They do not pull from kit.com. kit.com is a write destination only.

**Sync failure handling:** if the kit.com API call fails, write the failure to `leads.kit_com_synced = false` with an error log, retry via a cron job or manual trigger. Don't block the user-facing flow on kit.com availability.

## 15. Build phases

### Phase 1 (MVP, ship this first)

1. Homepage (`/`) complete build, all sections, mobile-responsive.
2. `/agents` Phase A (the four to six questions), clean UI, stored via `/api/submit-lead.js`.
3. `/agents` Phase B (Heat Map rendering), using rule-based row generation from `/config/cwu-shapes.json`.
4. `/agents` Phase C (Polynize agent chat), Minimax-powered, captures email and qualifying answers via tag pattern.
5. Supabase schema fully deployed, RLS configured.
6. `/api/lead-notify.js` basic version: computes bucket, writes to Supabase, sends email via Resend with placeholder Blueprint link.
7. `/blueprints/[id]` renderer with placeholder Blueprint content (structured but not AI-generated yet).
8. `/brand` rebuilt for machine-readability.

### Phase 2 (add intelligence)

9. Minimax-powered Blueprint generation via `/api/lead-notify.js`.
10. Day-in-the-life narrative generation.
11. Agent name generation.
12. Full Blueprint content rendering at `/blueprints/[id]`.

### Phase 3 (complete the loop)

13. kit.com integration via `/api/sync-kit.js`.
14. Internal notifications to Marrs for Bucket A leads.
15. View tracking on Blueprints.
16. Supabase webhook configuration.

### Phase 4 (polish and optimise)

17. A/B testing framework for Q wording and Heat Map layout.
18. Analytics on bucket distribution and conversion rates.
19. Cost monitoring for Minimax generation.
20. Admin dashboard at `/admin` (auth-gated) for lead review.

**Build Phase 1 first, end to end, before starting Phase 2.** Do not try to build all four phases simultaneously. The site must be shippable after Phase 1 even without AI-generated Blueprints.

## 16. Technical rules and gotchas

Carry these across from the prior codebase because they're universally true:

1. **No em-dashes anywhere.** Not in site copy, not in Blueprint content, not in AI-generated content, not in any commit messages or code comments that render to users. Enforce in Minimax system prompts.
2. **Cloudflare email-decode injection:** add `data-cfasync="false"` to any script tag that uses an email address. Encode visible `@` as `&#64;`.
3. **Supabase variable naming:** never `var supabase = null`. Use `var sbClient = window.supabase.createClient(...)` to avoid shadowing the CDN global.
4. **`event.keyCode === 13` not `event.key === 'Enter'`** in any HTML-string keyboard handlers to avoid quote nesting issues.
5. **CSS class existence:** no build step means no error when a class doesn't exist. Verify every class before using it. Search the file first.
6. **Image weight:** base64 embedding works but watch total page weight. Homepage should stay under 3 MB. If images push it higher, host separately.
7. **Mobile first:** design for narrow viewports first, scale up. The Heat Map in particular must work on mobile before it works on desktop.
8. **No framework, no build step.** If you catch yourself reaching for React, Next.js, Tailwind, Vite, stop. That's not the stack. Vanilla HTML, inlined CSS, inlined JS.

## 17. What to do when starting a session

1. Read this document in full.
2. Check the current state of the codebase. What phase are we in? What's shipped? What's in progress?
3. If starting fresh (Phase 1 not yet begun): scaffold the repo structure, create `/config/cwu-shapes.json` with all eight shapes, build the Supabase schema, then start on the homepage.
4. If continuing existing work: ask Marrs what task to pick up next, or look at the last commits to see where things were left.
5. Before writing any new code, propose the approach. Get confirmation. Then build.
6. Commit frequently with descriptive messages. Push to `main` only when a phase or feature is complete and tested locally.

## 18. What this document is not

- Not a design spec down to pixel measurements. Design decisions within the visual direction in Section 5 are yours to make.
- Not a fixed copy document. Generate copy, propose it, iterate with Marrs.
- Not a list of every edge case. Handle edge cases pragmatically and flag the interesting ones.

## 19. Reference materials

Marrs will provide or point to these as needed:

- CWU Design System v0.1 (PDF) — authoritative source for Shape Library and team composition logic
- Cognitive Productivity position paper (PDF) — the thesis and language for the CWU concept
- Buyer Decision Map v3.0 (PDF) — how Polynize sells, drives qualifying question design
- Social Studio proposal (HTML) — reference for the Map → Transform → Operate pricing structure and the day-in-the-life narrative style
- Existing polynize.ai site (live, for reference only) — the Agent Team Console GIF and AJ Milne testimonial may be lifted for the new site
- polynize.io and polynize.io/polynize_acp.html (live) — sibling sites for visual and tonal reference

## 20. Out of scope for this project

- Pricing page rebuild (separate project)
- Console page
- Any changes to polynize.io
- Blueprint PDF export
- Multi-language support
- Self-serve agent building (the Agent Designer narrative is dead, don't revive it)

**Preserved as-is (do not modify):**
- `/links` — active marketing infrastructure, leave untouched
- `/proposals/*` — client proposal workflow, leave untouched
- `/live-proposals/*` — live client proposal workflow, leave untouched
- `/console` — Agent Team Console standalone

---

**End of CLAUDE.md. Updates to this document should be committed with clear messages. Treat this as the single source of truth for the polynize.ai project.**
