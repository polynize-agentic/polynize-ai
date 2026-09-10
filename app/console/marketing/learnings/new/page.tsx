import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/console-auth';
import { BackLink } from '@/app/console/marketing/_components/BackLink';
import { NewLearning } from './NewLearning';
import s from '../../../_components/client-card.module.css';

export const dynamic = 'force-dynamic';

/** ADD A LEARNING (D115): the two ways in, then April's first pass. */
export default async function NewLearningPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.scope.type === 'client') redirect(`/console/${user.scope.slug}/blueprint`);
  return (
    <>
      <div className={s.bgPattern} aria-hidden />
      <div className={s.dashboard}>
        <div className={s.header}>
          <BackLink fallbackHref="/console/marketing/learnings" className={s.marketingBack} />
          <div className={s.eyebrow}>polynize content library</div>
          <h1 className={s.title}>Add a learning</h1>
        </div>
        <NewLearning />
      </div>
    </>
  );
}
