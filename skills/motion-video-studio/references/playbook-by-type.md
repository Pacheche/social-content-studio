# Playbook by video type

Distilled from about 700 published prompts for code-made videos and their results, plus the product-film and HyperFrames workflows. The pattern behind the strong ones is the same everywhere: format fixed first, one formal idea, a beat grid, a closed content deck, a palette in hex, a banned list, deterministic rendering, and a look at the frames before the final render. The weak ones are adjectives ("make it the best of the best") with no duration, no format and no facts.

## Pick the tool

| Video type | Default tool | Why | Watch out |
|---|---|---|---|
| Product launch, ad or promo with real assets | Remotion, or HyperFrames when the brand already lives in HTML/CSS | Real screenshots, brand tokens, typed props, format variants | Licence for Remotion; forbid invented stats |
| UI-morph film, app promo | One HTML file driven by `seek(t)` (DOM + SVG + canvas), closed-form springs, headless Chrome + FFmpeg | Pure-function frames, easy beat grid, sub-frame motion blur | Browser quirks (see `engines.md`) |
| Kinetic typography, lyric video | Canvas or SVG with GSAP stagger; Remotion when captions dominate | Glyph-level control | Closed copy deck, a role per word |
| Explainer, 2D concept | SVG + GSAP timeline, or canvas | Crisp diagrams, scrubbable | Simulate the real process instead of drawing a picture of it |
| Explainer, physical object | three.js with an exploded view and labels | Part-by-part reveal | Drive everything from time; no `useFrame` clocks |
| Abstract or music-driven motion | Canvas 2D, SVG + GSAP or GLSL; beat analysis with librosa | Particles, morphs, shader fields | Every sound maps to a visible movement |
| 3D scene, logo or product hero | three.js; Blender pre-render for hero quality | PBR, camera choreography | One eased camera move per shot; heavy renders |
| Data story | Canvas or SVG; Remotion for series with props | Direct control | Real data only; numbers end on true values |
| Math or algorithm explainer | Manim (Python) | Equations and geometric proofs | Rarely needed for social |
| Animation already made in After Effects | Lottie, played frame-accurately inside the engine | Reuses designer files | Seek it from time, never autoplay |
| Overlay for another editor | Remotion or HyperFrames with alpha (ProRes 4444 or WebM VP9) | Transparent layer | Check the last frame and edges on the real background |
| Captions on a talking head | `footage-edit-studio`, with this skill only for the animated caption layer | | |

Pick one engine per piece and write the reason in the spec. Do not install two engines for one film.

Other useful pieces, only when the film needs them: Motion Canvas (code-first animation with its own editor), anime.js or Motion (timeline and UI choreography inside a page), three-gpu-pathtracer (photoreal lighting for stills or slow shots), postprocessing (bloom, depth of field, grading in three.js; use with restraint), three.quarks (particle VFX), Jolt Physics (rigid and soft bodies, baked to keyframes before rendering), Tweakpane (live controls while designing, removed before render), ComfyUI (node-based image or video generation; breaks determinism, so treat outputs as fixed assets), Natron (node compositing of rendered layers).

## Types

### Product launch, ad, promo

- Input: the product's site, real screenshots or recordings, logo files, brand tokens, approved claims, 2-4 features.
- Structure: hook, tension, reveal, proof (one verb per scene), payoff on the drop, claim, end card with CTA (see `story-and-spec.md`).
- Show the workspace, isolate the action at 1.6-2x (text at least 26 px after the push), return the result to its place. No camera move over a frozen screenshot pretending to be an action.
- 15-35 s for social; 9:16, 1:1 and 16:9 versions recomposed, not cropped.
- Launch film: say what it is within 3 s ("[Product] is a [category] for [audience]" or "[Product] turns [input] into [output]"), then 3-5 capability beats with one concrete verb each, then the product name with one direct action (URL, repo or install command).
- Release update film: product name and version by 3 s, one beat per change shown as a real UI moment, then an end card.

### Native conversation ad (iMessage, Notes, chat UI)

- 8-14 bubbles, 0.6-1.2 s between sends. Typing animates at 12-15 characters per second with about 30% random jitter, from a seeded generator.
- The typing indicator is silent; sounds only on send and on receive, from CC0 or licensed recordings.
- In FFmpeg, mix with `amix=inputs=2:normalize=0` followed by `alimiter` so overlapping sounds do not pump the level.

### UI-morph film

- One concept line: "one shape keeps morphing into every UI state".
- 8-12 UI states, one accent, one canvas color, a camera that zooms so each state fills the frame (the cursor scales with it).
- Beat grid at about 120 BPM with something happening on every beat; content enters after its container starts morphing and leaves before the next morph, so text never overlaps.
- The accent element travels between states instead of fading.
- Banned by default: crossfades, blur-ins, particles, glows, 3D flips, bouncy easing, holds over 1 s.
- 14-30 s; loops when last frame equals first.

### Explainer

- A curiosity hook, one counter-intuitive point, a real analogy, real numbers with honest uncertainty, the audience level stated.
- Simulate the real process ("the random walk is an actual random walk") rather than drawing it.
- One strong formal idea per scene; three ideas at most for a social cut; captions taken from the source text.
- Ground first: a person and a question, then the device enters inside that world.
- 20-60 s for social, longer for YouTube with voice-over.

### Kinetic typography

- Exact text in exact order, understandable without audio.
- Named type roles (a voice for speech, a heavy face for load-bearing words, a mono for gauges) and hex colors.
- One metaphor for the whole film; a role per word (this word repels, that one flattens).
- 3-7 English words (4-12 CJK characters) per scene.

### 3D scene, logo, product hero

- Name the camera (one eased move per shot, never reversing), one key light, the materials, the post effects, and the timeline in seconds.
- Prefer procedural geometry or licensed models; generated models need cleanup.
- 20 s or less for a logo or ad.

### Data story

- One number at a time. Build a chart in reading order: frame, axis, reference, data, annotation on the mark itself. Highlight one series, grey the rest, no legend.
- Counters run 1.2-1.6 s then hold, with tabular figures, and end on the sourced value.
- Interpolate only sourced data; motion is not permission to invent a series.

### Music-driven or abstract

- State what is audible when, and map every sound to a visible movement.
- Beats from analysis of the real track, never typed in.

### Process, recipe, how-to

- Step by step with the measurements shown on screen; one step per beat or per scene.

### Repurposing

- Article to a 25 s explainer at 1080x1350, video to a 15 s vertical ad, one film to landscape and portrait: recompose per format with the same story and timings.

## Prompting another model or a sub-agent

When you hand a film to another agent, write the brief in blocks: `<inputs>` (assets, facts, what to ask for, defaults if skipped), `<direction>` (concept line, look, camera, banned list), `<structure>` (beat grid and scenes), `<build>` (determinism rules, render path), `<gotchas>` (known pitfalls), `<start>` (show the beat map and four stills before the full build).
