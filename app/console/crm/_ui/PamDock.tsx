'use client';

/**
 * PAM ON THE LEFT EDGE (D126). Marrs: "The chat is persistent on the left or right edges of the screen.
 * The left edge is probably better... we can humanise her a bit." And on her look: "remove the
 * background, and make it look cool in the box where you talk to Pam. Sort of bring that chat alive."
 *
 * Closed, she is a small portrait tab on the left edge of every CRM screen. Open, a panel slides out
 * with her waving on a soft glow, the conversation, and a box to ask her. She knows which company is
 * on screen. The conversation is kept in this browser, so moving between pages does not lose it.
 *
 * Her proposals arrive as cards: Apply saves through the same routes as the CRM's own forms, Dismiss
 * drops it. Nothing she suggests is saved until someone presses Apply.
 */
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { Proposal } from '@/lib/crm/pam';
import { crmCall } from './api';
import s from '../crm.module.css';

type CardState = { state?: 'applied' | 'dismissed' | 'failed'; error?: string };
type Card = Proposal & CardState;
type Turn = {
  role: 'user' | 'assistant';
  content: string;
  proposals?: Card[];
  sources?: { title: string; url: string }[];
};

const KEY = 'pam.crm.chat';
const OPEN_KEY = 'pam.crm.open';

const LABEL: Record<Proposal['type'], string> = {
  create_company: 'New company',
  update_company: 'Update company',
  add_contact: 'New contact',
  update_contact: 'Update contact',
  add_note: 'Note in History',
  add_action: 'Next step',
};

