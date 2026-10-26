/**
 * PAM, THE CRM'S ASSISTANT (D126). Server only.
 *
 * Marrs, on the suggestions board: "An agent chat... that can do the creation for you and potentially
 * even pull data from external sources on particular clients and businesses... search the web for data,
 * potentially fetch emails or contacts from Fireflies conversations." And on the AI service: "if we
 * can't use this Claude account... let's see if we can get OpenRouter set up." The Claude subscription
 * is for a person using Claude, not for powering a product, so Pam runs on OpenRouter, which every AI
 * feature in the console already uses: no new account or key.
 *
 * WHAT SHE CAN DO. Read the CRM (find companies, open one with its people, deals, actions and history),
 * search the web with sources, and read the team's recent Fireflies meetings and their summaries.
 *
 * WHAT SHE CANNOT DO: change anything herself. Every change she wants to make comes back as a proposal
 * the person approves with one click, through the same routes the forms use, so each record still
 * carries who added it. A wrong guess from a model costs a dismissed card, never a wrong record.
 */
import { tryLoadCrm, type CrmData } from './records';
import { COMPANY_FIELDS, CONTACT_FIELDS, optionLabel, ownerName, isOpenStage, stageLabel, CRM_TEAM, COMPANY_STATUSES, CONTACT_ROLES } from './schema';
import { fetchRecentMeetings, fetchMeetingSummary, isFirefliesConfigured, isInternal, transcriptUrl } from './fireflies';
import { NO_EM_DASH_INSTRUCTION } from '../em-dash';

const URL_ = 'https://openrouter.ai/api/v1/chat/completions';

/** Pam's model: her own setting, else the one April drafts with, else a fast model that uses tools well. */
export function pamModel(): string {
  return process.env.PAM_MODEL || process.env.SCRIPT_MODEL || 'google/gemini-3.5-flash';
}

export type PamMessage = { role: 'user' | 'assistant'; content: string };

/** A change Pam wants to make. Nothing happens until a person presses Apply on it. */
export type Proposal =
  | { type: 'create_company'; summary: string; fields: Record<string, string> }
  | { type: 'update_company'; summary: string; company_id: string; company: string; fields: Record<string, string> }
  | { type: 'add_contact'; summary: string; company_id: string; company: string; fields: Record<string, string> }
  | { type: 'update_contact'; summary: string; contact_id: string; company_id: string; company: string; person: string; fields: Record<string, string> }
  | { type: 'add_note'; summary: string; company_id: string; company: string; body: string; occurred_at?: string; kind?: string }
  | { type: 'add_action'; summary: string; company_id: string; company: string; fields: Record<string, string> };

export type PamReply = { reply: string; proposals: Proposal[]; used: string[]; sources: { title: string; url: string }[] };

/* ------------------------------------------------------------------ the tools she is given */

const COMPANY_KEYS = COMPANY_FIELDS.filter((f) => f.key !== 'owner').map((f) => f.key);
const CONTACT_KEYS = CONTACT_FIELDS.filter((f) => f.key !== 'company_id' && f.key !== 'owner').map((f) => f.key);
const ACTION_KEYS = ['task', 'due', 'owner', 'priority', 'notes'];

/**
 * THE FIELDS WITH THEIR MEANINGS, not just their keys. The first live test put BDO's headcount into
 * "estimated Polynize users" because all she was given was `est_users`. A key she can read the meaning
 * of is a key she fills correctly.
 */
const glossary = (fields: typeof COMPANY_FIELDS, keys: string[]) =>
  fields.filter((f) => keys.includes(f.key)).map((f) => `${f.key} (${f.label}${f.options ? `: one of ${f.options.map((o) => o.id).join(', ')}` : ''})`).join('; ');

/** Only the fields that exist survive into a proposal, so the card shows exactly what Apply will save. */
function onlyKeys(fields: Record<string, string>, keys: string[]): Record<string, string> {
  return Object.fromEntries(Object.entries(fields).filter(([k]) => keys.includes(k)));
}

