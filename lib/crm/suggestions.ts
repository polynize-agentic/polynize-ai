/**
 * THE SUGGESTIONS BOARD (D121). Server only.
 *
 * Marrs: "a feature request button... people can just type in something, and then it sends it to me
 * or keeps a log of suggestions... someone can like it if they think it's a good idea. After that, I
 * can tick it off when it's done... Ultimately, what I'll do is have an approve button."
 *
 * Anyone on the CRM team can suggest and like; only the operator (Marrs) approves, declines or marks
 * done. A new suggestion is emailed to him when email is switched on, and is on the board either way.
 */
import { supabaseService } from '../supabase';
import { sendEmail } from '../resend-client';
import { OPERATOR_EMAILS } from '../marketing/streams';
import { ownerName } from './schema';

export type SuggestionStatus = 'open' | 'approved' | 'done' | 'declined';
export const SUGGESTION_STATUSES: readonly { id: SuggestionStatus; label: string }[] = [
  { id: 'open', label: 'Suggested' },
  { id: 'approved', label: 'Approved' },
  { id: 'done', label: 'Done' },
  { id: 'declined', label: 'Not now' },
];

export type Suggestion = {
  id: string;
  body: string;
  status: SuggestionStatus;
  created_by: string;
  created_at: string;
  approved_at?: string | null;
  done_at?: string | null;
  likes: string[];
};

function missing(error: { code?: string; message?: string } | null): boolean {
  return !!error && (error.code === '42P01' || error.code === 'PGRST205' || /does not exist|could not find the table/i.test(error.message ?? ''));
}

export async function listSuggestions(): Promise<Suggestion[] | null> {
  const db = supabaseService();
  const [{ data: rows, error }, { data: likes, error: lerr }] = await Promise.all([
    db.from('console_requests').select('*').order('created_at', { ascending: false }).limit(500),
    db.from('console_request_likes').select('request_id, email').limit(10000),
  ]);
  if (missing(error) || missing(lerr)) return null;
  if (error) throw new Error(`[suggestions] read failed: ${error.message}`);
  const byReq = new Map<string, string[]>();
  for (const l of (likes ?? []) as { request_id: string; email: string }[]) {
    byReq.set(l.request_id, [...(byReq.get(l.request_id) ?? []), l.email]);
  }
  return ((rows ?? []) as Omit<Suggestion, 'likes'>[]).map((r) => ({ ...r, likes: byReq.get(r.id) ?? [] }));
}

export async function addSuggestion(body: string, by: string, origin: string): Promise<{ ok: boolean; error?: string }> {
  const text = body.trim().slice(0, 4000);
  if (text.length < 3) return { ok: false, error: 'Write the suggestion first.' };
  const { error } = await supabaseService().from('console_requests').insert({ body: text, created_by: by });
  if (error) {
    if (missing(error)) return { ok: false, error: 'The board needs its table: run migration 0016 in Supabase.' };
    return { ok: false, error: 'Could not save that.' };
  }
  // Best effort: the board is the record; the email is a nudge.
  for (const to of OPERATOR_EMAILS) {
    if (to === by) continue;
    void sendEmail({
      to,
      subject: `Console suggestion from ${ownerName(by)}`,
      text: `${ownerName(by)} suggested:\n\n${text}\n\n${origin}/console/crm/suggestions`,
      html: `<p><strong>${escapeHtml(ownerName(by))}</strong> suggested:</p><p style="white-space:pre-wrap">${escapeHtml(text)}</p><p><a href="${escapeHtml(origin)}/console/crm/suggestions">Open the board</a></p>`,
    }).catch((e) => console.error('[suggestions] email failed:', e instanceof Error ? e.message : e));
  }
  return { ok: true };
}

export async function toggleLike(id: string, email: string): Promise<boolean> {
  const db = supabaseService();
  const { data } = await db.from('console_request_likes').select('email').eq('request_id', id).eq('email', email).limit(1);
  if (data && data.length) {
    const { error } = await db.from('console_request_likes').delete().eq('request_id', id).eq('email', email);
    return !error;
  }
  const { error } = await db.from('console_request_likes').insert({ request_id: id, email });
  return !error;
}

export async function setStatus(id: string, status: SuggestionStatus): Promise<boolean> {
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { status, updated_at: now };
  if (status === 'approved') patch.approved_at = now;
  if (status === 'done') patch.done_at = now;
  if (status === 'open') {
    patch.approved_at = null;
    patch.done_at = null;
  }
  const { error } = await supabaseService().from('console_requests').update(patch).eq('id', id);
  return !error;
}

export async function deleteSuggestion(id: string): Promise<boolean> {
  const { error } = await supabaseService().from('console_requests').delete().eq('id', id);
  return !error;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
}
