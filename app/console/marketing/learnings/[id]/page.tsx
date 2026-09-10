import { redirect, notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/console-auth';
import { getLearning } from '@/lib/marketing/learning-store';
import { listMediaForStream } from '@/lib/marketing/media-store';
import { visibleStreams } from '@/lib/marketing/streams';
import { usesUseCases } from '@/lib/marketing/use-case';
import { LearningScreen } from './LearningScreen';

export const dynamic = 'force-dynamic';

/**
 * ONE LEARNING (D115): the article with April beside it, the sentence, where it came from, the hero,
 * and the two doors out: publish to polynize.ai/library, or make a Story from it on a board.
 */
export default async function LearningPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.scope.type === 'client') redirect(`/console/${user.scope.slug}/blueprint`);

  const learning = await getLearning(id);
  if (!learning) notFound();

  // The Polynize library's images, for the hero picker. Video is not a hero.
  const images = (await listMediaForStream('polynize').catch(() => []))
    .filter((a) => a.kind === 'image')
    .slice(0, 24)
    .map((a) => ({ media_id: a.media_id, url: a.url, label: a.label }));

  // A Story can be made on any board this person can see that carries Polynize content.
  const lanes = visibleStreams(user.email)
    .filter((st) => usesUseCases(st.id))
    .map((st) => ({ id: st.id, label: st.label }));

  return <LearningScreen initial={learning} images={images} lanes={lanes} />;
}
