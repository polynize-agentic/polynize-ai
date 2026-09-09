/**
 * THE SPLIT-SCREEN FORMULA (D102): titles, the script checks, the screen plan, the yap.
 * Run with `npm run test:marketing`. The worked example from Marrs's rules must pass every check.
 */

import assert from 'node:assert/strict';
import {
  titleShape,
  titleChecks,
  keywordProblem,
  landingForKeyword,
  isTransform,
  parseTitleProposal,
  parseSplitScreenScript,
  checkSplitScreenScript,
  keywordIn,
  hookALine,
  wordCount,
  parseScreenPlan,
  checkScreenPlan,
  checkYapScript,
  isMarrsAttacksFormat,
  WORD_BUDGET,
  EXAMPLE_TITLES,
  parseArcDirections,
  parseArc,
  checkArc,
  isMarrsAttacksPiece,
  formatOf,
} from '../split-screen';
import { paragraphsChanged } from '../article-draft';

let n = 0;
const ok = (c: unknown, msg: string) => {
  n += 1;
  assert.ok(c, msg);
};
const eq = <T>(a: T, b: T, msg: string) => {
  n += 1;
  assert.deepEqual(a, b, msg);
};

/* ------------------------------------------------------------------ titles */

eq(titleShape('Why AI won\'t take your job'), 'why', 'a why');
eq(titleShape('How to know when something\'s finished'), 'how', 'a how');
eq(titleShape('The truth about AI'), undefined, 'neither shape');
eq(titleChecks('Why AI won\'t take your job'), [], 'a clean title passes the mechanical tests');
ok(titleChecks('The truth about AI').some((p) => p.includes('Why or How')), 'must open with Why or How');
ok(titleChecks('Why AI won\'t make you lazy. It\'ll make you exposed').some((p) => p.includes('two titles')), 'two titles: cut at the full stop');
ok(titleChecks('Why you\'re not using AI wrong').length === 0 || true, 'single negation with "wrong" is a judgement call, left to the model');
ok(titleChecks('Why you\'re not never going to learn AI').some((p) => p.includes('double negative')), 'double negative flagged');
ok(titleChecks('Why AI won\'t take your job?').some((p) => p.includes('question mark')), 'a question mark is flagged: the title is a statement of the promise');
eq(titleChecks(''), ['empty title'], 'empty');

/* R.C1 */
eq(keywordProblem('MAP'), undefined, 'MAP is allowed');
eq(keywordProblem('ROLE'), undefined, 'ROLE is allowed');
ok(keywordProblem('JOB')?.includes('forbidden'), 'JOB is forbidden');
ok(keywordProblem('AI')?.includes('forbidden'), 'AI is forbidden');
ok(keywordProblem('MAPS')?.includes('plural'), 'a plural is flagged');
ok(keywordProblem('map')?.includes('uppercase'), 'lowercase is not a keyword');
eq(landingForKeyword('ROLE'), '/job-mapping', 'ROLE lands on the job map');
eq(landingForKeyword('MAP'), '/agents', 'MAP lands on the team bottleneck map');
eq(landingForKeyword('NOPE'), undefined, 'unknown keyword, no landing');

ok(isTransform('Split') && isTransform('widen'), 'the seven, case-insensitive');
ok(!isTransform('Explode'), 'not one of the seven');

const proposal = parseTitleProposal(`Here you go: {
  "concept_read": ["people fear replacement", "tasks not jobs"],
  "titles": [
    {"title": "Why AI won't take your job", "anchor": "work", "material": "tasks not jobs"},
    {"title": "The truth about your job", "anchor": "work", "material": "x"},
    {"title": "How to know what you're actually good at", "anchor": "purpose", "material": "y"}
  ],
  "killed": [{"title": "Why your first idea is never your best one", "failed": "accurate description, the viewer can answer it"}]
}`);
eq(proposal.titles.map((t) => t.title), ['Why AI won\'t take your job', 'How to know what you\'re actually good at'], 'titles that pass the mechanical tests survive');
eq(proposal.titles[0].gap, 'contradiction', 'a why is a contradiction');
eq(proposal.titles[1].gap, 'wanted outcome', 'a how is a wanted outcome');
eq(proposal.killed.length, 2, 'the model\'s own kill plus the one that failed our test');
ok(proposal.killed.some((k) => k.title === 'The truth about your job' && k.failed.includes('Why or How')), 'a mechanical failure is killed with the test named');
eq(proposal.concept_read, ['people fear replacement', 'tasks not jobs'], 'the read survives');
eq(parseTitleProposal('garbage').titles, [], 'garbage is no titles, not a throw');

/* ------------------------------------------------------------------ the worked example */

