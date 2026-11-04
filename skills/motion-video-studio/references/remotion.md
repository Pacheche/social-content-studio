# Remotion

Use when the film benefits from React components, typed props, data, captions or many formats from one composition. Remotion's official agent skills (`npx skills add remotion-dev/skills`) hold the full API; load only the ones the task needs (create, markup, studio, render, captions, multimedia, docs). The rules below are the ones agents break most.

## Setup

- New project: `npx create-video@latest --yes --blank --no-tailwind <dir>`. In a non-empty folder, scaffold into a subfolder; never delete `.env` or `.git`.
- Add packages with `npx remotion add <pkg>`. Every `remotion` and `@remotion/*` package must be the exact same version (`npx remotion versions`). `npx remotion upgrade` also updates project-local skills.
- Use Remotion's bundled browser and FFmpeg (`npx remotion ffmpeg`, `npx remotion ffprobe`). Do not set a custom browser unless asked.
- Check the licence for the user's organization before commercial use.
- Preserve edits the user made outside the conversation; if something changed unexpectedly, ask before overwriting.

## Time

- All motion comes from `useCurrentFrame()`. CSS animations, transitions and Tailwind `animate-*` / `transition-*` classes do not render correctly.
- Get `fps` from `useVideoConfig()` for every seconds-to-frames conversion (`from={2 * fps}`). Never hardcode a frame rate.
- Keep `useCurrentFrame()` in the smallest component that needs it.
- Inside a `<Sequence>`, the frame is local: it starts at 0 when the sequence starts.
- Keep timing in a cues file (`at(bar, beat)` converted with fps); scenes never hold literal frame numbers.

## interpolate, easing, spring

- `interpolate()` does not clamp by default. Pass `extrapolateLeft: 'clamp', extrapolateRight: 'clamp'` on anything that must stop.
- Easing goes in the `easing` option: `Easing.bezier(0.23, 1, 0.32, 1)`, or `Easing.spring({damping: 200})` for a smooth push without bounce. With N input points, pass N-1 easings.
- For scale, use `output: 'perceptual-scale'` so large scales do not look slower.
- `spring()` settles by physics; its length depends on fps. Measure it with `getDurationInFrames({fps})` when a scene must fit.
- Prefer the individual CSS properties `scale`, `translate`, `rotate` over one `transform` string.

## Sequences, timing props, transitions

- Most components accept `from`, `trimBefore`, `durationInFrames`, `playbackRate`, `loop`, applied in that order. `playbackRate` makes an item occupy `durationInFrames / playbackRate` frames.
- Put a shot's video, captions and overlays under one timing boundary. Trimming only the `<Video>` leaves its captions out of sync.
- `<Series>` for back-to-back scenes; `TransitionSeries` when adjacent scenes must overlap through a transition (`fade()`, `slide()`, `wipe()`, `flip()`, `clockWipe()`, or a custom presentation receiving direction and progress).
- Transitions overlap their neighbors: total = sum of scenes − sum of transitions (60 + 60 − 15 = 105). Set the composition duration from that, or compute it in `calculateMetadata`. `TransitionSeries.Overlay` sits on a cut without shortening the timeline.
- Give every scene a `name`.

## Compositions and variants

- `<Composition id component durationInFrames fps width height defaultProps schema calculateMetadata />`. `<Still>` for thumbnails and posters. Group formats in `<Folder name="Social">`.
- Parametrize with a Zod `z.object()` schema; `defaultProps` must be JSON-serializable; use `type`, not `interface`; `zColor()` from `@remotion/zod-types` gives a color picker.
- `calculateMetadata` (async) sets duration, size, fps, props, output name and codec, for example the duration from a voice-over file.
- One composition per output format (9:16, 1:1, 4:5, 16:9), all reusing the same scene components with their own layout rules. This is how a campaign matrix (hooks × formats × CTAs) renders from data.

## Assets, fonts, text

- Local assets live in `public/` and load with `staticFile()`. Remote URLs need CORS.
- `<Video>` and `<Audio>` from `@remotion/media`; images with `<Img>` or `<CanvasImage>` (never a raw `<img>`); GIF, APNG, animated WebP with `<AnimatedImage>`; Lottie with `@remotion/lottie`.
- Anything async (a JSON file, an SRT, a Lottie) loads inside `delayRender()` / `continueRender()` and calls `cancelRender()` on error.
- Google Fonts: `@remotion/google-fonts/<Name>` with `loadFont('normal', {weights, subsets})` at module level. Local fonts: `@remotion/fonts` `loadFont({family, url: staticFile(...), weight})`, one call per weight.
- Fit text with `@remotion/layout-utils` (`measureText`, `fitText`, capped with `Math.min`). DOM measurements must be divided by `useCurrentScale()`.
- Text highlights (underline, circle, strike) with `@remotion/rough-notation`, progress driven by `interpolate`.
- Trim media non-destructively with `trimBefore` and `durationInFrames`. If you must cut with FFmpeg, re-encode, or the first frames freeze.

## Audio

- `<Audio>` takes `volume` (a number or a function of frame), `muted`, `trimBefore`, `durationInFrames`, `from`, `playbackRate`, `loop`. `toneFrequency` (pitch) works only in server-side render, not in Studio.
- Voice-over: one file per scene, durations read in `calculateMetadata` to set the length. Ask which TTS provider to use; keys come from the environment.
- Audio-reactive visuals: `useWindowedAudioData()` and `visualizeAudio()` from `@remotion/media-utils`.
- Remotion hosts some sample sound effects at `remotion.media`; their licence is not stated, so do not use them commercially without checking.

## Captions

- Captions are an array of `Caption` from `@remotion/captions`: `{text, startMs, endMs, timestampMs, confidence}`. The leading space belongs inside each word's `text` (`" world"`).
- Import `.srt` with `parseSrt()`. Local transcription with `@remotion/whisper-webgpu` needs a compatible GPU; `small.en` for English, the multilingual `small` with an explicit `language` for anything else (it does not auto-detect, and English-only models translate).
- Transcribe each original source file once; keep timestamps relative to that source. Map them to output time when trimming.
- For the look of captions, see `motion-craft.md`.

## 3D

- Wrap 3D in `<ThreeCanvas width height>` from `@remotion/three` with width and height from `useVideoConfig()`, and add lights.
- Nothing animates by itself: no `useFrame`, no shader clocks. Drive everything from `useCurrentFrame()`.
- A `<Sequence>` inside `ThreeCanvas` uses `layout="none"`. Render WebGL with `--gl=angle`.

## Effects

`@remotion/effects` (color correction, LUT, blur, vignette, glow, chromatic aberration, halftone, noise and more) applies through an `effects` prop on media and shapes; plain HTML needs `<HtmlInCanvas>`, which depends on Remotion's bundled browser and is fragile in preview. `@remotion/motion-blur` gives sample-based motion blur. Use effects only when they serve the idea; most belong on the banned list.

## Preview and render

- Do not render until the user asks for the video or the agreed production plan includes it. Default to a Studio preview: `npx remotion studio`, open the printed URL and check that the composition loads.
- Stills for review: `npx remotion render <id> out/frames --frames=0,30,90 --image-format=png`, or `npx remotion still`.
- Transparent overlay for editors: `--codec=prores --prores-profile=4444 --image-format=png --pixel-format=yuva444p10le`. For browsers: `--codec=vp9 --pixel-format=yuva420p`.
- Do not switch on Lambda, cloud rendering or purchases by reflex.
