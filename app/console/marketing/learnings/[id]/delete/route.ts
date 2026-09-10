/** DELETE /console/marketing/learnings/[id] (D115). Stories made from it stay; they own their copy. */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/console-auth';
import { deleteLearning, getLearning } from '@/lib/marketing/learning-store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.scope.type !== 'team') return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const l = await getLearning(id);
  if (!l) return NextResponse.json({ ok: true });
  try {
    await deleteLearning(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[learnings.delete] failed:', err);
    return NextResponse.json({ error: 'could not delete' }, { status: 500 });
  }
}
