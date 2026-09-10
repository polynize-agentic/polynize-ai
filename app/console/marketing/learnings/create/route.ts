/**
 * POST /console/marketing/learnings/create (D115): what was said or pasted goes to April; the first
 * pass comes back as a learning in the library, opened for editing. Team scope.
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/console-auth';
import { llmErrorText } from '@/lib/llm/error-text';
import { draftLearning, type LearningMode } from '@/lib/marketing/learning-draft';
import { createLearning } from '@/lib/marketing/learning-store';
import { isUseCaseId } from '@/lib/marketing/use-case';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.scope.type !== 'team') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as {
    raw?: unknown;
    mode?: unknown;
    source?: unknown;
    use_case?: unknown;
  } | null;
  const raw = typeof body?.raw === 'string' ? body.raw.trim().slice(0, 60000) : '';
  if (raw.length < 20) return NextResponse.json({ error: 'say or paste a little more first' }, { status: 400 });
  const mode: LearningMode = body?.mode === 'pasted' ? 'pasted' : 'told';
  const source = typeof body?.source === 'string' ? body.source.trim().slice(0, 400) : '';

  let draft;
  try {
    draft = await draftLearning(raw, mode);
  } catch (err) {
    console.error('[learnings.create] draft failed:', err);
    return NextResponse.json({ error: llmErrorText(err) }, { status: 502 });
  }
  try {
    const l = await createLearning({
      article: draft.article,
      learning: draft.learning,
      added_by: user.email,
      source,
      raw,
      ...(isUseCaseId(body?.use_case) ? { use_case: body.use_case } : {}),
    });
    return NextResponse.json({ id: l.id });
  } catch (err) {
    console.error('[learnings.create] save failed:', err);
    return NextResponse.json({ error: 'April wrote it but it could not be saved. Try again.' }, { status: 500 });
  }
}
