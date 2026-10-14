'use client';

/**
 * ONE FORM FOR EVERY RECORD (D120). Creating asks only for the essential fields, with the rest one
 * click away under "More detail"; editing shows them all. A field fixed by where you are (the company
 * when you add a contact from BDO's page) is not asked at all. Contact and deal pickers only offer the
 * ones at the chosen company.
 */
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CRM_TEAM, FIELDS, type Field, type RecordKind } from '@/lib/crm/schema';
import { crmCall, type Lookups } from './api';
import s from '../crm.module.css';

type Values = Record<string, string>;

function toStr(v: unknown): string {
  if (v === null || v === undefined) return '';
  return String(v);
}

export function RecordForm({
  kind,
  id,
  initial,
  fixed,
  lookups,
  title,
  submitLabel,
  goTo,
  onClose,
  me,
}: {
  kind: RecordKind;
  id?: string;
  initial?: Record<string, unknown>;
  fixed?: Record<string, string>;
  lookups: Lookups;
  title?: string;
  submitLabel?: string;
  /** Where to go after creating; `{id}` is replaced with the new record's id. Absent: stay and refresh. */
  goTo?: string;
  onClose?: () => void;
  me?: string;
}) {
  const router = useRouter();
  const editing = !!id;
  const fields = FIELDS[kind].filter((f) => !(fixed && f.key in fixed));
  const [values, setValues] = useState<Values>(() => {
    const v: Values = {};
    for (const f of FIELDS[kind]) v[f.key] = toStr(initial?.[f.key]);
    if (!editing && me && 'owner' in v && !v.owner) v.owner = me;
    return v;
  });
  const [more, setMore] = useState(editing);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const companyId = fixed?.company_id ?? values.company_id ?? '';
  const contacts = useMemo(() => lookups.contacts.filter((c) => !companyId || c.company_id === companyId), [lookups.contacts, companyId]);
  const deals = useMemo(() => lookups.deals.filter((d) => !companyId || d.company_id === companyId), [lookups.deals, companyId]);

  const set = (k: string, v: string) => setValues((x) => ({ ...x, [k]: v }));

  const save = async () => {
    if (busy) return;
    setBusy(true);
    setErr(null);
    const body: Record<string, string> = { ...values, ...(fixed ?? {}) };
    const r = editing ? await crmCall(`${kind}/${id}`, 'PATCH', body) : await crmCall(kind, 'POST', body);
    setBusy(false);
    if (!r.ok) {
      setErr(String(r.data.error ?? 'Could not save that.'));
      return;
    }
    if (!editing && goTo && r.data.id) {
      router.push(goTo.replace('{id}', String(r.data.id)));
      return;
    }
    onClose?.();
    router.refresh();
  };

  const input = (f: Field) => {
    const v = values[f.key] ?? '';
    const common = { id: `f-${kind}-${f.key}`, value: v, disabled: busy };
    switch (f.kind) {
      case 'textarea':
        return <textarea {...common} className={s.textarea} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value)} />;
      case 'select':
        return (
          <select {...common} className={s.input} onChange={(e) => set(f.key, e.target.value)}>
            <option value="">Choose</option>
            {f.options?.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        );
      case 'owner':
        return (
          <select {...common} className={s.input} onChange={(e) => set(f.key, e.target.value)}>
            <option value="">Unassigned</option>
            {CRM_TEAM.map((m) => (
              <option key={m.email} value={m.email}>
                {m.name}
              </option>
            ))}
          </select>
        );
      case 'company':
        return (
          <select {...common} className={s.input} onChange={(e) => set(f.key, e.target.value)}>
            <option value="">Choose a company</option>
            {lookups.companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        );
      case 'contact':
      case 'deal': {
        const opts = f.kind === 'contact' ? contacts : deals;
        return (
          <select {...common} className={s.input} onChange={(e) => set(f.key, e.target.value)}>
            <option value="">None</option>
            {opts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        );
      }
      case 'date':
        return <input {...common} type="date" className={s.input} onChange={(e) => set(f.key, e.target.value)} />;
      case 'number':
      case 'money':
      case 'percent':
        return <input {...common} inputMode="decimal" className={s.input} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value)} />;
      case 'email':
        return <input {...common} type="email" className={s.input} onChange={(e) => set(f.key, e.target.value)} />;
      case 'url':
        return <input {...common} type="url" className={s.input} placeholder="https://" onChange={(e) => set(f.key, e.target.value)} />;
      default:
        return <input {...common} className={s.input} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value)} />;
    }
  };

  const block = (list: readonly Field[]) => (
    <div className={s.formGrid}>
      {list.map((f) => (
        <label key={f.key} className={`${s.formField} ${f.kind === 'textarea' ? s.formFieldWide : ''}`} htmlFor={`f-${kind}-${f.key}`}>
          <span className={s.formLabel}>
            {f.label}
            {f.required ? <span className={s.req}>*</span> : null}
          </span>
          {input(f)}
        </label>
      ))}
    </div>
  );

  const essential = fields.filter((f) => f.essential);
  const rest = fields.filter((f) => !f.essential);

  return (
    <div className={s.form}>
      {title ? <h3 className={s.panelTitle}>{title}</h3> : null}
      {block(essential)}
      {rest.length ? (
        <div className={s.more}>
          <button type="button" className={s.linkBtn} onClick={() => setMore((m) => !m)}>
            {more ? 'Less detail' : `More detail (${rest.length} more fields)`}
          </button>
        </div>
      ) : null}
      {more ? block(rest) : null}
      <div className={s.formFoot}>
        <button type="button" className={s.btn} onClick={save} disabled={busy}>
          {busy ? 'Saving…' : (submitLabel ?? (editing ? 'Save' : 'Add'))}
        </button>
        {onClose ? (
          <button type="button" className={s.btnGhost} onClick={onClose} disabled={busy}>
            Cancel
          </button>
        ) : null}
        {err ? <span className={s.err}>{err}</span> : null}
      </div>
    </div>
  );
}

