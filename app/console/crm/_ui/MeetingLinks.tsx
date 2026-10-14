'use client';

/**
 * MEETING LINKS ON A COMPANY (D120). AJ: "multiple Fireflies links" in the profile. Two ways to add
 * one: paste a link with a title and date, or pick from your recent Fireflies meetings, ticking any
 * attendees from the company to add them as contacts. Only the link, title, date and attendee
 * addresses are read; no transcript text comes into the CRM.
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { crmCall } from './api';
import s from '../crm.module.css';

export type MeetingLine = { id: string; title: string; url: string; met_at: string | null };
type Ff = { id: string; title: string; date?: string; url: string; external: string[] };

export function MeetingLinks({ companyId, meetings }: { companyId: string; meetings: MeetingLine[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<'none' | 'paste' | 'fireflies'>('none');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [date, setDate] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ff, setFf] = useState<Ff[] | null>(null);
  const [ticked, setTicked] = useState<Record<string, string[]>>({});

  const link = async (body: Record<string, unknown>) => {
    setBusy(true);
    setErr(null);
    const r = await crmCall('meetings', 'POST', { company_id: companyId, ...body });
    setBusy(false);
    if (!r.ok) {
      setErr(String(r.data.error ?? 'Could not link that meeting.'));
      return false;
    }
    router.refresh();
    return true;
  };

  const openFireflies = async () => {
    setMode('fireflies');
    if (ff) return;
    setBusy(true);
    const r = await crmCall('fireflies', 'GET');
    setBusy(false);
    if (!r.ok) {
      setErr(String(r.data.error ?? 'Fireflies did not answer.'));
      return;
    }
    setFf((r.data.meetings as Ff[]) ?? []);
  };

  const remove = async (id: string) => {
    if (!window.confirm('Remove this meeting link?')) return;
    const r = await crmCall(`meetings?id=${id}`, 'DELETE');
    if (r.ok) router.refresh();
  };

  return (
    <div>
      {meetings.length === 0 ? (
        <p className={s.empty}>No meetings linked yet.</p>
      ) : (
        <div className={s.list}>
          {meetings.map((m) => (
            <div key={m.id} className={s.listRow}>
              <div className={s.listMain}>
                <div className={s.listTitle}>{m.title}</div>
                <div className={s.listMeta}>{m.met_at ?? ''}</div>
              </div>
              <a className={s.listLink} href={m.url} target="_blank" rel="noopener noreferrer">
                Open ↗
              </a>
              <button type="button" className={`${s.linkBtn} ${s.danger}`} onClick={() => void remove(m.id)} aria-label={`Remove ${m.title}`}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={s.formFoot}>
        <button type="button" className={s.btnGhost} onClick={() => setMode(mode === 'paste' ? 'none' : 'paste')}>
          Paste a link
        </button>
        <button type="button" className={s.btnGhost} onClick={() => (mode === 'fireflies' ? setMode('none') : void openFireflies())}>
          From Fireflies
        </button>
      </div>

      {mode === 'paste' ? (
        <div className={s.formGrid} style={{ marginTop: 14 }}>
          <label className={s.formField}>
            <span className={s.formLabel}>Title</span>
            <input className={s.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Discovery meeting" />
          </label>
          <label className={s.formField}>
            <span className={s.formLabel}>Date</span>
            <input className={s.input} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className={`${s.formField} ${s.formFieldWide}`}>
            <span className={s.formLabel}>Link</span>
            <input className={s.input} type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://app.fireflies.ai/view/…" />
          </label>
          <div className={s.formFieldWide}>
            <button
              type="button"
              className={s.btn}
              disabled={busy}
              onClick={async () => {
                if (await link({ title, url, met_at: date })) {
                  setTitle('');
                  setUrl('');
                  setDate('');
                  setMode('none');
                }
              }}
            >
              {busy ? 'Linking…' : 'Link meeting'}
            </button>
          </div>
        </div>
      ) : null}

      {mode === 'fireflies' ? (
        <div style={{ marginTop: 14 }}>
          {busy && !ff ? <p className={s.empty}>Asking Fireflies…</p> : null}
          {ff && ff.length === 0 ? <p className={s.empty}>No recent meetings with you in them.</p> : null}
          {ff?.map((m) => (
            <div key={m.id} className={s.listRow}>
              <div className={s.listMain}>
                <div className={s.listTitle}>{m.title}</div>
                <div className={s.listMeta}>{m.date ?? ''}</div>
                {m.external.length ? (
                  <div className={s.listMeta}>
                    Add as contacts:{' '}
                    {m.external.map((e) => (
                      <label key={e} style={{ marginRight: 12, whiteSpace: 'nowrap' }}>
                        <input
                          type="checkbox"
                          className={s.check}
                          checked={(ticked[m.id] ?? []).includes(e)}
                          onChange={(ev) =>
                            setTicked((t) => {
                              const cur = new Set(t[m.id] ?? []);
                              if (ev.target.checked) cur.add(e);
                              else cur.delete(e);
                              return { ...t, [m.id]: [...cur] };
                            })
                          }
                        />{' '}
                        {e}
                      </label>
                    ))}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                className={s.btn}
                disabled={busy}
                onClick={() => void link({ title: m.title, url: m.url, met_at: m.date, fireflies_id: m.id, attendees: ticked[m.id] ?? [] })}
              >
                Link
              </button>
            </div>
          ))}
        </div>
      ) : null}
      {err ? <p className={s.err}>{err}</p> : null}
    </div>
  );
}
