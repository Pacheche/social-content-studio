# Engines and determinism

All three paths work the same way underneath: a real browser opens the composition, the renderer asks for the state at time `t = frame / fps`, captures the frame, and FFmpeg encodes. The only thing that can break that is code that depends on something other than `t`.

## The determinism contract (every engine)

- Every visible property is computed from the requested time. Frame 600 can render without frames 0-599.
- Forbidden while rendering: CSS transitions and keyframes (including Tailwind `transition-*` and `animate-*`), `setTimeout`, `setInterval`, `requestAnimationFrame` as a clock, `Date.now()`, unseeded `Math.random()` (use a seeded generator such as mulberry32, one stable seed per element so moving one object never shakes the others), infinite repeats, physics integrated frame by frame, network fetches during render, shaders or WebGL running on their own clock.
- Anything with its own clock (a motion library, a spinner, a video element, a Lottie file, a shader) gets a frame-driven twin: drive it from `t`, or rebuild it.
- Measure layout once, before building the animation, never inside an update callback.
- Fonts and images are loaded and awaited before the first frame. A fallback font or a missing asset in a frame is a failure, not a draft.
- Pin every dependency version. A changed version can change pixels.

## Choosing the engine

- **Remotion** (React): typed props and Zod schemas, `calculateMetadata`, data-driven series, many formats from one component, a mature render API and Lambda. Licence: free for individuals and small teams (up to three people at the time of writing); larger teams need a paid licence. Check https://www.remotion.dev/license before commercial use. Rules in `remotion.md`.
- **HyperFrames** (HTML + GSAP, Apache 2.0): the brand already lives in HTML/CSS (for example the static pipeline of `social-content-studio`), website capture, transparent overlays, no React or `node_modules`, a built-in checker. It breaks quietly when its contract is broken. Rules in `hyperframes.md`.
- **Plain `seek(t)` renderer** (one HTML file, canvas, SVG or DOM): UI-morph films, kinetic type, abstract and generative pieces, anything where you want full control with no framework.
- **three.js**: 3D inside any of the above.
- **Static design that must animate**: a Figma frame or screenshot rebuilt as an exact HTML replica that acts out what it shows, captured deterministically with Playwright's fake clock and encoded with FFmpeg. The `design-to-motion` skill follows this method (MIT, Markdown only). For a website, animate only the visual sections and keep text as real HTML; for a showcase, export MP4 or GIF. It does not suit product interaction motion such as hover, menus or toasts.
- **cinetic** (an agent skill for short launch films, landing loops and logo stings with Remotion or HyperFrames, MIT): a large technique list plus a linter and audits. Its own numbers put a film at roughly 95 minutes and 600k tokens, about three times the same job without it, so use it as a technique list for one short film, not as a default. Its docs target macOS and Linux; on Windows use WSL.
- **Blender**: hero-quality 3D, pre-rendered as a clip.
- **Manim**: math and algorithm explainers.

## A plain seek(t) renderer

1. The page exposes `window.seek(t)` that draws the full state at time `t` and resolves when drawn, and `window.ready` that resolves after fonts and assets load.
2. A Node script with Playwright opens the page at the exact output size (`deviceScaleFactor: 1`), awaits `ready`, then for each frame calls `seek(frame / fps)` and captures a PNG (canvas `toDataURL` or a page screenshot).
3. Stream frames to FFmpeg instead of writing thousands of PNGs, unless you need them for debugging:

```bash
ffmpeg -f image2pipe -framerate 60 -i - -c:v libx264 -pix_fmt yuv420p -crf 18 -movflags +faststart out.mp4
```

4. Motion blur: render at 4x the output rate (240 fps for 60) and average groups of four:

```bash
ffmpeg -framerate 240 -i frames/%06d.png -vf "tmix=frames=4:weights='1 1 1 1',select='not(mod(n+1\,4))',setpts=N/(60*TB)" -r 60 -c:v libx264 -pix_fmt yuv420p -crf 18 out.mp4
```