const TOOLS = [
  fn('find_companies', 'Search the CRM for companies by name, region, industry or owner. Use before opening one.', {
    query: { type: 'string', description: 'Words to look for; empty lists every company.' },
  }),
  fn('open_company', 'Everything the CRM holds about one company: profile, contacts, deals, open actions and recent history.', {
    company_id: { type: 'string' },
  }, ['company_id']),
  fn('pipeline_overview', 'The whole pipeline in brief: companies by status and owner, open deals by stage, overdue actions.', {}),
  fn('search_web', 'Search the public web and return findings with their sources. Use for company facts (headcount, headquarters, regions, leadership, recent news) and public roles of named people.', {
    question: { type: 'string', description: 'What to find out, specifically.' },
  }, ['question']),
  fn('list_meetings', "The team's recent Fireflies meetings: title, date, who was in them from outside Polynize, and a short summary.", {
    search: { type: 'string', description: 'Optional words to match in the title or an attendee address, such as a company name or domain.' },
  }),
  fn('meeting_summary', "One Fireflies meeting's overview and action items.", { meeting_id: { type: 'string' } }, ['meeting_id']),
  fn('propose_company', 'Propose adding a new company. A person approves it before anything is saved.', {
    summary: { type: 'string', description: 'One line saying what this adds and why.' },
    fields: { type: 'object', description: `Company fields, name required. Fields: ${glossary(COMPANY_FIELDS, COMPANY_KEYS)}. size is the number of employees; est_users is how many people at the company could use Polynize, which is NOT the headcount and should be left out unless someone has said it.` },
  }, ['summary', 'fields']),
  fn('propose_company_update', 'Propose filling in or correcting an existing company. Include only the fields that change.', {
    summary: { type: 'string' },
    company_id: { type: 'string' },
    fields: { type: 'object', description: `Only the fields that change. Fields: ${glossary(COMPANY_FIELDS, COMPANY_KEYS)}. size is the number of employees; est_users is how many could use Polynize, NOT the headcount.` },
  }, ['summary', 'company_id', 'fields']),
  fn('propose_contact', 'Propose adding a person at a company.', {
    summary: { type: 'string' },
    company_id: { type: 'string' },
    fields: { type: 'object', description: `first_name required. Fields: ${glossary(CONTACT_FIELDS, CONTACT_KEYS)}.` },
  }, ['summary', 'company_id', 'fields']),
  fn('propose_contact_update', 'Propose filling in or correcting a person who is already in the CRM. Use this, never propose_contact, when the person exists (open_company lists them with their contact_id).', {
    summary: { type: 'string' },
    contact_id: { type: 'string' },
    fields: { type: 'object', description: `Only the fields that change. Fields: ${glossary(CONTACT_FIELDS, CONTACT_KEYS)}.` },
  }, ['summary', 'contact_id', 'fields']),
  fn('propose_note', "Propose adding a dated note to a company's History, for example a meeting summary.", {
    summary: { type: 'string' },
    company_id: { type: 'string' },
    body: { type: 'string' },
    occurred_at: { type: 'string', description: 'YYYY-MM-DD, the day it happened.' },
    kind: { type: 'string', description: 'note, call, email or meeting.' },
  }, ['summary', 'company_id', 'body']),
  fn('propose_action', 'Propose a next step on a company.', {
    summary: { type: 'string' },
    company_id: { type: 'string' },
    fields: { type: 'object', description: 'Keys: task (required), due (YYYY-MM-DD), owner (a team email), priority (high, medium, low).' },
  }, ['summary', 'company_id', 'fields']),
];

function fn(name: string, description: string, properties: Record<string, unknown>, required: string[] = []) {
  return { type: 'function', function: { name, description, parameters: { type: 'object', properties, required } } };
}

