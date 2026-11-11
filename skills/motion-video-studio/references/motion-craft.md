# Motion craft

The numbers below come from measured product films and from interface motion practice. They are starting values: tune them to the brand and the format, and write the final choice in the spec. Most failures they prevent are timing and composition, not missing effects.

## Purpose first

Every moving thing answers one question: what does the viewer learn or feel from this movement? Reveal, compare, transform, orient, mark a change, show cause and effect. "It looks cool" alone is decoration. Data being read does not move for style; a number that ticks from old to new on a real change is fine.

## Curves by role

| Role | Curve | Example |
|---|---|---|
| Arrival (entering, landing) | Strong ease-out with a long tail | `cubic-bezier(0.23, 1, 0.32, 1)`, `cubic-bezier(0.22, 1, 0.36, 1)`, `expo.out`, `power4.out` |
| Movement on screen, camera, color flood | Ease-in-out | `cubic-bezier(0.77, 0, 0.175, 1)`, `power2.inOut` |
| Leaving, zooming through | Accelerating ease-in | `power3.in` |
| Constant (rotation, progress, marquee) | Linear | |

- Never ease-in on an entrance: the slow start delays the moment the viewer watches most closely.
- The same `power2.out 0.5 s` on everything is a generated tell. Vary curves by role, not at random.
- `bounce.out` and `elastic.out` are banned by default; a mild back-out (`back.out(1.4-1.7)`) is fine when the brand is playful.

## Durations

| Move | Duration |
|---|---|
| Micro feedback (press, toggle, tick) | 100-160 ms |
| Product UI moves | 150-300 ms (5-9 frames at 30 fps) |
| Text and hero entrances | 300-600 ms |
| Shared-element moves and camera settles | 400-900 ms |
| Fast moves with motion blur | 0.3-0.6 s |
| A single entrance | at most about 800 ms |

- Exits are 40-50% shorter than entrances (about 0.18 s against 0.3 s), simultaneous and simpler. Do not reverse-stagger an exit.
- Overlap: the next element starts when the previous one is 30-50% done.
- A landed title is dead still. Motion moves on to the next element or to the camera.
- Motion time is short; hold time is generous. They are separate budgets.

## Springs

- Pick springs by damping ratio: 1.0 no overshoot, 0.7-0.85 premium, 0.4-0.6 playful, under 0.3 cartoon.
- Good starting points: element move stiffness 150, damping 20, mass 1; camera stiffness 120, damping 30, mass 1.2 (held, not thrown).
- Bounce only position and scale, never opacity or color, and only after momentum.
- For a frame-pure renderer, use the closed-form step response. When a target changes several times, sum one step per change: `value(t) = start + Σ change_i × step(t − t_i)`. Any frame renders in any order, with no velocity pops.
- Decompose 2D motion into independent X and Y springs.

## Choreography

Before coding a scene, write its timeline table: element, role, start, duration, motion, relationship. Then write what does not move, and why.

- **Roles:** lead (moves first, farthest, stays longest), support (follows, shorter, smaller), decoration (fades in place or nothing), static. More than one lead is a hierarchy problem motion cannot fix.
- **Relationships:** together (same moment), sequence (only for cause and effect, the second starting just before the first ends), overlap (stagger), carry (animate the parent, children ride).
- Secondary motion syncs to the moment that matters: sparks and lines land in the last 20% of the lead's move, the most important one first, others about 40 ms behind.
- One entrance per container: never animate a parent's entrance and stagger its children too.
- One hero move per shot; secondary moves travel 50-70% as far and start 100-200 ms later. Ambient background motion stays under about 5% of the hero's travel, a slow sine on global progress.
- Separate container motion from text motion: the box starts expanding, the new label appears once there is room, the old label leaves before the next transition. This prevents the overlapping type that makes generated UI films look unfinished.
- Animate different edges separately for indicators: the leading edge moves first, the trailing edge follows on a slightly different spring, the shape stretches and settles.

## Stagger

- Letters about 1 frame apart; words 60-120 ms; list items 40-80 ms; hero text 100-150 ms. Total stagger at most 500 ms.
- Uniform stagger reads as a metronome. Vary by importance, or let delays shrink along the group.
- Order follows reading direction and importance, not DOM order.

## Text on screen

