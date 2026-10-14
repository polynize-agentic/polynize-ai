/**
 * THE COMPANY-FIRST CRM, READ AND WRITTEN (D120). Server only.
 *
 * Postgres, not the bucket: five people edit these records, and a row-level update cannot overwrite
 * someone else's edit the way a read-merge-write of a shared file can. The tables come from
 * migration 0015; until it is applied every read reports `notReady` and the screens say so instead of
 * failing.
 */
import { supabaseService } from '../supabase';
import {
  TABLES,
  cleanValues,
  stageProbability,
  isOpenStage,
  DEFAULT_CURRENCY,
  type RecordKind,
} from './schema';
import type { ActionRow, CompanyRow, ContactRow, DealRow, MeetingRow, StageEvent } from './metrics';
import type { NoteRow } from './history';

export class CrmNotReady extends Error {
  constructor() {
    super('The CRM tables are not set up yet (migration 0015).');
  }
}

function isMissingTable(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === '42P01' || error.code === 'PGRST205' || /relation .* does not exist|could not find the table/i.test(error.message ?? '');
}

function fail(where: string, error: { code?: string; message?: string }): never {
  if (isMissingTable(error)) throw new CrmNotReady();
  throw new Error(`[crm] ${where} failed: ${error.message ?? error.code ?? 'unknown error'}`);
}

/* ------------------------------------------------------------------ reads */

export type CrmData = {
  companies: CompanyRow[];
  contacts: ContactRow[];
  deals: DealRow[];
  actions: ActionRow[];
  meetings: MeetingRow[];
  events: StageEvent[];
  /** History notes (D121). Empty until migration 0016 is run, rather than taking the CRM down. */
  notes: NoteRow[];
};

async function all<T>(table: string, order: string, companyId?: string): Promise<T[]> {
  let q = supabaseService().from(table).select('*').order(order, { ascending: order !== 'updated_at' && order !== 'met_at' });
  if (companyId) q = q.eq('company_id', companyId);
  const { data, error } = await q.limit(5000);
  if (error) fail(`read ${table}`, error);
  return (data ?? []) as T[];
}

/** Everything, or everything about one company. Small enough at this scale to read whole. */
export async function loadCrm(companyId?: string): Promise<CrmData> {
  const [companies, contacts, deals, actions, meetings, events, notes] = await Promise.all([
    companyId
      ? (async () => {
          const { data, error } = await supabaseService().from('crm_companies').select('*').eq('id', companyId).limit(1);
          if (error) fail('read company', error);
          return (data ?? []) as CompanyRow[];
        })()
      : all<CompanyRow>('crm_companies', 'name'),
    all<ContactRow>('crm_contacts', 'first_name', companyId),
    all<DealRow>('crm_deals', 'updated_at', companyId),
    all<ActionRow>('crm_actions', 'due', companyId),
    all<MeetingRow>('crm_meetings', 'met_at', companyId),
    /**
     * IN THE SAME ROUND (D121). The stage history used to wait for the deals to come back first, which
     * doubled the time every CRM page spent on the database. A company's history is now filtered
     * through its deals in one query instead.
     */
    (async () => {
      let q = supabaseService()
        .from('crm_deal_stages')
        .select(companyId ? 'deal_id, stage, at, crm_deals!inner(company_id)' : 'deal_id, stage, at')
        .order('at', { ascending: true });
      if (companyId) q = q.eq('crm_deals.company_id', companyId);
      const { data, error } = await q.limit(20000);
      if (error) fail('read stage history', error);
      return ((data ?? []) as unknown as { deal_id: string; stage: string; at: string }[]).map((e) => ({ deal_id: e.deal_id, stage: e.stage, at: e.at }));
    })(),
    (async () => {
      let q = supabaseService().from('crm_notes').select('*').order('occurred_at', { ascending: false });
      if (companyId) q = q.eq('company_id', companyId);
      const { data, error } = await q.limit(5000);
      if (error) {
        if (isMissingTable(error)) return [] as NoteRow[];
        fail('read notes', error);
      }
      return (data ?? []) as NoteRow[];
    })(),
  ]);
  return { companies, contacts, deals, actions, meetings, events, notes };
}

export async function getRecord(kind: RecordKind, id: string): Promise<Record<string, unknown> | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await supabaseService().from(TABLES[kind]).select('*').eq('id', id).limit(1);
  if (error) fail(`read ${kind}`, error);
  return (data?.[0] as Record<string, unknown>) ?? null;
}

