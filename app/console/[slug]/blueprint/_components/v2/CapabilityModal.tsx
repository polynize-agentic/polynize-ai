'use client';

/**
 * Capability glance modal (spec §9.6, v1).
 *
 * Opens on capability row click. Shows AT A GLANCE (one screen, no nested
 * drill-down in v1):
 *   - name + id
 *   - owning agent (resolved from work-plan registry covering this id)
 *   - allocation (AGENTIC/HYBRID/HUMAN) + completeness
 *   - throughput / trigger (from work_shape)
 *   - skills (work_shape.type)
 *   - connectors (work_shape.inputs)
 *   - benchmark (if set in engagement-model.json)
 *
 * Read-only. Closes on Escape and backdrop click.
 */

import { useEffect, useRef } from 'react';
import type { CapabilityMapV05 } from '@/lib/blueprint/load-v2';
import { AllocationChip } from './shared';
import s from './v2-sections.module.css';

type Cap = CapabilityMapV05['capabilities'][number];

export function CapabilityModal({
  cap,
  owningAgent,
  benchmark,
  onClose,
}: {
  cap: Cap;
  owningAgent: string | null;
  benchmark: string | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className={s.modalBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label={`Capability ${cap.id}: ${cap.name}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={s.modal}>
        <div className={s.modalHead}>
          <div>
            <div className={s.modalId}>CAPABILITY {cap.id}</div>
            <h3 className={s.modalTitle}>{cap.name}</h3>
          </div>
          <button
            ref={closeRef}
            type="button"
            className={s.modalClose}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className={s.modalChips}>
          <AllocationChip allocation={cap.allocation} />
          <span className={`${s.tag}`}>{cap.completeness}</span>
          {cap.failure_cost !== 'N/A' && (
            <span className={s.tag}>risk: {cap.failure_cost.toLowerCase()}</span>
          )}
          <span className={s.tag}>confidence: {cap.confidence.toLowerCase()}</span>
        </div>

        <div className={s.modalGrid}>
          <Field label="Description" value={cap.description} />
          <Field
            label="Owning agent"
            value={owningAgent ?? 'Not yet assigned to a work plan'}
            muted={!owningAgent}
          />
          <Field label="Skills" value={cap.work_shape.type} />
          <Field
            label="Connectors"
            value={cap.work_shape.inputs.join(', ')}
          />
          <Field
            label="Throughput"
            value={`${cap.work_shape.trigger} → ${cap.work_shape.output}`}
          />
          {benchmark && <Field label="Benchmark" value={benchmark} />}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className={s.modalField}>
      <span className={s.modalKey}>{label}</span>
      <span className={`${s.modalValue} ${muted ? s.modalValueMuted : ''}`}>
        {value}
      </span>
    </div>
  );
}