export function PamDock({ firstName }: { firstName: string }) {
  const router = useRouter();
  const raw = usePathname() ?? '';
  const path = raw.startsWith('/console') ? raw : `/console${raw}`;
  const companyId = /^\/console\/crm\/company\/([0-9a-f-]{36})/i.exec(path)?.[1];

  const [open, setOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    setReducedMotion(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  }, []);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY);
      if (saved) setTurns(JSON.parse(saved) as Turn[]);
      if (window.localStorage.getItem(OPEN_KEY) === '1') setOpen(true);
    } catch {
      /* a fresh conversation */
    }
  }, []);
  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(turns.slice(-40)));
    } catch {
      /* not kept, still works */
    }
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [turns, busy]);
  const toggle = (v: boolean) => {
    setOpen(v);
    try {
      window.localStorage.setItem(OPEN_KEY, v ? '1' : '0');
    } catch {
      /* fine */
    }
  };

  /**
   * BELOW THE CONSOLE'S TOP BAR (D126). Marrs: "when scrolled right to the top, the header covers the X,
   * make the header push down the side chat." The bar scrolls away with the page and is drawn above the
   * CRM, so at the top of the page it covered the panel's first 60 pixels. The panel now starts where
   * the bar ends, and as the bar scrolls off, the panel's top follows it up to the top of the screen.
   */
  const [top, setTop] = useState(0);
  useEffect(() => {
    if (!open) return;
    const nav = document.querySelector<HTMLElement>('[data-console-topnav]');
    if (!nav) return;
    // Measured on every scroll directly, not on the next animation frame: scroll events already arrive
    // once a frame, and a frame timer is paused in a hidden tab, which left the panel under the bar.
    const measure = () => setTop(Math.max(0, Math.round(nav.getBoundingClientRect().bottom)));
    measure();
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [open]);

  // Escape closes the panel, from anywhere on the page, including while typing to her.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggle(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const send = async () => {
    const t = text.trim();
    if (!t || busy) return;
    const next: Turn[] = [...turns, { role: 'user', content: t }];
    setTurns(next);
    setText('');
    setBusy(true);
    setErr(null);
    const r = await crmCall('pam', 'POST', {
      messages: next.map((x) => ({ role: x.role, content: x.content })),
      ...(companyId ? { company_id: companyId } : {}),
    });
    setBusy(false);
    if (!r.ok) {
      setErr(String(r.data.error ?? 'Pam could not answer that.'));
      return;
    }
    setTurns([
      ...next,
      {
        role: 'assistant',
        content: String(r.data.reply ?? ''),
        proposals: (r.data.proposals as Proposal[] | undefined) ?? [],
        sources: (r.data.sources as { title: string; url: string }[] | undefined) ?? [],
      },
    ]);
  };

  // Only the card's state changes here, never its kind, so the spread keeps the card's own type.
  const setProposal = (ti: number, pi: number, patch: CardState) =>
    setTurns((all) => all.map((t, i) => (i !== ti ? t : { ...t, proposals: t.proposals?.map((p, j) => (j === pi ? ({ ...p, ...patch } as Card) : p)) })));

  const apply = async (ti: number, pi: number, p: Proposal) => {
    let r;
    if (p.type === 'create_company') r = await crmCall('company', 'POST', p.fields);
    else if (p.type === 'update_company') r = await crmCall(`company/${p.company_id}`, 'PATCH', p.fields);
    else if (p.type === 'add_contact') r = await crmCall('contact', 'POST', { ...p.fields, company_id: p.company_id });
    else if (p.type === 'update_contact') r = await crmCall(`contact/${p.contact_id}`, 'PATCH', p.fields);
    else if (p.type === 'add_action') r = await crmCall('action', 'POST', { ...p.fields, company_id: p.company_id });
    else r = await crmCall('notes', 'POST', { company_id: p.company_id, body: p.body, occurred_at: p.occurred_at, kind: p.kind ?? 'note' });
    if (!r.ok) {
      setProposal(ti, pi, { state: 'failed', error: String(r.data.error ?? 'Could not save that.') });
      return;
    }
    setProposal(ti, pi, { state: 'applied' });
    router.refresh();
  };

  if (!open) {
    return (
      <button type="button" className={s.pamTab} onClick={() => toggle(true)} aria-label="Open Pam, the CRM assistant">
        {/* Her face, cropped from the still, so she is recognisable at a glance. */}
        <span className={s.pamTabFace} aria-hidden />
        <span className={s.pamTabName}>Pam</span>
      </button>
    );
  }

  return (
    <aside className={s.pamPanel} style={top ? { top } : undefined} aria-label="Pam, the CRM assistant">
      <div className={s.pamStage}>
        {/* ONE WAVE, THEN STILL (D126). Marrs: "once she waves once, we can then freeze on the still
            image. It gets a bit distracting after a while." No loop: the wave plays forward and back,
            so it ends on the pose it began with and holds there. She waves again each time the panel
            opens. With reduced motion asked for, she does not wave at all. */}
        <video
          className={s.pamVideo}
          autoPlay={!reducedMotion}
          muted
          playsInline
          aria-hidden
          poster="/pam/assistant/pam.png"
        >
          <source src="/pam/assistant/pam-wave.mov" type='video/mp4; codecs="hvc1"' />
          <source src="/pam/assistant/pam-wave.webm" type="video/webm" />
        </video>
        <div className={s.pamName}>
          <span className={`${s.pamDot} ${busy ? s.pamDotBusy : ''}`} />
          Pam
          <small>{busy ? 'working on it…' : 'your CRM assistant'}</small>
        </div>
        <div className={s.pamTools}>
          {turns.length ? (
            <button type="button" className={s.pamIcon} onClick={() => setTurns([])} title="Start a new conversation">
              New chat
            </button>
          ) : null}
          {/* CLOSE, made obvious (D126). Marrs: "The window needs an x button to close it." There was one,
              a small grey x beside New, and it read as decoration. Escape closes it too. */}
          <button type="button" className={s.pamClose} onClick={() => toggle(false)} aria-label="Close Pam" title="Close (Esc)">
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
              <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className={s.pamChat}>
        {turns.length === 0 ? (
          <div className={`${s.pamBubble} ${s.pamBubblePam}`}>
            Hi {firstName}. I can look things up in the CRM, research a company on the web, or pull people and notes from a Fireflies meeting. I will show you anything I want to add before it is saved.
          </div>
        ) : null}
        {turns.map((t, ti) => (
          <div key={ti} className={s.pamTurn}>
            <div className={`${s.pamBubble} ${t.role === 'assistant' ? s.pamBubblePam : s.pamBubbleYou}`}>{t.content}</div>
            {t.proposals?.map((p, pi) => (
              <div key={pi} className={s.pamCard}>
                <div className={s.pamCardKind}>
                  {LABEL[p.type]}
                  {'company' in p && p.company ? ` · ${p.company}` : ''}
                  {p.type === 'update_contact' ? ` · ${p.person}` : ''}
                </div>
                <div className={s.pamCardText}>{p.summary}</div>
                {'fields' in p ? (
                  <div className={s.pamFields}>
                    {Object.entries(p.fields).map(([k, v]) => (
                      <div key={k}>
                        <span>{k.replace(/_/g, ' ')}</span> {v}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={s.pamFields}>{p.body}</div>
                )}
                {p.state === 'applied' ? (
                  <div className={s.pamDone}>Saved</div>
                ) : p.state === 'dismissed' ? (
                  <div className={s.pamDone}>Dismissed</div>
                ) : (
                  <div className={s.pamCardBtns}>
                    <button type="button" className={s.btn} onClick={() => void apply(ti, pi, p)}>
                      Apply
                    </button>
                    <button type="button" className={s.btnGhost} onClick={() => setProposal(ti, pi, { state: 'dismissed' })}>
                      Dismiss
                    </button>
                    {p.state === 'failed' ? <span className={s.err}>{p.error}</span> : null}
                  </div>
                )}
              </div>
            ))}
            {t.sources?.length ? (
              <div className={s.pamSources}>
                Sources:{' '}
                {t.sources.map((x, i) => (
                  <a key={i} href={x.url} target="_blank" rel="noopener noreferrer">
                    {x.title}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        ))}
        {busy ? <div className={`${s.pamBubble} ${s.pamBubblePam} ${s.pamTyping}`}>…</div> : null}
        {err ? <div className={s.err}>{err}</div> : null}
        <div ref={endRef} />
      </div>

      <div className={s.pamInput}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          placeholder={companyId ? 'Ask Pam about this company…' : 'Ask Pam…'}
          rows={2}
          disabled={busy}
        />
        <button type="button" className={s.btn} onClick={() => void send()} disabled={busy || !text.trim()}>
          Send
        </button>
      </div>
    </aside>
  );
}
