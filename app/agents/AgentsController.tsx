'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Answers, CapabilityMapData, SessionState } from '@/lib/types';
import { PhaseA } from './PhaseA';
import { PhaseB } from './PhaseB';
import { PhaseC, type ChatMessage } from './PhaseC';
import { track, emailDomain } from '@/lib/analytics';
import { persistAnswers, persistCapabilityMap } from '@/lib/persist-client';
import s from './phase-a.module.css';

const STORAGE_KEY = 'polynize_agents_state_v3';

type Persisted = {
  phase: SessionState['phase'];
  answers: Partial<Answers>;
  step: number;
  data?: CapabilityMapData;
  messages?: ChatMessage[];
};

const INITIAL: Persisted = { phase: 'A', answers: {}, step: 0 };

export function AgentsController() {
  const [state, setState] = useState<Persisted>(INITIAL);
  const [hydrated, setHydrated] = useState(false);
  const [resumePromptDismissed, setResumePromptDismissed] = useState(false);

  // Hydrate from localStorage + bootstrap server session on first mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Persisted>;
        setState({
          phase: parsed.phase ?? 'A',
          answers: parsed.answers ?? {},
          step: parsed.step ?? 0,
          data: parsed.data,
          messages: parsed.messages,
        });
      }
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
      /* quota or private mode, ignore */
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

  const handlePhaseBReady = useCallback((data: CapabilityMapData) => {
    track('phase_b_complete', {
      shape_id: data.shape_internal,
      agent_count: data.team.agents.length,
      capability_count: data.capabilities.length,
      pct_human: data.percentages.human,
      pct_hybrid: data.percentages.hybrid,
      pct_agent: data.percentages.agent,
      generated_by: data.generated_by ?? 'llm',
    });
    persistCapabilityMap(data);
    setState((prev) => ({ ...prev, data, phase: 'C' }));
  }, []);

  const handleMessagesChange = useCallback((messages: ChatMessage[]) => {
    setState((prev) => ({ ...prev, messages }));
  }, []);

  const handleBackToHeatMap = useCallback(() => {
    setState((prev) => ({ ...prev, phase: 'B' }));
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
  // Surface explicit options before dropping them back into Phase C.
  const hasCompletedSession = state.phase === 'C' && Boolean(state.data);
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

  if (state.phase === 'B') {
    return <PhaseB answers={state.answers} preloaded={state.data} onReady={handlePhaseBReady} />;
  }

  if (state.phase === 'C' && state.data) {
    return (
      <PhaseC
        answers={state.answers}
        data={state.data}
        initialMessages={state.messages}
        onMessagesChange={handleMessagesChange}
        onBack={handleBackToHeatMap}
      />
    );
  }

  // DONE state placeholder.
  return (
    <div style={{ padding: '4rem 2rem', maxWidth: 720, margin: '0 auto' }}>
      <p style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--mint)', fontSize: 12, letterSpacing: '0.15em' }}>
        PHASE {state.phase} · scaffold
      </p>
      <h1 style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 36, lineHeight: 1.1, marginTop: 24 }}>
        Flow complete.
      </h1>
      <button
        type="button"
        onClick={reset}
        style={{
          marginTop: 32,
          background: 'transparent',
          border: '1px solid var(--border)',
          color: 'var(--text-2)',
          padding: '10px 18px',
          fontFamily: 'var(--font-jetbrains-mono)',
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        reset_session
      </button>
    </div>
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
