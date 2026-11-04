# Other visual formats

Thumbnails, covers, memes, GIFs, stickers, LinkedIn documents, slides, and the spec table for every network. Specs were observed on 2026-11-04, mostly through third-party summaries; items marked "verify" disagree between sources. Keep platform specs in one project file (`specs.json` with a `verified_on` date per entry) and assert them in the export step instead of trusting memory.

The default production path is the same as for carousels: HTML/CSS at the exact size, rendered with Playwright to PNG, PDF or frames, then FFmpeg for anything animated. Canva and Gamma are optional when the user wants editable files in those tools.

## YouTube thumbnails and covers

- **Specs:** 1280x720 (16:9), at least 640 wide, under 2 MB, JPG or PNG in sRGB. Shorts are 9:16 (or 1:1) up to 3 minutes; a Shorts or Reels cover is 1080x1920, but the profile grid crops the center, so keep the subject inside the central 1080x1440. Podcast cover: square, 1400-3000 px, readable at about 55 px.
- **What works:** one idea; at most 3-4 words, which add to the title instead of repeating it; it must read at about 168x94 px (the mobile feed). A large face with a clear emotion, looking toward the text or object; strong contrast between subject and background; an outline around the cutout; 2-3 saturated colors; 5-8% margins; nothing important in the bottom right (the duration badge).
- **Testing:** YouTube's Test & Compare runs up to three thumbnails; make variants that differ in one thing, never change title and thumbnail together, and give it about a week.
- **Production:** cutouts with BiRefNet or rembg (or Canva's background removal); generated backgrounds only through `generative-media-studio`, never a generated real person; text set in HTML, not drawn by an image model.
- **QA:** view it at 168x94 and 100x56 and in grayscale; under 2 MB; spell-checked; next to three thumbnails of similar videos. A thumbnail the video does not pay off hurts retention.

## Memes, reaction images, GIFs, stickers

- **Static meme:** 1080x1080 or 1080x1350. A known template and one tight, specific punchline of about 12 words or fewer, timely. A brand meme owns a joke from its niche; no punching down, no film or TV stills or celebrity faces without rights.
- **Reaction GIF:** a 1-3 s seamless loop, 360-480 px wide, 12-15 fps, subject centered. Prefer a short looping MP4 or WebM where the platform takes it: 5-10 times smaller than GIF. Platforms convert or cap GIFs (some at about 8-15 MB): check.
- **GIF from video, two-pass palette:**

```bash
ffmpeg -i in.mp4 -vf "fps=12,scale=480:-1:flags=lanczos,palettegen=stats_mode=diff" pal.png
ffmpeg -i in.mp4 -i pal.png -lavfi "fps=12,scale=480:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" out.gif
```

  To shrink it, in this order: shorter, fewer fps, narrower, `max_colors=128`, then `gifsicle -O3 --lossy=80`. gifski often looks better; compare file size per clip.
- **Stickers:** WhatsApp takes WebP at 512x512, at most 100 KB static or 500 KB animated (PNG is rejected); a tray icon of 96x96. Telegram video stickers are WebM VP9 without audio, one side exactly 512, at most 3 s, 30 fps and 256 KB:

```bash
ffmpeg -i in.mp4 -vf "fps=15,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:-1:-1:color=0x00000000" -loop 0 -q:v 60 out.webp
ffmpeg -i in.mp4 -c:v libvpx-vp9 -an -b:v 0 -crf 40 -t 3 -r 30 -pix_fmt yuva420p -vf scale=512:-2 sticker.webm
```

  A pack has one consistent character, 8-30 stickers readable at about 150 px, with an 8-10 px white outline so they work on dark mode.
- **Publishing:** the Giphy upload API takes GIF or video up to 100 MB (a development key is rate-limited); Telegram's Bot API creates sticker sets. Google announced the end of the Tenor API: do not build on it.
- **QA:** assert the size caps in code; check the loop seam; look at stickers on dark and light backgrounds for halos.

## LinkedIn documents, slides, decks

- **LinkedIn document posts:** PDF (PPT, PPTX and DOC also accepted), at most 100 MB and 300 pages, every page the same size (the first page sets it). 1080x1350 or 1080x1080 read best on phones; 16:9 looks small. Embed fonts and keep it under about 10 MB. Set the document title. Caption up to 3,000 characters with the fold at about 200 characters.
- **What works:** 6-12 pages; a cover that is a hook of 8 words or fewer; one idea per page; body text at least 28-32 px at 1080 wide; a last page with the call to action.
- **Production:** render the HTML pages with Playwright `page.pdf({width: '1080px', height: '1350px', printBackground: true})`, or join PNGs with `img2pdf`. Check with `pdfinfo` and `pdffonts` (uniform size, embedded fonts) and look at each page at phone width.
- **Decks:**

| Tool | Output | When |
|---|---|---|
| HTML slides, reveal.js | HTML; PDF through print mode | Full control, animation, versionable |
| Marp | HTML, PDF, PPTX (as images), PNG | Markdown plus a CSS theme, one command |
| Slidev | Web app, PDF, PNG | Developer talks with code and live demos |
| pptxgenjs, python-pptx | Native editable PPTX | The client edits in PowerPoint, Keynote or Slides |
| Gamma (connector) | Web deck, export | A fast narrative deck; it has a recognizable look |
| Canva (connector) | PDF, PPTX, PNG, MP4 | The user's Canva brand kit and templates |
| Google Slides | Native, collaborative | Upload a PPTX to Drive for conversion |

- **Deck writing:** full-sentence assertion titles, one message per slide, about 30 words or fewer when presented (more for decks meant to be read), problem then insight then action, details in an appendix. Deliver a PDF plus the editable source.
- **QA:** a contact sheet of every slide; no overflow after font fallback; fonts installed where it renders; contrast at least 4.5:1; speaker notes and alt text. Watch for the generated-deck look (gradients, emoji icons, stock photos); `unslop-anything` catches it.

## Design connectors

| Connector | Can | Watch out |
|---|---|---|
| Canva | Generate and edit designs, resize (carousel to story), autofill brand templates in bulk, export PDF, PNG, JPG, PPTX, MP4, generate images, remove backgrounds | Brand kits, templates and resize may need a paid plan; less precise typography than HTML; jobs are asynchronous |
| Figma | Read design context, variables and screenshots; write native frames and components (beta) | Needs the user's authorization and the right seat |
| Gamma | Decks, documents, web pages and social posts from a prompt or outline; edits; exports; analytics | Credits by plan; coarse layout control |
| Google Drive and Slides | Upload a PPTX for conversion; share | No animation authoring |

Rule: brand-locked repeatable assets (carousels, thumbnails, covers, PDFs) go through HTML/CSS for full control and tests. Use Canva when the user needs editable files in their Canva account or template autofill at scale, Gamma for a fast narrative deck, native PPTX when the client edits in PowerPoint, Figma when the design team lives there.

## Spec table

Verify on the platform's help page before relying on a limit; several sources disagree.

| Platform and format | Size | Limits |
|---|---|---|
| Instagram feed | 1080x1350 (4:5) default, 1080x1080; 3:4 (1080x1440) reported, verify | Caption 2,200 characters (fold about 125); carousel up to 20 items, verify |
| Instagram Reels | 1080x1920 | Up to 3 minutes; keep text out of the top 14% and bottom 20% |
| Instagram Stories | 1080x1920 | 60 s per story; about 250 px safe zones top and bottom |
| TikTok | 1080x1920 | Up to 10 minutes in the app; photo carousels up to 35, verify |
| YouTube | 1920x1080 | Thumbnail 1280x720, under 2 MB |
| YouTube Shorts | 1080x1920 or 1:1 | Up to 3 minutes |
| LinkedIn image | 1200x627, 1080x1080, 1080x1350 | Post 3,000 characters |
| LinkedIn video | 16:9, 1:1, 4:5, 9:16 | About 10 minutes organic, verify |
| LinkedIn document | 1080x1350 or 1080x1080 | 300 pages, 100 MB |
| X image | 1600x900, 1080x1350 | 4 images; 5 MB |
| X video | 1920x1080, 1080x1920 | Length depends on the account tier |
| Facebook feed | 1080x1350, 1200x630 (link), 1080x1080 | |
| Facebook Reels | 1080x1920 | Length limit disputed, verify |
| Pinterest | 1000x1500 (2:3); 600x900 to 2000x3000 | Video 2:3 or 9:16 |
| Threads | 1080x1350, 1080x1920 | 500 characters |
| Bluesky | 1:1 or 4:5; 4 images | 300 characters; video about 3 minutes and 100 MB |
| WhatsApp Status | 1080x1920 | Video 30-90 s depending on region, verify; 24 hours |
| WhatsApp stickers | 512x512 WebP | 100 KB static, 500 KB animated |
| Telegram | | Message 4,096 characters, caption 1,024 |
