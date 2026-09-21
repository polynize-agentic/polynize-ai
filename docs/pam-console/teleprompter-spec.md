# The teleprompter: build spec

**For:** the agent building marrsattacks.world
**Written:** 21 September 2026, from the teleprompter that runs in the PAM Console today (`app/console/marketing/piece/[id]/teleprompter/`), after three rounds of Marrs using it on the rig. Everything below was earned on set; nothing is speculative. Where a decision has a reason, the reason is given, because the reason is what stops the next builder undoing it.

---

## 1. What it is

A full-screen web page, one per script, that an iPad in a beam-splitter hood (or a laptop beside the camera) shows while Marrs records. The script scrolls continuously, mirrored for the glass, at a speed he sets, and he can take over with a hidden mouse wheel at any moment. That is the whole product.

## 2. What it is not

- **Not paged.** The first version showed one section at a time, advanced by tapping or a clicker. Marrs replaced it after one session: *"instead of tapped for next section, can we just make it a straight scroll, because I have a mouse that I'm hiding on my desk."* A real prompter scrolls. Paging makes the reader execute steps; scrolling lets him read at his own pace and embellish without falling out of sync with a mechanism.
- **No tap zones on the text.** A stray touch on a prompter is a lost place in the script. The scroll area responds to the wheel and to drag-scroll only; taps do nothing.
- **No fit-to-screen.** Nothing has to fit once it scrolls, so there is no shrinking of long beats.
- **No horizontal mirror.** See §5.

## 3. The page

- **Address:** one page per script, e.g. `/prompt/<script-id>`. Chrome-less: no site navigation, no header, nothing but the script and the small control strip.
- **Ground:** pure black `#000`. Text pure white `#fff`. Nothing else on the page emits light; on glass, any grey wash becomes a visible ghost on the lens.
- **The column:** one centred column, max width 92vw, horizontal padding 6vw, vertical padding **46vh top and bottom** so the first line starts in the middle of the screen and the last line can scroll up to the middle. The reading line is the vertical centre.
- **Type:** the body in Space Grotesk (the house display face) at the chosen size, line height 1.3, regular weight. Section headers (see §4) in a monospace face at 0.34 of the body size, uppercase, letter-spaced, in a soft green `#7cffb2`, so the eye can find "BEAT 2" without reading it as script.
- **Blocks:** a section is a heading line plus its paragraph. Blocks are separated by generous vertical space (about one body line). A run of dashes on its own line is a separator in the house script format and is dropped, never shown: as a section it was a blank screen to scroll past mid-take.
- **Keep the device awake** for the length of the page (screen wake lock where the browser allows it; fall back to a silent looping video or a one-pixel animation if not). A prompter that sleeps mid-take is the one failure a person on set cannot recover from.

## 4. The script format it reads

Plain text. Blank line between sections. A section's first line is its label when the section has more than one line; the rest is the spoken text. The labels the split-screen format uses, in order:

```
INTRO
In under 60 seconds I'm going to explain to you

HOOK
Why you're not too late to learn AI

BEAT 1
...

BEAT 2
...

BEAT 3
...

BEAT 4
...

CTA
...
```

The prompter does not care what the labels are; it shows whatever the first line of each block is. Only the spoken words go on the prompter. Stage directions, visual notes and timings live elsewhere and are never mixed into this text, because everything on the glass gets read aloud eventually.

## 5. The flip

**Vertical only.** The rig's glass reverses top-to-bottom, so the transform is `scaleY(-1)`. The first version had a "mirror" button that applied a horizontal flip, and it never worked on this rig; a second button for vertical was added, Marrs confirmed *"flip is the button I need, so we can take mirror off because the flip is doing the right thing"*, and the horizontal one was removed entirely rather than hidden. A button that does nothing useful on set is worse than no button. If a different rig ever needs horizontal, it is one more term in the transform.

