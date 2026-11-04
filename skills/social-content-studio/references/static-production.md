# Static production and adaptation

## Resolve the real format

Before the HTML, record platform + piece type + publishing route. Distinguish logical canvas, exported pixels, aspect ratio and preview crop. A 1536x2048 PNG is 3:4 even at high resolution. It does not fit without cropping in a publisher limited to 4:5.

When a validated project profile exists, use it. For new destinations, confirm current specifications in official documentation and, if accessible, the real publisher's preview. A table in a skill does not prove current compatibility.

As composition starting points, subject to that confirmation: vertical feed 1080x1350 (4:5); vertical story/status 1080x1920 (9:16). LinkedIn may require a PDF document or images depending on the request and chosen route. Do not claim that all channels share size, UI or limits.

Export at 1x or 2x according to the contract/publisher. If exactly 1080x1350 is needed, 2160x2700 does not meet that contract even though it keeps the ratio. To convert 3:4 to 4:5, recompose the content. Do not squash or crop blindly.

## Implement

Use editable HTML/CSS as the base route if the project or user did not choose another tool. Respect Canva/Figma or another editor when requested. In an existing project, reuse the renderer and controls before adding dependencies.

- One identifiable file or root per slide; fixed canvas, `box-sizing:border-box`
- Local or embedded fonts with real weights; resolve resources relative to the file
- Main composition in grid/flex; absolute for inner layers/backgrounds, with shared coordinates in diagrams
- Avoid mixing preview and export styles. The simulator frame does not belong in the PNG
- Identify critical content for bounds checks; wait for fonts and images to actually load
- Capture the measured root in the browser, slide by slide, with the contract's viewport/scale. Do not deduce size with regex or from the first slide
- On Windows use `pathToFileURL()` or the system URI. Git Bash's `file:///c/...` is not the same as `file:///C:/...`

Recipe for an available automatable browser: open HTML -> wait for `document.fonts.ready` and image decoding -> verify resources/network -> measure root and bounds -> exact capture -> check PNG -> visual review. Take the concrete API from the tool at hand. Do not invent a Chrome command or assume Playwright is installed.

Keep render evidence: resource errors, computed dimensions, warnings, files and hashes. Screenshots of error pages can have correct dimensions. Only opening them rules them out safely.

## Stories/statuses

Recompose vertically: less text per screen, a large object and a visible CTA. Use a safe zone verified for the channel. If sharing across channels, meet the intersection. Backgrounds can bleed.

Leave room for a native sticker without drawing it as if it were already interactive. For WhatsApp, prepare a version that works with a manual reply. Omit the carousel bar if the platform already provides navigation or it does not apply.

## Export and delivery

Keep sources and finals in separate project folders. Unambiguous numbering; a manifest with order, ratio, expected output and auxiliaries. A contact sheet is identified as a sample and is not mixed into the publishable order.

For a multipage PDF, produce it from the approved images/HTML according to the pipeline and review pages, order and fidelity. For JPEG, check the decoded format, dimensions and compression with a suitable tool. The included auditor covers PNG only.

Write a network-specific caption and alt text where applicable. Link the real destination. Do not promise a comment or file that does not exist yet.
