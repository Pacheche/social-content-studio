# Captions

Most people watch muted. Captions are part of the edit, timed from the final cut, readable on a phone, and never over a face.

## Text

- Clean written grammar: remove stutters and the fillers you cut; keep slang, swearing and the speaker's phrasing.
- Word timings from the transcript of the final edit (or mapped from the source with the edit list). Never time captions by hand.
- Check them against a fresh transcript of the exported file: no missing word and no drift over 0.5 s.

For Arabic, Persian and Urdu, use a shaping renderer with HarfBuzz and bidirectional text support, such as libass or Pillow with libraqm. Set paragraph direction and use directional marks where needed; check mixed-script output with a fluent reader.

Without ASR word times, decode mono audio at 8 kHz, measure short-window energy and place estimated word boundaries at cumulative-energy quantiles weighted by word length. Constrain them to the phrase interval and check against playback; silence cannot provide word alignment.

For libass at `PlayResY=288`, convert the chosen safe-area position to script units with `MarginV = bottom_inset_fraction * 288`; keep the package's platform clearances and face checks rather than imposing a second margin.

## Segmentation

| Style | Words or characters | Timing |
|---|---|---|
| Social short, high energy | 2-3 words per group, or one word at a time | one group visible at a time |
| Conversational | 3-5 words, up to about 16 characters per line in heavy display type | |
| Long-form, YouTube | one line of at most 42 characters (up to 50 to avoid stranding a last word) | |

- Break at a sentence end, a pause of 0.6 s or more, or about 3.2-4 s of duration. Minimum duration about 0.9-1 s; hold 0.25 s past the last word.
- Phrase-aware breaks: never split inside a word; never strand a number, a currency sign, a unit or final punctuation; keep articles, prepositions and conjunctions with the phrase they belong to (in English, Spanish, Portuguese, French, German, Italian); in Japanese, attach particles to the word before them and follow line-breaking rules (kinsoku).
- For 9:16, one or two lines; for 16:9, one line.

## Look

- Burn captions with ASS (libass), not SRT, when you need word highlight, pop animation or exact placement. ASS uses a script height of 288 units: for vertical, start at size 24 (about 8.3% of the height, 160 px on 1920) and step down to 13 (about 4.5%) before splitting a cue.
- A default social look: a heavy display face, white text, a 3-4 px dark outline, one highlight color for the active word that rarely appears in the footage (a saturated yellow works), a small pop on each word. Keep one style per channel; a creator's own past videos define it better than any preset.
- Word entrance: rise about 0.6 of a line height over 8 frames with a 2-frame stagger, or a 3-frame fade per word.
- Contrast: measure caption contrast against the frames behind it; under 3:1 add a dark halo or shadow, under 1.5:1 a box behind the text.
- Emoji crash or misrender in drawtext and libass with color emoji fonts: composite them as PNG images, or leave them out.
- On Windows, always pass an explicit `fontfile=` to drawtext (fontconfig lookups can hang) and write text to a file (`textfile=...:expansion=none`) so `%`, `:` and `;` cannot break the filter.

## Placement

- Keep captions inside the platform's safe area (see `delivery.md`): on TikTok the bottom 22% and right 14% are covered; on Reels the bottom 20% and right 12%; on Shorts the bottom 18% and right 12%. Treat a 15% bottom margin as a minimum, not a safe value; on Reels and Shorts, captions around 55-65% of the height or centered are safer.
- Check face boxes on sampled frames and move the captions if they overlap a face. A hook overlay goes where it covers the least face, between about 6% and 80% of the height, never on the caption band.
- Keep one caption position throughout a shot when possible; change it at a cut or when a new graphic requires it.
- Two stacked speakers: captions on the seam between them.
- Captions are the top layer: apply them last in the filter chain so no overlay covers them.

## Deliver

Burned-in captions for social, plus an `.srt` (and `.vtt` for the web) for platforms that accept caption files and for accessibility. First cue may start at 0 for files; burned captions start with the first word.

For an optional spring pop, use `scale = clamp(1 - exp(-6*p)*cos(2.5*pi*p), 0.05, 1.35)`, `p = min(1, t/0.18)`; settle at 1 after 180 ms and scale color and alpha together with bilinear sampling on a fixed canvas.
