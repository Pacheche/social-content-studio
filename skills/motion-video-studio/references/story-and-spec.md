# Story and spec

Most generated videos fail before the first frame: the brief was adjectives, nobody decided what the viewer should understand, and the model filled the gaps with its defaults. This file turns a brief into a film someone can check.

## The core

Write these four lines before anything else:

- **One thing.** The single idea the film leaves behind.
- **One viewer, one task.** Who is watching and what they are trying to do when they meet the product.
- **One real fact.** A real number, screen, result or quote that travels from the hook to the payoff.
- **One formal idea.** The visual rule the whole film obeys: "one shape keeps morphing into every UI state", "the sentence's baseline is a trajectory", "everything happens inside one window".

If you cannot write the one thing, ask. If there is no real fact, the film is an announcement; say so and keep it short.

## Three storylines, then one

For a film over about 15 seconds, write three storylines that are three different films, not three versions of the same cuts. Vary the device and the form. Put a bold one among them, recommend one first, save them in `STORYLINES.md` and let the user pick.

**Devices** (what carries the meaning): a moment in someone's day; a character does the work; the feature itself is the hook; the result comes first; one object travels across apps; life before and after; the type carries the argument; a number lands; a question with its input; the object is the explanation.

**Forms** (how it is shot): one continuous take; an object-to-object chain; an endless zoom; a flight through one world; cuts on the beat; match cuts; a split screen that becomes one; one frame that rebuilds itself.

If all three storylines are plain cuts between slides, the forms were not tried.

## Structures by length

Plan in bars, not seconds, when there is music; for a silent film pick 120 BPM anyway (beat 0.5 s, bar 2 s). Film length is a whole number of bars; scene boundaries land on bars.

**6-15 s (feed ad, hook clip):** hook with the payoff visible, one proof, CTA. Something moves in the first frame.

**20-35 s (launch, product reel):** shares of the runtime that work as a start:

| Part | Share | Notes |
|---|---|---|
| Hook | ~8% | Frame 0 is the thumbnail: a face, a result or a bold line, never black or a logo |
| Tension | ~12% | The old way failing, on screen |
| Reveal | ~8% | Product or title at about 20-30% of the runtime |
| Proof | ~40% | 3-6 verbs, one per scene, real UI moving |
| Payoff | ~20% | Lands once, at 60-80% of the runtime, on the music's drop |
| Claim | ~8% | One line |
| End card | ~8% | Holds 2-3 s; the logo lands here, performed, not faded in |

**30-60 s with a song (bar budgets):** opening 1-2 bars, punchline 1-1.5, feature scene 2-4, proof 1.5-2.5, ending 2. Cut a slow music intro.

**Loop (landing page):** the last frame equals the first. Verify it by decoding both.

## Hook

- Frame 0 already shows what the film is about. A change or a question in the first beat.
- Assume sound is off: the hook must read from the picture and the words on screen.
- The first two seconds are the densest; the payoff comes before the viewer would swipe.
- No evidence from controlled studies backs an exact hook length; treat "first 1-3 s" as practice, not law.

## Voice-over films

- Before any recording, estimate speech at about 2.5 words per second: roughly 0.1 s plus 0.04 s per letter for each word, plus 0.17 s per comma and 0.38 s per sentence end. Replace the estimate with the measured audio as soon as it exists.
- Word budgets as a start: 30-45 s takes 5-6 blocks and 80-110 words; 60-90 s takes 7-9 blocks and 160-220 words; 2-3 min takes 12-18 blocks and 300-450 words. A block lasts 3-10 s, ideally 5-7.
- The picture shows what the voice says at that moment, because nobody reads one thing while hearing another. Outside captions, keep about 4 words or fewer on screen, and never large text that repeats the voice or the captions: it is the same information a third time. For each spoken section ask how to make the idea visual instead of writing it big.
- Talking-head reel: animation on top and the speaker below as the default layout, full screen only for sections that earn it.

## Spec header

Every film gets this block, filled, in `SPEC.md`:

```text
GOAL      what the viewer understands or does
OUTPUT    duration (to 0.01 s), W x H, fps, formats (9:16 / 1:1 / 16:9), loop yes/no,
          works muted yes/no, files (MP4, poster, source)
TIME      BPM, bars, beat sheet (cue ids at bar:beat)
LOOK      palette in hex (3 colors + 1 accent), type roles (family, weight, size at delivery),
          margins, one formal idea
OBJECTS   real assets used, with paths; facts file
MOTION    curves by role, durations, springs, what never moves
SHOTS     one line per shot: what is understood, lead element, transition in
SOUND     music source and licence, effects plan, voice, loudness target
BANNED    the defaults this film must not use (grows after each render)
QA        what will be checked and how
```

## Adjectives become numbers

| Word | Becomes |
|---|---|
| Premium | material with numbers: a satin surface with 2% grain, a 0.55 opacity contact shadow, one key light |
| Modern | one push of 30 frames on one ease, a display face at 9% of frame height, -2% tracking |
| Clean | 12 columns, 96 px margins, the accent on one word per shot |
| Dynamic | cuts on the beat, a layout change every 4 beats, one hero move per shot |
| Playful | springs with damping ratio 0.45-0.6, poses exaggerated 10-30% |
| Cinematic | 35 mm framing, key light upper left, rim light behind, 6% vignette |

If a word in the brief has no number yet, it is still a default.

## Closed content deck

- Exact on-screen text, in order, in one file. No extra slogans.
- A facts file is the only source of numbers, names and claims. "40 min to 2 min" never becomes "20x faster".
- Demo data matches the product's landing page, so the film and the site agree.
- Brand and partner names appear with their real logos. Fetch them from an official-logo catalogue such as svgl, simple-icons or gilbarbara/logos, strip fixed width and height so they scale, and log the source and licence; never redraw or approximate a mark. Check trademark terms for the use.
- When the live product and its documentation disagree, the live UI wins; log the differences in the project folder.
- Before rendering any captured or mocked UI, scrub it: real names, avatars, emails, workspace slugs, staging URLs, tokens, and the browser's timezone and language if they reveal the developer's machine. Use branded dummy data instead.
- "In the style of X" means the grammar of a style, never its assets; the result must be original.

## Banned defaults for video

These are what generated films fall back to. The list starts here and grows: after the first render, name every default you see, add it to the film's `BANNED` line and fix it.

- A dark navy void with small elements floating mid-frame.
- Glow, bloom, neon, lens flares, orbs, floating particles, purple-blue or mesh gradients, glass cards.
- The "tasteful" costume: cream paper, a serif display with an italic word, `01/02` labels, mono caps labels, pill chips.
- Everything centered, everything fading in together, everything fading and sliding up the same way.
- Text that moves while it is being read, or keeps drifting after it lands.
- Corner labels, frame borders, HUD decoration, fake terminal numbers.
- Three cards in a row, KPI grids, a title over a dimmed screenshot.
- The logo docked in a corner for the whole film.
- Idle loops: breathing, floating, pulsing. Click rings on every click.
- Every scene entering the same way; the same `power2.out 0.5 s` on everything.
- A whoosh on every cut, a boom on every logo, synthesized beeps standing for "tech".

Each one is fine when the brand or the idea asks for it. Then write why in the spec.

## Gates

- **Ask before you build** when the story, the look or a claim is still open. Changing the story after the build means redoing the build.
- **Autonomous mode** ("just do it", "decide yourself"): make the calls, record them, and list them at the end with the options you did not take.
- A question, a hold or a loose idea from the user gets an answer or a proposal, not an edit.