- **Read time:** a line holds 0.5 s plus 0.3 s per word; the last line at least 2 s; a 1-2 word chapter line 0.4 s. If readings do not fit, lengthen the shot or cut a reading.
- **Size floor:** 28 px at 1080 (2.6% of the short side) for anything held. Social video headlines at least 84 px and supporting text at least 44 px on a 1080-wide canvas, with margins of about 80 px at the sides and 100 px top and bottom. In vertical, type about 1.35x the landscape size.
- **Lines:** at most 6 words per line (about 10 for an explainer), 4-9% of frame height; hero words may fill 60-90% of the width.
- **Punchlines** between scenes: nothing else on screen but the words (and the brand mark); at most 6 words and 2 lines; one word or group per beat. Each word blurs in from about 16 px, rises about 36 px and lands in 0.3 s on a strong ease-out; exit is a quick blur (0.18 s, up to 12 px, lift 16 px). Size 120-160 px at 1080p, weight 600, line height 1.08. Every word keeps its slot (animate opacity, do not unmount), so a centered line never re-centers while it builds.
- Text never sits under a cursor, chip or texture, never crosses other text in a move, and never re-centers while building. Loading states keep their width.
- Large display text: tracking -0.02 to -0.04em, line height about 1.05.
- Avoid a plain opacity fade as the only entrance for type: pair it with displacement, a clip mask, a blur or a scale pop, or cut straight in.
- A caption, cursor label or callout chip finishes its entrance at least 0.4 s (12 frames at 30 fps) before the click or state change it describes, so it is read before the eye moves to the result.
- Vary the entrance within a film: per-word blur (6 px to 0 in 0.13 s, 0.067 s apart), grey to ink per word, a whole-line blur, per-letter for names, a slot-machine word roll.

## Rhythm

- Something new every 2-4 s; shots average 1.8-3 s; montage cuts 0.13-0.8 s; a product demo may hold 7-10 s while something happens in it.
- An information card shows its information within about 2.5 s and then holds. A static card dies after about 8 s; past 15 s it needs a staged reveal.
- A hold of 0.3-0.75 s before a payoff works as a dramatic comma.
- With a beat grid, something happens on every beat, but only the lead moves. A bar where nothing happens reads slow: give it beat-synced life or cut it. "Something every beat" is pacing, not permission for everything to move.
- Any single treatment goes stale after about 6 s.
- Cuts at equal intervals read as a metronome. Mix bursts of 0.4-0.8 s with holds of 1.8-3 s. A 75th-percentile shot length at least 1.6 times the 25th is a starting check, not a law.

## Beat grid

- Frames per beat = fps × 60 / BPM. Compute each beat from its index and round once; never accumulate rounded beats (at 128 BPM and 30 fps that drifts 2 frames every 32 beats).
- Write cues as `at(bar, beat, fraction)` in one cues file; scenes never contain literal frame numbers. Generate a beat-sheet table from it and keep it current.
- Cut on the beat; change the layout on the bar. A move that lands on a hit starts 40-190 ms early; a reaction follows 0-45 ms after; the hit itself is an instant set, because easing kills a hit.

## Transitions

The exit decides the entry: same axis, same direction, matched speed through mirrored curves (`power4.in` out, `power4.out` in), cut mid-motion on both sides.

- Give the film one dominant direction (forward = content moves left) and reserve the others for meaning: up for a conclusion, forward in depth for going deeper, a scale burst for leaving a world. Never ping-pong without a cause.
- Carriers (a cursor, a container, a mark) hand across cuts.
- Use 3-5 kinds of transition per film; hard cuts at most a third of the seams; worlds never crossfade.

Transitions with a cause, with starting values:

| Transition | Values |
|---|---|
| Zoom through a button | 0.6 s track with blur, then scale 8% to 250% in 0.35 s ease-in |
| Object becomes the world | 0.65 s ease-in-out grow; radius shrinks; surroundings blur about 15 px |
| Shared-element move (magic move) | spring stiffness 150 / damping 20; images and marks travel, words blur-swap; text never flies across text; traveler and destination share a line-height ratio so the move only scales |
| Color flood | about 0.4 s `power2.inOut`; overscale the flood so edges never show |
| Whip | 0.13-0.3 s smear, lands blurred, sharpens in 0.13 s |
| Iris from the click | `clip-path: circle()` in 0.15 s |
| Dip cut | darken about 40% for 3 frames before a hard cut |
| Blur swap on one stage | out 0.1-0.2 s with 8-10 px blur, in 0.13-0.18 s |
| Clip wipe | `clip-path: inset(0 100% 0 0)` to `inset(0 0 0 0)` |
| Camera on one world canvas | all scenes on one big canvas; heavy spring; zoom in log space |
| Hard cut on the beat | match background and accent across the cut |
| Ordered-dither reveal | a 4x4 Bayer threshold matrix swept in one direction as a mask, progress 0 to 1; a lo-fi hardware look, only when the brand is retro |

A small blur (2-10 px) hides a crossfade seam. Never enter from `scale(0)`: start at 0.9-0.97 with opacity 0.

## Animating product UI

Starting values for interface moves inside a film: a modal arrives from scale 0.96, a dropdown 0.97, a tooltip 0.98; small elements travel 4-12 px; swaps and slides carry a 2-3 px blur; a playful badge pop can use `cubic-bezier(0.34, 1.36, 0.64, 1)`.

