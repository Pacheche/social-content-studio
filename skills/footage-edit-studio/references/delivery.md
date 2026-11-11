# Delivery

## Platform specs

Limits change often and third-party sources disagree; check the platform's current help page when a maximum matters. These settings play everywhere:

| Platform | Size | Frame rate | Video | Audio | Interface covers (top / bottom / left / right) |
|---|---|---|---|---|---|
| TikTok | 1080x1920 | 30 (24-60 fine) | H.264 High, yuv420p, CRF 20 | AAC 128-192 kb/s, 48 kHz | about 10% / 22% / 5% / 14% |
| Instagram Reels | 1080x1920 | 30 | same | same | about 8% / 20% / 5% / 12% |
| YouTube Shorts | 1080x1920 (up to 3 min) | 30-60 | same | same | about 6% / 18% / 5% / 12% |
| YouTube | 1920x1080 or 3840x2160 | source, up to 60 | H.264 High, CRF 18, slow preset | AAC 192-320 kb/s | 5% all edges |
| LinkedIn | 1080x1080 or 1080x1350 | 30 | CRF 20 | AAC 128 kb/s | 5% all edges |
| X | 1280x720 or 1920x1080 | 30 | CRF 22 | AAC 128 kb/s | 5% all edges |

- These safe-area figures come from tools and community measurements, not from the platforms (they only publish ad safe zones). A conservative box common to the three vertical apps is about x 162-918, y 288-1248 on 1080x1920. Draw the interface boxes over a test frame and look.
- Cap bitrate for platforms that recompress (`-maxrate 10M -bufsize 20M`), keep files under about 250 MB, `+faststart` always.
- Recommended length for reach is usually 15-60 s; keep to the platform's current maximum.

## Final QA

Run `python3 <skill folder>/scripts/video_qa.py final.mp4 --spec spec.json --sheets qa/` (on Windows `py`; needs FFmpeg). It checks size, frame rate, duration against the spec, pixel format, color tags, an empty first frame, black and frozen stretches, loudness, true peak, long silences, short audio dropouts and single-frame flashes, and writes a contact sheet, a phone-size sheet and seam strips around detected cuts. Exit 0 means every check passed. It does not judge the edit.

Then check what the script cannot:

- The original files are unchanged (same size and modification time as at the start). Record `SIZE:MTIME_NS` before editing; `--expect-identity SIZE:MTIME_NS` checks the file passed to the QA CLI, so verify each source separately from the export.
- Audio and video durations match (drift at most about 0.5 s); sync holds at the start and at the end.
- Every cut, listened to or re-transcribed: no clipped word, no click, no meaning changed.
- Both sides of every cut in the exported file, not only in the source.
- Captions against a fresh transcript of the final file, no word missing, no drift over 0.5 s, none over a face, all inside the safe area.
- No single-frame flash (a brightness jump of about 5% or more against both neighbors) and no flat first frame.
- The duration matches the edit list plus transitions.
- A test frame with the platform interface drawn over it.

Write the QA log with timestamps, evidence, findings and fixes. If something could not be checked (no speakers, no player), say so and leave it open.

Before delivery, extract every numerical claim from captions, lower thirds and cards, including currencies, percentages and abbreviated metrics. Compare with the verbatim transcript and approved brief; any mismatch blocks delivery. Check the end-card reading hold from `cutting.md`.

## Hand-off and versions

- Deliver the final files, the edit list, the captions as `.srt` (and `.vtt` for the web), the music and credits, and the QA log.
- Keep every version (`v1`, `v2`) and say in two lines what changed.
- For a human editor: export FCP7 XML, EDL or OpenTimelineIO. In DaVinci Resolve, iterate on timelines through FCP7 XML; `.drt` duplicates the media pool and `.otio` can import offline. Note that some Resolve APIs count end frames inclusively and others exclusively.
- DaVinci Resolve can be driven by an MCP server that exposes its whole scripting API; treat it like any tool that writes to a project: back the project up first and confirm before destructive changes.
- "Ready for review" is not "approved to publish". Publishing or scheduling needs the user's explicit yes.