/* ------------------------------------------------------------------ writes */

export type WriteResult = { ok: true; id: string } | { ok: false; error: string; status: number };

async function logStage(dealId: string, stage: string, by: string) {
  const { error } = await supabaseService().from('crm_deal_stages').insert({ deal_id: dealId, stage, by });
  // History is best effort: losing one row costs one conversion data point, never the edit.
  if (error) console.error('[crm] stage history write failed:', error.message);
}

export async function createRecord(kind: RecordKind, input: Record<string, unknown>, by: string): Promise<WriteResult> {
  const { values, missing } = cleanValues(kind, input, false);
  if (missing.length) return { ok: false, error: `Fill in: ${missing.join(', ')}`, status: 400 };
  const row: Record<string, unknown> = { ...values, created_by: by };
  // The person entering it leads it unless someone else was chosen (Marrs: "who puts it in").
  if (!row.owner) row.owner = by;
  if (kind === 'company' && !row.status) row.status = 'target';
  if (kind === 'deal') {
    if (!row.stage) row.stage = 'contacted';
    if (!row.currency) row.currency = DEFAULT_CURRENCY;
    if (row.probability === null || row.probability === undefined) row.probability = stageProbability(row.stage as string) ?? null;
    if (!isOpenStage(row.stage as string)) row.closed_at = new Date().toISOString();
  }
  if (kind === 'action') {
    if (!row.status) row.status = 'todo';
    if (!row.source) row.source = 'manual';
    if (row.status === 'done') row.completed_at = new Date().toISOString();
  }
  for (const k of Object.keys(row)) if (row[k] === null) delete row[k];
  const { data, error } = await supabaseService().from(TABLES[kind]).insert(row).select('id').limit(1);
  if (error) {
    if (isMissingTable(error)) return { ok: false, error: new CrmNotReady().message, status: 503 };
    console.error(`[crm] create ${kind} failed:`, error.message);
    return { ok: false, error: 'Could not save that.', status: 500 };
  }
  const id = String(data?.[0]?.id ?? '');
  if (kind === 'deal' && id) await logStage(id, row.stage as string, by);
  return { ok: true, id };
}

export async function updateRecord(kind: RecordKind, id: string, input: Record<string, unknown>, by: string): Promise<WriteResult> {
  const prior = await getRecord(kind, id).catch((err) => {
    if (err instanceof CrmNotReady) return null;
    throw err;
  });
  if (!prior) return { ok: false, error: 'Not found.', status: 404 };
  const { values, missing } = cleanValues(kind, input, true);
  if (missing.length) return { ok: false, error: `${missing.join(', ')} cannot be empty.`, status: 400 };
  const patch: Record<string, unknown> = { ...values, updated_at: new Date().toISOString() };
  const stageMoved = kind === 'deal' && typeof values.stage === 'string' && values.stage !== prior.stage;
  if (stageMoved) {
    // A new stage brings its probability unless one was set in the same edit.
    if (!('probability' in input)) patch.probability = stageProbability(values.stage as string) ?? prior.probability;
    patch.closed_at = isOpenStage(values.stage as string) ? null : new Date().toISOString();
  }
  if (kind === 'action' && 'status' in values) {
    patch.completed_at = values.status === 'done' ? (prior.completed_at ?? new Date().toISOString()) : null;
  }
  const { error } = await supabaseService().from(TABLES[kind]).update(patch).eq('id', id);
  if (error) {
    console.error(`[crm] update ${kind} failed:`, error.message);
    return { ok: false, error: 'Could not save that.', status: 500 };
  }
  if (stageMoved) await logStage(id, values.stage as string, by);
  return { ok: true, id };
}

export async function deleteRecord(kind: RecordKind, id: string): Promise<WriteResult> {
  const { error } = await supabaseService().from(TABLES[kind]).delete().eq('id', id);
  if (error) {
    console.error(`[crm] delete ${kind} failed:`, error.message);
    return { ok: false, error: 'Could not delete that.', status: 500 };
  }
  return { ok: true, id };
}

/* ------------------------------------------------------------------ meeting links */

