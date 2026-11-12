# Voice, music and loudness

Dialogue leads. Music and effects support it and never fight it. Every level below is a starting point you confirm with a meter on the final file.

## Dialogue

- Match takes to each other first: adjacent segments within 3 LU (boost a quiet take by at most about 12 dB; past that, the noise comes up with it).
- Cleanup chain, lightest that works: high-pass at 80 Hz; a gentle compressor (threshold about -18 dB, ratio 2, attack 5 ms, release 80 ms); for harder cases a de-esser and light denoise (FFmpeg `deesser`, `afftdn`), ratio 3-4, a limiter at -1 dBFS.
- A muffled mic: cut about 3 dB around 250-300 Hz, add about 3-4 dB around 3-3.5 kHz, a small high shelf near 10 kHz. Diagnose first: if the band above 3 kHz sits more than about 22 dB under the total, the mic is muffled.
- Voice isolation tools help on noisy dialogue only; never run them on music.
- Lay room tone (about -37 LUFS) under edited gaps so the background never drops to digital silence between words.
- When you replace dialogue with an enhanced version, place it against the original clip duration and keep the source sample rate, or sync drifts.

## Music

- Licensed music only, logged in `CREDITS.md`. The user's own track first.
- Build one music bed: crossfade tracks over 2.5-3 s; edit on bar lines.
- Levels that work for talking-head content: music at about -16 LUFS where it plays alone (over b-roll), and 12-14 dB lower (about -28 to -30 LUFS) under speech. Or set the bed about 12 LU under the dialogue and duck it 6 dB during speech.
- Ducking: an envelope (attack about 0.15 s, release about 0.4 s, bridging speech gaps under 0.35 s), or a sidechain compressor keyed by the voice:

```bash
[music][voice]sidechaincompress=threshold=0.05:ratio=4:attack=20:release=400:makeup=1[ducked]
```

- **Music swell into b-roll (J-cut):** start raising the music 0.9 s before the cut to b-roll, inside the speaker's trailing breath, over 1.2 s; bring it down over 1 s so it is back under as the next sentence starts. A reversed cymbal (0.8-1.5 s, about 10 dB under the music) peaking on the cut sells it.

## Sound effects

- On visual events only (a cut to a graphic, a pop for a number, a whoosh for a fast card), peaking on the visual frame, at least 2.5 s apart, 10-24 dB under the speech on their own stem, never ducked.
- Never more than two and a half competing streams: within 12 dB of the loudest stream, more than about two-and-a-half active streams for 1.5 s or more turns into noise. A third stream must sit well under as a bed.
- For designed effects, sync windows and where to find licensed recordings (Openverse, Mixkit), see `motion-video-studio`'s sound reference.

## Loudness

| Destination | Integrated | True peak |
|---|---|---|
| Social and web video | -14 LUFS | -1 dBTP (aim -1.5 before AAC encoding) |
| Podcast | -16 LUFS | -1 dBTP |
| Broadcast | -23 LUFS | -1 dBTP |

- Two-pass `loudnorm`: measure, then apply with the measured values (`ffmpeg-recipes.md`).
- Lossy AAC adds 0.3-1.5 dB of overshoot after normalization. Measure the true peak again on the encoded file; if it is over the limit, re-encode at a higher bitrate (256-320 kb/s) or lower the limiter ceiling (about -1.7 dBTP leaves room).
- Apply constant gain per take so a take keeps its natural dynamics; the overall loudness range spread between parts stays within about 3 LU.
- Do not normalize ambience-only clips (around -40 LUFS) up to speech level.

## Check

- `scripts/video_qa.py` on the export: integrated loudness, true peak, silences inside the film.
- Audio dropouts: very quiet stretches (under about -80 dBFS for 20 to 200 ms) surrounded by sound are dropped samples or bad cuts; longer gaps are pauses, checked as silences.
- Muted or dead tracks: cross-correlate a quick render's audio against the source; a correlation far below about 0.9 means a track is missing.
- Listen to every join, or re-transcribe around each one; say what you could not listen to.