/* ------------------------------------------------------------------ running them */

/**
 * `seen` is every piece of text she has actually read this turn (search findings, meeting summaries,
 * CRM records), so an email address she proposes can be checked against it. `searches` caps the web.
 */
type Ctx = { data: CrmData; proposals: Proposal[]; sources: { title: string; url: string }[]; me: string; seen: string[]; searches: number };

/** Two web searches a question: the second live test searched five times and never answered. */
const MAX_SEARCHES = 2;

/**
 * NO GUESSED EMAILS. The second live test proposed jill.holme@bdo.com.au, the company's usual pattern,
 * which none of its sources showed. An address survives into a proposal only if it appears word for
 * word in something she read this turn; otherwise it is removed and the card says so.
 */
function keepSeenEmail(fields: Record<string, string>, ctx: Ctx): { fields: Record<string, string>; dropped?: string } {
  const email = fields.email?.trim().toLowerCase();
  if (!email) return { fields };
  if (ctx.seen.some((s) => s.toLowerCase().includes(email))) return { fields };
  const { email: _drop, ...rest } = fields;
  return { fields: rest, dropped: email };
}

function nameOf(d: CrmData, id: string): string {
  return d.companies.find((c) => c.id === id)?.name ?? '';
}

function clip(s: unknown, n: number): string {
  const t = typeof s === 'string' ? s : s === null || s === undefined ? '' : String(s);
  return t.length > n ? `${t.slice(0, n)}…` : t;
}

function stringFields(x: unknown): Record<string, string> {
  if (!x || typeof x !== 'object') return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(x as Record<string, unknown>)) {
    if (v === null || v === undefined || v === '') continue;
    out[k] = String(v);
  }
  return out;
}

