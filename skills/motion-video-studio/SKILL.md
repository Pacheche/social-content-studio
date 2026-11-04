---
name: motion-video-studio
description: Use when the user wants a video made from code for social media or a website (reels, product launch films, ads, explainers, UI animations, kinetic typography, data stories, logo reveals, animated captions or overlays, 3D shots) with Remotion, HyperFrames, a seek(t) HTML/canvas renderer or three.js. Covers story, spec, motion craft, sound design, campaign variants (hooks, formats, CTAs), render and frame-by-frame review. Not for cutting existing footage (use footage-edit-studio) or static posts (use social-content-studio).
metadata:
  version: "2.1.0"
---

# Motion Video Studio

A code-made video is a programmable animation: every frame is computed from time, so copy, color, timing and format can change without regenerating anything. That is the advantage. Use it, and do not waste it on a film that looks like every other generated video.

Good motion is not effects. It is one idea, a clear order of things to understand, timing that leaves time to read, sound that lands on what moves, and a review of the real frames. You build all of it yourself: write the code, render, look, fix. Ask the user only for what the material cannot tell you.

## How to use this skill

Paths are relative to this skill's folder. Load references on demand.

| Step | Read |
|---|---|
| Story, spec, banned defaults, beat grid | `references/story-and-spec.md` |
| What works for each video type, and which tool | `references/playbook-by-type.md` |
| Easing, durations, choreography, text, transitions, cursor, captions, vertical | `references/motion-craft.md` |
| Determinism and the engine you picked | `references/engines.md`, plus `references/remotion.md` or `references/hyperframes.md` |
| Music, sound effects, voice, loudness | `references/sound.md` |
| Checks, review, render settings, platform specs, variants | `references/review-and-delivery.md` |

Writing copy, captions or a post to go with the video: if `social-content-studio` is installed, use its strategy and voice references. Cutting existing footage or long videos into clips: use `footage-edit-studio`. Generated images, clips, voice-over or music to use as layers: `generative-media-studio`. An animated GIF or sticker from a render: the GIF and sticker recipes in `social-content-studio`'s formats reference.

## Workflow

1. **Brief.** Get what the video must make someone understand or do, where it plays (feed with sound off, landing loop, launch with sound), length, formats, the real assets (product, screenshots, logo, fonts, brand tokens, music) and approved claims. Read the project first; ask only what changes the film. Ask at most four questions at a time, with concrete options and a recommendation first.
2. **Story.** One thing, one viewer doing one task, one real fact that travels from hook to payoff. For anything over about 15 seconds, write three storylines that are three different films (different device and form), recommend one, and let the user pick unless they said to decide alone.
3. **Spec.** Fill the spec header and turn every adjective into a number: duration to 0.01 s, size, fps, formats, loop, works muted, palette in hex, type roles, the beat grid, the shots and a `BANNED` list. Text on screen and numbers come only from a closed content deck and a facts file. If an asset or fact is missing, stop and ask; when running unattended, report it instead of faking it.
4. **Stills gate.** Before building the whole film, show the beat map and three or four stills: the first frame, one feature scene and the strongest moment. People answer pictures faster than questions. Skip the wait only when the user said "just do it"; then still render the stills and check them yourself.
5. **Build.** Pick the engine with `references/playbook-by-type.md` and follow `references/engines.md`. Every frame is a pure function of time. Timing lives in data (cues on the beat grid), never in literal frame numbers scattered through scenes.
6. **Sound.** Unless the film must be silent, give it a bed and effects on visible causes, derived from the cue list, mixed and measured (`references/sound.md`). Silent-first still applies: the film must read with the sound off.
7. **Check and review.** Run `scripts/video_qa.py` on the render, then look at the frames: contact sheet, seam strips around every cut, phone-size frames, full-size crops of text. Write findings as P0/P1/P2 with the exact change. Fix P0 and the worthwhile P1, re-render only what changed.
8. **Deliver.** Render the finals, verify them again, keep every version (`v1`, `v2`), and write `REVIEW.md`: the creative calls, what was measured, what was looked at, what was not checked, the weakest shot and the warnings kept on purpose.

## Rules that do not bend

- **Every frame is a function of time.** No CSS transitions or keyframes, no timers, no `Date.now()`, no unseeded random, no state carried between frames, no library running its own clock. If a library has its own clock, drive it from time or rebuild the effect.
- **Real product, real data.** Show what the product really does, with its real screens, logo and facts. Never redraw a logo, never invent a number, a customer or a quote. A missing screen becomes a labeled gap or a question, not a fake.
- **One idea per film, one lead per moment.** If two things compete, one waits or goes.
- **Time to read.** A line holds at least 0.5 s plus 0.3 s per word. Motion is short; holds are generous.
- **The brand wins over the defaults here.** Values in these references are starting points from a small set of films. A brand that is playful may bounce; one that is quiet may not. Write the choice and the reason in the spec.
- **Measure, never guess.** Positions from the DOM, beats from the audio, colors from decoded frames, loudness from a meter. Never say a sound fits or a frame is clean without having measured or looked.
- **Do not claim done without looking at the render.** A statement like "the animation looks great" means nothing until the frames were inspected.
- **Ask before anything outward.** Publishing, uploading, paid generation, cloud render, accounts and API keys need the user's yes for that action. Keys come from the environment, never from the chat.
- **Check licences.** Engine licences (Remotion's is free only for small teams), music, sound effects, fonts and footage. Log every source in `CREDITS.md`.

## The template test

Cover the logo. If this could be a competitor's launch video with the name swapped, it is not done: the story, the real screens and the one formal idea must belong to this product.
