import s from '../crm.module.css';

/** Shown until migration 0015 has been run in Supabase (D120). */
export function NotReady() {
  return (
    <div className={s.notReady}>
      <h2 className={s.panelTitle}>The CRM needs its tables</h2>
      <p className={s.sub}>
        One step in Supabase: open the SQL editor, paste the contents of <code>supabase/migrations/0015_crm_companies.sql</code>, and run it. It is safe to run twice. Then reload this page.
      </p>
    </div>
  );
}
