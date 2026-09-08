/**
 * THE SPLIT-SCREEN EXPLAINER, AS A FORMULA (D102). Marrs's own account's hero format, built to his
 * rules in docs/pam-console/marrs-split-screen-rules.md. That document is the source; when this file
 * and it disagree, this file is wrong.
 *
 * Marrs, 8 September: "the pitch follows a formula, which means that we have our style guide, we
 * smash out the formula, the pitch gets created, and it's a lot easier to execute quicker... stick
 * to one concept, lock it down, and just pump out as much as we can."
 *
 * So the shape is LOCKED and the model fills the blanks. Everything here is pure: the rules as prompt
 * text, the calibration set as few-shots, and the checks that flag rather than force (rule 7 of his
 * document: "A flagged item returns to Marrs with the specific failed test named. Silent adaptation
 * to fit the format is worse than rejection.").
 *
 * NOT FOR POLYNIZE. His document says so in its own section: three rules invert. This module is used
 * only by pieces of the two Marrs Attacks formats.
 */

import { scriptSections } from './script-sections';

export const SPLIT_SCREEN_FORMAT = 'split_screen_short';
export const YAP_FORMAT = 'yap';

export function isMarrsAttacksFormat(format: string | undefined): boolean {
  return format === SPLIT_SCREEN_FORMAT || format === YAP_FORMAT;
}

/* ------------------------------------------------------------------ the vocabulary */

/** Every title needs a domain. "Never fully open." */
export const FOCUS_ANCHORS = ['AI', 'creativity', 'productivity', 'purpose', 'work'] as const;

/**
 * THE CTA KEYWORDS (rule R.C1): one token, no plurals, never the magnet's own noun. The keyword is what
 * a viewer comments; ManyChat sends the magnet. The landing is where the console's tracked link goes.
 */
export const CTA_KEYWORDS: readonly { keyword: string; magnet: string; landing: string }[] = [
  { keyword: 'MAP', magnet: 'the team bottleneck map', landing: '/agents' },
  { keyword: 'ROLE', magnet: 'the job map', landing: '/job-mapping' },
];
/** Never these: they appear in ordinary comments and would fire auto-DMs on false positives. */
export const FORBIDDEN_KEYWORDS = ['JOB', 'TEAM', 'AI', 'YES'];

export function landingForKeyword(keyword: string | undefined): string | undefined {
  return CTA_KEYWORDS.find((k) => k.keyword === keyword)?.landing;
}

/** Rule R.C1 as a check. Returns the failure, or undefined when the keyword is allowed. */
export function keywordProblem(keyword: string): string | undefined {
  const k = keyword.trim();
  if (!/^[A-Z]{2,12}$/.test(k)) return `keyword "${keyword}" must be one uppercase word`;
  if (FORBIDDEN_KEYWORDS.includes(k)) return `keyword ${k} is forbidden (R.C1: never JOB, TEAM, AI, YES)`;
  if (k.endsWith('S') && !CTA_KEYWORDS.some((c) => c.keyword === k)) return `keyword ${k} looks plural (R.C1: no plurals)`;
  return undefined;
}

/** The seven transforms. Beat 2 is always one of these; a turn that will not classify is flagged. */
export const TRANSFORMS: readonly { id: string; turn: string }[] = [
  { id: 'Split', turn: 'One thing becomes two categories' },
  { id: 'Drain', turn: 'Volume leaves, what remains is denser' },
  { id: 'Move', turn: 'Nothing was lost, it relocated' },
  { id: 'Invert', turn: 'The cause was the effect' },
  { id: 'Reveal', turn: 'It was there all along, frame held still' },
  { id: 'Rescale', turn: 'Same thing, wrong ruler' },
  { id: 'Widen', turn: 'Frame pulls back, same picture means something different' },
];

export function isTransform(x: string): boolean {
  return TRANSFORMS.some((t) => t.id.toLowerCase() === x.trim().toLowerCase());
}

/* ------------------------------------------------------------------ titles */

export type TitleShape = 'why' | 'how';

export function titleShape(title: string): TitleShape | undefined {
  const first = title.trim().split(/\s+/)[0]?.toLowerCase();
  return first === 'why' ? 'why' : first === 'how' ? 'how' : undefined;
}