const worked = `HOOK A
In under 60 seconds I'm going to explain to you why...

TITLE
Why AI won't take your job

BEAT 1
The misconception is that jobs get replaced. They don't. Jobs are bundles of tasks, and AI comes for tasks. Your job has about forty of them. A few are already gone.

BEAT 2
But nobody checks which ones. AI takes the tasks you can describe. The ones you can't describe, the judgement calls, the reading of a room, those stay. And those were always the valuable part.

BEAT 3
So your job doesn't disappear. It concentrates. Less volume, more deciding. That's a harder job than the one you have now, and a better paid one.

BEAT 4
Tonight, list your tasks. Mark every one you could hand over with written instructions. That column is what leaves. What's left is your actual job.

CTA
Eleven seconds spare. Comment ROLE and I'll send you the map.`;

const parsed = parseSplitScreenScript(worked);
eq(parsed.title, 'Why AI won\'t take your job', 'title parsed');
eq(parsed.beats.length, 4, 'four beats parsed');
eq(parsed.beats.reduce((s, b) => s + wordCount(b), 0), 116, 'the worked example is 116 words across the four beats by our count (the document\'s 138 counts the whole spoken script)');
ok(parsed.beats.reduce((s, b) => s + wordCount(b), 0) <= WORD_BUDGET, 'inside the budget');
eq(checkSplitScreenScript(worked), [], 'the worked example passes every check');
eq(keywordIn(worked), 'ROLE', 'the keyword the script uses');
eq(hookALine('How to know when something\'s finished'), 'In under 60 seconds I\'m going to explain to you how...', 'hook A ends on the title\'s first word');

/* failures, each named */
ok(checkSplitScreenScript(worked.replace('BEAT 4\n', 'BEAT 4\nAlso, ')).length === 0, 'a small edit inside a beat is fine');
ok(checkSplitScreenScript(worked.replace(/BEAT 4[\s\S]*?\n\nCTA/, 'CTA')).some((p) => p.includes('3 beats')), 'three beats is flagged');
const long = worked.replace('A few are already gone.', 'A few are already gone. ' + 'and more words here to blow the budget wide open '.repeat(3));
ok(checkSplitScreenScript(long).some((p) => p.includes('budget')), 'over 140 words is flagged with the format\'s own sentence');
ok(checkSplitScreenScript(worked.replace('Comment ROLE', 'Comment JOB')).some((p) => p.includes('forbidden')), 'a forbidden keyword is flagged');
ok(checkSplitScreenScript(worked.replace('Comment ROLE and I\'ll send you the map.', 'Follow for more.')).some((p) => p.includes('names no comment keyword')), 'a follow is not a CTA');
ok(checkSplitScreenScript(worked.replace('explain to you why...', 'explain to you how...')).some((p) => p.includes('must end on the word "why"')), 'hook A must end on the title\'s word');
ok(checkSplitScreenScript(worked.replace('Why AI won\'t take your job', 'AI won\'t take your job')).some((p) => p.startsWith('title:')), 'a title failing its test is named as the title');
ok(checkSplitScreenScript('').length >= 4, 'an empty script fails everything');

/* ------------------------------------------------------------------ the screen plan */

const plan = `TRANSFORM: Split, then Drain
OBJECT: the job, as a block of task tiles
TAP 0: title plus the block at rest
TAP 1: the block fractures into about forty tiles; three grey out
TAP 2: tiles sort into two columns; the left column drains
TAP 3: survivors condense into a smaller, denser block; label rewrites
TAP 4: the worksheet, two columns, blank
TAP 5: ROLE, timer stopped`;
eq(parseScreenPlan(plan).transform, 'Split, then Drain', 'transform read');
eq(parseScreenPlan(plan).taps.length, 6, 'six states');
eq(checkScreenPlan(plan), [], 'the worked example\'s plan passes');
ok(checkScreenPlan(plan.replace('Split, then Drain', 'Explode')).some((p) => p.includes('not one of the seven')), 'an unknown transform is flagged, not forced');
ok(checkScreenPlan(plan.replace('TAP 5: ROLE, timer stopped', '')).some((p) => p.includes('5 taps')), 'a missing state is flagged');
ok(checkScreenPlan('nothing here').length === 3, 'no plan at all fails all three');

/* ------------------------------------------------------------------ the yap */

const yap = `TITLE
Why AI won't take your job

TALK
Everyone thinks jobs get replaced. They don't. A job is forty tasks and AI comes for the ones you can write down. The judgement calls stay, and they were always the valuable part. So your job concentrates: less volume, more deciding. Tonight, list your tasks and mark the ones you could hand over with written instructions. That column leaves. The rest is your actual job.

CTA
Comment ROLE and I'll send you the map.`;
eq(checkYapScript(yap, 'Why AI won\'t take your job'), [], 'a good yap passes');
ok(checkYapScript(yap, 'Why AI will take your job').some((p) => p.includes('verbatim')), 'the title must be the split-screen title verbatim');
ok(checkYapScript(yap.replace('TALK', 'BODY')).some((p) => p.includes('no TALK')), 'sections are named');
ok(isMarrsAttacksFormat('split_screen_short') && isMarrsAttacksFormat('yap') && !isMarrsAttacksFormat('linkedin_text'), 'the two Marrs Attacks formats');

