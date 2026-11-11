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

Render traps: a PNG freshly written into a synced folder (OneDrive, Dropbox, Drive) can come out blank or tiny now and then, so render outside the synced folder or retry once when a file is suspiciously small. Never load a CDN font in an export, since a slow or failed request falls back silently to a system font: self-host the weights actually used (for Spanish, the `latin` and `latin-ext` subsets). Derive contact-sheet thumbnail height from the canvas's real aspect ratio, never a fixed number, or a 9:16 sheet comes out distorted.

Keep render evidence: resource errors, computed dimensions, warnings, files and hashes. Screenshots of error pages can have correct dimensions. Only opening them rules them out safely.

## Stories/statuses

Recompose vertically: less text per screen, a large object and a visible CTA. Use a safe zone verified for the channel. If sharing across channels, meet the intersection. Backgrounds can bleed.

A story is its own short piece of 2-4 screens with an angle the feed post lacks (a question, a preview instead of a summary). It points to the post and never repeats its lines; if it reinforces a post, publish it the day after, not the same day.

Stickers: when the piece is published where native stickers exist and someone will add them, leave room for the sticker and do not draw it as if it were already interactive. When the piece must work without a manual step, or on networks without the sticker (WhatsApp status, for example), draw the question or poll into the artwork and prepare a version that works with a manual reply. Omit the carousel bar and any "swipe" arrow: the app draws its own bar and people tap. Keep branding to the logo mark.

Composing in vertical is not the feed scaled:

- The safe zone is for text and the critical logo, not for the background: color, photo and pattern run edge to edge.
- Keep the CTA clear of the reply bar and keyboard area, about 300 px above the bottom edge of a 1080x1920 canvas.
- Type runs larger than the same brand's feed type (about 1.25x as a start). Cards and chips are narrower and taller, centered in the main reading column.
- Do not draw a phone frame inside a 9:16 canvas: the canvas is already the screen.
- When a story looks empty, ask what its visual anchor is before touching padding.

## Export and delivery

Keep sources and finals in separate project folders. Unambiguous numbering; a manifest with order, ratio, expected output and auxiliaries. A contact sheet is identified as a sample and is not mixed into the publishable order.

For a multipage PDF, produce it from the approved images/HTML according to the pipeline and review pages, order and fidelity. For JPEG, check the decoded format, dimensions and compression with a suitable tool. The included auditor covers PNG only.

Give the source tree and the delivery tree the same shape (`<Piece>/<Network>/...`), name finals for a non-technical reader ("Slide 1.png"), keep a plain `.txt` with paste-ready copy per network apart from notes, and use short, stable piece names without dates.

Write a network-specific caption and alt text where applicable. Link the real destination. Do not promise a comment or file that does not exist yet.
