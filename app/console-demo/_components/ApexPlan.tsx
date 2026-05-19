'use client';

import { useState, useRef, useEffect } from 'react';
import type { ApexPlan as ApexPlanT } from '@/lib/console-demo/types';
import p from './projects.module.css';

type Props = {
  plan: ApexPlanT;
  onChange: (plan: ApexPlanT) => void;
};

const SECTIONS: { key: keyof ApexPlanT; label: string }[] = [
  { key: 'objective', label: 'OBJECTIVE' },
  { key: 'strategy', label: 'STRATEGY' },
  { key: 'constraints', label: 'CONSTRAINTS' },
  { key: 'priorities', label: 'PRIORITIES' },
];

export function ApexPlan({ plan, onChange }: Props) {
  return (
    <section className={p.apexPanel}>
      <div className={p.apexHead}>§ APEX Plan</div>
      {SECTIONS.map(({ key, label }) => (
        <ApexSection
          key={key}
          label={label}
          value={plan[key]}
          onChange={(v) => onChange({ ...plan, [key]: v })}
        />
      ))}
    </section>
  );
}

function ApexSection({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => { setDraft(value); }, [value]);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      ref.current.style.height = 'auto';
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onChange(draft);
  };
  const cancel = () => {
    setEditing(false);
    setDraft(value);
  };

  return (
    <div className={p.apexSection}>
      <div className={p.apexLabel}>{label}</div>
      <div className={p.apexBody} onClick={() => !editing && setEditing(true)}>
        {editing ? (
          <textarea
            ref={ref}
            className={p.apexTextarea}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              if (ref.current) {
                ref.current.style.height = 'auto';
                ref.current.style.height = `${ref.current.scrollHeight}px`;
              }
            }}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                cancel();
              }
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                commit();
              }
            }}
          />
        ) : (
          <div>{value}</div>
        )}
      </div>
    </div>
  );
}
