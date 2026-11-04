# Brand profile and per-piece contract

## A new brand

Review assets and documentation before asking. The profile must distinguish confirmed, inferred and missing:

- Name, real offer, audience, context of use and commercial goal
- Full logo and official icon, light/dark variants, clear space and prohibited uses
- Palette with roles and restrictions on sublines; fonts with available files/weights and permissions
- Voice: language, region, person, formality, own vocabulary and good/bad examples
- Photography, illustration, materials and approved references, explaining what is taken from each
- Verified site/contacts/CTA for the piece, without inventing numbers, prices or promotions
- Network, post type, publishing route, sizes and verified restrictions
- Agreed review mode and what is authorized to produce
- Evidence bank (cases, figures with provenance, positions, reader vocabulary) per [voice and hooks](voice-and-hooks.md)

If logos are missing, use a clearly provisional proposal without fabricating a symbol. If colors or fonts are missing and the request includes designing identity, propose a direction as a proposal, not as an approved manual. If it only asks for a post, use the available references and state the assumptions.

The profile belongs to the project. Do not include a client's private contacts, logos or secrets in the shared skill.

## Editorial and visual contract

It can live in an existing file. For a new series, a JSON/Markdown file keeps:

- Identifier, brand, goal, reader, message and CTA with a real destination
- Platform, format and publisher (app, scheduler or API), check date and source
- Literal copy of each slide/scene and caption; copy status and pending items
- Per unit: role, idea, evidence/example, anchor, composition, material, scale and rhythm
- Agreed navigation/chrome; what stays and what changes between slides
- Assets and provenance, data sources with unit/period/base
- Logical canvas, exported pixels, file type and safe zones
- Acceptance criteria and list of expected outputs

When performance is evaluated: hypothesis, metric, period and variable to change. Use only the fields relevant to the assignment.

Do not fill fields out of bureaucracy. A one-sentence typographic post can use a very short contract. Data pieces require detail where things are fragile.

## Technical contract for the PNG auditor

Store it separately if the project's contract has a different schema. `files` is a closed list of final PNGs relative to the folder. Do not include a contact sheet. `canvas` and `export` are exact dimensions, not ratio names.

```json
{
  "version": 1,
  "canvas": {"width": 1080, "height": 1350},
  "export": {"width": 2160, "height": 2700},
  "files": ["Slide 1.png", "Slide 2.png"],
  "auxiliary_pngs": ["All slides (sample).png"]
}
```

Change the values to fit the piece. Never copy this example as authorization for two slides or as a universal standard. The auditor blocks incompatible ratios, duplicates, paths outside the folder, missing files, corrupt PNGs, different dimensions and undeclared extra PNGs. Its output always leaves the visual review pending.
