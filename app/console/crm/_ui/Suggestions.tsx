'use client';

/**
 * THE SUGGESTIONS BOARD (D121). One box to suggest something, the list below with likes, and for
 * Marrs the verdicts: Approve, Not now, Done. Sorted with the open and approved ones first and, within
 * those, the most liked first, so what the team wants most is at the top.
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ownerName } from '@/lib/crm/schema';
import { crmCall } from './api';
import s from '../crm.module.css';

export type SuggestionLine = {
  id: string;
  body: string;
  status: 'open' | 'approved' | 'built' | 'question' | 'done' | 'declined';
  created_by: string;
  reply?: string | null;
  created_at: string;
  likes: string[];
};

const LABEL: Record<SuggestionLine['status'], string> = {
  open: 'Suggested',
  approved: 'Approved',
  built: 'Built, check it',
  question: 'Question for Marrs',
  done: 'Done',
  declined: 'Not now',
};
const ORDER: Record<SuggestionLine['status'], number> = { question: 0, built: 1, approved: 2, open: 3, done: 4, declined: 5 };

export function Suggestions({ items, me, isOperator }: { items: SuggestionLine[]; me: string; isOperator: boolean }) {
  const router = useRouter();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [show, setShow] = useState<'live' | 'all'>('live');

  const call = async (fn: () => Promise<{ ok: boolean; data: Record<string, unknown> }>) => {
    const r = await fn();
    if (!r.ok) {
      window.alert(String(r.data.error ?? 'Could not save that.'));
      return;
    }
    router.refresh();
  };

  const submit = async () => {
    if (busy || text.trim().length < 3) return;
    setBusy(true);
    setErr(null);
    const r = await crmCall('suggestions', 'POST', { body: text });
    setBusy(false);
    if (!r.ok) {
      setErr(String(r.data.error ?? 'Could not save that.'));
      return;
    }
    setText('');
    router.refresh();
  };

  const rows = items
    .filter((i) => show === 'all' || !['done', 'declined'].includes(i.status))
    .sort((a, b) => ORDER[a.status] - ORDER[b.status] || b.likes.length - a.likes.length || b.created_at.localeCompare(a.created_at));

  return (
    <>
      <section className={s.form}>
        <h2 className={s.panelTitle}>Suggest something</h2>
        <textarea
          className={s.textarea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What would make the console better? A missing field, a screen that is slow, something you keep doing by hand…"
        />
        <div className={s.formFoot}>
          <button type="button" className={s.btn} onClick={submit} disabled={busy || text.trim().length < 3}>
            {busy ? 'Sending…' : 'Send suggestion'}
          </button>
          {err ? <span className={s.err}>{err}</span> : null}
        </div>
      </section>

      <div className={s.bar}>
        <button type="button" className={`${s.filter} ${show === 'live' ? s.filterOn : ''}`} onClick={() => setShow('live')}>
          Open
        </button>
        <button type="button" className={`${s.filter} ${show === 'all' ? s.filterOn : ''}`} onClick={() => setShow('all')}>
          Everything
        </button>
      </div>

      {rows.length === 0 ? (
        <p className={s.empty}>No suggestions yet.</p>
      ) : (
        <section className={s.panel}>
          <div className={s.list}>
            {rows.map((i) => {
              const liked = i.likes.includes(me);
              return (
                <div key={i.id} className={s.suggestion}>
                  <button
                    type="button"
                    className={`${s.like} ${liked ? s.likeOn : ''}`}
                    onClick={() => void call(() => crmCall('suggestions', 'PATCH', { id: i.id, like: true }))}
                    aria-pressed={liked}
                    title={i.likes.map((l) => ownerName(l)).join(', ') || 'Like this'}
                  >
                    <span aria-hidden>▲</span>
                    <span>{i.likes.length}</span>
                  </button>
                  <div className={s.listMain}>
                    <div className={`${s.suggestionBody} ${i.status === 'done' || i.status === 'declined' ? s.suggestionClosed : ''}`}>{i.body}</div>
                    <div className={s.listMeta}>
                      <span className={s.statusTag}>{LABEL[i.status]}</span> {ownerName(i.created_by)} · {i.created_at.slice(0, 10)}
                      {i.likes.length ? ` · liked by ${i.likes.map((l) => ownerName(l)).join(', ')}` : ''}
                    </div>
                    {i.reply ? <div className={s.reply}>{i.reply}</div> : null}
                    {isOperator ? (
                      <div className={s.formFoot} style={{ marginTop: 10 }}>
                        {i.status !== 'approved' && i.status !== 'done' && i.status !== 'built' ? (
                          <button type="button" className={s.btn} onClick={() => void call(() => crmCall('suggestions', 'PATCH', { id: i.id, status: 'approved' }))}>
                            {i.status === 'question' ? 'Approve, go ahead' : 'Approve'}
                          </button>
                        ) : null}
                        {i.status !== 'done' ? (
                          <button type="button" className={s.btnGhost} onClick={() => void call(() => crmCall('suggestions', 'PATCH', { id: i.id, status: 'done' }))}>
                            Mark done
                          </button>
                        ) : null}
                        {i.status === 'open' ? (
                          <button type="button" className={s.btnGhost} onClick={() => void call(() => crmCall('suggestions', 'PATCH', { id: i.id, status: 'declined' }))}>
                            Not now
                          </button>
                        ) : (
                          <button type="button" className={s.linkBtn} onClick={() => void call(() => crmCall('suggestions', 'PATCH', { id: i.id, status: 'open' }))}>
                            reopen
                          </button>
                        )}
                        <button
                          type="button"
                          className={`${s.linkBtn} ${s.danger}`}
                          onClick={() => {
                            if (window.confirm('Delete this suggestion?')) void call(() => crmCall(`suggestions?id=${i.id}`, 'DELETE'));
                          }}
                        >
                          delete
                        </button>
                      </div>
                    ) : i.created_by === me && i.status === 'open' ? (
                      <button
                        type="button"
                        className={`${s.linkBtn} ${s.danger}`}
                        onClick={() => {
                          if (window.confirm('Take this suggestion back?')) void call(() => crmCall(`suggestions?id=${i.id}`, 'DELETE'));
                        }}
                      >
                        take it back
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
