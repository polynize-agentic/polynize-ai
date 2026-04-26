'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Answers, HeatMapData, SessionState } from '@/lib/types';
import { PhaseA } from './PhaseA';
import { PhaseB } from './PhaseB';
import { PhaseC, type ChatMessage } from './PhaseC';
import { track, emailDomain } from '@/lib/analytics';
import { persistAnswers, persistHeatMap } from '@/lib/persist-client';

const STORAGE_KEY = 'polynize_agents_state_v2';

type Persisted = {
  phase: SessionState['phase'];
  answers: Partial<Answers>;
  step: number;
  data?: HeatMapData;
  messages?: ChatMessage[];
};

const INITIAL: Persisted = { phase: 'A', answers: {}, step: 0 };

export function AgentsController() {
  const [state, setState] = useState<Persisted>(INITIAL);
  const [hydrated, setHydrated] = useState(false);

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

    // Issue (or refresh) the server session cookie. The actual sessions
    // row is created lazily by ensureSession on the first write, so this
    // POST is just to mint the cookie up-front for cleaner debugging.
    void fetch('/api/session', { method: 'POST', credentials: 'same-origin' }).catch(() => {
      /* offline ok — writes will retry */
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
    // Persist the partial answers per step. Max ~12 writes per flow,
    // not per keystroke — handleAnswersChange fires on step transitions.
    persistAnswers(answers, false);
  }, []);

  const handlePhaseAComplete = useCallback((answers: Partial<Answers>) => {
    track('phase_a_complete', {
      steps_completed: 12,
      has_email: Boolean(answers.email),
    });
    if (answers.email) {
      track('email_captured', { domain: emailDomain(answers.email) });
    }
    persistAnswers(answers, true);
    setState((prev) => ({ ...prev, answers, phase: 'B' }));
  }, []);

  const handlePhaseBReady = useCallback((data: HeatMapData) => {
    track('phase_b_complete', {
      shape_id: data.shape_id,
      pct_human: data.percentages.human,
      pct_hybrid: data.percentages.hybrid,
      pct_agent: data.percentages.agent,
    });
    persistHeatMap(data);
    setState((prev) => ({ ...prev, data, phase: 'C' }));
  }, []);

  const handleMessagesChange = useCallback((messages: ChatMessage[]) => {
    setState((prev) => ({ ...prev, messages }));
  }, []);

  const handleBackToHeatMap = useCallback(() => {
    setState((prev) => ({ ...prev, phase: 'B' }));
  }, []);

  const reset = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setState(INITIAL);
  }, []);

  if (!hydrated) {
    return null;
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
    return <PhaseB answers={state.answers} onReady={handlePhaseBReady} />;
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

  // DONE state placeholder; Blueprint render lands next.
  return (
    <div style={{ padding: '4rem 2rem', maxWidth: 720, margin: '0 auto' }}>
      <p style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--mint)', fontSize: 12, letterSpacing: '0.15em' }}>
        PHASE {state.phase} · scaffold
      </p>
      <h1 style={{ fontFamily: 'var(--font-space-grotesk)', fontSize: 36, lineHeight: 1.1, marginTop: 24 }}>
        Flow complete. Blueprint renderer lands next.
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
