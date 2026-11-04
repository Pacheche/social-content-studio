# Seeing and hearing the footage

The agent edits what it can measure and look at. Build that evidence first, keep it next to the project, and reuse it.

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

- Word-level timestamps, from a local model when the footage is private: whisper.cpp, faster-whisper, WhisperX (forced alignment for tighter word times), Parakeet. Cloud ASR only with the user's yes.
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

## Shots, beats, speech

- **Hard cuts:** FFmpeg `scdet` (a one-frame spike detector, robust to fast pans): threshold 10 finds nearly all cuts with few false ones; 12 is stricter.
- **Camera motion:** classify shots as static, pan or moving from low-resolution frame differences; moving shots make poor b-roll entry points.
- **Beats** in music: onset envelope, tempo by autocorrelation in 60-200 BPM, and only beats confirmed by a real onset within about 70 ms. Treat low-confidence grids as absent.
- **Speech versus music** sections, and acoustic events (laughter, applause) from a sound classifier, as highlight hints.
- **Faces and saliency** at about 1 frame per second, for reframing and to keep captions off faces.
