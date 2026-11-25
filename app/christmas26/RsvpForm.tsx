'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import s from './christmas26.module.css';
import { CalendarButtons } from './CalendarButtons';
import {
  ERRORS,
  EVENT,
  LIMITS,
  QUESTIONS_EMAIL,
  RSVP_API_PATH,
  validateRsvp,
  type RsvpFieldErrors,
  type RsvpFields,
} from '@/lib/christmas26/event';

type Props = {
  /** The `?n=` name of a personal link, already cleaned on the server. */
  linkName: string | null;
  /** `?test=1`: the email subject starts with "TEST" and the row is marked as a test. */
  test: boolean;
};

type Done = { coming: boolean; name: string };

/** Where focus goes for each error, in the order the fields appear. */
const ERROR_FOCUS: Array<[keyof RsvpFieldErrors, string]> = [
  ['name', 'rsvp-name'],
  ['coming', 'rsvp-coming-yes'],
  ['partner', 'rsvp-partner-alone'],
  ['partnerName', 'rsvp-partner-name'],
];

const COPY = {
  yes: "Yes, I'll be there",
  no: "Sorry, I can't make it",
  alone: 'Just me',
  withPartner: 'Yes, with my partner',
  partnerName: "Your partner's name",
  allergiesHint: 'For you and your partner, so the kitchen can look after you.',
  privacy: 'We use your reply only to plan this party, and we delete it after the event.',
  closedTail: 'If your plans have changed, email',
} as const;

function focusFirst(errors: RsvpFieldErrors) {
  const hit = ERROR_FOCUS.find(([key]) => errors[key]);
  if (hit) document.getElementById(hit[1])?.focus();
}

export function RsvpClosed() {
  return (
    <p className={s.closed}>
      {ERRORS.closed} {COPY.closedTail} <a href={`mailto:${QUESTIONS_EMAIL}`}>{QUESTIONS_EMAIL}</a>.
    </p>
  );
}

