'use client';

/**
 * Mark-a-gap-addressed control (L13). Team-scope only. POSTs to
 * /api/console/[slug]/gaps/[gapRef]/status with { addressed: true }, then
 * refreshes. Disabled when the engagement is locked (the endpoint also
 * returns 423, but disabling avoids a pointless round trip).
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import s from './v2-sections.module.css';

export function GapAddressButton({
  slug,
  gapRef,
  locked,
}: {
  slug: string;
  gapRef: string;
  locked: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);

  async function address() {
    if (busy || locked) return;
    setBusy(true);
    setErr(false);
    try {
      const res = await fetch(
        `/api/console/${slug}/gaps/${encodeURIComponent(gapRef)}/status`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ addressed: true }),
        }
      );
      if (!res.ok) {
        setErr(true);
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      setErr(true);
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className={s.gapAddressBtn}
      onClick={address}
      disabled={busy || locked}
      title={locked ? 'Locked' : 'Mark this gap addressed'}
    >
      {busy ? 'Saving…' : err ? 'Retry' : 'mark addressed'}
    </button>
  );
}
