/**
 * The CRM's History notes (D121). POST adds one; PATCH ?id= edits its text or date; DELETE ?id=
 * removes it. Any of the CRM team can edit or remove a note: it is a shared record, like the rest.
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { crmUser } from '@/lib/crm/guard';
import { addNote, updateNote, deleteNote } from '@/lib/crm/records';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const user = await crmUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const b = (await req.json().catch(() => null)) as Record<string, string> | null;
  if (!b) return NextResponse.json({ error: 'bad request' }, { status: 400 });
  const r = await addNote(
    { company_id: b.company_id, deal_id: b.deal_id, contact_id: b.contact_id, kind: b.kind, title: b.title, body: b.body, occurred_at: b.occurred_at },
    user.email
  );
  return r.ok ? NextResponse.json({ id: r.id }) : NextResponse.json({ error: r.error }, { status: r.status });
}

export async function PATCH(req: NextRequest) {
  const user = await crmUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id') ?? '';
  const b = (await req.json().catch(() => null)) as { body?: string; occurred_at?: string; title?: string } | null;
  if (!b) return NextResponse.json({ error: 'bad request' }, { status: 400 });
  const r = await updateNote(id, b);
  return r.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: r.error }, { status: r.status });
}

export async function DELETE(req: NextRequest) {
  const user = await crmUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const r = await deleteNote(new URL(req.url).searchParams.get('id') ?? '');
  return r.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: r.error }, { status: r.status });
}
