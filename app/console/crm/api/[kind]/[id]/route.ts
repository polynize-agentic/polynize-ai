/** PATCH and DELETE /console/crm/api/{kind}/{id}: edit or remove one record (D120). */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { crmUser } from '@/lib/crm/guard';
import { isRecordKind } from '@/lib/crm/schema';
import { updateRecord, deleteRecord } from '@/lib/crm/records';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Ctx = { params: Promise<{ kind: string; id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { kind, id } = await params;
  const user = await crmUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!isRecordKind(kind)) return NextResponse.json({ error: 'unknown record type' }, { status: 400 });
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'bad request' }, { status: 400 });
  const r = await updateRecord(kind, id, body, user.email);
  return r.ok ? NextResponse.json({ id: r.id }) : NextResponse.json({ error: r.error }, { status: r.status });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { kind, id } = await params;
  const user = await crmUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!isRecordKind(kind)) return NextResponse.json({ error: 'unknown record type' }, { status: 400 });
  const r = await deleteRecord(kind, id);
  return r.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: r.error }, { status: r.status });
}