**Apply the flip to the viewport-sized scroll box, not to the text column inside it.** The scroll box fills the screen, so it pivots about the middle of the screen. The column is the whole script's height and would pivot about a point far below the bottom of it. Flipping the box also keeps the scroll direction honest without a second setting: the picture and the motion are one rendered output, so both turn together and the text still travels the reading direction on the glass. Apply no transform at all when the flip is off, so an unflipped prompter is not paying for a compositing layer.

## 6. Auto-scroll

- **Speeds, pixels per second:** 12, 20, 30, 42, 60, 84, 120. Default 30. Roughly: 30 is a slow, deliberate delivery at 78px type, 60 a normal speaking pace, and the top of the range is for scanning back to a mark rather than for reading.
- **Accumulate fractional pixels between frames.** A readable pace is well under one pixel per frame (20px/s is a third of a pixel at 60fps) and rounding to zero every frame would simply never move. Keep a carry.
- **Manual scrolling is never blocked while it runs.** The wheel always works; auto-scroll carries on from wherever he left it. This is the difference between a prompter and a rail.
- **Stop at the end** rather than spinning against the bottom for the rest of the take.
- Use `requestAnimationFrame`, not a timer.

## 7. Size

Seven steps of body size in pixels: **40, 52, 64, 78, 94, 112, 132.** Default 78. Reading distance varies with the rig, so the range is wide and the steps coarse: fine steps are fiddling on set.

## 8. Controls

A single strip, bottom centre, on a translucent dark pill (`rgba(10,10,15,0.82)`), monospace 13px labels, buttons with a faint border that takes the mint accent when active:

| Control | Does |
|---|---|
| ✕ | leaves the page (back to wherever the script lives) |
| ▶ / ❚❚ | start and stop auto-scroll |
| slower · `30` · faster | speed down and up, with the current pixels per second shown between |
| A- · A+ | size down and up |
| flip | vertical flip on and off (lit when on) |
| top | scroll to the top |
| hide | hides the strip; a faint ⋯ in a corner brings it back |

Keyboard, for the hidden mouse or a clicker mapped to keys: **Space** start/stop, **Up/Down** speed, **+/-** size, **f** flip, **Home** top. A one-line hint under the strip says so, in faint grey, and disappears with the strip.

## 9. What is remembered, and where

**Flip, size and speed live on the device, not on the script.** The iPad in the hood is always flipped and the laptop never is, so storing them per script would be wrong, and not storing them at all would mean setting them before every take. Local storage, three keys, read on load, written on change. Any storage failure (private mode) falls back to the defaults silently.

If an old key from a removed control ever exists (the retired horizontal mirror did), **clear it actively on load** rather than ignoring it, or a device that set it will load the wrong state forever with no button left to undo it.

## 10. Getting the iPad onto the right script

In the console, the Studio page lists everything queued to record and prints a **QR code per script** that opens its prompter page; you point the iPad's camera at the screen and it opens on the right take. The QR must encode an absolute URL (a relative path means nothing to a camera), read from the request's host so it is right on any deployment with nothing to configure. Beside the QR, the same URL as plain text for when the camera will not cooperate, and a **Recorded** button that marks the script done and drops it off the list, confirmed on the page instantly (a row that sits unchanged while a request flies gets pressed twice).

Whatever lists scripts on marrsattacks.world should do the same: a code and a link per script, and a way to mark it recorded.

## 11. Acceptance, on the rig

1. Open a script on the iPad in the hood, press flip once: text reads correctly through the glass, and the wheel scrolls it in the reading direction.
2. Close the page and open another script: flip, size and speed are as you left them.
3. Start auto-scroll at 30, read aloud at a natural pace: the reading line stays near the centre; nudge the wheel forward and back mid-take and auto-scroll continues from there.
4. Let it run to the end: it stops; it does not judder at the bottom.
5. Leave the page untouched for five minutes: the screen has not slept.
6. Tap the text anywhere: nothing happens.
