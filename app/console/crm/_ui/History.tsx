'use client';

/**
 * HISTORY (D121): everything that has happened with a company, newest first, under month headings.
 * Marrs: "Next to Actions, there would be a button called History, and that's where the chronological
 * history would be." Add a note (a call, an email, something said in a corridor) with any date; filter
 * to notes, meetings or what the CRM recorded itself; narrow to one deal. Notes and meeting summaries
 * can be edited or removed by anyone on the team.
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ownerName } from '@/lib/crm/schema';
import { NOTE_KINDS, monthHeading, type Entry } from '@/lib/crm/history';
import { crmCall, type Pick } from './api';
import s from '../crm.module.css';

type Filter = 'all' | 'note' | 'meeting' | 'activity';

export function History({
  entries,
  companyId,
  deals,
  contacts,
  fixedDealId,
  today,
}: {
  entries: Entry[];
  companyId: string;
  deals: Pick[];
  contacts: Pick[];
  fixedDealId?: string;
  today: string;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');
  const [dealFilter, setDealFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState('note');
  const [date, setDate] = useState(today);
  const [dealId, setDealId] = useState(fixedDealId ?? '');
  const [contactId, setContactId] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const dealName = new Map(deals.map((d) => [d.id, d.name]));
  const contactName = new Map(contacts.map((c) => [c.id, c.name]));

  const shown = entries.filter((e) => (filter === 'all' || e.group === filter) && (!dealFilter || e.deal_id === dealFilter));

  const save = async () => {
    if (busy || !body.trim()) return;
    setBusy(true);
    setErr(null);
    const r = await crmCall('notes', 'POST', {
      company_id: companyId,
      kind,
      occurred_at: date,
      body,
      ...(dealId ? { deal_id: dealId } : {}),
      ...(contactId ? { contact_id: contactId } : {}),
    });
    setBusy(false);
    if (!r.ok) {
      setErr(String(r.data.error ?? 'Could not save the note.'));
      return;
    }
    setBody('');
    setOpen(false);
    router.refresh();
  };

  const saveEdit = async (noteId: string) => {
    const r = await crmCall(`notes?id=${noteId}`, 'PATCH', { body: editText });
    if (!r.ok) {
      window.alert(String(r.data.error ?? 'Could not save that.'));
      return;
    }
    setEditing(null);
    router.refresh();
  };

  const remove = async (noteId: string) => {
    if (!window.confirm('Delete this note?')) return;
    const r = await crmCall(`notes?id=${noteId}`, 'DELETE');
    if (r.ok) router.refresh();
  };

  let lastMonth = '';

  return (
    <div>
      <div className={s.bar}>
        {!open ? (
          <button type="button" className={s.btn} onClick={() => setOpen(true)}>
            + Add note
          </button>
        ) : null}
        {(['all', 'note', 'meeting', 'activity'] as const).map((f) => (
          <button key={f} type="button" className={`${s.filter} ${filter === f ? s.filterOn : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f === 'note' ? 'Notes' : f === 'meeting' ? 'Meetings' : 'Activity'}
          </button>
        ))}
        {!fixedDealId && deals.length ? (
          <select className={s.select} value={dealFilter} onChange={(e) => setDealFilter(e.target.value)} aria-label="Show one deal">
            <option value="">Every deal</option>
            {deals.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      {open ? (
        <div className={s.form}>
          <div className={s.formGrid}>
            <label className={s.formField}>
              <span className={s.formLabel}>What</span>
              <select className={s.input} value={kind} onChange={(e) => setKind(e.target.value)}>
                {NOTE_KINDS.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={s.formField}>
              <span className={s.formLabel}>When</span>
              <input className={s.input} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            {!fixedDealId ? (
              <label className={s.formField}>
                <span className={s.formLabel}>Deal (optional)</span>
                <select className={s.input} value={dealId} onChange={(e) => setDealId(e.target.value)}>
                  <option value="">None</option>
                  {deals.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label className={s.formField}>
              <span className={s.formLabel}>Contact (optional)</span>
              <select className={s.input} value={contactId} onChange={(e) => setContactId(e.target.value)}>
                <option value="">None</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={`${s.formField} ${s.formFieldWide}`}>
              <span className={s.formLabel}>Note</span>
              <textarea className={s.textarea} value={body} onChange={(e) => setBody(e.target.value)} autoFocus />
            </label>
          </div>
          <div className={s.formFoot}>
            <button type="button" className={s.btn} onClick={save} disabled={busy || !body.trim()}>
              {busy ? 'Saving…' : 'Add to history'}
            </button>
            <button type="button" className={s.btnGhost} onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </button>
            {err ? <span className={s.err}>{err}</span> : null}
          </div>
        </div>
      ) : null}

      {shown.length === 0 ? (
        <p className={s.empty}>{entries.length === 0 ? 'Nothing has happened here yet.' : 'Nothing matches that filter.'}</p>
      ) : (
        <div className={s.timeline}>
          {shown.map((e) => {
            const month = monthHeading(e.date);
            const heading = month !== lastMonth ? month : null;
            lastMonth = month;
            const tags = [
              e.deal_id && !fixedDealId ? dealName.get(e.deal_id) : null,
              e.contact_id ? contactName.get(e.contact_id) : null,
              e.by ? ownerName(e.by) : null,
              e.source === 'fireflies' ? 'from Fireflies' : null,
            ].filter(Boolean);
            return (
              <div key={e.key}>
                {heading ? <div className={s.month}>{heading}</div> : null}
                <div className={`${s.entry} ${e.group === 'activity' ? s.entryQuiet : ''}`}>
                  <div className={s.entryDate}>
                    <span>{e.date.slice(8, 10)}</span>
                    <span className={s.entryKind}>{e.label}</span>
                  </div>
                  <div className={s.entryMain}>
                    <div className={s.entryTitle}>
                      {e.url ? (
                        <a href={e.url} target="_blank" rel="noopener noreferrer">
                          {e.title} ↗
                        </a>
                      ) : (
                        e.title
                      )}
                    </div>
                    {editing && editing === e.note_id ? (
                      <>
                        <textarea className={s.textarea} value={editText} onChange={(ev) => setEditText(ev.target.value)} />
                        <div className={s.formFoot}>
                          <button type="button" className={s.btn} onClick={() => void saveEdit(e.note_id!)}>
                            Save
                          </button>
                          <button type="button" className={s.btnGhost} onClick={() => setEditing(null)}>
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : e.body && e.title !== e.body ? (
                      <div className={s.entryBody}>{e.body}</div>
                    ) : null}
                    <div className={s.entryMeta}>
                      {tags.join(' · ')}
                      {e.note_id && editing !== e.note_id ? (
                        <>
                          {tags.length ? ' · ' : ''}
                          <button
                            type="button"
                            className={s.linkBtn}
                            onClick={() => {
                              setEditing(e.note_id!);
                              setEditText(e.body ?? '');
                            }}
                          >
                            edit
                          </button>{' '}
                          <button type="button" className={`${s.linkBtn} ${s.danger}`} onClick={() => void remove(e.note_id!)}>
                            delete
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