export async function addMeeting(
  companyId: string,
  m: { title: string; url: string; met_at?: string; fireflies_id?: string },
  by: string
): Promise<WriteResult> {
  const title = m.title.trim().slice(0, 200);
  const url = m.url.trim().slice(0, 2000);
  if (!title || !/^https?:\/\//i.test(url)) return { ok: false, error: 'A meeting needs a title and a link.', status: 400 };
  const row: Record<string, unknown> = { company_id: companyId, title, url, created_by: by };
  if (m.met_at && /^\d{4}-\d{2}-\d{2}$/.test(m.met_at)) row.met_at = m.met_at;
  if (m.fireflies_id) row.fireflies_id = m.fireflies_id.slice(0, 100);
  const { data, error } = await supabaseService().from('crm_meetings').insert(row).select('id').limit(1);
  if (error) {
    if (isMissingTable(error)) return { ok: false, error: new CrmNotReady().message, status: 503 };
    console.error('[crm] meeting link failed:', error.message);
    return { ok: false, error: 'Could not link that meeting.', status: 500 };
  }
  return { ok: true, id: String(data?.[0]?.id ?? '') };
}

export async function deleteMeeting(id: string): Promise<WriteResult> {
  const { error } = await supabaseService().from('crm_meetings').delete().eq('id', id);
  if (error) return { ok: false, error: 'Could not remove that link.', status: 500 };
  return { ok: true, id };
}

/** loadCrm, or null when the tables do not exist yet so the page can say so. */
export async function tryLoadCrm(companyId?: string): Promise<CrmData | null> {
  try {
    return await loadCrm(companyId);
  } catch (err) {
    if (err instanceof CrmNotReady) return null;
    throw err;
  }
}

/* ------------------------------------------------------------------ history notes (D121) */

const NOTE_KIND_IDS = new Set(['note', 'call', 'email', 'meeting']);
const UUID = /^[0-9a-f-]{36}$/i;

export async function addNote(
  n: { company_id: string; deal_id?: string; contact_id?: string; meeting_id?: string; kind?: string; title?: string; body: string; occurred_at?: string; source?: string },
  by: string
): Promise<WriteResult> {
  const body = (n.body ?? '').trim();
  if (!body) return { ok: false, error: 'Write the note first.', status: 400 };
  if (!UUID.test(n.company_id)) return { ok: false, error: 'Which company?', status: 400 };
  const row: Record<string, unknown> = {
    company_id: n.company_id,
    kind: NOTE_KIND_IDS.has(n.kind ?? '') ? n.kind : 'note',
    body: body.slice(0, 12000),
    source: n.source === 'fireflies' ? 'fireflies' : 'manual',
    created_by: by,
  };
  if (n.deal_id && UUID.test(n.deal_id)) row.deal_id = n.deal_id;
  if (n.contact_id && UUID.test(n.contact_id)) row.contact_id = n.contact_id;
  if (n.meeting_id && UUID.test(n.meeting_id)) row.meeting_id = n.meeting_id;
  if (n.title?.trim()) row.title = n.title.trim().slice(0, 200);
  if (n.occurred_at && /^\d{4}-\d{2}-\d{2}$/.test(n.occurred_at)) row.occurred_at = n.occurred_at;
  const { data, error } = await supabaseService().from('crm_notes').insert(row).select('id').limit(1);
  if (error) {
    if (isMissingTable(error)) return { ok: false, error: 'History needs its table: run migration 0016 in Supabase.', status: 503 };
    console.error('[crm] note write failed:', error.message);
    return { ok: false, error: 'Could not save the note.', status: 500 };
  }
  return { ok: true, id: String(data?.[0]?.id ?? '') };
}

export async function updateNote(id: string, patch: { body?: string; occurred_at?: string; title?: string }): Promise<WriteResult> {
  if (!UUID.test(id)) return { ok: false, error: 'Bad id.', status: 400 };
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.body !== undefined) {
    if (!patch.body.trim()) return { ok: false, error: 'A note cannot be empty.', status: 400 };
    row.body = patch.body.trim().slice(0, 12000);
  }
  if (patch.occurred_at && /^\d{4}-\d{2}-\d{2}$/.test(patch.occurred_at)) row.occurred_at = patch.occurred_at;
  if (patch.title !== undefined) row.title = patch.title.trim().slice(0, 200) || null;
  const { error } = await supabaseService().from('crm_notes').update(row).eq('id', id);
  if (error) return { ok: false, error: 'Could not save the note.', status: 500 };
  return { ok: true, id };
}

export async function deleteNote(id: string): Promise<WriteResult> {
  if (!UUID.test(id)) return { ok: false, error: 'Bad id.', status: 400 };
  const { error } = await supabaseService().from('crm_notes').delete().eq('id', id);
  if (error) return { ok: false, error: 'Could not delete the note.', status: 500 };
  return { ok: true, id };
}
