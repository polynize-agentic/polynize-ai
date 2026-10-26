/**
 * POST /console/crm/api/pam (D126): one turn with Pam. { messages, company_id? } in; her reply, any
 * proposals for the person to approve, the tools she used, and her web sources out. CRM team only.
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { crmUser } from '@/lib/crm/guard';
import { askPam, type PamMessage } from '@/lib/crm/pam';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 180;

export async function POST(req: NextRequest) {
  const user = await crmUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const b = (await req.json().catch(() => null)) as { messages?: unknown; company_id?: unknown } | null;
  const messages = Array.isArray(b?.messages)
    ? (b!.messages as unknown[])
        .filter((m): m is PamMessage => !!m && typeof m === 'object' && ((m as PamMessage).role === 'user' || (m as PamMessage).role === 'assistant') && typeof (m as PamMessage).content === 'string')
        .map((m) => ({ role: m.role, content: m.content }))
    : [];
  if (!messages.length || messages[messages.length - 1].role !== 'user') return NextResponse.json({ error: 'say something to Pam first' }, { status: 400 });
  const companyId = typeof b?.company_id === 'string' && /^[0-9a-f-]{36}$/i.test(b.company_id) ? b.company_id : undefined;
  try {
    return NextResponse.json(await askPam({ messages, me: user.email, companyId }));
  } catch (err) {
    console.error('[pam] turn failed:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Pam could not answer.' }, { status: 502 });
  }
}
