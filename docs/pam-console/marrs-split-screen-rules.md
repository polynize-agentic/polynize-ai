# Marrs Split-Screen Explainer: Generation Rules

> **Provenance.** Written for the PAM console builder agent; given to the console by Marrs on 8 September 2026. Stored verbatim except that em dashes were replaced with colons per the house rule. This is the intelligence layer the split-screen format in `lib/marketing/split-screen.ts` is built from; when the two disagree, this document is the source and the code is wrong. **One correction from Marrs the same day:** the CTA is a lead magnet keyword (MAP, ROLE), not a follow; the rules below already say so.

**For:** PAM console builder agent
**Scope:** Marrs stream only. Polynize streams not yet validated against these rules.
**Status:** v1. Question rules validated at 90% strike rate, 18 of 20 titles scoring 8 or above against Marrs scoring. Script and visual rules derived from one worked example, unvalidated in production.

This document is the intelligence layer, not the functionality spec. It says what makes a good question, a good script and a good visual. It does not describe console mechanics.

### Do not generalise this to Polynize

The Marrs stream is growth. The Polynize streams are lead generation. Three rules invert, so this document must not be reused for Polynize without a separate validation run:

1. **Relief becomes problem.** Marrs titles hand the viewer relief, because relief is what gets a video sent to a specific person. A Polynize buyer who feels reassured does not book a call. Polynize needs the viewer holding a problem they cannot unsee
2. **Beat 4 changes job.** For Marrs it is a free action the viewer takes tonight, and the video is complete in itself. For Polynize it must open the gap the lead magnet fills, without becoming an ad
3. **The vocabulary corpus moves.** Consumer confessions on Reddit and Substack do not contain the language of a Head of L&D or a security awareness lead. That corpus is client call transcripts and LinkedIn threads

The format, the timer, the beat count and the visual grammar all transfer. The question rules do not.

---

## 1. The format

Split screen. Top frame: Marrs, torso up. Bottom frame: bird's-eye view of the desk touchscreen. A strip of desk between them where hands cross.

**Cold open, fixed every time:**

1. Screen already displays the title before Marrs enters
2. Walk on, timer held beside face
3. Verbal hook A: "In under 60 seconds I'm going to explain to you **why**..."
4. Timer descends and crosses the frame split, pulling the viewer's eye down
5. Timer lands on desk. Verbal hook B: the title, word for word
6. Thumb on Go. Countdown starts. Tap to first state

Three hooks operate at once: visual (walk-on), verbal (hook A), written (title on screen).

**Rules:**

- Hook A ends on the word "why" or "how". Hook B opens with the same word
- Hook B is the on-screen title verbatim. No paraphrase
- Timer counts down, never up
- Timer stops on camera with time visibly remaining. Beating the stated promise is the trust mechanism
- CTA sits outside the clock

---

## 2. Question generation

The question is the product. Everything downstream is execution.

### Two shapes only

**Contradiction.** A claim the viewer cannot explain and suspects is wrong.
Examples scored 9 or 10: *Why you need a 100-year plan to hit your goals. Why AI won't make your kids stupid. Why you trust AI most when it's wrong. Why your best ideas come on the toilet.*

**Wanted outcome.** Something the viewer wants and does not have.
Examples scored 9 or 10: *How to know when something's finished. How to make your work impossible to copy. How to have the best idea in the room. How to know what you're actually good at.*

### The killer test

**If the viewer can answer the title themselves, kill it.**

Recognition is not curiosity. An accurate description of the viewer's behaviour reads as true, generates agreement, and produces no click. This is the single most common failure mode and it produces titles that are well written and worthless.

Failed on this test: *Why the last 10 percent takes longer than the first 90. Why you'd rather start something new than finish this. Why your first idea is never your best one.* All accurate. All closed.

Passed: *Why you abandon things at 90 percent.* Same territory, but the number creates a mystery instead of restating a fact.

**Never describe. Contradict them, or give them something.**

### Construction rules

