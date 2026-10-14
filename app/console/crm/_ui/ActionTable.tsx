'use client';

/**
 * THE ACTIONS (D120): AJ's working task list. Tick to mark done; untick to reopen. Filters for mine,
 * open and overdue. Overdue is said in words on the row.
 */
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ownerName, optionLabel, ACTION_STATUSES } from '@/lib/crm/schema';
import { crmCall } from './api';
import s from '../crm.module.css';

export type ActionLine = {
  id: string;
  task: string;
  company_id: string;
  company: string;
  deal_id: string | null;
  deal: string;
  owner: string | null;
  due: string | null;
  status: string;
  overdue: boolean;
};

export function ActionTable({ actions, me, showCompany, startMine }: { actions: ActionLine[]; me: string; showCompany: boolean; startMine?: boolean }) {
  const router = useRouter();
  const [mine, setMine] = useState(!!startMine);
  const [show, setShow] = useState<'open' | 'overdue' | 'all'>('open');
  const [busy, setBusy] = useState<string | null>(null);

  const rows = actions.filter((a) => {
    if (mine && a.owner !== me) return false;
    if (show === 'open') return a.status !== 'done';
    if (show === 'overdue') return a.overdue;
    return true;
  });

  const toggle = async (a: ActionLine) => {
    if (busy) return;
    setBusy(a.id);
    const r = await crmCall(`action/${a.id}`, 'PATCH', { status: a.status === 'done' ? 'todo' : 'done' });
    setBusy(null);
    if (!r.ok) {
      window.alert(String(r.data.error ?? 'Could not save that.'));
      return;
    }
    router.refresh();
  };

  return (
    <>
      <div className={s.bar}>
        <button type="button" className={`${s.filter} ${mine ? s.filterOn : ''}`} onClick={() => setMine((m) => !m)}>
          Mine
        </button>
        {(['open', 'overdue', 'all'] as const).map((k) => (
          <button key={k} type="button" className={`${s.filter} ${show === k ? s.filterOn : ''}`} onClick={() => setShow(k)}>
            {k === 'open' ? 'Open' : k === 'overdue' ? 'Overdue' : 'All'}
          </button>
        ))}
      </div>
      {rows.length === 0 ? (
        <p className={s.empty}>Nothing here.</p>
      ) : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th aria-label="Done" />
                <th>Task or next step</th>
                {showCompany ? <th>Company</th> : null}
                <th>Deal</th>
                <th>Owner</th>
                <th>Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className={a.status === 'done' ? s.done : ''}>
                  <td>
                    <input
                      type="checkbox"
                      className={s.check}
                      checked={a.status === 'done'}
                      disabled={busy === a.id}
                      onChange={() => void toggle(a)}
                      aria-label={a.status === 'done' ? `Reopen ${a.task}` : `Mark ${a.task} done`}
                    />
                  </td>
                  <td className={s.strong}>{a.task}</td>
                  {showCompany ? (
                    <td>
                      <Link className={s.listLink} href={`/console/crm/company/${a.company_id}?tab=actions`}>
                        {a.company}
                      </Link>
                    </td>
                  ) : null}
                  <td>
                    {a.deal_id ? (
                      <Link className={s.listLink} href={`/console/crm/deal/${a.deal_id}`}>
                        {a.deal}
                      </Link>
                    ) : (
                      ''
                    )}
                  </td>
                  <td>{ownerName(a.owner)}</td>
                  <td>
                    {a.due ?? ''}
                    {a.overdue ? <span className={s.overdue}>overdue</span> : null}
                  </td>
                  <td>{optionLabel(ACTION_STATUSES, a.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
