'use client';

/**
 * PASTE A YAP, GET A PROMPTER (D119). One box at the top of the Studio. Paste a yap you have already
 * written, press, and it appears in the queue below as a yap with its QR code, as any queued piece
 * does. The optional title is only the name on the row; the first line stands in when it is blank.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import d from './studio.module.css';

export function QuickPrompter() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [script, setScript] = useState('');
  const [busy, setBusy] = useState(false);
  const [made, setMade] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const make = async () => {
    if (busy || !script.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch('/console/studio/prompter', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title, script }),
      });
      const b = (await res.json().catch(() => null)) as { teleprompter_url?: string; error?: string } | null;
      if (!res.ok || !b?.teleprompter_url) {
        setErr(b?.error ?? 'Could not make the prompter.');
        return;
      }
      setMade(b.teleprompter_url);
      setScript('');
      setTitle('');
      // The queue below re-renders with the new row and its QR.
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not make the prompter.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={d.paste} aria-label="Paste a yap">
      <div className={d.pasteHead}>
        <span className={d.pasteTitle}>Paste a yap</span>
        <span className={d.groupMeta}>a yap you have already written joins the queue below with its QR code</span>
      </div>
      <input
        className={d.pasteLine}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (or the first line is used)"
        disabled={busy}
      />
      <textarea
        className={d.pasteBox}
        value={script}
        onChange={(e) => setScript(e.target.value)}
        placeholder={'TITLE\nWhy ...\n\nTALK\n...\n\nCTA\nComment COMPASS and ...'}
        disabled={busy}
        spellCheck={false}
      />
      <div className={d.actions}>
        <button type="button" className={d.bigBtn} onClick={make} disabled={busy || !script.trim()}>
          {busy ? 'Making…' : 'Make the prompter'}
        </button>
        {made ? (
          <a className={d.btn} href={made} target="_blank" rel="noopener noreferrer">
            Open it ↗
          </a>
        ) : null}
        {err ? <span className={d.warn}>{err}</span> : null}
      </div>
    </section>
  );
}
