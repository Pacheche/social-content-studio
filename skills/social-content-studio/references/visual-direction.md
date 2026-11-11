# Visual direction that explains

## Before laying out

Write per slide: "The reader understands ___ by seeing ___." Fill the second blank with observable content: rows of a budget, a comparison, an illustrative conversation, a photo with action, an annotated document. If only "icon + texture" appears, it is still undecided how the idea gets explained.

Choose a visual family suited to the brand and topic. Break references down into criteria (scale, hierarchy, material, composition, light, rhythm), without copying someone else's content or identity.

If the direction is already approved, continue it. If references are missing, formulate a direction with reasons and produce a cover + a hard slide to verify internally before the batch. Do not impose three proposals or new approvals if the user already asked to produce.

## Grammars that can alternate

| Narrative need | Useful composition | Content that makes it work |
| --- | --- | --- |
| Show an operation | Document or interface as protagonist, with annotation | Legible fields, one case and a coherent result |
| Compare | Two aligned states or a short matrix | Same units/base, relevant differences |
| Explain cause/process | Diagram with nodes and connections | Identifiable inputs, actions and outputs |
| Evidence a data point | Contextual figure or suitable chart | Source, period, unit and honest scale |
| Show an experience | Photo/illustration with a scene | Subject, action and context tied to the copy |
| Fix an idea | Typographic/editorial composition | Specific sentence and reading rhythm |
| Invite action | Campaign closing | Real benefit, clear action and destination |

Alternate grammars between slides when the story calls for it. Do not merge all resources into one board or demand a mathematical A/B pattern. A series keeps identity through tokens, voice and treatment, with variety in composition and content.

## Space, typography and detail

- Text and graphic are one compositional unit: normal flow with an explicit gap. Do not pin them to opposite ends of a canvas
- Judge the gap between visible content, not between CSS boxes. Expand useful information when there is room. A taller card with tiny rows does not improve legibility
- Hierarchy by scale, weight, contrast, position and alignment. Do not highlight every word or set everything in capitals
- Check the effective size on mobile: 30 px on a 1080 source shows as 10 px on a 360 sample. Adjust to the real reading, not to meet a theoretical minimum
- Starting reference, not a quota: at 1080 wide, titles of 64-100 px, body of 34-44 px and examples of 30-36 px usually work. Font name, length and content may call for another scale
- Reduce redundancy, reorganize or split before shrinking the font. Do not hide overflow to cover errors
- Optically align logo/glyphs and check real transparency, even in SVG
- If a fictional example can be mistaken for a real case, interface or data point, include an explicit label such as "Illustrative example". Lower contrast or quotation marks do not replace that clarification. Keep it readable and do not dim all the information
- Textures, cutouts, lighting and layers give materiality to the object. Vary their function, position and scale. Avoid the rectangular patch with unintended edges
- Continuity lines between slides can guide. Each image must work on its own. The profile mosaic depends on order/crop and never justifies cutting essential information

Two tells of "generated" survive a good layout, so use them as diagnostics, not quotas. A smooth gradient with no grain reads unfinished: a last-layer SVG `feTurbulence` noise as a data URI at about 5% opacity with `mix-blend-mode: overlay` needs no extra file. Everything aligned to one column reads as a template: deliberate editorial asymmetry, consistent across a series, reads as a decision.

Measure contrast against the worst real point, not the nominal background. An accent that passes on the dark base can fail in the corner where a gradient or glow lightens it. Compute the WCAG ratio at the lightest zone once and record the minimum text size for that color in the brand tokens. After applying any technique that depends on a minimum (anchor size, ratio, text width), measure the result against the minimum; "looks bigger than before" is not evidence.

Optional brand-system devices: a second, semantic accent used only for tension or what is missing (one element per slide at most), and a monospace family reserved for data (figures, timestamps, field names) so a mock interface reads as software.

No quotas of hexagons, hero numbers, photos, gradients, depth or occupied area. Do not ban resources just because one execution went wrong.

## Data and diagrams

Choose the chart from the question and the available data. A negative year-over-year change is not a series: use the contextual percentage or two comparable values, without inventing a trajectory. Do not flip the direction for aesthetics.

For connections, share coordinates with the nodes (e.g., SVG viewBox or anchors computed from real boxes). Verify each origin/destination, direction and semantic relationship. A common hub can contradict a message of custom solutions.

In charts, check scale, units, sign, order, period, labels and source. A lone figure does not need a one-bar chart. Fictional data must have correct arithmetic relationships and a label.

## Assets and tools

Keep official logos. Fetch real brand marks from an official-logo catalogue such as svgl, simple-icons or gilbarbara/logos instead of redrawing or approximating them, then check the mark on the final background and its transparency. For product/UI/cases, use authorized evidence or declared examples. Image generation serves scenes and metaphors. Long text, figures and logos are composed afterward when they need fidelity. Check anatomy, artifacts, context and light coherence.

Choose one main visual guide. Ask for a second critique only for a concrete problem. From frontend, adopt hierarchy and composition, not its framework, favorite fonts, hover or default web layout. The brand prevails over general aesthetic recommendations.

To generate or improve an image, separate invariants (identity, product, proportion and composition that must be kept) from allowed changes (light, background, framing or sharpness). Specify a free zone for the copy. Compose the official logo, figures and exact text afterward in the editor. Verify binary dimensions, since asking for "4K" in a prompt does not guarantee them. An aesthetic retouch does not turn a generated scene into documentary evidence.

If a library offers orbs, glows, metal or effects, first decide which state or mechanism they explain. Read [choosing tools](choosing-tools.md) before bringing it in: the finish supports the message and must survive the output format.