async function run(name: string, args: Record<string, unknown>, ctx: Ctx): Promise<unknown> {
  const d = ctx.data;
  switch (name) {
    case 'find_companies': {
      const q = String(args.query ?? '').toLowerCase().trim();
      return d.companies
        .filter((c) => !q || `${c.name} ${c.regions ?? ''} ${c.industry ?? ''} ${ownerName(c.owner)}`.toLowerCase().includes(q))
        .slice(0, 40)
        .map((c) => ({
          id: c.id,
          name: c.name,
          status: optionLabel(COMPANY_STATUSES, c.status),
          owner: ownerName(c.owner),
          region: c.regions ?? '',
          open_deals: d.deals.filter((x) => x.company_id === c.id && isOpenStage(x.stage)).length,
        }));
    }
    case 'open_company': {
      const id = String(args.company_id ?? '');
      const c = d.companies.find((x) => x.id === id);
      if (!c) return { error: 'No company with that id. Use find_companies first.' };
      const profile: Record<string, string> = {};
      for (const f of COMPANY_FIELDS) {
        const v = c[f.key];
        if (v !== null && v !== undefined && v !== '') profile[f.label] = f.options ? optionLabel(f.options, v) : f.kind === 'owner' ? ownerName(String(v)) : clip(v, 600);
      }
      return {
        id,
        profile,
        contacts: d.contacts.filter((x) => x.company_id === id).map((x) => ({ contact_id: x.id, name: [x.first_name, x.last_name].filter(Boolean).join(' '), title: x.title ?? '', email: x.email ?? '', location: x.location ?? '', role: optionLabel(CONTACT_ROLES, x.role) })),
        deals: d.deals.filter((x) => x.company_id === id).map((x) => ({ name: x.name, stage: stageLabel(x.stage), value: x.value, currency: x.currency })),
        open_actions: d.actions.filter((x) => x.company_id === id && x.status !== 'done').map((x) => ({ task: x.task, due: x.due ?? '', owner: ownerName(x.owner) })),
        history: d.notes.filter((x) => x.company_id === id).slice(0, 8).map((x) => ({ date: x.occurred_at, title: x.title ?? x.kind, text: clip(x.body, 700) })),
      };
    }
    case 'pipeline_overview': {
      const byStatus: Record<string, number> = {};
      const byOwner: Record<string, number> = {};
      for (const c of d.companies) {
        const st = optionLabel(COMPANY_STATUSES, c.status) || 'No status';
        byStatus[st] = (byStatus[st] ?? 0) + 1;
        const o = ownerName(c.owner);
        byOwner[o] = (byOwner[o] ?? 0) + 1;
      }
      const open = d.deals.filter((x) => isOpenStage(x.stage));
      return {
        companies: d.companies.length,
        by_status: byStatus,
        by_owner: byOwner,
        open_deals: open.map((x) => ({ name: x.name, company: nameOf(d, x.company_id), stage: stageLabel(x.stage), value: x.value, currency: x.currency })),
        overdue_actions: d.actions.filter((x) => x.status !== 'done' && x.due && x.due < new Date().toISOString().slice(0, 10)).length,
      };
    }
    case 'search_web':
      if (ctx.searches >= MAX_SEARCHES) return { error: `That is the ${MAX_SEARCHES} web searches for this question. Answer with what you have, and say what you could not find.` };
      ctx.searches += 1;
      return searchWeb(String(args.question ?? ''), ctx);
    case 'list_meetings': {
      if (!isFirefliesConfigured()) return { error: 'Fireflies is not connected.' };
      const q = String(args.search ?? '').toLowerCase().trim();
      const ms = await fetchRecentMeetings({ limit: 50 });
      return ms
        .filter((m) => !q || m.title.toLowerCase().includes(q) || m.attendees.some((a) => a.includes(q)))
        .slice(0, 20)
        .map((m) => ({
          id: m.id,
          title: m.title,
          date: m.dateString?.slice(0, 10) ?? '',
          organiser: m.organizerEmail ?? '',
          outside_attendees: m.attendees.filter((a) => !isInternal(a)),
          summary: clip(m.summary, 400),
          link: transcriptUrl(m.id),
        }));
    }
    case 'meeting_summary':
      return (await fetchMeetingSummary(String(args.meeting_id ?? ''))) ?? { error: 'Fireflies gave no summary for that meeting.' };
    case 'propose_company': {
      const fields = stringFields(args.fields);
      if (!fields.name) return { error: 'A new company needs a name.' };
      ctx.proposals.push({ type: 'create_company', summary: String(args.summary ?? `Add ${fields.name}`), fields: onlyKeys(fields, [...COMPANY_KEYS, 'owner']) });
      return { ok: 'Shown to the person to approve. It is not saved until they do.' };
    }
    case 'propose_contact_update': {
      const contact = d.contacts.find((x) => x.id === String(args.contact_id ?? ''));
      if (!contact) return { error: 'No contact with that id. open_company lists them.' };
      const name_ = [contact.first_name, contact.last_name].filter(Boolean).join(' ');
      ctx.proposals.push({
        type: 'update_contact',
        summary: String(args.summary ?? `Update ${name_}`),
        contact_id: contact.id,
        company_id: contact.company_id,
        company: nameOf(d, contact.company_id),
        person: name_,
        ...(() => {
          const g = keepSeenEmail(onlyKeys(stringFields(args.fields), CONTACT_KEYS), ctx);
          return { fields: g.fields, ...(g.dropped ? { summary: `${String(args.summary ?? `Update ${name_}`)} (Email left out: ${g.dropped} was not in any source.)` } : {}) };
        })(),
      });
      return { ok: 'Shown to the person to approve. It is not saved until they do.' };
    }
    case 'propose_company_update':
    case 'propose_contact':
    case 'propose_note':
    case 'propose_action': {
      const company_id = String(args.company_id ?? '');
      const company = nameOf(d, company_id);
      if (!company) return { error: 'No company with that id. Use find_companies first.' };
      const summary = String(args.summary ?? '');
      if (name === 'propose_company_update') ctx.proposals.push({ type: 'update_company', summary, company_id, company, fields: onlyKeys(stringFields(args.fields), [...COMPANY_KEYS, 'owner']) });
      if (name === 'propose_contact') {
        const g = keepSeenEmail(onlyKeys(stringFields(args.fields), CONTACT_KEYS), ctx);
        ctx.proposals.push({ type: 'add_contact', summary: g.dropped ? `${summary} (Email left out: ${g.dropped} was not in any source.)` : summary, company_id, company, fields: g.fields });
      }
      if (name === 'propose_action') ctx.proposals.push({ type: 'add_action', summary, company_id, company, fields: onlyKeys(stringFields(args.fields), ACTION_KEYS) });
      if (name === 'propose_note')
        ctx.proposals.push({ type: 'add_note', summary, company_id, company, body: String(args.body ?? ''), occurred_at: args.occurred_at ? String(args.occurred_at) : undefined, kind: args.kind ? String(args.kind) : undefined });
      return { ok: 'Shown to the person to approve. It is not saved until they do.' };
    }
    default:
      return { error: `Unknown tool ${name}` };
  }
}