/** A button that opens the form in place. */
export function AddRecord(props: Omit<Parameters<typeof RecordForm>[0], 'onClose'> & { label: string }) {
  const [open, setOpen] = useState(false);
  const { label, ...rest } = props;
  if (!open) {
    return (
      <button type="button" className={s.btn} onClick={() => setOpen(true)}>
        {label}
      </button>
    );
  }
  return (
    <div style={{ flexBasis: '100%' }}>
      <RecordForm {...rest} onClose={() => setOpen(false)} />
    </div>
  );
}

/** "Edit" that swaps a record's read view for its form. */
export function EditRecord(props: Omit<Parameters<typeof RecordForm>[0], 'onClose'> & { label?: string }) {
  const [open, setOpen] = useState(false);
  const { label, ...rest } = props;
  if (!open) {
    return (
      <button type="button" className={s.btnGhost} onClick={() => setOpen(true)}>
        {label ?? 'Edit'}
      </button>
    );
  }
  return (
    <div style={{ flexBasis: '100%' }}>
      <RecordForm {...rest} onClose={() => setOpen(false)} />
    </div>
  );
}

/** Delete, after saying what goes with it. */
export function DeleteRecord({ kind, id, what, goTo }: { kind: RecordKind; id: string; what: string; goTo: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const run = async () => {
    if (busy || !window.confirm(what)) return;
    setBusy(true);
    const r = await crmCall(`${kind}/${id}`, 'DELETE');
    setBusy(false);
    if (!r.ok) {
      window.alert(String(r.data.error ?? 'Could not delete that.'));
      return;
    }
    router.push(goTo);
    router.refresh();
  };
  return (
    <button type="button" className={`${s.linkBtn} ${s.danger}`} onClick={run} disabled={busy}>
      {busy ? 'Deleting…' : 'Delete'}
    </button>
  );
}
