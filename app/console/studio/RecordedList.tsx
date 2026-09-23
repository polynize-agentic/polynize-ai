'use client';

/**
 * THE RECORDED LIST (D119), behind one button. Marrs: "put a little button in the studio that says
 * Recorded or something, where it reveals the ones that I've already recorded." Closed by default,
 * because the Studio is for the next take; open, it lists what has been shot, newest first, with the
 * piece, its prompter, and Queue again for a retake (which clears the recorded stamp, as the Ready
 * switch always has).
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { RecordedRow } from '@/lib/marketing/shoot-queue';
import d from './studio.module.css';

export function RecordedList({ rows, labels }: { rows: RecordedRow[]; labels: Record<string, string> }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const requeue = async (id: string) => {
    if (busy) return;
    setBusy(id);
    try {
      const res = await fetch('/console/studio/shoot', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ piece_id: id, ready: true }),
      });
      if (!res.ok) {
        const b = (await res.json().catch(() => null)) as { error?: string } | null;
        window.alert(b?.error ?? 'Could not put that back in the queue.');
        return;
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className={d.recWrap}>
      <button type="button" className={`${d.recToggle} ${open ? d.recToggleOn : ''}`} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        Recorded{rows.length ? ` · ${rows.length}` : ''}
      </button>
      {open ? (
        rows.length === 0 ? (
          <p className={d.recEmpty}>Nothing recorded yet.</p>
        ) : (
          <div className={d.recList}>
            {rows.map((r) => (
              <div key={r.piece_id} className={d.recRow}>
                <div className={d.recMain}>
                  <span className={d.stream}>{labels[r.stream] ?? r.stream}</span>
                  <Link className={d.recTitle} href={`/console/marketing/piece/${r.piece_id}`}>
                    {r.title}
                  </Link>
                  <span className={d.recMeta}>
                    {r.format_label} · recorded {r.recorded_at.slice(0, 10)}
                  </span>
                </div>
                <div className={d.recActions}>
                  <a className={d.quiet} href={r.teleprompter_url} target="_blank" rel="noopener noreferrer">
                    teleprompter
                  </a>
                  <button type="button" className={d.quietBtn} onClick={() => requeue(r.piece_id)} disabled={busy === r.piece_id}>
                    {busy === r.piece_id ? '…' : 'Queue again'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}
