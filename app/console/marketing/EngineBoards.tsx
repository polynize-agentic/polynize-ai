'use client';

/**
 * THE BOARDS ON THE ENGINE PAGE, WITH THE TEAM FOLDED AWAY (D117).
 *
 * Marrs, 21 September: "hide Shourov, Kristin, and Julian's cards in my view so I can't see them.
 * Maybe just have a toggle switch in the top right somewhere, just a little button that I can flick
 * them on and off at some point, just on the content engine main screen, so I can see them when
 * needed."
 *
 * The switch is top right of the title. Off hides every other person's board; on shows them. Only
 * this page: the boards themselves, the calendar and the numbers are untouched. The choice is
 * remembered in this browser and nowhere else, because it is a way of looking, not a fact about the
 * boards. Where the switch starts is decided by the server (his seat starts folded; a teammate's
 * starts open), and a remembered choice wins over that.
 */

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import s from '../_components/client-card.module.css';
import l from '../_components/launcher.module.css';

export type BoardCard = {
  id: string;
  label: string;
  desc: string;
  avatar?: string;
  team: boolean;
};

const KEY = 'pam.engine.showTeamBoards';

export function EngineBoards({
  cards,
  defaultShowTeam,
  children,
}: {
  cards: BoardCard[];
  defaultShowTeam: boolean;
  /** The whole-engine buttons, rendered by the server, shown between the title and the boards. */
  children?: ReactNode;
}) {
  const [showTeam, setShowTeam] = useState(defaultShowTeam);
  useEffect(() => {
    try {
      const v = window.localStorage.getItem(KEY);
      if (v === '1') setShowTeam(true);
      else if (v === '0') setShowTeam(false);
    } catch {
      /* a private window or blocked storage: the server's default stands */
    }
  }, []);
  const flip = () => {
    const next = !showTeam;
    setShowTeam(next);
    try {
      window.localStorage.setItem(KEY, next ? '1' : '0');
    } catch {
      /* not remembered, still flipped */
    }
  };
  const teamCount = cards.filter((c) => c.team).length;
  const shown = showTeam ? cards : cards.filter((c) => !c.team);

  return (
    <>
      <div className={`${s.header} ${s.headerRow}`}>
        <div>
          <div className={s.eyebrow}>marketing engine</div>
          <h1 className={s.title}>Content engine</h1>
        </div>
        {teamCount > 0 ? (
          <button
            type="button"
            className={`${s.switch} ${showTeam ? s.switchOn : ''}`}
            onClick={flip}
            aria-pressed={showTeam}
            title={showTeam ? 'Hide the team boards' : 'Show the team boards'}
          >
            <span className={s.switchKnob} aria-hidden />
            Team boards{showTeam ? '' : ` · ${teamCount} hidden`}
          </button>
        ) : null}
      </div>

      {children}

      <div className={l.cards}>
        {shown.map((c) => (
          <Link key={c.id} href={`/console/marketing/stream/${c.id}`} className={`${l.card} ${s.hasAvatar}`}>
            <span className={s.streamAvatar} aria-hidden>
              {c.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.avatar} alt="" className={s.streamAvatarImg} />
              ) : (
                /* The mint mark, half the circle's diameter, so the brand card reads as a
                   mark and not as a logo that has been shrunk. */
                <span className={s.streamAvatarMark} />
              )}
            </span>
            <span className={l.cardTitle}>{c.label}</span>
            <span className={l.cardDesc}>{c.desc}</span>
            <span className={l.cardArrow} aria-hidden>
              →
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
