'use client';

/**
 * THE STAGED BUILD (D39): agree the hooks, agree the arc, then write.
 *
 * This replaces the one-shot angle box for video. It exists because the old path gave Marrs
 * exactly one decision (a free-text angle worth ~1% of April's instruction) and then produced
 * the entire script from it, so the first thing he could review was also the last thing made.
 *
 * Both stages are CHOOSERS, not forms. Every hook shows the pattern it uses and the concept
 * material it stands on, and every beat of the arc says what it argues and what it stands on,
 * because the thing he could never see was April's selection from the concept. Making that
 * visible while it is still two lines of text is the entire point.
 *
 * Nothing here writes to the server: the parent owns the single autosave path, so this reports
 * agreed hooks and an agreed arc upward and lets the piece save them with everything else.
 */

import { useState } from 'react';
import type { HookOption } from '@/lib/marketing/draft';
import s from './staged.module.css';

type Props = {
  hooks: string[];
  outline: string;
  conceptRead: string[];
  onHooksChange: (hooks: string[]) => void;
  onOutlineChange: (outline: string) => void;
  onConceptReadChange: (read: string[]) => void;
  /** Write the script. Only offered once both stages are settled. */
  onWriteScript: () => void;
  writing: boolean;
  /** True when a script already exists, so the panel starts collapsed and out of the way. */
  hasScript: boolean;
  /**
   * ONE AT A TIME (D104). On the Marrs Attacks formats the "hook" is the title and the title is the
   * piece, so choosing a second one is starting a second piece. Marrs, after choosing four: "it wrote
   * me one narrative. The narrative isn't particularly good for any of the hooks... I only should be
   * able to select one hook, and then the narrative is locked to that hook." The others are saved to
   * the ideas inbox for Gate 1 instead.
   */
  single?: boolean;
  /** The stream whose inbox saved titles go to. */
  stream?: string;
  /**
   * LOCKED AT GATE 1 (D105). The hook was chosen from the Hook library, so this screen proposes
   * nothing: it shows the hook and moves on to the arc. It is also the question on the prezie's first
   * slide, so changing it here would change the piece.
   */
  locked?: boolean;
};