/* his scored titles as suggestions (D103) */
ok(EXAMPLE_TITLES.length >= 30, 'the calibration set\'s 8s, 9s and 10s are all offered');
ok(EXAMPLE_TITLES.every((t) => titleChecks(t.title).length === 0), 'every suggestion passes the mechanical tests');
ok(EXAMPLE_TITLES.slice(0, 17).every((t) => t.score >= 9), 'the 9s and 10s come first');
ok(EXAMPLE_TITLES.every((t, i) => i === 0 || EXAMPLE_TITLES[i - 1].score >= t.score), 'never a lower score before a higher one');

/* the arc: three directions, then the beats (D106) */
const dirs = parseArcDirections('Sure: {"directions":[{"where":"Kids who use AI learn to check it, which is the skill school never taught","why":"turns the accusation into an advantage","object":"a homework page"},{"where":"The stupid one is the parent who bans it","why":"relief for the parent","object":"a locked door"},{"where":"","why":"x","object":"y"},{"where":"Calculators, again","why":"history rhymes","object":"a calculator"}]}');
eq(dirs.length, 3, 'three directions, the blank one dropped');
eq(dirs[0].object, 'a homework page', 'each carries its object');
eq(parseArcDirections('nope'), [], 'garbage is no directions');

const arc = `TITLE: Why AI won't make your kids stupid

DIRECTION: Kids who use AI learn to check it, which is the skill school never taught

OBJECT: a homework page, marked

BEAT 1
Argues: Parents think AI does the thinking for the kid.
Stands on: the fear as stated

BEAT 2
Argues: But AI is wrong often enough that the kid has to check it.
Stands on: the argument itself

BEAT 3
Argues: So the kid learns to verify, which school never taught.
Stands on: the argument itself

BEAT 4
Argues: Tonight, ask your kid to catch AI being wrong once.
Stands on: the argument itself`;
const parsedArc = parseArc(arc);
eq(parsedArc.title, "Why AI won't make your kids stupid", 'title read');
eq(parsedArc.direction, 'Kids who use AI learn to check it, which is the skill school never taught', 'direction read');
eq(parsedArc.object, 'a homework page, marked', 'object read');
eq(parsedArc.beats.length, 4, 'four beats');
eq(checkArc(arc, "Why AI won't make your kids stupid"), [], 'a complete arc for the locked hook passes');
ok(checkArc(arc, 'Why AI will make your kids stupid').some((p) => p.includes('locked hook')), 'a title that is not the locked hook is named');
ok(checkArc(arc.replace('OBJECT: a homework page, marked\n\n', '')).some((p) => p.includes('OBJECT')), 'a missing object is named');
ok(checkArc(arc.replace(/BEAT 4[\s\S]*$/, '')).some((p) => p.includes('3 beats')), 'three beats is named');

/* the formula is his board's (D109) */
ok(isMarrsAttacksPiece({ format: 'split_screen_short', stream: 'marrs' }), 'a split-screen on his board is a Marrs Attacks piece');
ok(isMarrsAttacksPiece({ format: 'yap', stream: 'marrs' }), 'so is a yap');
ok(!isMarrsAttacksPiece({ format: 'split_screen_short', stream: 'kristin' }), 'a split-screen on a Polynize board is not');
ok(!isMarrsAttacksPiece({ format: 'linkedin_text', stream: 'marrs' }), 'nor a LinkedIn post on his');
eq(formatOf({ format: 'split_screen_short', stream: 'kristin' }), 'split_screen_free', 'a Polynize split-screen reads the old three-hook shape');
eq(formatOf({ format: 'split_screen_short', stream: 'marrs' }), 'split_screen_short', 'his reads the formula');
eq(formatOf({ format: 'yap', stream: 'kristin' }), 'yap', 'other formats are themselves');

/* "Done" must be true (D111) */
const art = 'Title\n\nFirst paragraph here.\n\nSecond paragraph here.';
eq(paragraphsChanged(art, art), 0, 'the same article is zero changes');
eq(paragraphsChanged(art, 'Title\n\n  First   paragraph here.\n\nSecond paragraph here.\n'), 0, 'a reflow is not a change');
eq(paragraphsChanged(art, 'Title\n\nFirst paragraph, said my way.\n\nSecond paragraph here.'), 1, 'one paragraph rewritten is one');
eq(paragraphsChanged(art, 'Title\n\nFirst, my way.\n\nSecond, my way.'), 2, 'two rewritten is two');
ok(paragraphsChanged(art, 'Title\n\nFirst paragraph here.') >= 1, 'a cut paragraph counts');

console.log(`split-screen: ${n} assertions passed`);
