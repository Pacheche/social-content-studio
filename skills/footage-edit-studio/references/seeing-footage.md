# Seeing and hearing the footage

The agent edits what it can measure and look at. Build that evidence first, keep it next to the project, and reuse it.

When shooting for an SDR delivery, request SDR or Normal capture mode to avoid an extra HDR conversion.

## Probe every file

```bash
ffprobe -v error -show_streams -show_format -of json clip.mp4
```

Check and record:

- **Variable frame rate:** `r_frame_rate` differs from `avg_frame_rate`, or packet timestamps jump (phone footage, screen recordings). VFR breaks stream-copy cuts and sync: convert to constant frame rate before editing (`ffmpeg-recipes.md`).
- **HDR or log:** transfer `smpte2084` (PQ) or `arib-std-b67` (HLG), BT.2020 primaries, or a flat, low-contrast, low-saturation look typical of S-Log, C-Log or V-Log. HDR needs tone mapping for SDR platforms; log needs a conversion LUT before any grade.
- **Rotation and aspect:** a rotation tag, a non-square sample aspect ratio.
- **Audio:** sample rate (keep 48 kHz through the chain; mixing 44.1 and 48 kHz shifts sync), channels, which track holds the dialogue.
- **Sync across devices:** separate camera and recorder audio drift on long takes (over about 10 minutes): measure the offset by cross-correlating the two audio tracks, then correct drift by resampling.
- **Burned-in subtitles** already in the footage: crop or avoid that band before adding new captions.

## Transcribe

- Word-level timestamps, from a local model when the footage is private: whisper.cpp, faster-whisper, WhisperX (forced alignment for tighter word times), Parakeet. On Apple Silicon, mlx-whisper runs much faster than the CPU builds. Cloud ASR only with the user's yes.
- Names, brands and technical terms are where ASR errs most. Pass them as a prompt or hotword list and check them by eye in the captions.
- Set the language explicitly. English-only models translate other languages; auto-detection fails on short or mixed clips.
- Avoid loop hallucinations: turn off conditioning on previous text (faster-whisper `condition_on_previous_text=False`, whisper.cpp `-mc 0`), use voice activity detection, and drop words invented in trailing silence.
- Transcribe each original source once and cache it by a hash of the audio plus the model and options. A new container or a picture change with identical audio does not need a new transcript; a change of voice, model or settings does.
- Keep two views: the literal word list with times, and a compact view by sentence for reading.

### Swallowed retakes

When a speaker stumbles and immediately says the phrase again, Whisper often writes the words once and stretches one word's timestamp across the pause and the second take (measured up to 2.4 s in English and 6 s in Chinese). Silence detection misses most of these because breath and mouth noise stay loud. Flag:

- any single word longer than 1.2 s;
- any word with 0.15 s or more of internal silence;
- any gap of 0.2 s or more that holds a short burst of voice.

Re-transcribe just those spots with about 1.2 s of context on each side, to expose false starts ("we're-"), fragments and two- or three-word stutters.

## Look at the picture

- **Contact sheets with burned timecodes** (`ffmpeg-recipes.md`). For a long interview, a frame every few seconds; for b-roll candidates, 2 frames per second, 8 per row, because sparse sheets miss the moment the camera gets shoved into a bag at 6.5 s of an 11 s clip.
- **Adaptive sampling** is cheaper: frames at shot starts, mid-shot representatives and flash candidates, capped at about 3-80 per clip. Label each frame with its time and why it was picked.
- Describe what each shot shows in one line and keep that table. Do not edit a clip you have not looked at.
- Single frames at exact times for decisions (`-ss T -frames:v 1`), side-by-side comparisons for color matching.

### Lighting and grade decisions

Measure the subject separately from the background; use these as inspection triggers, then compare representative frames. Luma ratios use linear light; Lab uses signed a/b coordinates.

| Measurement | Decision trigger |
|---|---|
| Bright/dark subject-half luma | Below 1.35: frontal; above 2.5: side light |
| Top/bottom luma | Below 0.85: light from below; above 1.35: overhead |
| Shadow 10-90% transition / subject width | At most 0.16: hard; at least 0.32: soft |
| L* second percentile | Above 12: lifted blacks |
| L* standard deviation / 100 | Below 0.16: low contrast; above 0.28: high |
| Near-neutral pixels, chroma below 20 | Shadow b* below -5 and highlight b* above 8: teal-orange split |

## Shots, beats, speech

- **Hard cuts:** FFmpeg `scdet` (a one-frame spike detector that fast pans do not fool): threshold 10 finds nearly all cuts with few false ones; 12 is stricter.
- **Camera motion:** classify shots as static, pan or moving from low-resolution frame differences; moving shots make poor b-roll entry points.
- **Beats** in music: onset envelope, tempo by autocorrelation in 60-200 BPM, and only beats confirmed by a real onset within about 70 ms. Treat low-confidence grids as absent.
- **Speech versus music** sections, and acoustic events (laughter, applause) from a sound classifier, as highlight hints.
- **Faces and saliency** at about 1 frame per second, for reframing and to keep captions off faces.

## Inspect an ambiguous boundary

Build one timeline card for the local window: evenly spaced thumbnails, a 16 kHz mono RMS envelope, word/phrase timestamps, and below-gate silence spans. Align every layer to the same source-time axis. Extract the visual and audio layers, then annotate the measured boundaries:

```bash
ffmpeg -ss 10 -i in.mp4 -t 4 -vf "fps=2,scale=320:-2,tile=8x1" -frames:v 1 strip.png
ffmpeg -ss 10 -i in.mp4 -t 4 -vn -ac 1 -ar 16000 -c:a pcm_s16le window.wav
ffmpeg -i window.wav -filter_complex "showwavespic=s=2560x240:split_channels=0" -frames:v 1 envelope.png
ffmpeg -i strip.png -i envelope.png -filter_complex "vstack=inputs=2" -frames:v 1 timeline.png
```

The waveform is the visual guide; calculate windowed RMS from the PCM for gate decisions. Add the window start to local timestamps.
