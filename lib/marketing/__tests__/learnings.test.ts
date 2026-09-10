/**
 * THE LEARNINGS LIBRARY (D115): the slug, the parse of April's first pass, and the record shape.
 * Pure functions only; nothing here touches storage.
 */
import { parseLearningDraft } from '../learning-draft';
import {
  slugify,
  uniqueSlug,
  isSafeSlug,
  learningTitle,
  learningBody,
  normalizeLearning,
  cardFor,
} from '../learning-store';

let pass = 0;
let fail = 0;
const ok = (n: string, c: boolean, x = '') => {
  if (c) pass += 1;
  else {
    fail += 1;
    console.log(`FAIL ${n} ${x}`);
  }
};
const eq = (n: string, got: unknown, want: unknown) => ok(n, JSON.stringify(got) === JSON.stringify(want), `got ${JSON.stringify(got)}`);

/* the slug */
eq('a title becomes a slug', slugify('Set what good looks like, then let people exceed it'), 'set-what-good-looks-like-then-let-people-exceed-it');
eq('quotes vanish rather than becoming hyphens', slugify("Why you're not too late"), 'why-youre-not-too-late');
eq('punctuation collapses to one hyphen', slugify('Benchmarks: not a rubric!'), 'benchmarks-not-a-rubric');
ok('never longer than 80', slugify('a '.repeat(100)).length <= 80);
eq('a taken slug counts up', uniqueSlug('Benchmarks', ['benchmarks']), 'benchmarks-2');
eq('and keeps counting', uniqueSlug('Benchmarks', ['benchmarks', 'benchmarks-2']), 'benchmarks-3');
eq('a free slug is itself', uniqueSlug('Benchmarks', []), 'benchmarks');
eq('an empty title still gets an address', uniqueSlug('!!!', []), 'learning');
ok('a safe slug passes', isSafeSlug('set-what-good-looks-like'));
ok('a path is not a slug', !isSafeSlug('../etc'));
ok('nor is an upper-case one', !isSafeSlug('Benchmarks'));
ok('nor an empty one', !isSafeSlug(''));

/* the article convention: first line is the title */
eq('the title is the first line', learningTitle('\n\nThe title\n\nBody here.'), 'The title');
eq('the body is the rest', learningBody('The title\n\nBody here.\nMore.'), 'Body here.\nMore.');
eq('no title is named as such', learningTitle('   '), 'Untitled learning');

/* April's first pass */
const parsed = parseLearningDraft(`Set what good looks like, then let people exceed it
LEARNING: A benchmark is a threshold people can pass, not a perfection they fall short of.

Everyone in the room had the same picture in their head. You set the standard at 100 and mark people down from it.

That is school. Work is the other way round.`);
ok('the draft parses', parsed !== null);
eq('the title leads the article', learningTitle(parsed!.article), 'Set what good looks like, then let people exceed it');
eq('the learning is its own line', parsed!.learning, 'A benchmark is a threshold people can pass, not a perfection they fall short of.');
ok('the LEARNING line is not in the body', !/LEARNING:/.test(parsed!.article));
ok('the body survives', /That is school/.test(parsed!.article));
const noLine = parseLearningDraft('A title\n\nFirst sentence here. Second one.');
eq('a missing LEARNING line falls back to the first sentence', noLine!.learning, 'First sentence here.');
eq('an em dash is turned into a plainer mark', /—/.test(parseLearningDraft('T\nLEARNING: a—b\n\nbody.')!.learning), false);
eq('a blank reply is null, not a blank learning', parseLearningDraft('   '), null);
eq('a title with no body is null', parseLearningDraft('Just a title'), null);
eq('a markdown hash on the title is dropped', learningTitle(parseLearningDraft('# Heading\nLEARNING: x\n\nBody.')!.article), 'Heading');

/* the record */
const id = '11111111-2222-3333-4444-555555555555';
const l = normalizeLearning({
  id,
  slug: 'benchmarks',
  learning: 'x',
  article: 'Benchmarks\n\nBody.',
  added_by: 'shourov@polynize.io',
  use_case: 'ai_capability_lead',
  source: 'PwC L&D, 9 Sept',
  story_ids: ['a', 3, 'b'],
  published_at: '2026-09-10T00:00:00.000Z',
  created_at: 'c',
  updated_at: 'u',
});
ok('a good record loads', l !== null);
eq('story ids keep only strings', l!.story_ids, ['a', 'b']);
eq('a bad id is rejected outright', normalizeLearning({ id: 'nope', slug: 'x', article: 'T\n\nb' }), null);
eq('a bad slug is rejected outright', normalizeLearning({ id, slug: 'Not Safe', article: 'T\n\nb' }), null);
eq('an unknown use case is dropped, not kept', normalizeLearning({ id, slug: 'x', article: 'T', use_case: 'sales_lead_v9' })!.use_case, undefined);
const card = cardFor(l!);
eq('the card carries the title', card.title, 'Benchmarks');
eq('and the count of stories', card.stories, 2);
ok('and never the source', !('source' in card));
ok('nor the raw text', !('raw' in card));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
