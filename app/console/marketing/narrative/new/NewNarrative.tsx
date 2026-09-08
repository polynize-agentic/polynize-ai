'use client';

/**
 * GATE 1 · IDEA (D40, narrowed by D45). ONE decision now: which idea.
 *
 * The ideas come from the inbox (this stream's, newest first) and the box on top takes a fresh
 * one, because ideas arrive "in the flow of my week" and the gate must accept them at the exact
 * moment they exist. Typing in the box deselects the list; picking from the list clears the box:
 * one idea is the input, never a blend.
 *
 * THE LANE PICKER IS GONE when you arrive from a stream, which is now the only way in: you got
 * here from that person's board, so asking whose narrative it is would be asking a question the
 * click already answered. It still appears when there is no stream in the url, so the screen
 * cannot become unreachable if something links to it bare.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { streamLabel } from '@/lib/marketing/streams';
import { USE_CASES, guessUseCase, usesUseCases } from '@/lib/marketing/use-case';
import { EXAMPLE_TITLES } from '@/lib/marketing/split-screen';
import g from '../gates.module.css';

/**
 * THREE WAYS OUT OF GATE 1 (D103). Marrs: "you have the ideas page, and then underneath that, there are
 * three selections: Split Screen, Yap, Multi. It decides from there how it routes it."
 *
 * Multi is the Story as it always was: one narrative, the article, the kit, many outputs. Split
 * Screen and Yap are his Marrs Attacks formats: one question, one piece, straight to the script
 * screen. All three start from the same idea, which is why they live on this screen and not on the
 * board; the board is for work in flight.
 */
type Route = 'split' | 'yap' | 'multi';
const ROUTES: { id: Route; label: string; hint: string }[] = [
  { id: 'split', label: 'Split screen', hint: 'One question, four beats, the timer. His hero format.' },
  { id: 'yap', label: 'Yap', hint: 'The same question straight to camera, one take.' },
  { id: 'multi', label: 'Multi', hint: 'A narrative: the article, the kit, many outputs.' },
];

export type IdeaRow = { id: string; lane: string; text: string; when: string };