| Rule | Detail |
|---|---|
| **Focus anchor** | Every title needs a domain: AI, creativity, productivity, purpose, work. Never fully open. "Why you're further along than you think" fails, there is no category |
| **Borrowed vocabulary** | Use only words harvested from the research corpus. Invented verbs kill titles. *Rot your brain* works because people say it. *Flatten, hollow out, melt, wreck* all failed |
| **Commonest phrasing** | Use the most natural form, not the second most. *Come in the shower* beats *arrive in the shower*. *Keeping you up at night* beats *keeping you awake* |
| **Behaviour, not feeling** | Name something observable. *Abandon at 90 percent* works. *Feel guilty about AI* instructs an emotion the viewer may not have |
| **Name the accusation** | Use the exact label people are given: *too old, cheating, stupid, lazy*. Abstractions fail: *fraud, crutch, the author* |
| **One idea, no second read** | If parsing is required, it is dead. Ambiguity scores 5 or below every time. Length is not the constraint: a twelve-word title scored 8 and a ten-word title scored 10. Short is usually the result of one clean idea, not the cause of one |
| **Concrete over abstract** | Abstract nouns produce 8s. Concrete images produce 10s. *Taste, decision, idea, question* score well. *Kids, the toilet, the room, 100 years, 90 percent* score higher. When a title is landing at 8, look for the concrete version of the same claim. This correlates strongly but does not govern: *How to know when something's finished* scored 10 with nothing concrete in it |
| **Title is the promise, not the twist** | The clever inversion lives in beat 2 as the reward for staying. *Why AI won't make you lazy. It'll make you exposed* is two titles. Cut at the full stop |
| **Relief over shame** | Shame hooks get watched. Relief hooks get sent to a specific person. Shareability is the primary objective, so default to relief and treat shame framings as deliberate tests |

### How-format specific

A how title must name an **outcome**, never a **method**.

- *How to know what you're actually good at* scored 9. Outcome
- *How to plan your life backwards from 100* scored 5. Method
- Marrs rewrote that same idea as *Why you need a 100-year plan to hit your goals* and scored it 10

When a method is the only available framing, convert to a why.

### Applies to all sources

Run these tests on ideas that originate from Marrs as well. A Marrs-originated title scored 5 on fresh eyes in testing. The test is objective and overrides taste, including his.

---

## 3. Research arm

**The research does not find topics. It finds vocabulary.**

Angles come from Marrs and from the format rules above. The corpus supplies two things only:

1. **Native phrasing.** The exact nouns and verbs people use about themselves
2. **Saturation check.** Whether a framing is already worn out

### Method

- Search **first-person stems**, never topics. *"is AI making me", "am I the only one", "should I feel bad that", "is it cheating to", "I can't seem to", "does anyone else"*
- Keep verbatim. Paraphrase destroys the asset. *"I don't know where AI fits in my organisation"* is a title. *"They wanted AI readiness guidance"* is nothing
- Harvest complaints, not conclusions. The complaint is in the person's words. The article's conclusion is in the writer's
- Store as a phrase bank: verbatim string, source, date

### Sources, ranked by confession density

1. Blind, Reddit
2. Substack notes and comment threads
3. YouTube comments under AI launches and product announcements
4. LinkedIn comment threads

Comment sections under news events are the highest-value seam. They show the fear in native language, already ranked by engagement.

### News handling

News never becomes the subject. Event lands, ask what an ordinary person fears or hopes about it, search that as a first-person stem, invert, test against section 2.

**The news peg enters at beat 1 and never appears in the title.** This keeps the title durable for months and lets an underperforming piece be re-pegged rather than rewritten.

---

## 4. Script rules

### Budget

60 seconds, four beats, target 48 seconds so the timer stops with time remaining.

- ~12 seconds per beat
- ~33 to 36 spoken words per beat
- ~140 words total

If an idea cannot survive 140 words, it is not this format.

### Why structure

| Beat | Job |
|---|---|
| 1 | **Setup.** The belief the viewer holds. Stated fairly, so the turn lands |
| 2 | **But.** The turn. The only surprise in the script |
| 3 | **Therefore.** What it actually means for them |
| 4 | **So do this.** One action they can take tonight, with no purchase required |

### How structure

| Beat | Job |
|---|---|
| 1 | **The result.** Show the finished thing first, so the 60 seconds is earned |
| 2 | Step one |
| 3 | Step two |
| 4 | **The bit nobody does.** The non-obvious move that makes it work |

Beat 4 supplies the surprise that the why format gets structurally. A how with an obvious beat 4 fails harder than a weak why, because it has no turn to fall back on.

### CTA

Spoken after the timer stops, in the relief. Never inside the clock. Roughly ten words.

Comment keywords must not appear in ordinary praise or reply comments, or auto-DM triggers fire on false positives.

- `MAP` = team bottleneck flow (existing, locked)
- `ROLE` = job map, polynize.ai/job-map

**Rule R.C1:** one token, no plurals, never the magnet's own noun. Never JOB, TEAM, AI, YES.

---

## 5. Visual grammar

