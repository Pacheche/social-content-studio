# Podcasts, screen recordings and live streams

Specs observed on 2026-11-04 from third-party summaries; verify host and platform limits before relying on them.

## Podcasts

- **Master and delivery:** WAV at 44.1 or 48 kHz; deliver MP3 at 128 kb/s constant (mono speech 64-96 kb/s) or AAC. Loudness -16 LUFS stereo or -19 LUFS mono, true peak -1 dBTP (`loudnorm=I=-16:TP=-1:LRA=11`, two passes, see `ffmpeg-recipes.md`).
- **Feed:** title, description, enclosure, GUID, publication date, cover art 1400-3000 px. Add Podcasting 2.0 tags: `podcast:chapters` (JSON chapters) and `podcast:transcript` (SRT or VTT). Apple reads JSON chapters and generates its own unless you opt out. How Spotify reads chapters is disputed: also put timestamps in the description.
- **YouTube:** a podcast is a playlist; RSS submission is supported. Chapters come from description timestamps: start at 0:00, at least 3 chapters, each at least 10 s.
- **Video podcasts:** 1080p 16:9, H.264, 30 fps, AAC. In May 2026 Spotify announced it will adopt Apple's HLS video for podcasts, with host support coming later; until a host supports it, video often uploads directly to each platform.
- **What works:** a 15-30 s cold open with the strongest moment, a consistent structure, chapters, a transcript, 3-5 clips per episode cut at the quotable peak (`clips-from-long.md`). Show notes: a one-paragraph summary, timestamps, links, the guest's bio, the transcript link.
- **Pipeline:** transcribe with word times, propose chapters and clip candidates, cut, clean the audio (`audio-mix.md`), write the show notes, `chapters.json` and the SRT.
- **Audiograms:** 9:16, 1:1 or 16:9, 30-60 s: an animated waveform (`showwaves` in FFmpeg, or a code-made design in `motion-video-studio`), burned captions, the title and the cover; start on the strongest sentence.
- **QA:** loudness and clipping measured, chapter times within ±1 s, captions in sync and outside the interface zones, the feed validated, every name spelled right in the transcript.

## Screen recordings and product demos

- **Capture:** at twice the delivery size (2560x1440 or 3840x2160 for a 1080p cut) so zooms stay sharp; 30 or 60 fps; record cursor, clicks and keys as separate events. Deliver 1920x1080 H.264 at 8-12 Mb/s, or 1080x1920 after reframing.
- **What works:** 30-90 s per feature; the result first, then how; one task per clip; a smooth cursor, hidden when idle; zoom of 1.5-2.5x onto the clicked area (see the click zoom in `cutting.md`); speed up loading; burned captions; a clean desktop with seeded demo data; an end card.
- **Scripted demos (repeatable when the UI changes):** drive the product with Playwright (`recordVideo`, or a CDP screencast), draw a cursor in the page, log click coordinates, times and element boxes, then add zooms and the cursor afterwards with FFmpeg (`crop`, `scale`, `zoompan`) or as keyframes in `motion-video-studio`.
- **Desktop apps:** OBS, controlled through obs-websocket (built into OBS 28 and later, port 4455) to start and stop recording and switch scenes; `ffmpeg -f gdigrab` on Windows. Screen Studio and similar apps add auto-zoom on macOS; open alternatives exist.
- **QA:** no jittery cursor, zooms never crop the active element, no personal data, tokens, emails or other tabs visible (use seeded data and a blur pass), audio levels measured, captions readable on a phone.

For dashboard recordings, use KPI text at least 72 px at capture size and reload before each take to retrigger section animations.

## Live streams

- **Scenes:** starting soon, main (camera and screen), screen only, be right back, ending. Overlays (lower thirds, alerts, chat) as transparent 1920x1080 HTML browser sources, which an agent can write and test.
- **Audio:** noise suppression, a compressor and a limiter on the mic.
- **Output:** 1080p60 at about 6-9 Mb/s, keyframe every 2 s, AAC 128-160 kb/s; check the platform's own limits.
- **From the recording (VOD) to clips:** transcribe, find highlights (chat spikes, audio peaks, ranked moments as in `clips-from-long.md`), cut, reframe to 9:16 (a face crop, or the screen and the face split), caption.
- **Pitfalls:** leaked secrets on screen, audio and video drifting apart, music muted later by Content ID.