export function NewNarrative({
  ideas,
  streams,
  fixedLane,
  preselect,
  savedTitles = [],
  archivedTitles = [],
}: {
  ideas: IdeaRow[];
  /** Every stream, for the fallback picker. */
  streams: { id: string; label: string }[];
  /** The stream we came from. When set, there is nothing to pick. */
  fixedLane?: string;
  /** An inbox idea to arrive with already chosen ("Create narrative" on the ideas panel). */
  preselect?: string;
  /** Inbox ideas that are titles (D104), shown as their own group on the split-screen and yap routes. */
  savedTitles?: IdeaRow[];
  /** Hooks already used: a post made from them was scheduled (D105). Out of circulation. */
  archivedTitles?: IdeaRow[];
}) {
  const router = useRouter();
  const [picked, setPicked] = useState<string | null>(preselect ?? null);
  /**
   * THE LIST IS LOCAL STATE so a stale idea can be deleted in place (D107). Marrs: "some are a bit
   * stale and I just need to delete them." The delete goes to the inbox route; the row disappears at
   * once and comes back if the server refused.
   */
  const [list, setList] = useState<IdeaRow[]>(ideas);
  const [hookList, setHookList] = useState<IdeaRow[]>(savedTitles);
  const removeIdea = async (row: IdeaRow) => {
    setList((l) => l.filter((i) => i.id !== row.id));
    setHookList((l) => l.filter((i) => i.id !== row.id));
    if (picked === row.id) setPicked(null);
    try {
      const res = await fetch(`/console/marketing/stream/${row.lane}/ideas`, {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: row.id }),
      });
      if (!res.ok) throw new Error('refused');
    } catch {
      setErr('Could not delete that idea. It is still in the inbox.');
      setList(ideas);
      setHookList(savedTitles);
    }
  };
  /**
   * WHICH WAY OUT. Multi by default everywhere. On Polynize boards Split screen and Yap are shown
   * but disabled, because his rules document says the question rules must not be reused there
   * without a separate validation run: the layout stays the same on every board, and the reason
   * is on the button.
   */
  const [route, setRoute] = useState<Route>('multi');
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [chosenLane, setChosenLane] = useState<string | null>(null);
  const lane = fixedLane ?? chosenLane;

  const chosenText =
    typed.trim() || [...list, ...hookList].find((i) => i.id === picked)?.text || '';
  const ready = chosenText !== '' && lane !== null;
  const marrsBoard = lane !== null && !usesUseCases(lane);

  /**
   * THE USE CASE (D96): what this Story is about and for whom. April's suggestion comes from the
   * idea's own words and is shown pre-selected; a click changes it. Nothing is stored until Develop,
   * and the Story screen can change it again, so this is a default and not a commitment.
   */
  const [pickedUseCase, setPickedUseCase] = useState<string | null>(null);
  // Polynize content only: the marrs stream is Marrs Attacks and has no use cases (D101).
  const showUseCases = usesUseCases(lane ?? undefined);
  const suggested = showUseCases && chosenText ? guessUseCase(chosenText) : undefined;
  const useCase = showUseCases ? (pickedUseCase ?? suggested ?? null) : null;

  const develop = async () => {
    if (!ready || busy) return;
    setBusy(true);
    setErr(null);
    // Split screen and Yap mint one piece and open its script screen; no Story, no gates.
    if (route !== 'multi') {
      try {
        const res = await fetch(`/console/marketing/stream/${lane}/split-screen`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            idea: chosenText,
            format: route === 'yap' ? 'yap' : 'split_screen_short',
            idea_ref: typed.trim() ? undefined : (picked ?? undefined),
          }),
        });
        const b = (await res.json().catch(() => null)) as { id?: string; error?: string } | null;
        if (!res.ok || !b?.id) {
          setErr(b?.error ?? 'Could not create it.');
          setBusy(false);
          return;
        }
        router.push(`/console/marketing/piece/${b.id}`);
      } catch {
        setErr('Network error. Try again.');
        setBusy(false);
      }
      return;
    }
    try {
      const res = await fetch('/console/marketing/narrative/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          lane,
          idea: chosenText,
          idea_ref: typed.trim() ? undefined : (picked ?? undefined),
          use_case: useCase ?? undefined,
        }),
      });
      const b = (await res.json().catch(() => null)) as { id?: string; error?: string } | null;
      if (!res.ok || !b?.id) {
        setErr(b?.error ?? 'Could not create the narrative.');
        setBusy(false);
        return;
      }
      router.push(`/console/marketing/narrative/${b.id}`);
    } catch {
      setErr('Network error. Try again.');
      setBusy(false);
    }
  };

  return (
    <div className={g.app}>
      <div className={g.top}>
        <span className={g.where}>
          Gate 1 · Idea{fixedLane ? ` · ${streamLabel(fixedLane)}` : ''}
        </span>
      </div>

      <textarea
        className={g.newidea}
        rows={2}
        placeholder="What's your idea?"
        value={typed}
        onChange={(e) => {
          setTyped(e.target.value);
          if (e.target.value.trim()) setPicked(null);
        }}
        disabled={busy}
      />

      {list
        .filter((i) => !(route !== 'multi' && marrsBoard && hookList.some((t) => t.id === i.id)))
        .map((i) => (
        <div key={i.id} className={g.ideaRow}>
          <button
            type="button"
            className={`${g.idea} ${picked === i.id ? g.ideaOn : ''}`}
            onClick={() => {
              setPicked(i.id);
              setTyped('');
            }}
            disabled={busy}
          >
            {i.text}
            <span className={g.meta}>caught {i.when}</span>
          </button>
          {/* THE LITTLE CROSS (D107): a stale idea leaves the inbox. */}
          <button
            type="button"
            className={g.ideaDel}
            onClick={() => void removeIdea(i)}
            disabled={busy}
            aria-label="Delete this idea"
            title="Delete this idea"
          >
            ×
          </button>
        </div>
      ))}

      {/* THE THREE WAYS OUT (D103), under the ideas. */}
      <p className={g.useCaseHead}>What is it?</p>
      <div className={g.routes} role="group" aria-label="Format">
        {ROUTES.map((r) => {
          const off = r.id !== 'multi' && lane !== null && !marrsBoard;
          return (
            <button
              key={r.id}
              type="button"
              className={`${g.route} ${route === r.id ? g.routeOn : ''}`}
              onClick={() => setRoute(r.id)}
              disabled={busy || off}
              title={off ? 'A Marrs Attacks format. Its question rules are not yet validated for Polynize content.' : r.hint}
              aria-pressed={route === r.id}
            >
              <span className={g.routeLabel}>{r.label}</span>
              <span className={g.routeHint}>{off ? 'Marrs Attacks only' : r.hint}</span>
            </button>
          );
        })}
      </div>

      {/* HIS SCORED TITLES AS SUGGESTIONS (D103), when the way out is a split screen or a yap. One
          click puts a title in the box; he can still type his own. The 9s and 10s come first. */}
      {/* THE HOOK LIBRARY (D105). Marrs: "let's call it the hook library on gate 1." Three groups:
          his own hooks (saved from the script screen or typed as a title), the scored hooks from the
          calibration set that are not already his, and at the bottom the archived ones, out of
          circulation since a post made from them was scheduled. The hook chosen here is locked on
          the script screen and is the question on the prezie's first slide. */}
      {route !== 'multi' && marrsBoard ? (
        <p className={g.libraryHead}>Hook library</p>
      ) : null}

      {route !== 'multi' && marrsBoard && hookList.length > 0 ? (
        <>
          <p className={g.useCaseHead}>
            Your hooks
            <span className={g.meta}> (saved from the script screen, or typed as a title)</span>
          </p>
          <div className={g.examples}>
            {hookList.map((t) => (
              <span key={t.id} className={g.exampleRow}>
                <button
                  type="button"
                  className={`${g.example} ${picked === t.id ? g.exampleOn : ''}`}
                  onClick={() => {
                    setPicked(t.id);
                    setTyped('');
                  }}
                  disabled={busy}
                  title={`saved ${t.when}`}
                >
                  {t.text}
                </button>
                <button
                  type="button"
                  className={g.exampleDel}
                  onClick={() => void removeIdea(t)}
                  disabled={busy}
                  aria-label="Delete this hook"
                  title="Delete this hook"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </>
      ) : null}

      {route !== 'multi' && marrsBoard ? (
        <>
          <p className={g.useCaseHead}>
            Scored hooks
            <span className={g.meta}> (your calibration set, 9s and 10s first)</span>
          </p>
          <div className={g.examples}>
            {EXAMPLE_TITLES.filter(
              (t) =>
                !hookList.some((s) => s.text.toLowerCase() === t.title.toLowerCase()) &&
                !archivedTitles.some((s) => s.text.toLowerCase() === t.title.toLowerCase())
            ).map((t) => (
              <button
                key={t.title}
                type="button"
                className={`${g.example} ${typed.trim() === t.title ? g.exampleOn : ''}`}
                onClick={() => {
                  setTyped(t.title);
                  setPicked(null);
                }}
                disabled={busy}
                title={`Scored ${t.score} by you`}
              >
                {t.title}
              </button>
            ))}
          </div>
        </>
      ) : null}

      {route !== 'multi' && marrsBoard && archivedTitles.length > 0 ? (
        <>
          <p className={g.useCaseHead}>
            Archived hooks
            <span className={g.meta}> (used: a post made from them has been scheduled)</span>
          </p>
          <div className={g.examples}>
            {archivedTitles.map((t) => (
              <span key={t.id} className={`${g.example} ${g.exampleOff}`} title={`used ${t.when}`}>
                {t.text}
              </span>
            ))}
          </div>
        </>
      ) : null}

      {fixedLane ? null : (
        <div className={g.lanes}>
          {streams.map((st) => (
            <button
              key={st.id}
              type="button"
              className={`${g.lane} ${lane === st.id ? g.laneOn : ''}`}
              onClick={() => setChosenLane(st.id)}
              disabled={busy}
            >
              {st.label}
            </button>
          ))}
        </div>
      )}

      {showUseCases && route === 'multi' ? (
      <>
      <p className={g.useCaseHead}>
        Who is this for?
        {suggested && !pickedUseCase ? <span className={g.meta}> suggested from the idea</span> : null}
      </p>
      <div className={g.useCases}>
        {USE_CASES.map((u) => (
          <button
            key={u.id}
            type="button"
            className={`${g.useCase} ${useCase === u.id ? g.useCaseOn : ''}`}
            onClick={() => setPickedUseCase(u.id)}
            disabled={busy}
            title={u.hint}
          >
            {u.label}
          </button>
        ))}
      </div>
      </>
      ) : null}

      {err ? <p className={g.err}>{err}</p> : null}

      <div className={g.bar}>
        <button type="button" className={g.go} onClick={develop} disabled={!ready || busy}>
          {busy
            ? 'Creating…'
            : !chosenText
              ? 'Pick an idea'
              : !lane
                ? 'Pick whose it is'
                : route === 'split'
                  ? 'Split screen →'
                  : route === 'yap'
                    ? 'Yap →'
                    : 'Develop →'}
        </button>
      </div>
    </div>
  );
}
