# The CRM rebuild: build plan

**Written:** 14 October 2026, for Marrs and AJ.
**Source:** AJ's email to the team, his *Polynize CRM Structure* (six pages of fields), his *Polynize CRM Visual Concept* (six mock screens, BDO as the example), and the *Company Entry Point* grid. Marrs: "We'll pretty much take the following as gospel... Take the design as a direction to go, but in terms of style, we stay within our design style."

**Status:** phases 1 to 5 built on 14 October 2026 (D120). Marrs's answers to the seven questions are in §7. Phase 6 (bulk import, Fireflies action drafts, the weekly overdue email) is not built; bulk import is dropped on his word.

---

## 1. What changes, in one paragraph

The CRM stops being a list of people per Polynize team member and becomes a list of **companies** we are working on. You open the CRM, you see BDO, PwC, EY, KPMG and the rest as cards. You click one and you are inside that company's workspace: its profile, its people, its deals, and the next actions on them. Across the top, the same four things for every company at once, plus a dashboard for the whole pipeline. The section is called **CRM**, not Leads.

## 2. The shape

**Top navigation, always visible inside the CRM:** Companies · Contacts · Deals · Actions · Dashboard.

| Screen | What you see | Question it answers |
|---|---|---|
| **Companies** (the landing page) | Four numbers on top (target accounts, engaged, open deals, total pipeline), a search box, **+ Add company**, then the company cards: name, region, number of active deals, a filled arrow for the ones with live work | Which organisations are we working on, and where is the activity? |
| **A company** | A header with the name, tier and status, then four tabs: **Profile**, **Contacts**, **Deals**, **Actions** | Everything we know and are doing with BDO, in one place |
| Profile tab | Company intelligence (sector, regions, headquarters, potential users, use case, business problem), the meeting links, the account overview and owner, counts of people, deals and actions | What is this company, why do they need us, and what have we discussed? |
| Contacts tab | Everyone at the company with role, location and influence; click one for their own page | Who do we know there, and who matters? |
| Deals tab | That company's deals as cards in stage columns (Discovery, Demo or pilot, Proposal, Negotiation), with the company's total open pipeline underneath | What are we trying to sell them, and how close is each? |
| Actions tab | That company's next steps: task, deal, owner, due date, status | What has to happen next, and who is doing it? |
| **Contacts** (top nav) | Every contact across every company, searchable and filterable by company, role and owner | Who do I need to talk to? |
| **Deals** (top nav) | The whole pipeline as one board, every company's deals in stage columns | Where is every deal? |
| **Actions** (top nav) | Every open action, overdue first, filter to "mine" | What do I have to do this week? |
| **Dashboard** (top nav) | Open pipeline, weighted pipeline, active deals, follow-ups due; pipeline by stage; the quarter's forecast, proposals sent, new accounts engaged, meetings, deals won and lost | How is the business tracking? |

## 3. The look

AJ's layout, our style. That means:

- **His structure, kept:** the top nav, the four number tiles, the card grid, the company header strip, the two-column profile, the stage-column deal board, the dashboard's bars and quarterly list.
- **Our skin:** the console's dark and light themes with the same switch as everywhere else, Space Grotesk for headings, the console's surfaces and borders. AJ's terracotta palette is not adopted.
- **Colour has a meaning here already, so it is used sparingly.** In the Polynize brand coral is human, amber is hybrid and mint is agent, and the CRM must not quietly reuse those for something else. Mint is the one accent (the active tab, the primary button, live work); everything else is the console's neutral ink. Status is shown in words, not in colour.

## 4. The information, trimmed

AJ asked what is essential and what is nice to have. His structure has 22 company fields, 20 contact fields, 17 deal fields and 15 action fields. Every field stays available, but a new record **asks for only the essential ones**, and the rest sit under "More detail" on the record. That is what stops this becoming the admin task AJ warned about.

**Essential to create (everything else optional):**

| Record | Asked for when you add one |
|---|---|
| Company | Name, status (Target, Engaged, Active client, Inactive), tier (1, 2, 3), relationship owner |
| Contact | Name, company, job title, email, contact role (Decision maker, Influencer, Champion, User) |
| Deal | Name, company, stage, value, close probability, expected close date, owner |
| Action | What to do, company, owner, due date (deal and contact optional) |

