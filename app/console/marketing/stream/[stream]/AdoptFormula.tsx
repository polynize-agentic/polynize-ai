'use client';

/**
 * BRING THE FORMULA ACROSS (D114), one button, shown only while there is something to bring.
 *
 * The Marrs Attacks board is new and the week's split-screens were made on the marrs board before it
 * existed. Rather than a migration nobody can see, the board itself says how many are waiting and
 * offers to move them, and once they have moved the panel is gone. It reports what it did in the
 * words of the things moved, not in row counts.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import s from '../../../_components/client-card.module.css';

type Moved = { pieces: number; entries: number; narratives: number; ideas: number; voice: boolean; brand: boolean };

export function AdoptFormula({ stream, pending }: { stream: string; pending: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  if (pending === 0 && !done) return null;

  const run = async () => {
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      const base = window.location.pathname.replace(/\/+$/, '');
      const res = await fetch(`${base}/adopt`, { method: 'POST' });
      const b = (await res.json().catch(() => null)) as { moved?: Moved; failures?: string[]; error?: string } | null;
      if (!res.ok || !b?.moved) {
        setErr(b?.error ?? 'Could not move them.');
        return;
      }
      const m = b.moved;
      const parts = [
        m.pieces > 0 ? `${m.pieces} split-screen${m.pieces === 1 ? '' : 's'}` : null,
        m.entries > 0 ? `${m.entries} calendar post${m.entries === 1 ? '' : 's'}` : null,
        m.narratives > 0 ? `${m.narratives} Stor${m.narratives === 1 ? 'y' : 'ies'}` : null,
        m.ideas > 0 ? `${m.ideas} hook${m.ideas === 1 ? '' : 's'}` : null,
        m.voice ? 'the voice doc copied' : null,
        m.brand ? 'the Metricool brand copied' : null,
      ].filter(Boolean);
      setDone(
        (parts.length ? `Moved: ${parts.join(', ')}.` : 'Nothing left to move.') +
          (b.failures?.length ? ` Not moved: ${b.failures.join('; ')}` : '')
      );
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not move them.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={s.setupPanel} aria-label="Bring the formula across">
      <span className={s.setupTitle}>From the Marrs board</span>
      {done ? (
        <p className={s.dashSectionEmpty} style={{ marginTop: 8 }}>{done}</p>
      ) : (
        <>
          <p className={s.dashSectionEmpty} style={{ marginTop: 8 }}>
            {pending} split-screen{pending === 1 ? '' : 's'} and yaps from this week are still filed under Marrs.
            They belong here, with their hooks, calendar drafts, voice doc and Metricool brand.
          </p>
          <div style={{ marginTop: 10 }}>
            <button type="button" className={s.startConceptCta} onClick={run} disabled={busy}>
              {busy ? 'Moving…' : `Bring them across (${stream === 'marrsattacks' ? 'Marrs Attacks' : stream})`}
            </button>
          </div>
          {err ? <p className={s.dashSectionEmpty} style={{ marginTop: 8 }}>{err}</p> : null}
        </>
      )}
    </section>
  );
}
