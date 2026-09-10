'use client';

/**
 * THE LEARNING SCREEN (D115). The same shape as Gate 2, because it IS the article with April
 * docked beside it: edit the text yourself, or give April one instruction at a time. Under it, the
 * things a Story does not have: the learning in one sentence, where it came from (internal), the
 * hero for the public page. Then the two doors: publish, and make a Story.
 *
 * SAVES AS YOU GO, debounced, the way the gates do. The publish and story actions are explicit.
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Learning } from '@/lib/marketing/learning-store';
import { USE_CASES, labelForUseCase } from '@/lib/marketing/use-case';
import g from '../../narrative/gates.module.css';
import m from '../learnings.module.css';

type Img = { media_id: string; url: string; label: string };
type Lane = { id: string; label: string };

function firstLine(article: string): string {
  return article.split('\n').map((l) => l.trim()).find((l) => l.length > 0) ?? 'Untitled learning';
}

export function LearningScreen({ initial, images, lanes }: { initial: Learning; images: Img[]; lanes: Lane[] }) {
  const router = useRouter();
  const base = `/console/marketing/learnings/${initial.id}`;
  const [l, setL] = useState<Learning>(initial);
  const [article, setArticle] = useState(initial.article);
  const [learning, setLearning] = useState(initial.learning);
  const [source, setSource] = useState(initial.source ?? '');
  const [chat, setChat] = useState<{ who: 'you' | 'april'; text: string }[]>([]);
  const [chatIn, setChatIn] = useState('');
  const [chatBusy, setChatBusy] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState<'saved' | 'saving' | 'failed' | null>(null);
  const [heroPrompt, setHeroPrompt] = useState('');
  const [heroOptions, setHeroOptions] = useState<string[]>([]);
  const [lane, setLane] = useState(lanes[0]?.id ?? 'polynize');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const put = async (patch: Record<string, unknown>) => {
    setSaved('saving');
    const res = await fetch(`${base}/state`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(patch),
    });
    const b = (await res.json().catch(() => null)) as { learning?: Learning; error?: string } | null;
    if (!res.ok || !b?.learning) {
      setSaved('failed');
      throw new Error(b?.error ?? 'save failed');
    }
    setL(b.learning);
    setSaved('saved');
    return b.learning;
  };

  // Debounced autosave for the three text fields.
  const schedule = (patch: Record<string, unknown>) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void put(patch).catch(() => setErr('Could not save. Your text is still on screen; try again.'));
    }, 700);
  };
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const askApril = async () => {
    const instruction = chatIn.trim();
    if (!instruction || chatBusy) return;
    setChatBusy(true);
    setChatIn('');
    setChat((c) => [...c, { who: 'you', text: instruction }]);
    try {
      const res = await fetch(`${base}/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ instruction, article }),
      });
      const b = (await res.json().catch(() => null)) as { article?: string; note?: string; error?: string } | null;
      if (!res.ok || !b?.article) {
        setChat((c) => [...c, { who: 'april', text: b?.error ?? 'That did not work. Try once more.' }]);
        return;
      }
      setArticle(b.article);
      setL((x) => ({ ...x, article: b.article as string }));
      setChat((c) => [...c, { who: 'april', text: b.note ?? 'Done.' }]);
    } finally {
      setChatBusy(false);
    }
  };

  const publish = async (on: boolean) => {
    if (busy) return;
    setBusy('publish');
    setErr(null);
    try {
      const res = await fetch(`${base}/publish`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ publish: on }),
      });
      const b = (await res.json().catch(() => null)) as { learning?: Learning; error?: string } | null;
      if (!res.ok || !b?.learning) {
        setErr(b?.error ?? 'Could not change that.');
        return;
      }
      setL(b.learning);
    } finally {
      setBusy(null);
    }
  };

  const makeStory = async () => {
    if (busy) return;
    setBusy('story');
    setErr(null);
    try {
      const res = await fetch(`${base}/story`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ lane }),
      });
      const b = (await res.json().catch(() => null)) as { id?: string; error?: string } | null;
      if (!res.ok || !b?.id) {
        setErr(b?.error ?? 'Could not make the Story.');
        return;
      }
      router.push(`/console/marketing/narrative/${b.id}`);
    } finally {
      setBusy(null);
    }
  };

  const makeHero = async () => {
    if (busy || heroPrompt.trim().length < 3) return;
    setBusy('hero');
    setErr(null);
    try {
      const res = await fetch(`${base}/hero`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt: heroPrompt }),
      });
      const b = (await res.json().catch(() => null)) as { urls?: string[]; error?: string } | null;
      if (!res.ok || !b?.urls?.length) {
        setErr(b?.error ?? 'Could not make the image.');
        return;
      }
      setHeroOptions(b.urls);
    } finally {
      setBusy(null);
    }
  };

  /** A made image is registered in the Polynize library first, so it has a media id like any other. */
  const keepHero = async (url: string, mediaId?: string) => {
    if (busy) return;
    setBusy('hero-save');
    setErr(null);
    try {
      let id = mediaId;
      if (!id) {
        const reg = await fetch('/console/marketing/stream/polynize/media/add', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ url, kind: 'image', label: `Hero · ${firstLine(article).slice(0, 60)}` }),
        });
        const rb = (await reg.json().catch(() => null)) as { asset?: { media_id: string }; error?: string } | null;
        if (!reg.ok || !rb?.asset) {
          setErr(rb?.error ?? 'Could not keep that image.');
          return;
        }
        id = rb.asset.media_id;
      }
      await put({ hero_url: url, hero_media_id: id });
      setHeroOptions([]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not keep that image.');
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (busy) return;
    if (!window.confirm(`Delete "${firstLine(article).slice(0, 60)}"?\n\nThe learning and its public page go. Stories already made from it stay. This cannot be undone.`)) return;
    setBusy('delete');
    try {
      const res = await fetch(`${base}/delete`, { method: 'DELETE' });
      if (!res.ok) {
        setErr('Could not delete it.');
        return;
      }
      router.push('/console/marketing/learnings');
    } finally {
      setBusy(null);
    }
  };

  const live = !!l.published_at;

  return (
    <div className={`${g.app} ${g.appWide}`}>
      <div className={g.top}>
        <button type="button" className={g.back} aria-label="Back" onClick={() => router.push('/console/marketing/learnings')}>
          ‹
        </button>
        <span className={g.where}>Learning</span>
        <select
          className={g.useCaseSelect}
          aria-label="Use case"
          value={l.use_case ?? ''}
          onChange={(ev) => {
            const v = ev.target.value || null;
            void put({ use_case: v }).catch(() => setErr('Could not save the use case.'));
          }}
        >
          <option value="">No use case</option>
          {USE_CASES.map((u) => (
            <option key={u.id} value={u.id}>{u.label}</option>
          ))}
        </select>
        <span className={live ? m.live : m.draft}>{live ? 'live on polynize.ai' : 'draft'}</span>
        {saved ? <span className={m.draft}>{saved}</span> : null}
      </div>

      <div className={g.duo}>
        <div>
          <div className={g.card}>
            <textarea
              className={g.article}
              value={article}
              onChange={(e) => {
                setArticle(e.target.value);
                schedule({ article: e.target.value });
              }}
              disabled={chatBusy}
              spellCheck={false}
            />
          </div>
          <p className={g.hint}>{chatBusy ? 'April has the document' : 'first line is the title · edit the text yourself, or tell April'}</p>
        </div>
        <div className={`${g.card} ${g.chat}`}>
          <span className={g.chatHead}>April</span>
          {chat.map((c, i) => (
            <div key={i} className={`${g.msg} ${c.who === 'you' ? g.msgYou : g.msgApril}`}>
              <span className={g.who}>{c.who}</span>
              {c.text}
            </div>
          ))}
          <div className={g.chatrow}>
            <input
              value={chatIn}
              onChange={(e) => setChatIn(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') askApril(); }}
              placeholder="Tell April what to change"
              disabled={chatBusy}
            />
            <button type="button" onClick={askApril} disabled={chatBusy}>{chatBusy ? '…' : '→'}</button>
          </div>
        </div>
      </div>

      <div className={m.extras}>
        <div className={g.card}>
          <span className={m.label}>The learning in one sentence</span>
          <input
            className={m.line}
            value={learning}
            onChange={(e) => { setLearning(e.target.value); schedule({ learning: e.target.value }); }}
          />
          <span className={m.label}>Where it came from (stays internal)</span>
          <input
            className={m.line}
            value={source}
            onChange={(e) => { setSource(e.target.value); schedule({ source: e.target.value }); }}
            placeholder="e.g. a client L&D session, 9 September"
          />
          {l.added_by ? <p className={g.hint}>brought by {l.added_by.split('@')[0]}{l.use_case ? ` · ${labelForUseCase(l.use_case)}` : ''}</p> : null}
        </div>
        <div className={g.card}>
          <span className={m.label}>The image on the public page</span>
          {l.hero_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={l.hero_url} alt="" className={m.heroNow} />
          ) : (
            <p className={g.hint}>None yet. Describe the look and make one, or pick one from the Polynize library.</p>
          )}
          <input
            className={m.line}
            value={heroPrompt}
            onChange={(e) => setHeroPrompt(e.target.value)}
            placeholder="Describe the look"
            disabled={busy === 'hero'}
          />
          <div className={m.actions} style={{ marginTop: 10 }}>
            <button type="button" className={g.go} onClick={makeHero} disabled={!!busy || heroPrompt.trim().length < 3}>
              {busy === 'hero' ? 'Making…' : 'Make four'}
            </button>
          </div>
          {heroOptions.length > 0 ? (
            <div className={m.heroGrid}>
              {heroOptions.map((u) => (
                <button key={u} type="button" className={m.heroTile} onClick={() => keepHero(u)} disabled={!!busy} title="Use this one">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u} alt="" />
                </button>
              ))}
            </div>
          ) : null}
          {images.length > 0 ? (
            <>
              <span className={m.label}>Or pick from the Polynize library</span>
              <div className={m.heroGrid}>
                {images.map((im) => (
                  <button
                    key={im.media_id}
                    type="button"
                    className={`${m.heroTile} ${l.hero_media_id === im.media_id ? m.heroTileOn : ''}`}
                    onClick={() => keepHero(im.url, im.media_id)}
                    disabled={!!busy}
                    title={im.label}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={im.url} alt="" />
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {err ? <p className={g.err}>{err}</p> : null}

      <div className={g.bar}>
        <div className={m.actions}>
          {live ? (
            <>
              <a href={`/library/${l.slug}`} target="_blank" rel="noreferrer" className={m.publicLink}>
                polynize.ai/library/{l.slug} →
              </a>
              <button type="button" className={g.go} onClick={() => publish(false)} disabled={!!busy}>
                {busy === 'publish' ? '…' : 'Take it down'}
              </button>
            </>
          ) : (
            <button type="button" className={g.go} onClick={() => publish(true)} disabled={!!busy || !article.trim()}>
              {busy === 'publish' ? '…' : 'Publish to polynize.ai/library →'}
            </button>
          )}
          <select className={m.select} value={lane} onChange={(e) => setLane(e.target.value)} aria-label="Which board">
            {lanes.map((x) => (
              <option key={x.id} value={x.id}>{x.label}</option>
            ))}
          </select>
          <button type="button" className={g.go} onClick={makeStory} disabled={!!busy || !article.trim()}>
            {busy === 'story' ? '…' : `Make a Story from this →`}
          </button>
          {(l.story_ids?.length ?? 0) > 0 ? <span className={g.hint}>{l.story_ids!.length} made so far</span> : null}
          <button type="button" className={m.del} onClick={remove} disabled={!!busy}>delete</button>
        </div>
      </div>
    </div>
  );
}