**Worked out by the console, never typed:** the IDs (COM-001, CON-001, DEA-001, ACT-001, shown on the record as AJ drew them), the company name on a contact, date added, last contact date (from the latest meeting or action), the overdue flag, the weighted pipeline, the forecasts and every dashboard number.

**Close probability defaults from the stage** (Discovery 10%, Demo or pilot 30%, Proposal 50%, Negotiation 75%) and can be overwritten per deal.

**One rule from AJ's mock, enforced gently:** *"Every open deal requires an owner, next step and due date."* A deal with no open action shows a small "no next step" mark on the board and in the dashboard's follow-up count. It never blocks anything.

**Stage history is recorded from day one.** Conversion rates between stages need to know when each deal moved. If it is not recorded from the first deal, that number can never be calculated for anything already in the system.

## 5. What happens to what we have now

| Today | After |
|---|---|
| **Leads** card on the launcher | **CRM** card. The old address redirects. |
| A CRM per person (Polynize, Marrs, Shourov, Kristin, Julian) | One CRM, company first. Each person becomes an **owner** you can filter by. |
| Contacts in those per-person lists | Moved into companies by their business name. Anyone with no company lands in an **Inbound** list on the Contacts screen, to be assigned to a company with one click. Nothing is deleted. |
| Website leads (from the team map, job map, blueprints) | Keep arriving exactly as now, with the use case and the post that brought them (the attribution built in September). They land in Inbound until someone assigns them. |
| The Fireflies meeting pull (pick meetings, tick attendees into contacts) | Becomes **Link a meeting** on a company: the console lists recent meetings you attended, you tick one, it is attached to the company as a meeting link with its title and date, and you can tick attendees to add as contacts. It links the meeting and reads attendee names; it does not copy transcripts into the CRM. |
| New-lead emails and the daily Fireflies digest | Kept, pointed at the new screens. |

## 6. Build order

Six phases. Each one ships on its own and is usable the day it lands, so the team can start entering real companies after phase 1 rather than waiting for the whole thing.

**Phase 1. Companies.** The CRM name and card, the top navigation, the database for all four record types (one setup script you paste into Supabase, as with the September one), the Companies landing page with its numbers, search and Add company, and the company Profile tab with meeting links. *You see:* the grid, BDO's profile, the Fireflies links on it. *Answers:* which companies are we working on and what do we know about them?

**Phase 2. Contacts.** The company Contacts tab, the contact page, the all-contacts screen with filters, the move of today's contacts into companies, the Inbound list and Assign to company. *You see:* BDO's people and everyone across every company. *Answers:* who do we know, where, and how strong is the relationship?

**Phase 3. Deals.** The company Deals board, the whole-pipeline board, the deal page, moving a deal between stages (drag or a stage picker), and the stage history. *You see:* BDO's three deals in their columns and the total under them. *Answers:* what are we selling, to whom, and how close is it?

**Phase 4. Actions.** The company Actions tab, the all-actions screen with Mine and Overdue, the overdue flag, the "no next step" mark on deals, and actions created from a linked meeting. *You see:* this week's follow-ups with owners and dates. *Answers:* what has to happen next, and is anything slipping?

**Phase 5. Dashboard.** The four headline numbers, pipeline by stage, weighted pipeline, monthly and quarterly forecast, won and lost with values, conversion between stages, meetings linked, overdue actions. *You see:* AJ's management dashboard with live numbers. *Answers:* how is the business tracking against the quarter?

**Phase 6. After it has run for a month.** Paste a spreadsheet to import companies or contacts in bulk; draft actions from a meeting's Fireflies summary for a tick to accept; a weekly email of overdue actions per owner; retiring the old per-person screens once nothing points at them.

## 7. The answers (Marrs, 14 October)

1. **Owners:** a dropdown of Marrs, Kristin, Shourov, Logen and AJ. Julian does not need the CRM. AJ is added to the console.
2. **Currency:** per deal.
3. **Partnership:** a deal type. A partnership console is the next design after the CRM.
4. **Stages:** Contacted, Discovery, Demo or pilot, Proposal, Negotiation, Won, Lost.
5. **Today's contacts:** start empty; the per-person lists stay readable at their old addresses.
6. **Access:** team only, never partners.
7. **The target list:** loaded with Marrs in a session; no bulk upload screen.
