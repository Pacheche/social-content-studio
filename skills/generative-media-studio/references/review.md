# Reviewing generated media

A model's output is a draft until someone looked at it. Review every asset at full size, then in place (the post, the film, the phone screen).

## Images

- Look at 100% and 200%: hands and fingers, teeth and eyes, ears and jewelry, text letter by letter, logos (never generated: composite the real one), reflections and shadows that disagree with the light, objects merging, repeated patterns that break, a checkerboard from fake grain.
- Identity: the same person, product or mascot across the series (face shape, colors, proportions, labels).
- Edges: a hard rectangle of a different white or black than the page; halos around cutouts.
- Slop tells: plastic skin, waxy airbrushing, HDR halos, everything glossy, light from several directions, perfect symmetry, purple gradients and glow. If `unslop-anything` is installed, run its visual-design check.
- The asset says something true about the product and fits the brief; a pretty picture that says nothing goes back.

## Video

- Run `video_qa.py` from `motion-video-studio` or `footage-edit-studio` on assembled clips (specs, loudness, black and frozen stretches, sheets).
- Step through each clip: morphing, identity drift between shots, hands, on-screen text, physics, flicker, the first and last frames (trim them), watermarks.
- Lip-sync: consonants that close the lips (p, b, m) land on closed lips; audio and video stay in sync to the end.
- Check the frame size and duration you asked for; models ignore requested sizes sometimes.

## Audio

- Listen, and measure: loudness and true peak (`ebur128`), clicks at the start and end, clipped words, breaths cut mid-way, robotic artifacts, wrong pronunciation of names and places, the accent the user asked for.
- Voice clones: compare with the reference by ear; do not ship a clone that sounds like someone else.
- Music: no vocals unless asked, the right length, a clean ending on a bar, no recognizable melody from an existing song.

## Before delivery

- The ledger has every asset with its model, route, cost, licence and consent id.
- Labels are planned for each platform.
- Anything that could not be checked (no speakers, no GPU, an unreadable file) is written down as not checked.
