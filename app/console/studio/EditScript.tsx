'use client';

/**
 * EDIT A QUEUED SCRIPT IN PLACE (D119). Marrs: "add an edit button to that yap when it gets created,
 * so if I have to edit the script, I can do it directly from there." Edit opens the script under the
 * row; Save writes it and the row's title and read time follow; the prompter shows the new words on
 * its next load. Cancel throws the edit away. On every queued row, not only pasted yaps, because a
 * wrong word is a wrong word whichever way the script arrived.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import d from './studio.module.css';

export function EditScript({ pieceId, title, script }: { pieceId: string; title: string; script: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(script);
  const [name, setName] = useState(title);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const save = async () => {
    if (busy || !text.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch('/console/studio/prompter', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ piece_id: pieceId, title: name, script: text }),
      });
      const b = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !b?.ok) {
        setErr(b?.error ?? 'Could not save the edit.');
        return;
      }
      setOpen(false);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not save the edit.');
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        className={d.btn}
        onClick={() => {
          setText(script);
          setName(title);
          setOpen(true);
        }}
      >
        Edit
      </button>
    );
  }

  return (
    <div className={d.editor}>
      <input className={d.pasteLine} value={name} onChange={(e) => setName(e.target.value)} placeholder="Title" disabled={busy} />
      <textarea className={d.pasteBox} value={text} onChange={(e) => setText(e.target.value)} disabled={busy} spellCheck={false} />
      <div className={d.actions} style={{ marginTop: 0 }}>
        <button type="button" className={d.bigBtn} onClick={save} disabled={busy || !text.trim()}>
          {busy ? 'Saving…' : 'Save'}
        </button>
        <button type="button" className={d.btn} onClick={() => setOpen(false)} disabled={busy}>
          Cancel
        </button>
        {err ? <span className={d.warn}>{err}</span> : null}
      </div>
    </div>
  );
}
