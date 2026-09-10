/**
 * APRIL'S FIRST PASS AT A LEARNING (D115).
 *
 * Marrs: "We all work with voice, so the input would be just a voice dump or a transcript...
 * 'Tell us what the insight is' or 'Paste the text about the insight', one of those two. Then April
 * turns it into a first pass as a full article. You can edit that."
 *
 * One call, one shape back: the title, the learning in a sentence, the article. The article follows
 * the Story convention (first line is the title) so the existing reviser, headline helper and the
 * public page read it without a second format. It is longer than a Story's article on purpose: this
 * is the long form everything else is cut from, and it publishes on polynize.ai as a page, not a
 * LinkedIn post. Marrs, in the meeting: "here's a 600 word article which outlines exactly what you said."
 *
 * NAMES STAY OUT. The source is often a client room. The prompt forbids naming a client, a person
 * or an organisation from the source; the operator can put them back by hand if a case study is
 * cleared, but April never puts them in.
 */

import { complete } from '@/lib/llm';
import { NO_MARKDOWN_INSTRUCTION } from '@/lib/plain-copy';
import { stripEmDashes } from '@/lib/em-dash';
import { getBrandVoiceForStream } from './brand-voice-store';
import { laneVoice, cleanArticle } from './article-draft';

export type LearningMode = 'told' | 'pasted';

export type LearningDraft = {
  /** First line the title, then the body. */
  article: string;
  /** The insight, one sentence. */
  learning: string;
};

const scriptModel = () => process.env.SCRIPT_MODEL || undefined;

function systemPrompt(mode: LearningMode, brandVoice?: string): string {
  const sourceLine =
    mode === 'told'
      ? 'The operator has SPOKEN the insight, so the source is a dictated dump: loose, repetitive, in the order it came to mind. Find the one insight in it.'
      : 'The operator has PASTED notes or a transcript. Most of it is not the insight. Find the one insight the operator means and leave the rest.';
  const voice = brandVoice
    ? `\n\nTHE POLYNIZE VOICE. Match it.\n"""\n${brandVoice}\n"""\nIf the doc contains actual sentences in the voice, those are your strongest signal; adjectives describe the sound, they are not the instruction.`
    : '';
  return `You are April, Polynize's copy chief. From the source in the user's message, write ONE core learning for the Polynize Content Library of Core Learnings.

WHAT A CORE LEARNING IS. Something Polynize learnt in real work with clients that is true well beyond that client: a way of seeing a problem, a mistake everyone makes, a distinction that unlocks the room. The article is the long form it publishes as, on polynize.ai, and everything else (posts, videos, carousels) is later cut from it, so it has to stand alone and carry the whole argument.

${sourceLine}

SHAPE. PLAIN TEXT, exactly this:
Line 1: the title, on its own line, nothing around it. A claim or a question, not a label.
Line 2: LEARNING: then the insight in one sentence, the sentence a partner could repeat in a meeting.
Then a blank line, then the article: 450 to 700 words. One argument carried start to end, in beats a reader can feel turning, landing on a last line worth remembering. Vary sentence length. Teach by walking through the actual thing. Written for a reader who runs a team and is short of time.

${laneVoice('polynize')}${voice}

GROUNDING, the hard rule: the source is your ONLY source of facts. Do not invent numbers, outcomes or statistics. Argue from the mechanism and the stakes rather than a figure you do not have.

NAMES STAY OUT, the other hard rule: never name a client, a company, a product other than Polynize, or a person from the source. Say "a client's L&D team", "a partner", "a room of seven people". The operator will add names only if a case study has been cleared.

Hard constraints:
- Never use the em-dash character (U+2014). Use a comma, a period, or a colon.
- No hashtags. No emoji.
- ${NO_MARKDOWN_INSTRUCTION}
- Output ONLY the three parts above: no preamble, no notes, no code fences.`;
}

/**
 * Pull the three parts out of what came back. Tolerant: a missing LEARNING line falls back to the
 * article's first sentence rather than failing, because a draft with a weaker one-liner is still a
 * draft he can edit, and an error is a blank screen.
 */
export function parseLearningDraft(raw: string): LearningDraft | null {
  const text = stripEmDashes(raw).replace(/\r/g, '').trim();
  if (!text) return null;
  const lines = text.split('\n');
  const firstIx = lines.findIndex((l) => l.trim().length > 0);
  if (firstIx === -1) return null;
  const title = lines[firstIx].trim().replace(/^(title:\s*)/i, '').replace(/^#+\s*/, '').replace(/^["“]|["”]$/g, '');
  let learning = '';
  const rest: string[] = [];
  for (const l of lines.slice(firstIx + 1)) {
    const m = /^\s*learning\s*:\s*(.+)$/i.exec(l);
    if (m && !learning) learning = m[1].trim();
    else rest.push(l);
  }
  const body = cleanArticle(rest.join('\n')).trim();
  if (!title || !body) return null;
  if (!learning) {
    const first = /^[^.!?]+[.!?]/.exec(body);
    learning = (first ? first[0] : body.slice(0, 200)).trim();
  }
  return { article: `${title}\n\n${body}`, learning: learning.slice(0, 600) };
}

export async function draftLearning(raw: string, mode: LearningMode): Promise<LearningDraft> {
  const brandVoice = await getBrandVoiceForStream('polynize');
  const out = await complete({
    system: systemPrompt(mode, brandVoice),
    messages: [
      {
        role: 'user',
        content: `THE SOURCE (${mode === 'told' ? 'spoken' : 'pasted'}):\n"""\n${raw}\n"""\n\nWrite the core learning.`,
      },
    ],
    // The default model reasons before it writes (800 to 2300 tokens of it count against the cap),
    // and a 700-word article is another 1000. 8000 leaves room for both.
    maxTokens: 8000,
    temperature: 0.7,
    json: false,
    model: scriptModel(),
    apiKey: process.env.APRIL_OPENROUTER_API_KEY,
  });
  const parsed = parseLearningDraft(out);
  if (!parsed) throw new Error('empty');
  return parsed;
}