The voice moves on. The screen holds. The voice describes. The screen shows change.

### One object, five states

The screen presents the viewer's situation as a **single object**, and each tap changes that object's state. Never five different pictures. The viewer watches one thing transform, which is what makes it read as a journey rather than a slideshow.

| Tap | Beat | Screen |
|---|---|---|
| 0 | Written hook | Title plus the object at rest |
| 1 | Setup | The belief made visible. The object as the viewer currently pictures it: complete, reasonable, wrong |
| 2 | But | The object changes state. The only moment the screen surprises |
| 3 | Therefore | The new state settles and is renamed |
| 4 | So do this | The artefact. The thing worth screenshotting |
| 5 | CTA, off clock | Keyword or link, timer stopped |

### The seven transforms

Beat 2 is always one of these. Classify before designing.

| Transform | The turn |
|---|---|
| **Split** | One thing becomes two categories |
| **Drain** | Volume leaves, what remains is denser |
| **Move** | Nothing was lost, it relocated |
| **Invert** | The cause was the effect |
| **Reveal** | It was there all along, frame held still |
| **Rescale** | Same thing, wrong ruler |
| **Widen** | Frame pulls back, same picture means something different |

The set is v1 and not proven exhaustive. **When a script's turn will not classify, flag it rather than forcing a fit.** Forcing produces generic visuals. Freeze the set after ten produced scripts.

### Object selection

From the script, find the noun the viewer is worried about: job, creativity, brain, voice, taste, time. Then ask what shape shows the belief **and can change shape to show the truth**.

The object is chosen for its ability to transform, not for how it looks at rest. It should be simple. It is an analogy, not an illustration. It changes per topic and is never a house shape reused across videos.

### Hard rules

1. **Sound-off test.** The object must be followable as an argument with captions covered. If not, it is decoration
2. **One change per tap.** The eye is split between face and screen. It can read one change
3. **No text except tap 0 and tap 5.** The viewer is already reading captions or listening. Numbers permitted where a number is the point
4. **Tap on the beat word.** The finger enters on "but", on "so". Never mid-sentence

---

## 6. Worked example

**Title:** Why AI won't take your job
**Transform:** Split, then Drain
**Object:** the job, as a block of task tiles

**Beat 1, Setup**
"The misconception is that jobs get replaced. They don't. Jobs are bundles of tasks, and AI comes for tasks. Your job has about forty of them. A few are already gone."
*Screen: job block fractures into ~40 tiles. Three grey out.*

**Beat 2, But**
"But nobody checks which ones. AI takes the tasks you can describe. The ones you can't describe, the judgement calls, the reading of a room, those stay. And those were always the valuable part."
*Screen: tiles sort into two columns. Left column drains.*

**Beat 3, Therefore**
"So your job doesn't disappear. It concentrates. Less volume, more deciding. That's a harder job than the one you have now, and a better paid one."
*Screen: survivors condense into a smaller, denser block. Label rewrites.*

**Beat 4, So do this**
"Tonight, list your tasks. Mark every one you could hand over with written instructions. That column is what leaves. What's left is your actual job."
*Screen: the worksheet. Two columns, blank.*

**Timer stops on camera.**
"Eleven seconds spare. Comment ROLE and I'll send you the map."

138 words.

---

## 7. Rejection behaviour

The agent flags rather than forces when:

- A title cannot pass the killer test
- A script's turn will not classify against the seven transforms
- The vocabulary is not present in the phrase bank
- An idea needs more than 140 words

A flagged item returns to Marrs with the specific failed test named. Silent adaptation to fit the format is worse than rejection.

---

## Appendix A: Scored calibration set

Titles scored by Marrs across seven rounds of generation. Use these as few-shot examples. They calibrate better than the rules above, because the rules are a summary of this data and the data is the primary source.

**Reliability notes.** Scores were transcribed from voice input and a small number are inferred from wording rather than a stated number. Several titles were scored twice across rounds, and the later score is always lower, because the standard rose as the exercise progressed. **Where a title was scored twice, the latest score is used and the earlier one discarded.** The ambiguous 6 to 7 band is excluded, since that is where transcription noise and score drift are worst.

### A1. Contrastive pairs

Highest-signal section. Each pair holds the idea roughly constant and changes one variable.

