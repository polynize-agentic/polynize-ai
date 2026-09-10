# Console audit, 10 September 2026

**Why now.** Two weeks of fast changes (D96 to D115) and a change of direction: Polynize content is built from core learnings, Marrs Attacks has its own private board, and the console is the engine the leadership team means when they say "we've now got the engine". Marrs: *"We just want to make sure things are neat and right."* This is every screen and every route, what it is for, whether anything leads to it, and a verdict against the new direction.

**How to read the verdicts.** *Keep* is the working console. *Fixed today* was wrong and is now right, in the same commit as this document. *Hide* means remove the way in but keep the code and the data. *Retire* means the screen is superseded; remove it in a clean-up commit once the replacement has run for two weeks, data kept. *Decide* needs Marrs.

---

## 1. Screens

| Screen | What it is | Who leads to it | Verdict |
|---|---|---|---|
| `/console` | The launcher: Marketing, Leads | the top bar | Keep |
| `/console/marketing` | The front page: the boards as cards, Calendar, Studio, April's brief, Learnings library, the engine's numbers | everything | Keep. **Fixed today:** Studio shown to Marrs only; a private board shows no card to anyone else; Learnings library added |
| `/console/marketing/stream/{board}` | One board: setup cards, Learnings (Polynize only), Narratives at their gates, ideas, numbers | the cards | Keep. **Fixed today:** private board redirects others home; brand voice card no longer says "concept" |
| `…/stream/{board}/brand-voice` | The voice doc | setup card | Keep |
| `…/stream/{board}/media` | The media library | setup card, the pickers | Keep |
| `…/stream/{board}/templates` | Content templates | setup card | **Decide.** Nothing in the five gates reads these; only the retired concept flow did (the template picker under a concept). The card is a door to a room nothing uses. Recommend hiding the card; the code stays until the concept flow is retired |
| `/console/marketing/narrative/new` | Gate 1: the inbox, the hook library, the three doors on his board | + New narrative, Create narrative on an idea | Keep |
| `/console/marketing/narrative/{id}` | Gates 2 to 5 | the board rows | Keep |
| `/console/marketing/learnings` and `/new` and `/{id}` | The learnings library, add a learning, one learning | front page button, Polynize board | Keep (new today, D115) |
| `/console/marketing/piece/{id}` | Script, text or image screen for one piece | the gates, the calendar, the Studio | Keep |
| `…/piece/{id}/prezie` | The prezie stage | the stage rail | Keep |
| `…/piece/{id}/teleprompter` | The iPad teleprompter | the script screen, the Studio | Keep |
| `/console/studio` | What to shoot, in order | front page | Keep. **Fixed today:** Marrs only |
| `/console/marketing/calendar` | Everything going out | front page | Keep |
| `/console/marketing/metricool` | Connect Metricool, map boards to brands, posting times | the calendar | Keep. **Fixed today:** lists only the boards you can see |
| `/console/marketing/feedback` | What April has been told | front page | Keep |
| `/console/leads` and `/leads/{person}` | The CRMs | launcher | Keep. **Fixed today:** no card for Marrs Attacks (it takes no meeting contacts) |
| `/console/marketing/concept/{slug}` (+ `/create`, `/develop`, `/plan`, `/update`) | The old core-concept flow: the doc, plan outputs, a template picker, April's update conversation | nothing since D48 (only the concept screens link to each other) | **Retire.** Superseded by Learnings (D115). Data stays under `pam/concept-bank/` |
| `/console/marketing/intake` | April's interview that wrote a concept | nothing | **Retire** with the concept flow |
| `/console/marketing/import` | Paste a concept document | nothing | **Retire** with the concept flow. Add a learning is the paste now |
| `/console/marketing/library` | The concept library (copy another board's concept) | nothing | **Retire** with the concept flow. The name now belongs to polynize.ai/library |
| `/console/marketing/podcast` and `/{id}` | Episodes and the clip workbench | nothing since D48 | **Hide (already), keep.** Marrs parked the podcast module in August; the code and Descript wiring are intact for when it returns |
| `/console/marketing/llm-probe`, `/metricool/probe` | Diagnostics | nothing, by design | Keep, unlinked |
| `/console/marketing/streams`, `/story/…`, `/piece/{id}/interface`, `/piece/{id}/screen-prompt` | Redirects from old addresses | old bookmarks | **Retire** in the clean-up; the bookmarks are a month old |
| `/console/blueprinting` | The old blueprint console | nothing (removed from the launcher) | Out of scope for this console; noted |

## 2. Routes

Every one of the 66 routes under `/console/marketing` has a caller in the console; none is orphaned. The routes under `/concept/…`, `/intake/…`, `/import/…`, `/library/copy` and `/podcast/…` go when their screens go. Two things noted by their own comments: the Metricool save still writes an old per-board `slots` table that nothing reads (remove with the clean-up), and the older hook step of the staged build is "one input among several" now (fine).

## 3. Names

Three words for one thing. The board says **Narratives** and **+ New narrative**; Gate 1's third door says **Multi**; Marrs and the documents say **Story** and **the kit**. The gates themselves say "Story" in their copy since D109. **Decide:** one word. Recommend **Story** on the board and the button, because it is the word he uses and the word the gates already use; "Multi" stays as the name of the door that makes one (a Story that becomes many pieces), or becomes "Story" too.

"Concept" is gone from live copy as of today (the brand voice card was the last). "Library" now means polynize.ai/library; the internal screen is "Learnings".

## 4. What the two weeks left open

- **Slack #content ping** needs the webhook in Vercel (`SLACK_CONTENT_WEBHOOK`); the code is live (D108).
- **Hand-posted LinkedIn** never gets a public url, so it never pings and never joins the numbers. Idea on the list: "mark published with link" on the calendar row.
- **Focus anchor** is shown on the split-screen screen but not stored.
- **First live proofs still owed:** a Pull now with the Vercel keys in, a first Make evergreen, a first template prezie board, and now a first learning published and a first Story cut from it.
- **The co-founder photo:** the Marrs card paints the mint mark until Marrs sends a second image (D114).

## 5. What I would do next, in order

1. Marrs decides the one word (section 3) and the templates card (section 1). Both are one-line changes.
2. Two weeks of learnings through the new flow.
3. The clean-up commit: retire the concept flow, the redirects and the dead Metricool table. Data untouched.
