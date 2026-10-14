import { getCurrentUser } from '@/lib/console-auth';
import { listSuggestions } from '@/lib/crm/suggestions';
import { isOperator } from '@/lib/marketing/streams';
import { Suggestions } from '../_ui/Suggestions';
import s from '../crm.module.css';

export const dynamic = 'force-dynamic';

/** SUGGESTIONS (D121): what the team wants from the console, liked by the team, decided by Marrs. */
export default async function SuggestionsPage() {
  const user = await getCurrentUser();
  const me = (user?.email ?? '').trim().toLowerCase();
  const items = await listSuggestions();
  return (
    <>
      <div className={s.head}>
        <div>
          <h1 className={s.h1}>Suggestions</h1>
          <p className={s.sub}>Ideas for the console. Like the ones you want; Marrs approves what gets built.</p>
        </div>
      </div>
      {items === null ? (
        <div className={s.notReady}>
          <h2 className={s.panelTitle}>The board needs its table</h2>
          <p className={s.sub}>
            One step in Supabase: paste the contents of <code>supabase/migrations/0016_crm_history_and_suggestions.sql</code> into the SQL editor and run it.
          </p>
        </div>
      ) : (
        <Suggestions items={items} me={me} isOperator={isOperator(me)} />
      )}
    </>
  );
}