/** A web search as its own small request, with OpenRouter's web plugin: findings plus their sources. */
async function searchWeb(question: string, ctx: Ctx): Promise<unknown> {
  if (!question.trim()) return { error: 'Ask a specific question.' };
  const res = await call({
    model: pamModel(),
    max_tokens: 3000,
    // Exa, not the model's own search: Google's grounding hands back unreadable redirect links with no
    // titles (seen in the first live test), where Exa gives the page's real address and title.
    plugins: [{ id: 'web', engine: 'exa', max_results: 5 }],
    messages: [
      { role: 'system', content: `Answer from the web results only, briefly and factually, naming the source for each fact. If the results do not answer it, say so. ${NO_EM_DASH_INSTRUCTION}` },
      { role: 'user', content: question },
    ],
  });
  const msg = res.choices?.[0]?.message;
  const cites = (msg?.annotations ?? [])
    .map((a) => a.url_citation)
    .filter((c): c is { url: string; title?: string } => !!c?.url)
    .map((c) => ({ title: c.title || c.url, url: c.url }));
  for (const c of cites) if (!ctx.sources.some((s) => s.url === c.url) && ctx.sources.length < 8) ctx.sources.push(c);
  return { findings: msg?.content ?? '', sources: cites };
}

/* ------------------------------------------------------------------ the conversation */

type ApiMessage = { role: string; content?: string | null; tool_calls?: ToolCall[]; tool_call_id?: string };
type ToolCall = { id: string; type: 'function'; function: { name: string; arguments: string } };
type ApiResponse = {
  choices?: { message?: { content?: string | null; tool_calls?: ToolCall[]; annotations?: { url_citation?: { url: string; title?: string } }[] } }[];
  error?: { message?: string };
};