Rendering at 240 fps takes about 10 minutes per 50 s on a laptop; run it in the background. For a cheaper social cut, render 60 fps directly with per-element blur on fast moves.

5. Some animators render detail at 120 fps and convert to 30 fps for smoother fast motion; the 4x sub-frame method is the controlled version of the same idea.

### Browser gotchas

- `backdrop-filter` combined with displacement filters misbehaves: clone the scene into a layer instead.
- A color flood needs overscale (the shape larger than the frame) and about 0.3 s, or its edges show.
- `visibility: visible` on a child leaks through a hidden parent.
- A simple static file server may not support range requests, so `<video>` cannot seek: load video as a blob URL or use the engine's media component.
- Dashed CSS borders crawl when a box resizes: draw dashes as SVG strokes at a fixed pitch.
- `will-change` on a camera-scaled layer blurs text.
- Heavy CSS (large blurs, `backdrop-filter`, many shadows) is the main render cost. Supply images near delivery size.

## HEVC footage in browser engines

Chrome often cannot preview H.265 outside Apple platforms, so a clip can show black or frozen while editing. Probe local footage with `ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 clip.mp4`; for `hevc`, make an H.264 proxy for preview (`ffmpeg -i in.mp4 -c:v libx264 -crf 18 -pix_fmt yuv420p proxy.mp4`) and keep the original for the final render if the engine decodes it.

## Color range trap

Many browser-to-FFmpeg pipelines produce limited-range BT.601 frames without tags. Treating them as full range lifts `#0a0a0a` to about `#171717`. Convert once and tag the output:

```bash
-vf "scale=in_range=tv:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709" -x264-params colorprim=bt709:transfer=bt709:colormatrix=bt709
```

Tag through `-x264-params` (or the encoder's equivalent): on FFmpeg 7.1 and later, output `-colorspace` flags can insert an automatic scale filter that corrupts untagged input.

Then decode frame 0 and check the background is within ±2 of the brand value. Fix the filter, never the brand tokens. Use hex for colors that animate; some interpolators cannot parse `color-mix()`.

## three.js

- Drive every rotation, position and camera from `t`. In React Three Fiber inside Remotion, `useFrame` is forbidden.
- Name the camera move (one eased move per shot, never reversing), one key light (and a rim light if needed), the materials (PBR, or toon with a 3-4 band ramp plus an edge outline), post effects (depth of field, bloom kept subtle).
- Many repeated objects: `InstancedMesh`.
- WebGL in headless Chrome may need ANGLE (`--gl=angle` in Remotion).

## Blender

- Worth it for product and object hero shots, logo extrusion, device mockups, abstract looping backgrounds, explainers needing real lighting and camera moves. Not worth it for text and chart reels, talking heads, or variants with changing copy.
- Safest integration: pre-render the Blender shot (PNG sequence, or ProRes 4444 for alpha) and place it as a layer in Remotion or HyperFrames, so copy and CTA stay parametrized. The alternative is exporting glTF and animating it in three.js from `t`.
- Blender MCP (`mcp-for-blender`) lets an agent build and edit scenes and look at the viewport, which is its best feature. Risks: it runs arbitrary Python with no sandbox and its local socket has no authentication. Save work first, enable its safe mode, keep telemetry off if the user prefers, and treat generated 3D models as dense meshes that need cleanup. Asset sources: Poly Haven is CC0; Sketchfab and others vary, so check each licence. Model generators upload content and cost money: ask first. `CLI-Anything` (HKUDS) wraps software that exposes code, an API or scripting (Blender, GIMP, Audacity, Inkscape) as an agent-usable CLI; try it on a throwaway project, only with a concrete need and after checking its licence. It does not make closed software scriptable.

## Lottie

Play a Lottie file frame-accurately from `t` (Remotion has `@remotion/lottie`; HyperFrames has an adapter). Never autoplay it.

## Generated imagery and video

Image or video models (directly, through ComfyUI, or through an aggregator API) are not deterministic: treat their outputs as fixed assets, generated once, approved, stored and credited. Show the cost before any paid run. Never use generated images to show a product capability that does not exist.