/**
 * THE MECHANICAL TESTS a title can fail without a model's judgement. The judgement tests (the killer
 * test, borrowed vocabulary, relief over shame) are the model's, prompted below with the calibration
 * set; these are the ones a regex can hold the line on.
 */
export function titleChecks(title: string): string[] {
  const t = title.trim();
  const out: string[] = [];
  if (!t) return ['empty title'];
  if (!titleShape(t)) out.push('does not open with Why or How (the two shapes)');
  // "Title is the promise, not the twist": a full stop with words after it is two titles.
  if (/[.!?]\s+\S/.test(t.replace(/\.\.\.$/, ''))) out.push('two titles: cut at the full stop');
  const lower = ` ${t.toLowerCase()} `;
  const negatives = (lower.match(/\b(not|never|no|nobody|nothing)\b|n't\b/g) ?? []).length;
  if (negatives >= 2) out.push('double negative: needs a second read');
  if (/—/.test(t)) out.push('contains an em dash');
  if (/[?]$/.test(t)) out.push('ends with a question mark: the title is a statement of the promise');
  return out;
}

/* ------------------------------------------------------------------ the prompts */

const CALIBRATION = `THE CALIBRATION SET. Titles Marrs scored across seven rounds. These calibrate better than the rules, because the rules summarise this data and this data is the primary source.

Contrastive pairs (same idea, one variable changed):
- "How to finish what you start" 3  vs  "How to know when something's finished" 10  (method vs outcome)
- "How to plan your life backwards from 100" 5  vs  "Why you need a 100-year plan to hit your goals" 10  (method vs contradiction)
- "Why AI won't melt your attention span" 3  vs  "Why AI won't rot your brain" 9  (invented verb vs native phrase)
- "Why AI isn't a crutch" 3  vs  "Why using AI isn't cheating" 9  (abstraction vs the actual accusation)
- "Why you're not bad at AI" 5  vs  "Why AI won't make your kids stupid" 10  (flat label vs named accusation with a concrete stake)
- "Why the last 10 percent takes longer than the first 90" 6  vs  "Why you abandon things at 90 percent" 9  (description vs mystery)
- "Why your best ideas arrive in the shower" 6  vs  "Why your best ideas come on the toilet" 8  (second-most-natural word vs natural, plus concreteness)
- "Why you should tidy your desk before you start" 5  vs  "Why you should let AI do the fun part" 9  (no curiosity gap vs real gap)
- "How to trust your own taste" 8  vs  "How to have the best idea in the room" 10  (abstract noun vs concrete image)

Scored 9 or 10: Why you need a 100-year plan to hit your goals. Why AI won't make your kids stupid. Why deadlines make you more creative. Why you abandon things at 80 percent. How to know when something's finished. How to make your work impossible to copy. How to have the best idea in the room. Why your taste is ahead of your skill. Why AI won't rot your brain. Why AI won't kill your creativity. Why using AI isn't cheating. Why you're not too old for AI. Why you should let AI do the fun part. Why you trust AI most when it's wrong. How to know what you're actually good at. How to stop second-guessing yourself. How to make yourself hard to replace.

Scored 8: Why your best ideas come on the toilet. Why finishing badly beats finishing well. Why you're allowed to quit at 90 percent. Why the question you're embarrassed to ask AI is the right one. Why nobody can keep up with AI. Why your worst idea is worth writing down. Why you're too polite to AI. Why nobody actually knows how to use AI yet. Why you're not too late to learn AI. Why you're not falling behind on AI. Why you're chasing a goal you never chose. Why you ask AI things you'd never ask a person. How to trust your own taste. How to make a decision you won't regret. How to never run out of ideas. How to tell when AI is lying to you.

Clear failures, with the cause: "Why you're allowed to not use AI" (meaningless, no accusation to be relieved of). "How to get your evenings back" (no focus anchor, generic productivity). "Why you're still the author" (abstract noun, no accusation). "Why you're doing AI's typing" (unparseable). "Why AI won't melt your attention span" (invented verb). "How to finish what you start" (method, and the viewer can answer it). "Why AI isn't a crutch" (abstraction). "Why you're not using AI wrong" (double negative). "Why you're further along than you think" (no focus anchor). "Why you don't need to be technical" (no focus anchor). "Why you shouldn't feel guilty about AI" (instructs an emotion). "Why your thinking is still yours" (abstract). "Why AI won't hollow out your work" (invented verb). "Why AI won't wreck your memory" (nobody says it). "Why using AI doesn't make you a fraud" (wrong accusation, not the word people use). "How to make AI argue with you" (undesirable outcome). "How to make AI sound like you" (saturated trope). "Why you should start with the ending" (ambiguous). "Why AI won't flatten your taste" (invented verb, ambiguous noun). "Why you'd rather start something new than finish this" (accurate description). "Why your first idea is never your best one" (accurate description). "Why you work better at 11pm" (accurate description, arguable).

The drift: method framings and worn tropes read well on first pass and fail on re-reading ("How to finish what you start" went 10 then 3). When a title scores well but is a method or a familiar trope, discount it.`;

export const TITLE_RULES = `THE QUESTION IS THE PRODUCT. Everything downstream is execution. You are proposing TITLES for a split-screen explainer on Marrs's own account: working professionals, curious about AI and unsure, or just starting. The editorial job is translation: enterprise-grade AI reality made useful for someone's Monday.

TWO SHAPES ONLY.
- Contradiction: a claim the viewer cannot explain and suspects is wrong. Opens with "Why".
- Wanted outcome: something the viewer wants and does not have. Opens with "How to", and must name an OUTCOME, never a method. When a method is the only framing, convert it to a why.

THE KILLER TEST. If the viewer can answer the title themselves, kill it. Recognition is not curiosity: an accurate description of the viewer's behaviour reads as true, produces agreement, and no click. Never describe. Contradict them, or give them something.

CONSTRUCTION RULES.
- Focus anchor: every title needs a domain (AI, creativity, productivity, purpose, work). Never fully open.
- Borrowed vocabulary: only words people actually use about themselves. Invented verbs kill titles ("rot your brain" works; "flatten, hollow out, melt, wreck" all failed).
- Commonest phrasing, not the second most natural.
- Behaviour, not feeling: name something observable.
- Name the accusation people are actually given: too old, cheating, stupid, lazy. Not fraud, crutch, the author.
- One idea, no second read. Ambiguity fails every time. Length is not the constraint.
- Concrete over abstract: kids, the toilet, the room, 100 years, 90 percent score higher than taste, decision, idea.
- The title is the promise, not the twist. The inversion lives in beat 2. Cut at the full stop.
- Relief over shame. Shame gets watched; relief gets sent to a specific person. Shareability is the objective.
- News is a trigger, never the subject: it enters at beat 1 and never appears in the title.

These tests apply to Marrs's own ideas too. The test is objective and overrides taste, including his.

${CALIBRATION}`;

export const WHY_BEATS = `WHY STRUCTURE, four beats, ~12 seconds and 33 to 36 spoken words each, about 140 words in total:
BEAT 1, Setup: the belief the viewer holds, stated fairly so the turn lands.
BEAT 2, But: the turn. The only surprise in the script.
BEAT 3, Therefore: what it actually means for them.
BEAT 4, So do this: one action they can take tonight, with no purchase required.`;

export const HOW_BEATS = `HOW STRUCTURE, four beats, ~12 seconds and 33 to 36 spoken words each, about 140 words in total:
BEAT 1, The result: show the finished thing first, so the 60 seconds is earned.
BEAT 2: step one.
BEAT 3: step two.
BEAT 4, The bit nobody does: the non-obvious move that makes it work. This beat supplies the surprise; a how with an obvious beat 4 fails harder than a weak why.`;

export const VISUAL_GRAMMAR = `THE VISUAL GRAMMAR of the split-screen explainer. The voice moves on; the screen holds. The voice describes; the screen shows change.

ONE OBJECT, FIVE STATES. The screen presents the viewer's situation as a SINGLE OBJECT and each tap changes that object's state. Never five different pictures. The viewer watches one thing transform, which is what makes it a journey rather than a slideshow.
- Tap 0 (written hook): the title plus the object at rest.
- Tap 1 (beat 1): the belief made visible. The object as the viewer pictures it: complete, reasonable, wrong.
- Tap 2 (beat 2): the object changes state. The only moment the screen surprises.
- Tap 3 (beat 3): the new state settles and is renamed.
- Tap 4 (beat 4): the artefact. The thing worth screenshotting.
- Tap 5 (CTA, off the clock): the keyword, timer stopped.

THE SEVEN TRANSFORMS. Beat 2 is always one of these; classify before designing, and if the turn will not classify say so rather than forcing a fit:
${TRANSFORMS.map((t) => `- ${t.id}: ${t.turn}`).join('\n')}

OBJECT SELECTION. Find the noun the viewer is worried about (job, creativity, brain, voice, taste, time), then ask what shape shows the belief AND can change shape to show the truth. Chosen for its ability to transform, not for how it looks at rest. Simple. An analogy, not an illustration. Never a house shape reused across videos.

HARD RULES. Sound-off test: the object must be followable as an argument with captions covered. One change per tap. No text except tap 0 and tap 5 (numbers allowed where a number is the point). The tap lands on the beat word: "but", "so", never mid-sentence.`;

/**
 * THE SCORED TITLES, AS SUGGESTIONS (D103). Marrs: "I spent a lot of time creating some examples...
 * when I click Split Screen, underneath there should come some example questions... at every stage,
 * we're trying to reduce the friction in that creative decision." These are his own titles from the
 * calibration set, the 9s and 10s first, then the 8s. Every one passes the mechanical tests (asserted).
 */
export const EXAMPLE_TITLES: readonly { title: string; score: number }[] = [
  { title: 'Why you need a 100-year plan to hit your goals', score: 10 },
  { title: "Why AI won't make your kids stupid", score: 10 },
  { title: 'Why deadlines make you more creative', score: 10 },
  { title: 'Why you abandon things at 80 percent', score: 10 },
  { title: "How to know when something's finished", score: 10 },
  { title: 'How to make your work impossible to copy', score: 10 },
  { title: 'How to have the best idea in the room', score: 10 },
  { title: 'Why your taste is ahead of your skill', score: 9 },
  { title: "Why AI won't rot your brain", score: 9 },
  { title: "Why AI won't kill your creativity", score: 9 },
  { title: "Why using AI isn't cheating", score: 9 },
  { title: "Why you're not too old for AI", score: 9 },
  { title: 'Why you should let AI do the fun part', score: 9 },
  { title: "Why you trust AI most when it's wrong", score: 9 },
  { title: "How to know what you're actually good at", score: 9 },
  { title: 'How to stop second-guessing yourself', score: 9 },
  { title: 'How to make yourself hard to replace', score: 9 },
  { title: 'Why your best ideas come on the toilet', score: 8 },
  { title: 'Why finishing badly beats finishing well', score: 8 },
  { title: "Why you're allowed to quit at 90 percent", score: 8 },
  { title: "Why the question you're embarrassed to ask AI is the right one", score: 8 },
  { title: 'Why nobody can keep up with AI', score: 8 },
  { title: 'Why your worst idea is worth writing down', score: 8 },
  { title: "Why you're too polite to AI", score: 8 },
  { title: 'Why nobody actually knows how to use AI yet', score: 8 },
  { title: "Why you're not too late to learn AI", score: 8 },
  { title: "Why you're not falling behind on AI", score: 8 },
  { title: "Why you're chasing a goal you never chose", score: 8 },
  { title: "Why you ask AI things you'd never ask a person", score: 8 },
  { title: 'How to trust your own taste', score: 8 },
  { title: "How to make a decision you won't regret", score: 8 },
  { title: 'How to never run out of ideas', score: 8 },
  { title: 'How to tell when AI is lying to you', score: 8 },
];

/* ------------------------------------------------------------------ title proposals */

export type TitleOption = {
  title: string;
  shape: TitleShape;
  anchor: string;
  gap: 'contradiction' | 'wanted outcome';
  material: string;
};

export type TitleProposal = {
  concept_read: string[];
  titles: TitleOption[];
  /** Flagged rather than forced: each with the failed test named. */
  killed: { title: string; failed: string }[];
};

/**
 * Read the model's JSON, then run the mechanical checks on every title it proposed. A title that
 * fails one moves to `killed` with the test named, whatever the model thought of it.
 */
export function parseTitleProposal(raw: string): TitleProposal {
  let obj: unknown;
  try {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    obj = start >= 0 && end > start ? JSON.parse(raw.slice(start, end + 1)) : null;
  } catch {
    obj = null;
  }
  const o = (obj ?? {}) as Record<string, unknown>;
  const line = (v: unknown) => (typeof v === 'string' ? v.replace(/—/g, ':').trim() : '');
  const concept_read = Array.isArray(o.concept_read) ? o.concept_read.map(line).filter(Boolean).slice(0, 8) : [];
  const titles: TitleOption[] = [];
  const killed: { title: string; failed: string }[] = [];
  for (const t of Array.isArray(o.titles) ? o.titles : []) {
    const r = (t ?? {}) as Record<string, unknown>;
    const title = line(r.title);
    if (!title) continue;
    const problems = titleChecks(title);
    if (problems.length) {
      killed.push({ title, failed: problems[0] });
      continue;
    }
    const shape = titleShape(title)!;
    titles.push({
      title,
      shape,
      anchor: line(r.anchor) || 'unnamed',
      gap: shape === 'how' ? 'wanted outcome' : 'contradiction',
      material: line(r.material),
    });
    if (titles.length >= 12) break;
  }
  for (const k of Array.isArray(o.killed) ? o.killed : []) {
    const r = (k ?? {}) as Record<string, unknown>;
    const title = line(r.title);
    if (title) killed.push({ title, failed: line(r.failed) || 'failed a test the model did not name' });
  }
  return { concept_read, titles, killed };
}

/* ------------------------------------------------------------------ the script */

export const WORD_BUDGET = 140;
export const BEAT_WORDS_MAX = 42;
export const BEAT_WORDS_MIN = 20;
export const CTA_WORDS_MAX = 16;

export function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export type SplitScreenScript = {
  hookA: string;
  title: string;
  beats: string[];
  cta: string;
};

/**
 * Read the spoken script as the console stores it (uppercase section labels, blank lines between),
 * which is also what the teleprompter reads. Anything not in the formula's sections is ignored.
 */
export function parseSplitScreenScript(text: string): SplitScreenScript {
  const out: SplitScreenScript = { hookA: '', title: '', beats: [], cta: '' };
  const beats = new Map<number, string>();
  for (const s of scriptSections(text)) {
    const label = s.label.toUpperCase().replace(/\s+/g, ' ').trim();
    if (label === 'HOOK A' || label === 'HOOK') out.hookA = s.body;
    else if (label === 'TITLE' || label === 'HOOK B') out.title = s.body.split('\n')[0].trim();
    else if (/^BEAT \d$/.test(label)) beats.set(Number(label.slice(5)), s.body);
    else if (label === 'CTA' || label === 'CLOSE') out.cta = out.cta ? `${out.cta} ${s.body}` : s.body;
  }
  out.beats = [...beats.keys()].sort((a, b) => a - b).map((k) => beats.get(k)!);
  return out;
}

/** Hook A as the format fixes it: the promise, ending on the title's own first word. */
export function hookALine(title: string): string {
  const shape = titleShape(title) ?? 'why';
  return `In under 60 seconds I'm going to explain to you ${shape}...`;
}

/**
 * THE REJECTION BEHAVIOUR (rule 7): every test the script fails, named. Empty means it passes.
 * Called after generation and shown to Marrs, never used to silently rewrite.
 */
export function checkSplitScreenScript(text: string): string[] {
  const s = parseSplitScreenScript(text);
  const out: string[] = [];
  if (!s.title) out.push('no TITLE section');
  else out.push(...titleChecks(s.title).map((p) => `title: ${p}`));
  if (!s.hookA) out.push('no HOOK A section');
  else {
    const shape = titleShape(s.title);
    const endsOn = s.hookA.trim().replace(/[.…]+$/, '').split(/\s+/).pop()?.toLowerCase();
    if (shape && endsOn !== shape) out.push(`hook A must end on the word "${shape}", the title's own first word (it ends on "${endsOn ?? ''}")`);
  }
  if (s.beats.length !== 4) out.push(`${s.beats.length} beats: the format is exactly four`);
  const total = s.beats.reduce((n, b) => n + wordCount(b), 0);
  if (total > WORD_BUDGET) out.push(`${total} spoken words across the beats: the budget is ${WORD_BUDGET}. If an idea cannot survive 140 words, it is not this format`);
  s.beats.forEach((b, i) => {
    const n = wordCount(b);
    if (n > BEAT_WORDS_MAX) out.push(`beat ${i + 1} is ${n} words: about 33 to 36 fits twelve seconds`);
    if (n > 0 && n < BEAT_WORDS_MIN) out.push(`beat ${i + 1} is ${n} words: thin for a twelve-second beat`);
  });
  if (!s.cta) out.push('no CTA section (spoken after the timer stops, outside the clock)');
  else {
    if (wordCount(s.cta) > CTA_WORDS_MAX) out.push(`the CTA is ${wordCount(s.cta)} words: roughly ten`);
    const tokens: string[] = s.cta.match(/\b[A-Z]{2,12}\b/g) ?? [];
    const keyword = tokens.find((t) => !['CTA', 'AI'].includes(t));
    if (!keyword) out.push('the CTA names no comment keyword (MAP or ROLE)');
    else {
      const problem = keywordProblem(keyword);
      if (problem) out.push(`CTA ${problem}`);
      else if (!CTA_KEYWORDS.some((k) => k.keyword === keyword)) out.push(`CTA keyword ${keyword} is not one of the magnets (${CTA_KEYWORDS.map((k) => k.keyword).join(', ')})`);
    }
    if (tokens.includes('AI') && /\bAI\b/.test(s.cta) && /comment\s+AI\b/i.test(s.cta)) out.push('CTA asks them to comment AI, which R.C1 forbids');
  }
  return out;
}

/** The CTA keyword a script actually uses, for the link's landing and the piece's label. */
export function keywordIn(text: string): string | undefined {
  const s = parseSplitScreenScript(text);
  const tokens: string[] = s.cta.match(/\b[A-Z]{2,12}\b/g) ?? [];
  return tokens.find((t) => CTA_KEYWORDS.some((k) => k.keyword === t));
}

/* ------------------------------------------------------------------ the screen plan */

export type ScreenPlan = { transform?: string; object?: string; taps: string[] };

/**
 * The outline for a split-screen piece IS the screen plan plus the beat jobs. It is stored in
 * `piece.outline` (the existing arc field) and read by the prezie generator. Lines:
 *   TRANSFORM: Split
 *   OBJECT: the job, as a block of task tiles
 *   TAP 0: ... TAP 5: ...
 */
export function parseScreenPlan(text: string): ScreenPlan {
  const out: ScreenPlan = { taps: [] };
  const taps = new Map<number, string>();
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    const m = line.match(/^(TRANSFORM|OBJECT|TAP (\d))\s*:\s*(.*)$/i);
    if (!m) continue;
    const key = m[1].toUpperCase();
    if (key === 'TRANSFORM') out.transform = m[3].trim();
    else if (key === 'OBJECT') out.object = m[3].trim();
    else taps.set(Number(m[2]), m[3].trim());
  }
  out.taps = [...taps.keys()].sort((a, b) => a - b).map((k) => taps.get(k)!);
  return out;
}

export function checkScreenPlan(text: string): string[] {
  const p = parseScreenPlan(text);
  const out: string[] = [];
  if (!p.transform) out.push('no TRANSFORM named');
  else {
    // "Split, then Drain" is allowed: the first named must be one of the seven.
    const first = p.transform.split(/[,;]|\bthen\b/i)[0].trim();
    if (!isTransform(first)) out.push(`transform "${p.transform}" is not one of the seven: flag it rather than force a fit`);
  }
  if (!p.object) out.push('no OBJECT named');
  if (p.taps.length < 6) out.push(`${p.taps.length} taps described: the screen has six states, tap 0 to tap 5`);
  return out;
}


/* ------------------------------------------------------------------ the arc (D106) */

/**
 * THE ARC IS THE POINT OF THE PIECE, NOT THE SCREEN (D106). Marrs: "At the moment, what is being
 * generated is not the narrative arc. It's actually the entire design for the prezi... The narrative
 * arc is just: what's the point of this piece?" So the arc step is two short moves: three DIRECTIONS
 * to choose from (where could this hook go, one or two lines each), then the chosen one developed into
 * the four beats, with one line naming the object that will carry it. No taps, no transform: the prezie
 * decides the screen later, from the script and the arc.
 */
export type ArcDirection = {
  /** Where this takes the hook, in one line. */
  where: string;
  /** Why it fits this hook, in one line. */
  why: string;
  /** The object that would carry it on the screen, a few words. */
  object: string;
};

export function parseArcDirections(raw: string): ArcDirection[] {
  let obj: unknown;
  try {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    obj = start >= 0 && end > start ? JSON.parse(raw.slice(start, end + 1)) : null;
  } catch {
    obj = null;
  }
  const list = (obj as { directions?: unknown } | null)?.directions;
  const line = (v: unknown) => (typeof v === 'string' ? v.replace(/—/g, ':').trim() : '');
  const out: ArcDirection[] = [];
  for (const d of Array.isArray(list) ? list : []) {
    const r = (d ?? {}) as Record<string, unknown>;
    const where = line(r.where);
    if (!where) continue;
    out.push({ where, why: line(r.why), object: line(r.object) });
    if (out.length >= 4) break;
  }
  return out;
}

export type Arc = { title?: string; direction?: string; object?: string; beats: string[] };

/**
 * The developed arc as the console stores it: KEY lines for the title, the direction and the object,
 * then BEAT sections with their Argues and Stands on lines, blank lines between everything.
 */
export function parseArc(text: string): Arc {
  const out: Arc = { beats: [] };
  const beats = new Map<number, string>();
  for (const raw of text.split('\n')) {
    const m = raw.trim().match(/^(TITLE|DIRECTION|OBJECT)\s*:\s*(.*)$/i);
    if (!m) continue;
    const key = m[1].toUpperCase();
    if (key === 'TITLE') out.title = m[2].trim();
    else if (key === 'DIRECTION') out.direction = m[2].trim();
    else out.object = m[2].trim();
  }
  for (const sct of scriptSections(text)) {
    const label = sct.label.toUpperCase().trim();
    if (/^BEAT \d$/.test(label)) beats.set(Number(label.slice(5)), sct.body);
  }
  out.beats = [...beats.keys()].sort((a, b) => a - b).map((k) => beats.get(k)!);
  return out;
}

/** Named, never forced: what the developed arc is missing. */
export function checkArc(text: string, hook?: string): string[] {
  const a = parseArc(text);
  const out: string[] = [];
  if (!a.title) out.push('no TITLE line');
  else if (hook && a.title.trim().toLowerCase() !== hook.trim().toLowerCase()) out.push('the TITLE is not the locked hook, word for word');
  if (!a.direction) out.push('no DIRECTION line: which of the three this arc develops');
  if (!a.object) out.push('no OBJECT line: the one thing the screen will show changing');
  if (a.beats.length !== 4) out.push(`${a.beats.length} beats: the format is exactly four`);
  return out;
}

/* ------------------------------------------------------------------ the yap */

/**
 * THE YAP: the same question, straight to camera, one take, no edits. Marrs: "yaps are more natural,
 * so we have to work on how those two scripts are determined." The yap is written FROM the
 * split-screen's beats, as talk rather than as beats, and opens on the title verbatim.
 */
export const YAP_WORDS_MAX = 160;

export function yapSystemPrompt(voice?: string): string {
  return [
    'You rewrite a four-beat split-screen script as a YAP: the same question and the same argument, delivered straight to camera in one take, no edits, no screen.',
    'It is TALK, not beats: one continuous natural paragraph as the presenter would say it to a friend, with the same turn and the same action at the end. Keep every fact and the call to action exactly. Add nothing.',
    `Open with the title, word for word, as the first sentence. Then the talk. Then the CTA in one sentence. ${YAP_WORDS_MAX} words at most in total.`,
    'Do not use em dashes. No stage directions, no labels inside the talk.',
    'Return exactly three sections, each an uppercase label on its own line, a blank line between sections:',
    'TITLE\n<the title verbatim>\n\nTALK\n<the paragraph>\n\nCTA\n<one sentence with the same comment keyword>',
    voice ? `\nVOICE:\n${voice}` : '',
  ].join('\n');
}

export function checkYapScript(text: string, title?: string): string[] {
  const out: string[] = [];
  const sections = scriptSections(text);
  const find = (l: string) => sections.find((s) => s.label.toUpperCase() === l)?.body ?? '';
  const t = find('TITLE');
  const talk = find('TALK');
  const cta = find('CTA');
  if (!t) out.push('no TITLE section');
  else if (title && t.trim().toLowerCase() !== title.trim().toLowerCase()) out.push('the title is not the split-screen title verbatim');
  if (!talk) out.push('no TALK section');
  const total = wordCount(t) + wordCount(talk) + wordCount(cta);
  if (total > YAP_WORDS_MAX) out.push(`${total} words: a yap is ${YAP_WORDS_MAX} at most`);
  if (!cta) out.push('no CTA section');
  return out;
}