export function RsvpForm({ linkName, test }: Props) {
  const [f, setF] = useState<RsvpFields>({
    name: linkName ?? '',
    coming: '',
    partner: '',
    partnerName: '',
    allergies: '',
    note: '',
  });
  const [errors, setErrors] = useState<RsvpFieldErrors>({});
  const [formError, setFormError] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const [closed, setClosed] = useState(false);
  const honeypot = useRef<HTMLInputElement>(null);
  const doneRef = useRef<HTMLParagraphElement>(null);

  // Move focus to the thank-you line, so a screen reader announces it and the visitor sees it.
  useEffect(() => {
    if (done) doneRef.current?.focus();
  }, [done]);

  function set<K extends keyof RsvpFields>(key: K, value: RsvpFields[K]) {
    setF((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key as keyof RsvpFieldErrors] ? { ...prev, [key]: undefined } : prev));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (sending) return;
    setFormError('');
    const check = validateRsvp(f);
    if (!check.ok) {
      setErrors(check.errors);
      focusFirst(check.errors);
      return;
    }
    setSending(true);
    try {
      const res = await fetch(RSVP_API_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, linkName, test, website: honeypot.current?.value ?? '' }),
      });
      if (res.ok) {
        setDone({ coming: check.value.coming, name: linkName ?? check.value.name });
        return;
      }
      if (res.status === 410) {
        setClosed(true);
        return;
      }
      if (res.status === 400) {
        const body = (await res.json().catch(() => null)) as { errors?: RsvpFieldErrors } | null;
        if (body?.errors && Object.keys(body.errors).length > 0) {
          setErrors(body.errors);
          focusFirst(body.errors);
          return;
        }
      }
      setFormError(ERRORS.failed);
    } catch {
      setFormError(ERRORS.failed);
    } finally {
      setSending(false);
    }
  }

  if (closed) return <RsvpClosed />;

  if (done) {
    return (
      <div className={s.done} role="status">
        <p ref={doneRef} tabIndex={-1} className={s.doneText}>
          {done.coming
            ? `Thank you, ${done.name}. See you on ${EVENT.shortDateLabel}.`
            : `Thank you for letting us know, ${done.name}. We'll miss you.`}
        </p>
        {done.coming && <CalendarButtons />}
      </div>
    );
  }

  const describe = (key: keyof RsvpFieldErrors, extra?: string) =>
    [extra, errors[key] ? `rsvp-${key}-error` : undefined].filter(Boolean).join(' ') || undefined;

  return (
    <form className={s.form} onSubmit={submit} noValidate>
      <p className={s.rsvpSub}>Please reply by Friday 27 November.</p>
      <div className={s.field}>
        <label htmlFor="rsvp-name" className={s.label}>
          Your name
        </label>
        <input
          id="rsvp-name"
          className={s.input}
          type="text"
          autoComplete="name"
          maxLength={LIMITS.name}
          value={f.name}
          onChange={(e) => set('name', e.target.value)}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={describe('name')}
        />
        {errors.name && (
          <p id="rsvp-name-error" className={s.error}>
            {errors.name}
          </p>
        )}
      </div>

      <fieldset className={s.fieldset} aria-describedby={describe('coming')}>
        <legend className={s.label}>Can you make it?</legend>
        <div className={s.choices}>
          <label className={s.choice}>
            <input
              id="rsvp-coming-yes"
              type="radio"
              name="coming"
              value="yes"
              checked={f.coming === 'yes'}
              onChange={() => set('coming', 'yes')}
            />
            <span>{COPY.yes}</span>
          </label>
          <label className={s.choice}>
            <input
              id="rsvp-coming-no"
              type="radio"
              name="coming"
              value="no"
              checked={f.coming === 'no'}
              onChange={() => set('coming', 'no')}
            />
            <span>{COPY.no}</span>
          </label>
        </div>
        {errors.coming && (
          <p id="rsvp-coming-error" className={s.error}>
            {errors.coming}
          </p>
        )}
      </fieldset>

      {f.coming === 'yes' && (
        <>
          <fieldset className={s.fieldset} aria-describedby={describe('partner')}>
            <legend className={s.label}>Are you bringing your partner?</legend>
            <div className={s.choices}>
              <label className={s.choice}>
                <input
                  id="rsvp-partner-alone"
                  type="radio"
                  name="partner"
                  value="alone"
                  checked={f.partner === 'alone'}
                  onChange={() => set('partner', 'alone')}
                />
                <span>{COPY.alone}</span>
              </label>
              <label className={s.choice}>
                <input
                  id="rsvp-partner-with"
                  type="radio"
                  name="partner"
                  value="partner"
                  checked={f.partner === 'partner'}
                  onChange={() => set('partner', 'partner')}
                />
                <span>{COPY.withPartner}</span>
              </label>
            </div>
            {errors.partner && (
              <p id="rsvp-partner-error" className={s.error}>
                {errors.partner}
              </p>
            )}
          </fieldset>

          {f.partner === 'partner' && (
            <div className={s.field}>
              <label htmlFor="rsvp-partner-name" className={s.label}>
                {COPY.partnerName}
              </label>
              <input
                id="rsvp-partner-name"
                className={s.input}
                type="text"
                autoComplete="off"
                maxLength={LIMITS.partnerName}
                value={f.partnerName}
                onChange={(e) => set('partnerName', e.target.value)}
                aria-invalid={errors.partnerName ? true : undefined}
                aria-describedby={describe('partnerName')}
              />
              {errors.partnerName && (
                <p id="rsvp-partnerName-error" className={s.error}>
                  {errors.partnerName}
                </p>
              )}
            </div>
          )}

          <div className={s.field}>
            <label htmlFor="rsvp-allergies" className={s.label}>
              Any food allergies?<span className={s.optional}>Optional</span>
            </label>
            <p id="rsvp-allergies-hint" className={s.hint}>
              {COPY.allergiesHint}
            </p>
            <textarea
              id="rsvp-allergies"
              className={s.input}
              rows={2}
              maxLength={LIMITS.allergies}
              value={f.allergies}
              onChange={(e) => set('allergies', e.target.value)}
              aria-describedby="rsvp-allergies-hint"
            />
          </div>
        </>
      )}

      <div className={s.field}>
        <label htmlFor="rsvp-note" className={s.label}>
          A note for Shourov and Marrs<span className={s.optional}>Optional</span>
        </label>
        <textarea
          id="rsvp-note"
          className={s.input}
          rows={3}
          maxLength={LIMITS.note}
          value={f.note}
          onChange={(e) => set('note', e.target.value)}
        />
      </div>

      {/* Spam trap. People never see it; bots fill it in. The API drops any reply that has it. */}
      <div className={s.honeypot} aria-hidden="true">
        <label htmlFor="rsvp-website">Leave this empty</label>
        <input ref={honeypot} id="rsvp-website" type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {formError && (
        <p className={s.formError} role="alert">
          {formError}
        </p>
      )}

      <div className={s.submitRow}>
        <button type="submit" className={`${s.btnPrimary} ${s.submit}`} disabled={sending}>
          {sending ? 'Sending...' : 'Send my reply'}
        </button>
        <p className={s.privacy}>{COPY.privacy}</p>
      </div>
    </form>
  );
}
