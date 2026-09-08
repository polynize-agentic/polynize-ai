'use client';

/**
 * THE DOOR INTO A SPLIT-SCREEN (D102), on the Marrs Attacks board only. One box: the idea, or the
 * question if he already has one. Develop opens the script screen at the title step.
 *
 * Marrs: "if the hook's right, I should get to the hook as quickly as possible." So this asks for
 * one thing and nothing else; the format, the platforms and the shape are all fixed by the formula.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import s from './new-split-screen.module.css';

export function NewSplitScreen({ stream }: { stream: string }) {
  const router = useRouter();
  const [idea, setIdea] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const go = async (format: 'split_screen_short' | 'yap') => {
    if (busy || !idea.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/console/marketing/stream/${stream}/split-screen`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ idea, format }),
      });
      const b = (await res.json().catch(() => null)) as { id?: string; error?: string } | null;
      if (!res.ok || !b?.id) {
        setErr(b?.error ?? 'Could not create it.');
        setBusy(false);
        return;
      }
      router.push(`/console/marketing/piece/${b.id}`);
    } catch {
      setErr('Network error. Try again.');
      setBusy(false);
    }
  };

  return (
    <div className={s.wrap}>
      <p className={s.head}>New split-screen or yap</p>
      <textarea
        className={s.idea}
        rows={2}
        placeholder="The idea, or the question if you already have it (Why... / How to...)"
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        disabled={busy}
      />
      <div className={s.row}>
        <button type="button" className={s.go} onClick={() => go('split_screen_short')} disabled={busy || !idea.trim()}>
          {busy ? 'Creating…' : 'Split-screen →'}
        </button>
        <button type="button" className={s.goQuiet} onClick={() => go('yap')} disabled={busy || !idea.trim()}>
          Yap →
        </button>
        <span className={s.note}>April proposes titles against your rules; you pick one.</span>
      </div>
      {err ? <p className={s.err}>{err}</p> : null}
    </div>
  );
}
