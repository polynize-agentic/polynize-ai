'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Answers } from '@/lib/types';
import { QUESTIONS, resolveLabel, type Question } from '@/lib/agents/questions';
import s from './phase-a.module.css';

type Props = {
  initial?: Partial<Answers>;
  initialStep?: number;
  onAnswersChange?: (answers: Partial<Answers>, step: number) => void;
  onComplete: (answers: Partial<Answers>) => void;
};

const BLANK: Partial<Answers> = {
  name: '',
  company: '',
  business_description: '',
  team_size: '',
  functional_areas: [],
  primary_area: '',
  drowning_work: '',
  human_critical: '',
  primary_risk: '',
  tools: [],
  urgency: '',
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

  // Q04 (primary_area) options come from Q03 (functional_areas) at runtime.
  const dynamicOptions = useMemo(() => {
    if (q.id !== 'primary_area') return null;
    return answers.functional_areas ?? [];
  }, [q.id, answers.functional_areas]);

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

  // Plain Enter advances on chip/email; Cmd/Ctrl+Enter advances in textarea.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.shiftKey) return;
      const isTextLike = q.type === 'textarea' || q.type === 'business' || q.type === 'email';
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

          {q.type === 'textarea' && (
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
              <input
                className={s.input}
                type="text"
                placeholder="your first name"
                value={answers.name ?? ''}
                autoFocus
                onChange={(e) => setField('name', e.target.value)}
              />
              <input
                className={`${s.input} ${s.inputThin}`}
                type="text"
                placeholder="business name"
                value={answers.company ?? ''}
                onChange={(e) => setField('company', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && checkCanAdvance(q, answers)) {
                    e.preventDefault();
                    next();
                  }
                }}
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

          {q.type === 'single' && (q.options || dynamicOptions) && (
            <div className={s.single}>
              {(dynamicOptions ?? q.options ?? []).map((o) => (
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
              {q.dynamicOptions && (dynamicOptions?.length ?? 0) === 0 && (
                <div className={s.sub} style={{ marginTop: 0 }}>
                  Pick at least one functional area on the previous step.
                </div>
              )}
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
                ? 'send_my_business_map →'
                : step === QUESTIONS.length - 1
                  ? 'generate_business_map →'
                  : 'next →'}
            </button>
            {q.type === 'textarea' && <span className={s.hint}>⌘ + enter</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function checkCanAdvance(q: Question, answers: Partial<Answers>): boolean {
  if (q.type === 'business') {
    return ((answers.name ?? '').trim().length >= 2) && ((answers.company ?? '').trim().length >= 2);
  }
  if (q.type === 'multi') {
    return ((answers[q.id as keyof Answers] as string[] | undefined)?.length ?? 0) > 0;
  }
  if (q.type === 'email') return /^\S+@\S+\.\S+$/.test(answers.email ?? '');
  if (q.type === 'textarea') {
    return ((answers[q.id as keyof Answers] as string | undefined) ?? '').trim().length > 3;
  }
  return Boolean(answers[q.id as keyof Answers]);
}