- A label that changes and keeps letters ("Copy code" to "Copied", "Save" to "Saved"): diff the strings, keep the shared prefix and suffix still, and cross-blur only the differing middle (about 180 ms, 2 px) in one grid cell while the width eases over about 240 ms.
- A number that changes ("1,290" to "1,295"): only the changed digits move, with distance and blur set in em so they scale with the type, staggered about 40 ms. Unchanged digits stay still.
- A disclosure panel can open by animating `grid-template-rows` from 0fr to 1fr, and a ring chart can morph by interpolating its segment angles. Use both only when the real product does it.

## Fast motion and blur

- Motion blur on fast moves: 6-12 px on text, 15-20 px full frame, horizontal-only for horizontal moves.
- Render-time blur reads best: render at 4x the frame rate and average 4 sub-frames per output frame (see `engines.md`).

## Cursor and interaction

- An OS-style arrow glides on a slight arc and arrives exactly on the cue. It starts up to 0.46 s earlier (duration = min(0.46, 0.82 × gap)), easing `cubic-bezier(0.42, 0, 0.12, 1)`, arc bulge min(70 px, 9% of the distance).
- A click squashes to 0.8 over 0.16 s, holds at 0.86 while pressed, then the target reacts on that frame, with its sound on the same frame.
- Size it for video: about 3.5x a desktop arrow, 4-7% of the frame.
- Take target positions from the DOM, not by eye: mark targets with `data-target`, read `getBoundingClientRect()` on the rendered components and print the boxes on a debug still. Cursor keyframes use those numbers.
- Pass the cursor through its waypoints with a Catmull-Rom spline (the tangent at each point is half the slope between its neighbours), forcing zero velocity at waypoints where it should rest, so it lingers without overshoot. The same path can drive a look-at vector (-1 to 1) that turns a spotlight, tooltip or 3D card toward the pointer.
- Click text fields on their far side so typed text is never covered. The product's own cursor, if it automates something, looks different from the user's.

## Captions inside a motion film

- Groups of 2-3 words for high energy, 3-5 for conversation, 4-6 for calm. Break at sentence ends, at pauses of 150 ms or more, or at the word limit. One group visible at a time.
- A group opens at or just before its first word and closes at or after its last; never at exactly 0 s (start 0.1-0.3 s).
- Fit the text to a width (landscape about 1600 px, portrait about 900 px, base 78 px, minimum 42 px); center it in a full-width box instead of `left: 50%` plus a translate.
- On footage, choose the blend by the brightness behind the text: dark (under 60 of 255) `screen`, mid `overlay`, bright opaque text; subtitles over a bright area get a 30-40% scrim sized to the text, never a full-width bar.
- A caption group belongs to one visual section and ends on its boundary; bleeding even 0.2 s into the next shot looks amateur, so test every section change. Over a stacked layout, captions sit on the seam; in a full-screen section they drop so they do not cover the visual.
- Captions are an overlay, never a reserved band you push the composition up for.

## Vertical 9:16 at 1080x1920

- No platform publishes a safe zone for organic posts (only for ads), and community figures disagree. The interface covers roughly the top 130-290 px, the bottom 480-670 px and the right 120-190 px. Conservative box for words, faces and product: x 162-918, y 288-1248. Less strict: x 108-972, y 288-1440. Keep captions at or above y 1248 on Reels and Shorts; below that only texture. Check the real app interface over a test frame.
- One subject, stacked, centered; type about 1.35x the landscape size; padding 24-36 px.
- Shots 1-2 s, a new beat every 2-4 s, the payoff before the swipe.
- Landscape is recomposed, never squeezed: the vertical version may stack components that sit side by side in 16:9.

Other formats, as starting values (share of frame height from the top): 16:9 action 7-74%, subtitles 79-92%; 1:1 action 7-70%, subtitles 75-90%; 4:5 action 7-68%, subtitles 72-88%. Subtitle groups of about 7 words (38 characters) in 16:9 and 5 words (24-26 characters) in 1:1 and 4:5.

## Compression facts

- Full-screen linear gradients on dark backgrounds band under H.264: use a radial or a solid.
- An accent at 5% opacity disappears after compression; use 15-25% for atmosphere, full strength for a focal element.

## What not to animate

Idle loops on things that persist (pulse, shimmer, glow orbs), camera bobbing or drift that follows nothing, scroll-reveal on every section, hover-like lifts, things that would be instant in the real product (show the result), decorative re-animation of data, `scale(0)` pop-ins. Avoid strobing, hard bright flashes and full-frame parallax: they cause discomfort, and platforms flag photosensitive content.

## Edit notes from the user

- "Too fast" on a zoom or pan: slow it to 0.7x, nothing else.
- "Speed it up": shorten every beat equally.
- "The titles move": land them, then freeze.
- "It feels like slides": enter the next scene through an object already on screen.
