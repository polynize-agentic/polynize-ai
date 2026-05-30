'use client';

/**
 * Sprint stage status control (L13). A small select beneath a stepper
 * stage. Team-scope only. Always allowed (work plans are not lock-gated).
 * POSTs to /api/console/[slug]/work-plans/[workPlanId]/stage, then refreshes.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SprintStageId } from '@/lib/blueprint/schema-v2';
import s from './v2-sections.module.css';

export function StageStatusControl({
  slug,
  workPlanId,
  stageId,
  status,
}: {
  slug: string;
  workPlanId: string;
  stageId: SprintStageId;
  status: 'pending' | 'active' | 'complete';
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onChange(next: string) {
    if (busy || next === status) return;
    setBusy(true);
    try {
      const res = await fetch(
        `/api/console/${slug}/work-plans/${workPlanId}/stage`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ stageId, status: next }),
        }
      );
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <select
      className={s.stageSelect}
      value={status}
      disabled={busy}
      onChange={(e) => onChange(e.target.value)}
      aria-label={`Set ${stageId} status`}
    >
      <option value="pending">pending</option>
      <option value="active">active</option>
      <option value="complete">complete</option>
    </select>
  );
}
