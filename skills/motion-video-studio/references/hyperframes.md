# HyperFrames

HyperFrames (heygen-com/hyperframes, Apache 2.0) writes a video as plain HTML: a root `index.html` mounts one sub-composition per scene, timing is declared with data attributes, and motion is a paused GSAP timeline that the renderer seeks frame by frame. It needs Node 22+ and FFmpeg; it manages Chrome itself. Install its agent skills from the repo when you use it, and follow their current version over this summary.

Skills: `npx skills add heygen-com/hyperframes --full-depth` installs an entry skill (`hyperframes`), domain skills (animation, audio, cli, core, creative, keyframes, registry, media-use) and workflow skills (captions, faceless explainer, product launch video, talking-head recut, slideshow, music to video, PR to video, Remotion to HyperFrames, Figma). Names change between releases, so list what installed. Load the entry first and only the domains the film needs. Installed skills run with the agent's permissions and the installer has flagged some of them for review: read them before use. Pin the HyperFrames version per project and upgrade only if `check` still passes. Prefer the official repo over third-party starter packs that pin old versions.

## Contract

- Every timed element has `class="clip"`, `data-start`, `data-duration` (seconds, local to its file) and an `id`. An element is visible over `[start, start + duration)`: an end state landing exactly on the end never renders, so land it just before.
- Video length is the root's `data-duration`; canvas is `data-width` × `data-height` at `data-fps` (default 30).
- One paused timeline per composition, registered after its tweens on `window.__timelines[<composition-id>]`. The id must match the host and the scene root, or the render waits and then outputs static frames.
- Use `fromTo`, never `from` (seeking back drifts). Never add a scene timeline into the root timeline. Two timelines never animate the same property.
- Never tween `display`, `visibility` or `autoAlpha` on a `.clip`; animate a child. No CSS transform on an element GSAP also transforms. Transforms on a `<span>` need `inline-block`.
- Finite repeats only: `repeat: Math.floor(duration / cycle) - 1`, never `-1`.
- Media: never call `play()`, `pause()` or seek on media. A `<video>` is `muted` or marked `data-has-audio="true"`; audio is a separate `<audio id=...>` (without an id it is dropped from the mix). Time the video or its wrapper, not both. Re-encode footage with a keyframe every second (`-g <fps>`) or seeking freezes. Clamp durations to the real media length from `ffprobe`.
- Fonts: only a small bundled list resolves by name; any other family needs `@font-face` pointing to `assets/fonts/*.woff2`. Use only the weights the font ships.
- Paths are `assets/...` without a leading slash; ids are unique across the assembled page; styles and scripts outside `<template>` are dropped; a full-bleed background needs `position: absolute; inset: 0`.
- Grades, grain and blur on footage go through its media treatment command (baked), not CSS filters.
- Keep it editable: one scene per sub-composition, timed elements written in HTML with stable ids, copy and colors as composition variables (`data-composition-variables`, bound with `data-var-text`, `data-var-src`, `var(--id)`). This is also how variants render from data.

## CLI worth knowing

`init`, `lint`, `check`, `snapshot`, `preview`, `render` (MP4, MOV ProRes 4444 with alpha, WebM with alpha, GIF, PNG sequence; `--resolution 4k`; `--batch rows.json` for variants), `capture <url>` (screenshots, copy, tokens and fonts from a website), `transcribe`, `tts`, `beats`, `audio` (loudness and checks), `diff a.mp4 b.mp4`. Render-time motion blur is opt-in on the root (`data-motion-blur="on"`).

## Editing through the CLI

- Prefer `timeline` edits to hand-editing HTML: `timeline ids` stamps a stable `#id` on every timed element; `timeline move|trim|split|set|duplicate|delete <ref> --plan --json` previews one edit and the same command without `--plan` applies it. Several edits go in a JSON plan run with `timeline apply plan.json --json`, which prints a receipt; keep it, and `timeline undo receipt.json` reverts that batch.
- `history begin --who <agent> --label "<plan>"` at the start of a turn, `history --since mine --who <agent>` to see what the person changed meanwhile, and `history undo --who <agent>` to roll back your own edits without losing theirs. Close the turn with `history end`.
- A speed ramp does not need split clips: a `rate` lane in `data-automation` on the `<video>` (`t` in clip seconds, `v` from 0.1 to 10).

## Its checker, mirrored in our review

`check` measures lines held too briefly to read, stretches over 3 s with no change, text below the size floor, an empty first frame, a silent film over 15 s, overflow and overlap, WCAG contrast at sampled points, and media outside the frame. Its warnings are questions, not rules: a deliberate exception gets a note. `snapshot --review` produces three sheets (scenes, seam strips across each cut, phone-width frames). Use them, then follow `review-and-delivery.md`.

Write intent as data: a `<name>.motion.json` next to the composition holds assertions that `check` runs on the seeked timeline, reported as errors: `appearsBy` (selector visible by a second), `before` (a settles before b), `staysInFrame` (box stays inside the canvas) and `keepsMoving` (no frozen stretch inside a scene). `keyframes --shot motion.png --selector '#id'` plots a path and nine samples of an element over time (`--angle` for 3D, `--ghost` for canvas). To match a reference film, `snapshot --at <t1,t2> --against ref.mp4` gives a side-by-side sheet at the same timestamps.

## Porting from Remotion

Its own port tool refuses components with React state and effects; those stay in Remotion. Add `* { box-sizing: border-box }` to the root style.
