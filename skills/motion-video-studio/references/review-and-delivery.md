# Review and delivery

The render is the evidence. Review the decoded frames and the measured audio of the file you will deliver, not the code and not the preview.

## Stage the review

1. **Storyboard pass.** A few frames per scene: does the sequence tell a coherent story?
2. **Timing pass.** Frames just before, during and after every important transition: overlapping text, abrupt moves, disappearing elements, jumps.
3. **Phone pass.** Frames scaled to about 360 px wide, the size people actually watch at: what still reads?
4. **Brand and fact pass.** Logo, fonts, colors, screenshots and every claim against the approved sources.
5. **Full file pass.** The encoded file: duration, aspect, fps, audio sync, loudness, first and last frame.

## Machine checks

Run `python3 <skill folder>/scripts/video_qa.py film.mp4 --spec spec.json --sheets out/qa` (on Windows `py`; it needs FFmpeg and ffprobe on the PATH). It reports:

- duration, size, fps, codecs, pixel format and color tags against the spec;
- integrated loudness, loudness range and true peak against the targets;
- black or near-empty first frame, black stretches, frozen stretches over 3 s (dead stretches), silences inside the film;
- and it writes a contact sheet, seam strips around detected cuts and a phone-size sheet into the sheets folder.

Exit 0 means every check passed, 1 means findings, 2 means the file could not be read. A passing run does not approve the story, the motion or the design; it only removes the mechanical failures. If FFmpeg is missing, say which checks did not run.

## Look at the frames

- **Contact sheet** for the global shape: does each shot read alone, does the subject have size and separation from the background? Regular intervals miss transitions, so also use:
- **Seam strips**: frames from -0.2 s to +0.2 s across every cut. A broken transition hides between contact-sheet frames.
- **Handoff sheets**: 8 frames every 0.1 s around each shared-element move. Keep windows apart or frame selection dedupes them.
- **Full-size crops** of text, hands, contacts, edges and logos.
- **Slow motion**: step key moves frame by frame, or play at 2-5x slower, for crossfades, abrupt stops, wrong origins and properties out of sync.

```bash
# Contact sheet: 1 frame per second, tiles of 480 px
ffmpeg -i film.mp4 -vf "fps=1,scale=480:-2,tile=6x5" -frames:v 1 -update 1 sheet.jpg
# Frames around a cut at 12.40 s
ffmpeg -ss 12.2 -i film.mp4 -t 0.4 -vf "scale=480:-2,tile=12x1" -frames:v 1 -update 1 seam.jpg
# Frame-difference spikes (single-frame pops): look for values 3x their neighbors
ffmpeg -i film.mp4 -vf "select='gt(scene,0)',metadata=print:file=scenes.txt" -an -f null -
```

## Review method

- Describe each beat frame in one sentence, as a stranger naming every object. An object that needs explaining is a P0.
- Read the frames in order: do they tell a causal story? Compare them with the shots in the spec.
- Cover the words: do the pictures alone carry the idea? Cover the pictures: do the words alone make sense?
- List every default or tell you see and add it to the film's `BANNED` line.
- A busy film: remove a third of the motion.

Write findings as:

```text
t=4.2s · headline · second line re-centers while building -> keep word slots, animate opacity · keep the blur entrance
```

Ranks: **P0** breaks reading, truth or the contract; **P1** weakens the film; **P2** is polish. Fix P0 and the worthwhile P1: text first, then timing, then detail. Re-render and re-check only what changed. Run a second pass only if a P0 is still open.

Do not score the film out of 10. A score finds nothing to fix and invites polishing what already passed. When a second opinion helps, give a fresh reviewer (another model or a person) only the storyboard and the three sheets, and ask for ranked findings in the same format. At least one finding should raise the impact, not only polish.

If three rounds do not fix the same defect, diagnose the cause or report the blocker. Do not loop, and do not approve a film because the attempts ran out.

## REVIEW.md

Close every round with `REVIEW.md` in the film folder: the creative calls, the storylines not built, what was measured, what was looked at and what was not checked ("sound measured, not heard"), the weakest shot, and the warnings kept on purpose with their reason. The next turn reads it first. Keep a production log as well: inputs, rounds, time and cost, so one workflow can be compared with another.

## Render the finals

| Output | Settings |
|---|---|
| Social and web MP4 | H.264 High, `yuv420p`, CRF 18-20 (or a bitrate cap if the platform needs one), BT.709 tags, `-movflags +faststart`, AAC 48 kHz at 256-320 kb/s |
| Muted landing loop | as above, no audio track, last frame equal to first |
| Web alternative | VP9 WebM |
| Overlay for an editor | ProRes 4444 with alpha (`.mov`), or WebM VP9 with `yuva420p` for browsers |
| Poster | a JPEG of the headline frame, never frame 0 if frame 0 is empty |
| Loop check | a sheet of the last 8 and first 8 frames played twice |

After encoding: `ffprobe` duration equals the composition's duration, frame 0's background decodes to the brand color within ±2, the last frame matches the first for loops, and the audio is measured again on the final file.

Keep every version in `out/<film>/v1`, `v2`; send files with two lines on what changed; report durations, sizes and the checks that ran. Delete heavy masters and intermediates once finals are verified.

## Platform specs

MP4, H.264, AAC, 30 fps (or 60 when the motion needs it), 1080x1920 for vertical, works in TikTok, Instagram Reels and YouTube Shorts. Limits change often and sources disagree; check the platform's current help page before relying on a maximum duration, size or bitrate. At the time of writing YouTube Shorts accepts up to 3 minutes. Feed formats: 1080x1350 (4:5) and 1080x1080 (1:1); landscape 1920x1080.

## Campaign variants

One approved story can serve many placements. Build a matrix instead of separate films, for example 3 hooks × 3 formats × 2 CTAs = 18 exports:

- hooks: open on the problem, on the result, or on a surprising feature;
- formats: 9:16, 1:1, 16:9, each with its own layout rules from the same scene data (recomposed, never cropped);
- CTAs: the ones the user approved.

Keep copy, assets and timings in data; the engine decides how they appear. Validate the inputs before any expensive render: every asset present, fonts load, each CTA fits its component, every claim approved. Cache what does not change (logos, fonts, audio, backgrounds) and re-render only what changed. Store a manifest with the source assets, campaign data, template version and render settings for each export, so a revision never ships with outdated assets. Get one reference film genuinely good before adding formats and hooks: automating a mediocre film only makes more mediocre films.

## Before handing over

- The final files open, play with sound, and match the spec.
- Copy, captions and the post text are delivered with the video.
- Credits and licences are in `CREDITS.md`.
- "Ready for review" is not "approved to publish". Publishing or scheduling needs the user's explicit yes.
