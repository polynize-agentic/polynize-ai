/**
 * A COMPANY'S HISTORY, IN ORDER (D121). Pure.
 *
 * Marrs: "how do we deal with adding notes to a customer or a deal from Fireflies, and how do we
 * organise those chronologically?" One list, newest first, made of what people wrote (notes, calls,
 * emails), the meetings (with Fireflies' summary when there is one), and what the CRM saw happen (a
 * deal moving stage, an action done, a contact or deal added). Nothing here is stored twice: the
 * timeline is assembled from the records each time.
 */
import type { ActionRow, ContactRow, DealRow, MeetingRow, StageEvent } from './metrics';
import { stageLabel } from './schema';

export type NoteRow = {
  id: string;
  company_id: string;
  deal_id?: string | null;
  contact_id?: string | null;
  meeting_id?: string | null;
  kind: string;
  title?: string | null;
  body: string;
  occurred_at: string;
  source: string;
  created_by?: string | null;
  created_at: string;
};

export const NOTE_KINDS = [
  { id: 'note', label: 'Note' },
  { id: 'call', label: 'Call' },
  { id: 'email', label: 'Email' },
  { id: 'meeting', label: 'Meeting' },
] as const;

export type EntryGroup = 'note' | 'meeting' | 'activity';

export type Entry = {
  key: string;
  group: EntryGroup;
  /** Note, Call, Email, Meeting, Stage, Done, Added. */
  label: string;
  date: string;
  /** Tie-break inside a day: the moment it was recorded. */
  at: string;
  title: string;
  body?: string;
  url?: string;
  deal_id?: string;
  contact_id?: string;
  by?: string;
  source?: string;
  /** Present on entries a person wrote, so they can be edited or removed. */
  note_id?: string;
};

export function buildTimeline(input: {
  notes: NoteRow[];
  meetings: MeetingRow[];
  events: StageEvent[];
  actions: ActionRow[];
  contacts: ContactRow[];
  deals: DealRow[];
}): Entry[] {
  const { notes, meetings, events, actions, contacts, deals } = input;
  const dealName = new Map(deals.map((d) => [d.id, d.name]));
  const out: Entry[] = [];
  const meetingNote = new Map<string, NoteRow>();
  for (const n of notes) if (n.meeting_id) meetingNote.set(n.meeting_id, n);

  for (const n of notes) {
    if (n.meeting_id) continue;
    const kind = NOTE_KINDS.find((k) => k.id === n.kind);
    out.push({
      key: `n-${n.id}`,
      group: n.kind === 'meeting' ? 'meeting' : 'note',
      label: kind?.label ?? 'Note',
      date: n.occurred_at.slice(0, 10),
      at: n.created_at,
      title: n.title || (kind?.label ?? 'Note'),
      body: n.body,
      ...(n.deal_id ? { deal_id: n.deal_id } : {}),
      ...(n.contact_id ? { contact_id: n.contact_id } : {}),
      ...(n.created_by ? { by: n.created_by } : {}),
      source: n.source,
      note_id: n.id,
    });
  }
  for (const m of meetings) {
    const n = meetingNote.get(m.id);
    out.push({
      key: `m-${m.id}`,
      group: 'meeting',
      label: 'Meeting',
      date: (m.met_at ?? m.created_at).slice(0, 10),
      at: m.created_at,
      title: m.title,
      ...(n?.body ? { body: n.body } : {}),
      url: m.url,
      ...(n?.deal_id ? { deal_id: n.deal_id } : {}),
      source: n?.source ?? 'link',
      ...(n ? { note_id: n.id } : {}),
    });
  }
  for (const e of events) {
    out.push({
      key: `s-${e.deal_id}-${e.at}`,
      group: 'activity',
      label: 'Stage',
      date: e.at.slice(0, 10),
      at: e.at,
      title: `${dealName.get(e.deal_id) ?? 'A deal'} moved to ${stageLabel(e.stage)}`,
      deal_id: e.deal_id,
    });
  }
  for (const a of actions) {
    if (a.status !== 'done' || !a.completed_at) continue;
    out.push({
      key: `a-${a.id}`,
      group: 'activity',
      label: 'Done',
      date: a.completed_at.slice(0, 10),
      at: a.completed_at,
      title: a.task,
      ...(a.deal_id ? { deal_id: a.deal_id } : {}),
      ...(a.owner ? { by: a.owner } : {}),
    });
  }
  for (const c of contacts) {
    out.push({
      key: `c-${c.id}`,
      group: 'activity',
      label: 'Added',
      date: c.created_at.slice(0, 10),
      at: c.created_at,
      title: `${[c.first_name, c.last_name].filter(Boolean).join(' ')} added as a contact`,
      contact_id: c.id,
    });
  }
  return out.sort((a, b) => b.date.localeCompare(a.date) || b.at.localeCompare(a.at));
}

/** Only what touches one deal: its notes, its meetings' notes, its stage moves and its actions. */
export function forDeal(entries: Entry[], dealId: string): Entry[] {
  return entries.filter((e) => e.deal_id === dealId);
}

/** "October 2026", for the month headings on the timeline. */
export function monthHeading(date: string): string {
  const [y, m] = date.split('-').map(Number);
  if (!y || !m) return date;
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString('en-AU', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/** The text a Fireflies meeting writes into History: the overview, then the action items. */
export function meetingNoteBody(s: { overview?: string; actionItems?: string } | null): string | undefined {
  if (!s) return undefined;
  const parts = [s.overview, s.actionItems ? `Action items\n${s.actionItems}` : undefined].filter(Boolean);
  return parts.length ? parts.join('\n\n').slice(0, 12000) : undefined;
}