async function call(body: Record<string, unknown>): Promise<ApiResponse> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OpenRouter is not connected (OPENROUTER_API_KEY is not set).');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90_000);
  try {
    const res = await fetch(URL_, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': process.env.OPENROUTER_REFERER ?? 'https://polynize.ai',
        'X-Title': 'Polynize CRM: Pam',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const json = (await res.json().catch(() => ({}))) as ApiResponse;
    if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${json.error?.message ?? 'no detail'}`);
    return json;
  } finally {
    clearTimeout(timer);
  }
}

function systemPrompt(me: string, companyName: string | null, companyId: string | null): string {
  const who = ownerName(me);
  const team = CRM_TEAM.map((m) => `${m.name} (${m.email})`).join(', ');
  return `You are Pam, the assistant inside Polynize's CRM. You are talking to ${who}. Polynize sells an AI workforce-capability platform to large organisations, often through partners; the CRM tracks target companies, the people at them, deals, next steps and a dated history.

The team: ${team}. Today is ${new Date().toISOString().slice(0, 10)}.
${companyName ? `${who} is looking at ${companyName} (company id ${companyId}). Assume questions are about it unless they say otherwise.` : ''}

HOW YOU WORK
- Look before you answer: use find_companies and open_company rather than guessing what the CRM holds.
- For facts about a company or a person from outside the CRM, use search_web and say where each fact came from. Never invent a number, a name or an email address. A guessed email is worse than none.
- For meetings, use list_meetings and meeting_summary.
- You never change the CRM yourself. To add or change something, call the propose_ tools; each becomes a card ${who} approves with one click. Propose only what you have a source for, fill only the fields you know, and say in one line what each proposal does. Do not propose changes to a field that already has a value unless asked to correct it.
- Ask the web once with everything you need in one question where you can; each search takes time.
- Before proposing a new person, check open_company: if they are already there, even half filled in, use propose_contact_update.
- Write plain text only: no asterisks, no hashes, no markdown. The chat shows text exactly as written. Short sentences, a few lines, or a simple list with hyphens. Australian spelling. ${NO_EM_DASH_INSTRUCTION}`;
}

/**
 * One turn: the conversation so far in, Pam's reply plus any proposals out. Up to eight rounds of tool
 * use, which is room for "find the company, open it, search the web twice, check a meeting, propose".
 */
export async function askPam(input: { messages: PamMessage[]; me: string; companyId?: string }): Promise<PamReply> {
  const data = await tryLoadCrm();
  if (!data) throw new Error('The CRM tables are not set up yet.');
  const ctx: Ctx = { data, proposals: [], sources: [], me: input.me, seen: [], searches: 0 };
  const company = input.companyId ? data.companies.find((c) => c.id === input.companyId) : undefined;
  const msgs: ApiMessage[] = [
    { role: 'system', content: systemPrompt(input.me, company?.name ?? null, company?.id ?? null) },
    ...input.messages.slice(-20).map((m) => ({ role: m.role, content: m.content.slice(0, 6000) })),
  ];
  const used: string[] = [];
  for (let round = 0; round < 8; round += 1) {
    const res = await call({ model: pamModel(), max_tokens: 4000, messages: msgs, tools: TOOLS, tool_choice: 'auto' });
    const msg = res.choices?.[0]?.message;
    if (!msg) throw new Error('Pam got no answer back.');
    const calls = msg.tool_calls ?? [];
    if (!calls.length) {
      // Plain text in the chat: any bold or heading marks a model still adds are taken out.
      const reply = (msg.content ?? '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/^#{1,6}\s+/gm, '').trim();
      return { reply: reply || 'Done.', proposals: ctx.proposals, used, sources: ctx.sources };
    }
    msgs.push({ role: 'assistant', content: msg.content ?? null, tool_calls: calls });
    for (const tc of calls) {
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(tc.function.arguments || '{}') as Record<string, unknown>;
      } catch {
        args = {};
      }
      used.push(tc.function.name);
      let result: unknown;
      try {
        result = await run(tc.function.name, args, ctx);
      } catch (err) {
        result = { error: err instanceof Error ? err.message : 'That did not work.' };
      }
      if (!tc.function.name.startsWith('propose')) ctx.seen.push(JSON.stringify(result));
      msgs.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result).slice(0, 24000) });
    }
  }
  // She ran long: one last turn with no tools, so the person always gets an answer from what she found.
  msgs.push({ role: 'user', content: 'Stop using tools now. In a few plain lines, tell me what you found, what you proposed, and anything you could not find.' });
  const last = await call({ model: pamModel(), max_tokens: 2000, messages: msgs });
  const text = (last.choices?.[0]?.message?.content ?? '').replace(/\*\*(.+?)\*\*/g, '$1').trim();
  return { reply: text || 'I found what I could; the proposals are below.', proposals: ctx.proposals, used, sources: ctx.sources };
}
