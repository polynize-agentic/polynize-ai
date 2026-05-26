'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Answers, CapabilityMapV05, SessionState } from '@/lib/types';
import { isV05 } from '@/lib/agents/v05-adapter';
import { PhaseA } from './PhaseA';
import { PhaseB } from './PhaseB';
import { track, emailDomain } from '@/lib/analytics';
import { persistAnswers } from '@/lib/persist-client';
import s from './phase-a.module.css';

// Bumped to v4 because the persisted `data` shape changed (legacy
// CapabilityMapData → CapabilityMapV05) with the Cap Matrix v0.5 redesign.
// Visitors with stored v3 data start fresh, which is fine — the shape isn't
// compatible and there are very few production sessions to date.
const STORAGE_KEY = 'polynize_agents_state_v4';
const LEGACY_STORAGE_KEY = 'polynize_agents_state_v3';

type Persisted = {
  phase: SessionState['phase'];
  answers: Partial<Answers>;
  step: number;
  data?: CapabilityMapV05;
};

const INITIAL: Persisted = { phase: 'A', answers: {}, step: 0 };

/**
 * Two-phase flow.
 *
 *   A: 10 questions, email captured at Q09.
 *   B: capability map generates via LLM, persists to capability_maps,
 *      auto-creates the blueprint row, fires the Scout webhook, and
 *      shows the visitor their map with two CTAs (book a call / share).
 *
 * No Phase C chat step. The "send my blueprint" button is gone — the
 * blueprint is created automatically once the LLM data lands so we
 * never lose visitors who would otherwise drop off mid-Phase-B.
 */
export function AgentsController() {
  const [state, setState] = useState<Persisted>(INITIAL);
  const [hydrated, setHydrated] = useState(false);
  const [resumePromptDismissed, setResumePromptDismissed] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Persisted>;
        // Guard against stale `data` of the wrong shape (e.g. legacy maps
        // saved before the v0.5 redesign). Drop it if the stage marker is
        // missing — PhaseB will regenerate fresh.
        const safeData = isV05(parsed.data) ? parsed.data : undefined;
        setState({
          phase: safeData ? (parsed.phase ?? 'A') : 'A',
          answers: parsed.answers ?? {},
          step: parsed.step ?? 0,
          data: safeData,
        });
      }
      // One-time cleanup of the old localStorage slot.
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      /* ignore corrupted state */
    }
    setHydrated(true);

    void fetch('/api/session', { method: 'POST', credentials: 'same-origin' }).catch(() => {
      /* offline ok */
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  const handleAnswersChange = useCallback((answers: Partial<Answers>, step: number) => {
    setState((prev) => ({ ...prev, answers, step }));
    persistAnswers(answers, false);
  }, []);

  const handlePhaseAComplete = useCallback((answers: Partial<Answers>) => {
    track('phase_a_complete', {
      steps_completed: 10,
      has_email: Boolean(answers.email),
    });
    if (answers.email) {
      track('email_captured', { domain: emailDomain(answers.email) });
    }
    persistAnswers(answers, true);
    setState((prev) => ({ ...prev, answers, phase: 'B' }));
  }, []);

  // Once Phase B has finished generating + persisting + creating the blueprint,
  // it sends the v0.5 data up so we can stash it for the resume guard on next visit.
  const handlePhaseBData = useCallback((data: CapabilityMapV05) => {
    setState((prev) => ({ ...prev, data, phase: 'DONE' }));
  }, []);

  const reset = useCallback(() => {
    track('cta_click', { surface: 'agents_resume_prompt', label: 'start_fresh' });
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setState(INITIAL);
    setResumePromptDismissed(true);
  }, []);

  const resumeExisting = useCallback(() => {
    track('cta_click', { surface: 'agents_resume_prompt', label: 'view_my_map' });
    setResumePromptDismissed(true);
  }, []);

  if (!hydrated) {
    return null;
  }

  // Resume guard: someone landed on /agents but already finished a flow.
  // Surface explicit options before re-rendering Phase B with their map.
  const hasCompletedSession = (state.phase === 'B' || state.phase === 'DONE') && Boolean(state.data);
  if (hasCompletedSession && !resumePromptDismissed) {
    return <ResumePrompt onView={resumeExisting} onReset={reset} />;
  }

  if (state.phase === 'A') {
    return (
      <PhaseA
        initial={state.answers}
        initialStep={state.step}
        onAnswersChange={handleAnswersChange}
        onComplete={handlePhaseAComplete}
      />
    );
  }

  // Phase B (also covers DONE state — same surface, just preloaded data so
  // we don't re-fire the LLM call or the blueprint creation).
  return (
    <PhaseB
      answers={state.answers}
      preloaded={state.data}
      onDataReady={handlePhaseBData}
    />
  );
}

function ResumePrompt({ onView, onReset }: { onView: () => void; onReset: () => void }) {
  return (
    <div className={s.phaseA}>
      <div className={s.stage}>
        <div className={s.card} style={{ textAlign: 'center' }}>
          <div className={s.num} style={{ marginBottom: 16 }}>[ resume ]</div>
          <h2 className={s.q} style={{ marginBottom: 18 }}>
            You already have a capability map.
          </h2>
          <p className={s.sub} style={{ marginBottom: 36 }}>
            Pick up where you left off, or wipe this session and map a fresh bottleneck.
          </p>
          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              className={s.next}
              onClick={onView}
              style={{ minWidth: 220 }}
            >
              view my capability map →
            </button>
            <button
              type="button"
              className={s.back}
              onClick={onReset}
              style={{
                minWidth: 220,
                padding: '14px 22px',
                border: '1px solid var(--border-soft)',
                borderRadius: 12,
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              + start fresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
