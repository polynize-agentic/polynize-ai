/** POST /console/crm/api/{company|contact|deal|action}: create one record (D120). */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { crmUser } from '@/lib/crm/guard';
import { isRecordKind } from '@/lib/crm/schema';
import { createRecord } from '@/lib/crm/records';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest, { params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  const user = await crmUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!isRecordKind(kind)) return NextResponse.json({ error: 'unknown record type' }, { status: 400 });
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'bad request' }, { status: 400 });
  const r = await createRecord(kind, body, user.email);
  return r.ok ? NextResponse.json({ id: r.id }) : NextResponse.json({ error: r.error }, { status: r.status });
}
