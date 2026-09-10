'use client';

/**
 * THE TWO WAYS IN (D115). Marrs: "We all work with voice, so the input would be just a voice dump or
 * a transcript... 'Tell us what the insight is' or 'Paste the text about the insight', one of those
 * two." One box, two modes: the mode changes the prompt April gets (a spoken dump is shaped, a pasted
 * transcript is mined) and the words on the screen, nothing else. Where it came from is one optional
 * line, internal only. The use case is optional; it can be set on the learning afterwards.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { USE_CASES } from '@/lib/marketing/use-case';
import s from '../../../_components/client-card.module.css';
import g from '../../narrative/gates.module.css';
import m from '../learnings.module.css';

type Mode = 'told' | 'pasted';

export function NewLearning() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('told');
  const [raw, setRaw] = useState('');
  const [source, setSource] = useState('');
  const [useCase, setUseCase] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const go = async () => {
    if (busy || raw.trim().length < 20) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch('/console/marketing/learnings/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ raw, mode, source, use_case: useCase }),
      });
      const b = (await res.json().catch(() => null)) as { id?: string; error?: string } | null;
      if (!res.ok || !b?.id) {
        setErr(b?.error ?? 'April could not write the first pass. Try again.');
        return;
      }
      router.push(`/console/marketing/learnings/${b.id}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not reach April.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={`${s.dashSection} ${s.panel}`}>
      <div className={m.modes}>
        <button type="button" className={`${m.mode} ${mode === 'told' ? m.modeOn : ''}`} onClick={() => setMode('told')}>
          Tell us what the insight is
        </button>
        <button type="button" className={`${m.mode} ${mode === 'pasted' ? m.modeOn : ''}`} onClick={() => setMode('pasted')}>
          Paste the text about the insight
        </button>
      </div>
      <textarea
        className={m.dump}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder={
          mode === 'told'
            ? 'Say it the way you would say it to us. What did you learn, where, and why does it matter beyond that room.'
            : 'Paste the notes or the transcript. April finds the insight and leaves the rest.'
        }
        disabled={busy}
        spellCheck={false}
      />
      <span className={m.label}>Where it came from (stays internal)</span>
      <input
        className={m.line}
        value={source}
        onChange={(e) => setSource(e.target.value)}
        placeholder="e.g. a client L&D session, 9 September"
        disabled={busy}
      />
      <span className={m.label}>Use case (optional)</span>
      <div className={g.useCases}>
        {USE_CASES.map((u) => (
          <button
            key={u.id}
            type="button"
            className={`${g.useCase} ${useCase === u.id ? g.useCaseOn : ''}`}
            onClick={() => setUseCase(useCase === u.id ? null : u.id)}
            disabled={busy}
          >
            {u.label}
          </button>
        ))}
      </div>
      {err ? <p className={g.err}>{err}</p> : null}
      <div className={g.bar}>
        <button type="button" className={g.go} onClick={go} disabled={busy || raw.trim().length < 20}>
          {busy ? 'April is writing the first pass…' : 'April, write the first pass →'}
        </button>
      </div>
    </section>
  );
}