| Failed | Score | Passed | Score | Variable |
|---|---|---|---|---|
| How to finish what you start | 3 | How to know when something's finished | 10 | Method vs outcome |
| How to plan your life backwards from 100 | 5 | Why you need a 100-year plan to hit your goals | 10 | Method vs contradiction, same idea |
| Why AI won't melt your attention span | 3 | Why AI won't rot your brain | 9 | Invented verb vs native phrase |
| Why AI isn't a crutch | 3 | Why using AI isn't cheating | 9 | Abstraction vs the actual accusation |
| Why you're not bad at AI | 5 | Why AI won't make your kids stupid | 10 | Flat label vs named accusation with a concrete stake |
| Why the last 10 percent takes longer than the first 90 | 6 | Why you abandon things at 90 percent | 9 | Description vs mystery |
| Why your best ideas arrive in the shower | 6 | Why your best ideas come on the toilet | 8 | Second-most-natural word vs natural word, plus concreteness |
| Why you should tidy your desk before you start | 5 | Why you should let AI do the fun part | 9 | No curiosity gap vs real gap |
| How to trust your own taste | 8 | How to have the best idea in the room | 10 | Abstract noun vs concrete image |

### A2. Scored 9 or 10

- Why you need a 100-year plan to hit your goals: 10
- Why AI won't make your kids stupid: 10
- Why deadlines make you more creative: 10
- Why you abandon things at 80 percent: 10
- How to know when something's finished: 10
- How to make your work impossible to copy: 10
- How to have the best idea in the room: 10
- Why your taste is ahead of your skill: 9
- Why AI won't rot your brain: 9
- Why AI won't kill your creativity: 9
- Why using AI isn't cheating: 9
- Why you're not too old for AI: 9
- Why you should let AI do the fun part: 9
- Why you trust AI most when it's wrong: 9
- How to know what you're actually good at: 9
- How to stop second-guessing yourself: 9
- How to make yourself hard to replace: 9

### A3. Scored 8

- Why your best ideas come on the toilet
- Why finishing badly beats finishing well
- Why you're allowed to quit at 90 percent
- Why the question you're embarrassed to ask AI is the right one
- Why nobody can keep up with AI
- Why your worst idea is worth writing down
- Why you're too polite to AI
- Why nobody actually knows how to use AI yet
- Why you're not too late to learn AI
- Why you're not falling behind on AI
- Why you're chasing a goal you never chose
- Why you ask AI things you'd never ask a person
- How to trust your own taste
- How to make a decision you won't regret
- How to never run out of ideas
- How to tell when AI is lying to you

### A4. Clear failures, with the named cause

| Title | Score | Cause |
|---|---|---|
| Why you're allowed to not use AI | 2 | Meaningless. No accusation exists to be relieved of |
| How to get your evenings back | 2 | No focus anchor, reads as generic productivity |
| Why you're still the author | 3 | Abstract noun, no accusation named |
| Why you're doing AI's typing | 3 | Unparseable |
| Why AI won't melt your attention span | 3 | Invented verb |
| How to finish what you start | 3 | Method, and the viewer can answer it themselves |
| Why AI isn't a crutch | 3 | Abstraction |
| Why you're not using AI wrong | fail | Double negative |
| Why you're further along than you think | fail | No focus anchor. Further along in what |
| Why you don't need to be technical | fail | No focus anchor |
| Why you shouldn't feel guilty about AI | 3 | Instructs an emotion the viewer may not hold |
| Why your thinking is still yours | 5 | Abstract, no accusation |
| Why AI won't hollow out your work | 5 | Invented verb |
| Why AI won't wreck your memory | 5 | Invented phrasing. Nobody says their memory is wrecked |
| Why using AI doesn't make you a fraud | 5 | Wrong accusation. Not the word people use |
| How to make AI argue with you | 5 | Reads as an undesirable outcome |
| How to make AI sound like you | 5 | Saturated trope |
| Why you should start with the ending | 6 | Ambiguous, required a second read |
| Why AI won't flatten your taste | 6 | Invented verb, and *taste* is ambiguous without context |
| Why you'd rather start something new than finish this | 6 | Accurate description. Viewer can answer it themselves |
| Why your first idea is never your best one | 6 | Accurate description |
| Why you work better at 11pm | 6 | Accurate description, and the claim is arguable |

### A5. What the drift shows

Three titles were scored high early and low later:

| Title | Early | Late |
|---|---|---|
| How to finish what you start | 10 | 3 |
| How to plan your life backwards from 100 | 8 | 5 |
| Why you're using AI wrong | approved | flagged as saturated |

All three are how-methods or saturated framings. The pattern is that **method framings and worn tropes read well on first pass and fail on re-reading.** When a title scores well but is a method or a familiar trope, discount it rather than trusting the first score.
