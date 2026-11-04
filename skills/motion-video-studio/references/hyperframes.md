# HyperFrames

HyperFrames (heygen-com/hyperframes, Apache 2.0) writes a video as plain HTML: a root `index.html` mounts one sub-composition per scene, timing is declared with data attributes, and motion is a paused GSAP timeline that the renderer seeks frame by frame. It needs Node 22+ and FFmpeg; it manages Chrome itself. Install its agent skills from the repo when you use it, and follow their current version over this summary.

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

## Its checker, mirrored in our review

`check` measures lines held too briefly to read, stretches over 3 s with no change, text below the size floor, an empty first frame, a silent film over 15 s, overflow and overlap, WCAG contrast at sampled points, and media outside the frame. Its warnings are questions, not rules: a deliberate exception gets a note. `snapshot --review` produces three sheets (scenes, seam strips across each cut, phone-width frames). Use them, then follow `review-and-delivery.md`.

## Porting from Remotion

Its own port tool refuses components with React state and effects; those stay in Remotion. Add `* { box-sizing: border-box }` to the root style.
