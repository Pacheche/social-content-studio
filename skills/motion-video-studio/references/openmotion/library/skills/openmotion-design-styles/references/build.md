# Building a style film

## Canvas and timing

- 1920x1080 by default (1080x1920 when the user asks for vertical; re-flow the grid, do not scale it).
- Choose a tempo (110–130 BPM works for most cards) and land every entrance, press, stamp and cut on a
  beat or half-beat. Write the beat length once (`const BEAT = 60 / BPM`) and time everything from it.
- Reading time: a line needs about 0.5 s + 0.3 s per word on screen. Bring secondary text in within
  the first 1–1.5 beats of its scene, and add about 0.6 s to a scene for every extra line.
  `npx hyperframes check` reports `line_unread` when this is missed.
- Type floor: everything meant to be read, rule plates included, is at least 30 px at 1080p.
- One GSAP timeline per composition, paused; each scene gets its own label. No `Math.random()` without
  a seed: every frame must be a pure function of time so renders repeat.

## From card to composition

1. Copy the card palette into CSS variables (`--paper`, `--ink`, ...). Paint only with those and the
   plan's `brandColors`. List every painted hex in `plan.json → colors` so the checker can see it.
2. Paste the `@font-face` rules from `fonts.css` into the composition's `<style>`; map `display`, `text`, `cjk` and `mono` to four CSS variables.
3. Turn each of the five rules into a layout constraint before animating:
   a grid (Swiss, New Wave, Bento), an axis (Constructivism -30°, Art Deco vertical mirror),
   an outline and hard-shadow system (Memphis, Pop Art, Neo-Brutalism), a material
   (Risograph multiply plus grain, Mid-Century paper shadows, Ink Wash density).
4. Animate with the card's `motion` lines. Prefer physical moves (drop, squash, press, slide by whole
   grid units, draw on, stamp) over opacity fades. Opacity alone is never a style move.
5. When teaching the style, show a small rule plate in each scene that demonstrates a rule:
   number plus a 2–5 word label (for example "04 · Asymmetry"), set in the card's `mono` or `text` face.
6. Size text inside a colour block to the block, not to the frame: keep at least one grid column
   (or 48 px) of padding between the longest word and the block edge.
7. Respect the card's `avoid` list; it is the quickest way to stop a film reading as generic.

## Render tiers

- `css`: HTML, CSS, inline SVG, GSAP.
- `canvas`: add one `<canvas>` layer drawn from the timeline time (glyph grids, tapered curves,
  triangles, ink blooms). Keep text in HTML above it so it stays crisp and editable.
- `webgl`: approximate with Canvas or CSS (dot fields, gradients with one hard highlight, soft round
  shapes) and tell the user it is an approximation, not the real material.

## Brand beats

- Opening: OpenMotion wordmark (`assets/brand/openmotion-logo.svg`) small in a corner, or rebuilt in the
  style (a Bauhaus wordmark made of primitives is fine; recolouring the mark's shape is not).
- End: "Made with OpenMotion" for at least 1.5 s. The user's own logo stays unmodified.

## Hand-off

Keep `plan.json`, `fonts.css`, `assets/fonts/` and `index.html` together in the project. Text and
colours stay editable: the headline strings in the HTML must match `plan.json`.
