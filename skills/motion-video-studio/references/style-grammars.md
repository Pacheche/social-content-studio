# Style grammars

A named style is a grammar: a short set of rules written as numbers, so any scene built under it looks related. "In the style of X" means the grammar, never X's assets. Pick one grammar per film, copy it into the spec's `LOOK`, `MOTION` and `BANNED` lines, and change a value only with a reason. Some of these overlap the banned defaults in `story-and-spec.md`; a grammar is chosen on purpose, never by default. All values are starting points; the brand's tokens win.

## Motion brief shape

When you brief a film or a sub-agent, use five lines: Style (a grammar below), Output (size, fps, duration, formats), Suggested technical route (engine and why), Creative seed (the one idea and the real fact), Signature features (the two or three moves that make it recognizable).

## Grammars

| Grammar | Palette | Type | Motion | Banned |
|---|---|---|---|---|
| Swiss motion graphics | off-white `#F4F2EE`, ink `#111111`, one saturated accent (red `#E5392B`) | one grotesque, two weights, flush left, strict grid of 12 columns | hard cuts and slides on the grid, `power4.out` 0.4 s, objects snap to grid lines, no overlap of type | gradients, shadows, glow, bounce, centered layouts |
| Dark tech keynote | near-black `#0B0C0F`, one cool accent (`#4C8DFF`), grey text `#9AA1AD` | a geometric sans, large headline then small mono for specs | slow push-ins (one eased move per shot), one reveal per beat, long holds on a single claim | particle fields, mesh gradients, neon, floating cards |
| Data storytelling | light or dark base, one highlight color, everything else grey | tabular figures, labels on the marks, no legend | build in reading order (frame, axis, reference, data, annotation); counters run 1.2-1.6 s then hold | 3D charts, decorative motion on data, invented series |
| Whiteboard explainer | warm white `#FBFAF7`, black ink, two marker colors | a hand-drawn or rounded face, 60-90 px labels | strokes draw on at the pace of the voice (path length by time), erase to transition | stock icons, drop shadows, smooth corporate gradients |
| Isometric infographic | a 4-color flat palette plus a neutral base, no outlines | short labels in one sans | parts assemble along the isometric axes in sequence, camera rotates one step per scene | perspective distortion, realistic textures |
| Variety captions (vertical) | one background, 2-3 text colors | 3-4 faces mixed on purpose, one per emotional role | one word or short group at a time, scale and weight follow the emphasis of the voice, new position each group (this grammar overrides the one-position-per-shot default) | one font and one size throughout, full-sentence blocks |

## Review against a rubric

Before the final render, write 5-8 pass/fail lines for the chosen grammar ("accent appears on one element per shot", "no two moves share a curve"). A second pass by a different model or person grades the stills against that list and returns ranked findings. It is a guide for the fix list, not permission to publish.
