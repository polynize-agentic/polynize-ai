'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Answers } from '@/lib/types';
import { QUESTIONS, ROLE_OPTIONS, SIZE_OPTIONS, resolveLabel, type Question } from '@/lib/agents/questions';
import s from './phase-a.module.css';

type Props = {
  initial?: Partial<Answers>;
  initialStep?: number;
  onAnswersChange?: (answers: Partial<Answers>, step: number) => void;
  onComplete: (answers: Partial<Answers>) => void;
};

const BLANK: Partial<Answers> = {
  name: '',
  q1: '',
  q1_company: '',
  q2_role: '',
  q2_size: '',
  q3: '',
  q4: [],
  q5_volume: '',
  q6_tools: [],
  q7_constraint: '',
  q8_metric: '',
  q9_urgency: '',
  q10_stance: '',
  email: '',
};

export function PhaseA({ initial, initialStep, onAnswersChange, onComplete }: Props) {
  const [answers, setAnswers] = useState<Partial<Answers>>({ ...BLANK, ...initial });
  const [step, setStep] = useState(initialStep ?? 0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const skipNextNotify = useRef(true);

  const q = QUESTIONS[step];
  const firstName = (answers.name ?? '').trim().split(/\s+/)[0] ?? '';
  const label = resolveLabel(q, firstName);
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  const canAdvance = useCallback((): boolean => {
    return checkCanAdvance(q, answers);
  }, [q, answers]);

  const next = useCallback(() => {
    if (!checkCanAdvance(q, answers)) return;
    setDirection(1);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(answers);
    }
  }, [q, answers, step, onComplete]);

  const prev = useCallback(() => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  }, [step]);

  // Notify parent of state changes (for persistence). Skip first run.
  useEffect(() => {
    if (skipNextNotify.current) {
      skipNextNotify.current = false;
      return;
    }
    onAnswersChange?.(answers, step);
  }, [answers, step, onAnswersChange]);

  // Global Enter handling. Plain Enter advances on non-text inputs;
  // Cmd/Ctrl+Enter advances on text inputs.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.shiftKey) return;
      const isTextLike = q.type === 'text' || q.type === 'business' || q.type === 'email';
      if (!isTextLike) {
        e.preventDefault();
        next();
      } else if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [q.type, next]);

  const setField = useCallback(<K extends keyof Answers>(key: K, value: Answers[K]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  const cardClass = direction === 1 ? `${s.card} ${s.cardEnter}` : `${s.card} ${s.cardBack}`;

  return (
    <div className={s.phaseA}>
      <div className={s.progress}>
        <div className={s.progressFill} style={{ width: `${progress}%` }} />
        <div className={s.progressLabel}>
          {q.tag} · {step + 1} / {QUESTIONS.length}
        </div>
      </div>

      <div className={s.stage}>
        <div key={step} className={cardClass}>
          <div className={s.num}>[{String(step + 1).padStart(2, '0')}]</div>
          <h2 className={s.q}>{label}</h2>
          {q.sub && <p className={s.sub}>{q.sub}</p>}

          {q.type === 'text' && q.short && (
            <input
              className={s.input}
              type="text"
              placeholder={q.placeholder}
              value={(answers[q.id as keyof Answers] as string) ?? ''}
              autoFocus
              onChange={(e) => setField(q.id as keyof Answers, e.target.value as never)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  next();
                }
              }}
            />
          )}

          {q.type === 'text' && !q.short && (
            <textarea
              className={s.input}
              placeholder={q.placeholder}
              value={(answers[q.id as keyof Answers] as string) ?? ''}
              autoFocus
              onChange={(e) => setField(q.id as keyof Answers, e.target.value as never)}
            />
          )}

          {q.type === 'business' && (
            <div className={s.business}>
              <textarea
                className={s.input}
                placeholder="e.g. we help mid-market ops teams roll out internal tooling"
                value={answers.q1 ?? ''}
                autoFocus
                onChange={(e) => setField('q1', e.target.value)}
              />
              <input
                className={`${s.input} ${s.inputThin}`}
                type="text"
                placeholder="business name (optional)"
                value={answers.q1_company ?? ''}
                onChange={(e) => setField('q1_company', e.target.value)}
              />
            </div>
          )}

          {q.type === 'email' && (
            <div className={s.email}>
              <input
                className={s.input}
                type="email"
                placeholder="you@company.com"
                value={answers.email ?? ''}
                autoFocus
                onChange={(e) => setField('email', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && checkCanAdvance(q, { ...answers, email: (e.target as HTMLInputElement).value })) {
                    e.preventDefault();
                    next();
                  }
                }}
              />
              <div className={s.emailPromise}>
                <span className={s.lock}>▲</span>
                We won&apos;t share it. You&apos;ll get your report within two minutes.
              </div>
            </div>
          )}

          {q.type === 'role_size' && (
            <div className={s.pairs}>
              <div>
                <div className={s.sublabel}>Role</div>
                <div className={s.chips}>
                  {ROLE_OPTIONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`${s.chip} ${answers.q2_role === r ? s.chipOn : ''}`}
                      onClick={() => setField('q2_role', r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className={s.sublabel}>Team size</div>
                <div className={s.chips}>
                  {SIZE_OPTIONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`${s.chip} ${answers.q2_size === r ? s.chipOn : ''}`}
                      onClick={() => setField('q2_size', r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {q.type === 'multi' && q.options && (
            <div className={s.multi}>
              {q.options.map((o) => {
                const cur = (answers[q.id as keyof Answers] as string[] | undefined) ?? [];
                const on = cur.includes(o);
                return (
                  <button
                    key={o}
                    type="button"
                    className={`${s.opt} ${on ? s.optOn : ''}`}
                    onClick={() => {
                      const nextVal = on ? cur.filter((x) => x !== o) : [...cur, o];
                      setField(q.id as keyof Answers, nextVal as never);
                    }}
                  >
                    <span className={s.check}>{on ? '●' : '○'}</span>
                    <span>{o}</span>
                  </button>
                );
              })}
            </div>
          )}

          {q.type === 'single' && q.options && (
            <div className={s.single}>
              {q.options.map((o) => (
                <button
                  key={o}
                  type="button"
                  className={`${s.opt} ${answers[q.id as keyof Answers] === o ? s.optOn : ''}`}
                  onClick={() => {
                    const newAnswers = { ...answers, [q.id]: o };
                    setAnswers(newAnswers);
                    setTimeout(() => {
                      setDirection(1);
                      if (step < QUESTIONS.length - 1) {
                        setStep(step + 1);
                      } else {
                        onComplete(newAnswers);
                      }
                    }, 260);
                  }}
                >
                  <span className={s.check}>{answers[q.id as keyof Answers] === o ? '●' : '○'}</span>
                  <span>{o}</span>
                </button>
              ))}
            </div>
          )}

          <div className={s.controls}>
            {step > 0 && (
              <button type="button" className={s.back} onClick={prev}>
                ← back
              </button>
            )}
            <div className={s.spacer} />
            <button type="button" className={s.next} disabled={!canAdvance()} onClick={next}>
              {q.type === 'email'
                ? 'send_my_heat_map →'
                : step === QUESTIONS.length - 1
                  ? 'generate_heat_map →'
                  : 'next →'}
            </button>
            {q.type === 'text' && <span className={s.hint}>⌘ + enter</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function checkCanAdvance(q: Question, answers: Partial<Answers>): boolean {
  if (q.id === 'name') return ((answers.name ?? '').trim().length >= 2);
  if (q.id === 'q1' || q.type === 'business') return ((answers.q1 ?? '').trim().length > 3);
  if (q.type === 'role_size') return Boolean(answers.q2_role && answers.q2_size);
  if (q.type === 'multi') return ((answers[q.id as keyof Answers] as string[] | undefined)?.length ?? 0) > 0;
  if (q.type === 'email') return /^\S+@\S+\.\S+$/.test(answers.email ?? '');
  if (q.type === 'text') return ((answers[q.id as keyof Answers] as string | undefined) ?? '').trim().length > 3;
  return Boolean(answers[q.id as keyof Answers]);
}