export function StagedBuild({
  hooks,
  outline,
  conceptRead,
  onHooksChange,
  onOutlineChange,
  onConceptReadChange,
  onWriteScript,
  writing,
  hasScript,
  single = false,
  stream,
  locked = false,
}: Props) {
  const hookLocked = single && locked && hooks.length === 1;
  const [open, setOpen] = useState(!hasScript);
  /** Which options have been saved to the inbox this visit, so the button can say so. */
  const [saved, setSaved] = useState<Record<string, 'saving' | 'saved' | 'failed'>>({});
  const saveForLater = async (text: string) => {
    if (!stream || saved[text] === 'saving' || saved[text] === 'saved') return;
    setSaved((m) => ({ ...m, [text]: 'saving' }));
    try {
      const res = await fetch(`/console/marketing/stream/${stream}/ideas`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      setSaved((m) => ({ ...m, [text]: res.ok ? 'saved' : 'failed' }));
    } catch {
      setSaved((m) => ({ ...m, [text]: 'failed' }));
    }
  };
  const [steer, setSteer] = useState('');
  const [options, setOptions] = useState<HookOption[]>([]);
  const [busy, setBusy] = useState<null | 'hooks' | 'outline'>(null);
  const [arcFlags, setArcFlags] = useState<string[]>([]);
  /** "Any ideas or direction?" (D106): where he wants this to go, in his words, before the arc. */
  const [arcSteer, setArcSteer] = useState('');
  /** The three places the hook could go, for the Marrs Attacks formats, until one is taken. */
  const [directions, setDirections] = useState<{ where: string; why: string; object: string }[]>([]);
  const [taking, setTaking] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);

  const base = () => window.location.pathname.replace(/\/+$/, '');

/**
 * Size a textarea to its content.
 *
 * Called on mount and on every input. Cheap, and it removes the guesswork: a hook is short but
 * its wrapped height depends entirely on the viewport, so no `rows` value is right on both a
 * laptop and a phone.
 */
function grow(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}

  /**
   * Propose (or re-propose) hooks. Appends rather than replaces, so "give me six more" widens
   * the set he is choosing from instead of throwing away the batch he was still reading.
   */
  const getHooks = async (append: boolean) => {
    if (busy) return;
    setBusy('hooks');
    setErr(null);
    try {
      const res = await fetch(`${base()}/hooks`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ steer: steer.trim() }),
      });
      const b = (await res.json().catch(() => null)) as
        | { concept_read?: string[]; hooks?: HookOption[]; model?: string; error?: string }
        | null;
      if (!res.ok) {
        setErr(b?.error ?? 'Could not get hooks.');
        return;
      }
      setOptions((prev) => (append ? [...prev, ...(b?.hooks ?? [])] : (b?.hooks ?? [])));
      if (b?.concept_read?.length) onConceptReadChange(b.concept_read);
      setModel(b?.model ?? null);
    } catch {
      setErr('Network error. Try again.');
    } finally {
      setBusy(null);
    }
  };

  /**
   * THE ARC IN TWO MOVES (D106). Without a direction: a Story piece gets its arc; a Marrs Attacks piece
   * gets three directions to choose from. With one (`develop`): the chosen direction becomes the beats.
   */
  const getOutline = async (direction?: string) => {
    if (busy) return;
    setBusy('outline');
    setErr(null);
    if (direction) setTaking(direction);
    try {
      const res = await fetch(`${base()}/outline`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ steer: arcSteer.trim() || undefined, direction }),
      });
      const b = (await res.json().catch(() => null)) as
        | {
            outline?: string;
            directions?: { where: string; why: string; object: string }[];
            model?: string;
            error?: string;
            warnings?: string[];
          }
        | null;
      if (!res.ok) {
        setErr(b?.error ?? 'Could not get the arc.');
        return;
      }
      setModel(b?.model ?? null);
      if (b?.directions) {
        setDirections(b.directions);
        return;
      }
      onOutlineChange(b?.outline ?? '');
      setDirections([]);
      // Named, not fixed: what the arc is missing, if anything.
      setArcFlags(Array.isArray(b?.warnings) ? b.warnings : []);
    } catch {
      setErr('Network error. Try again.');
    } finally {
      setBusy(null);
      setTaking(null);
    }
  };

  const toggle = (hook: string) => {
    if (single) {
      // The title is the piece: choosing one replaces the other, never adds to it.
      onHooksChange(hooks.includes(hook) ? [] : [hook]);
      return;
    }
    onHooksChange(hooks.includes(hook) ? hooks.filter((h) => h !== hook) : [...hooks, hook]);
  };

  // An edit to a chosen hook has to follow it into the chosen list, or he would edit a hook on
  // screen and the old wording would be the one that reached the script.
  const editOption = (i: number, next: string) => {
    const was = options[i]?.hook ?? '';
    setOptions((prev) => prev.map((o, j) => (j === i ? { ...o, hook: next } : o)));
    if (hooks.includes(was)) onHooksChange(hooks.map((h) => (h === was ? next : h)));
  };

  if (!open) {
    return (
      <button type="button" className={s.reopen} onClick={() => setOpen(true)}>
        Hooks and arc ({hooks.length} hook{hooks.length === 1 ? '' : 's'} agreed)
      </button>
    );
  }

  return (
    <section className={s.wrap}>
      <header className={s.head}>
        <h2 className={s.title}>Build the script</h2>
        {hasScript ? (
          <button type="button" className={s.close} onClick={() => setOpen(false)}>
            Hide
          </button>
        ) : null}
      </header>

      {/* WHAT IS IN THE CONCEPT. Above the hooks because it is the evidence for them. */}
      {conceptRead.length > 0 ? (
        <div className={s.readBox}>
          <p className={s.stepLabel}>What April can use from this concept</p>
          <ul className={s.readList}>
            {conceptRead.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* STAGE ONE: HOOKS */}
      <div className={s.step}>
        <p className={s.stepLabel}>
          1. {single ? 'The hook' : 'Hooks'}
          {hookLocked ? null : (
            <>
              {' '}
              <span className={s.count}>
                {hooks.length} chosen{hooks.length > 0 ? ', and each goes in word for word' : ''}
              </span>
            </>
          )}
        </p>
        {/* LOCKED AT GATE 1 (D105, trimmed in D106): the hook, big, and nothing else. Marrs: "We're
            always going for minimal distraction here." */}
        {hookLocked ? <p className={s.lockedHook}>{hooks[0]}</p> : null}
        {hookLocked ? null : (
        <>
        <textarea
          className={s.steer}
          ref={grow}
          value={steer}
          onInput={(e) => grow(e.currentTarget)}
          onChange={(e) => setSteer(e.target.value)}
          placeholder={
            'Optional. Anything you already know you want? Paste your own hooks here and they go in exactly as written. Or just say the argument you want to make.'
          }
          rows={3}
          disabled={busy !== null}
        />
        <div className={s.row}>
          <button
            type="button"
            className={s.primary}
            onClick={() => getHooks(false)}
            disabled={busy !== null}
          >
            {busy === 'hooks' ? 'Thinking…' : options.length ? 'Start again' : 'Propose hooks'}
          </button>
          {options.length > 0 ? (
            <button
              type="button"
              className={s.ghost}
              onClick={() => getHooks(true)}
              disabled={busy !== null}
            >
              Six more
            </button>
          ) : null}
        </div>
        </>
        )}

        {options.length > 0 && !hookLocked ? (
          <ul className={s.hookList}>
            {options.map((o, i) => {
              const chosen = hooks.includes(o.hook);
              return (
                <li key={i} className={chosen ? `${s.hook} ${s.hookOn}` : s.hook}>
                  <button
                    type="button"
                    className={s.tick}
                    onClick={() => toggle(o.hook)}
                    aria-pressed={chosen}
                    aria-label={chosen ? 'Unchoose this hook' : 'Choose this hook'}
                  >
                    {chosen ? '✓' : ''}
                  </button>
                  <div className={s.hookBody}>
                    <textarea
                      className={s.hookText}
                      ref={grow}
                      value={o.hook}
                      onInput={(e) => grow(e.currentTarget)}
                      onChange={(e) => editOption(i, e.target.value)}
                      rows={2}
                    />
                    <p className={s.why}>
                      <span className={s.tag}>{o.pattern || 'pattern not named'}</span>
                      <span className={s.material}>
                        {o.material || 'no material named'}
                      </span>
                      {single && stream ? (
                        <button
                          type="button"
                          className={`${s.save} ${saved[o.hook] === 'saved' ? s.saved : ''}`}
                          onClick={() => void saveForLater(o.hook)}
                          disabled={saved[o.hook] === 'saving' || saved[o.hook] === 'saved'}
                          title="Put this title in your ideas inbox, so it is one click away at Gate 1 later."
                        >
                          {saved[o.hook] === 'saved'
                            ? 'Saved to ideas'
                            : saved[o.hook] === 'saving'
                              ? 'Saving…'
                              : saved[o.hook] === 'failed'
                                ? 'Not saved, try again'
                                : 'Save for later'}
                        </button>
                      ) : null}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      {/* STAGE TWO: THE ARC */}
      <div className={s.step}>
        <p className={s.stepLabel}>2. The narrative arc</p>
        {hooks.length === 0 ? (
          <p className={s.hint}>
            {single ? 'Choose one hook above first.' : 'Choose your hooks first. The arc has to hand over to all of them.'}
          </p>
        ) : single && hooks.length !== 1 ? (
          <p className={s.hint}>Choose one hook only; the arc is locked to it.</p>
        ) : (
          <>
            {/* WHERE HE WANTS IT TO GO (D106). Marrs: "I'd want a text box in there that says Any ideas
                or direction?... If I don't have an idea, it just says Propose an arc." */}
            <textarea
              className={s.steer}
              ref={grow}
              value={arcSteer}
              onInput={(e) => grow(e.currentTarget)}
              onChange={(e) => setArcSteer(e.target.value)}
              placeholder="Any ideas or direction?"
              rows={2}
              disabled={busy !== null}
            />
            <div className={s.row}>
              <button
                type="button"
                className={s.primary}
                onClick={() => void getOutline()}
                disabled={busy !== null}
              >
                {busy === 'outline' && !taking
                  ? 'Thinking…'
                  : outline.trim() || directions.length
                    ? single
                      ? 'Propose different directions'
                      : 'Propose a different arc'
                    : 'Propose an arc'}
              </button>
            </div>
            {/* THREE PLACES THE HOOK COULD GO (D106): where, why it fits, the object. Take one and it
                becomes the beats below. */}
            {single && directions.length > 0 ? (
              <ul className={s.directions}>
                {directions.map((d) => (
                  <li key={d.where} className={s.direction}>
                    <p className={s.directionWhere}>{d.where}</p>
                    <p className={s.directionWhy}>
                      {d.why}
                      {d.object ? <span className={s.directionObject}> · on screen: {d.object}</span> : null}
                    </p>
                    <button
                      type="button"
                      className={s.ghost}
                      onClick={() => void getOutline(d.where)}
                      disabled={busy !== null}
                    >
                      {taking === d.where ? 'Developing…' : 'Take this →'}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            {outline.trim() ? (
              <textarea
                className={s.outline}
                value={outline}
                onChange={(e) => onOutlineChange(e.target.value)}
                rows={16}
                spellCheck={false}
              />
            ) : null}
            {arcFlags.length ? (
              <ul className={s.material} aria-label="Tests this plan failed">
                {arcFlags.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            ) : null}
          </>
        )}
      </div>

      {/* STAGE THREE */}
      <div className={s.step}>
        <p className={s.stepLabel}>3. The script</p>
        <div className={s.row}>
          <button
            type="button"
            className={s.write}
            onClick={onWriteScript}
            disabled={writing || busy !== null || hooks.length === 0}
          >
            {writing ? 'Writing…' : 'Write the script'}
          </button>
          {hooks.length === 0 ? (
            <span className={s.hint}>Needs at least one agreed hook.</span>
          ) : !outline.trim() ? (
            <span className={s.hint}>
              No arc agreed. She will build one herself, which is the old behaviour.
            </span>
          ) : null}
        </div>
      </div>

      {err ? <p className={s.err}>{err}</p> : null}
      {model && !err ? <p className={s.model}>April is running on {model}</p> : null}
    </section>
  );
}
