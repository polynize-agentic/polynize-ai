/**
 * The suggestions board (D121). POST adds one. PATCH { id, like: true } toggles the caller's like;
 * PATCH { id, status } changes its state (Marrs only). DELETE ?id= removes one (Marrs, or its author
 * while it is still a suggestion).
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { crmUser } from '@/lib/crm/guard';
import { isOperator } from '@/lib/marketing/streams';
import { addSuggestion, deleteSuggestion, listSuggestions, setStatus, toggleLike, type SuggestionStatus } from '@/lib/crm/suggestions';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const STATUSES: SuggestionStatus[] = ['open', 'approved', 'built', 'question', 'done', 'declined'];
const UUID = /^[0-9a-f-]{36}$/i;

export async function POST(req: NextRequest) {
  const user = await crmUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const b = (await req.json().catch(() => null)) as { body?: string } | null;
  const r = await addSuggestion(b?.body ?? '', user.email, new URL(req.url).origin);
  return r.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: r.error }, { status: 400 });
}

export async function PATCH(req: NextRequest) {
  const user = await crmUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const b = (await req.json().catch(() => null)) as { id?: string; like?: boolean; status?: string } | null;
  if (!b?.id || !UUID.test(b.id)) return NextResponse.json({ error: 'bad request' }, { status: 400 });
  if (b.like) return (await toggleLike(b.id, user.email)) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'Could not save that.' }, { status: 500 });
  if (!isOperator(user.email)) return NextResponse.json({ error: 'Only Marrs can change that.' }, { status: 403 });
  if (!STATUSES.includes(b.status as SuggestionStatus)) return NextResponse.json({ error: 'bad status' }, { status: 400 });
  return (await setStatus(b.id, b.status as SuggestionStatus)) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'Could not save that.' }, { status: 500 });
}

export async function DELETE(req: NextRequest) {
  const user = await crmUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id') ?? '';
  if (!UUID.test(id)) return NextResponse.json({ error: 'bad request' }, { status: 400 });
  if (!isOperator(user.email)) {
    const mine = (await listSuggestions())?.find((s) => s.id === id);
    if (!mine || mine.created_by !== user.email || mine.status !== 'open') return NextResponse.json({ error: 'Only Marrs can remove that.' }, { status: 403 });
  }
  return (await deleteSuggestion(id)) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'Could not delete that.' }, { status: 500 });
}
