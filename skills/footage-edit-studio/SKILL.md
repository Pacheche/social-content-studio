---
name: footage-edit-studio
description: Use when the user has existing footage to edit for social media or YouTube (interviews, podcasts, vlogs, tutorials, talking heads, screen recordings, product demos, live streams and their recordings, video and audio podcasts) and wants a rough cut, silences and filler words removed, retakes cleaned, jump cuts smoothed, b-roll placed, captions, music and ducking, loudness fixed, vertical 9:16 reframing, or a long video cut into short clips. Works with FFmpeg and local transcription; optional DaVinci Resolve. Not for animations made from code (use motion-video-studio).
metadata:
  version: "2.2.0"
---

# Footage Edit Studio

Editing footage is choosing: which words stay, where the cut falls, what the viewer looks at while someone talks. The agent's job is to see and hear the material through tools (transcripts with word times, contact sheets, measurements), make those choices with the creator's intent, and prove every cut on the exported file.

Deterministic work (cutting, measuring, encoding) runs through tools and returns numbers. Taste (which moment, which take, what to keep) is yours, and it is never claimed from a waveform: emotion and story are judged by watching and reading, and said so.

## Setup

On first use, run `python <skill>/scripts/setup_deps.py` (`python3` on macOS and Linux). It installs what this skill needs and is missing (FFmpeg and faster-whisper for local transcription) with the system package manager (winget, Chocolatey or Scoop; Homebrew; apt, dnf, pacman or zypper) and pip, then reports what is present. Optional tools install only when a task needs them, with `--with <name>`: Node.js, OpenCV, Demucs (~2 GB with PyTorch). Ask before a download over 1 GB. Run it again with `--check` when a tool fails. If Python itself is missing, install it first (`winget install Python.Python.3.12`, `brew install python`, or the distribution's `python3` package). The script's report is the evidence of what is installed; a tool named in this skill is not.

## How to use this skill

Paths are relative to this skill's folder. Load references on demand.

| Need | Read |
|---|---|
| Probe, transcribe, sample frames, find shots and beats | `references/seeing-footage.md` |
| Rough cut, silences, fillers, retakes, jump cuts, b-roll, rhythm | `references/cutting.md` |
| Long video to short clips, hooks, vertical reframing | `references/clips-from-long.md` |
| Captions | `references/captions.md` |
| Voice, music, ducking, sound effects, loudness | `references/audio-mix.md` |
| FFmpeg commands that work, and the traps | `references/ffmpeg-recipes.md` |
| Podcasts and audiograms, screen recordings and product demos, live streams and clips from the recording | `references/podcasts-and-recordings.md` |
| Platform specs, safe zones, export, final QA, handoff to an editor | `references/delivery.md` |

Animated titles, lower thirds or overlays built in code: `motion-video-studio`. Post copy and captions for the post itself: `social-content-studio`. Generated b-roll, voice-over, dubbing, music or audio cleanup with AI models: `generative-media-studio`.

## Workflow

1. **Brief.** What the edit is for (a 40-minute talk into five clips, a vlog, a tutorial), the platform and format, length, style references or the creator's past videos, what must stay (a joke, a sponsor read, a name), and the music source. Ask only what the footage cannot answer.
2. **Inventory.** Never touch the originals: work on copies, write outputs to a project folder. Probe every file (`seeing-footage.md`): duration, fps (and variable frame rate), color (HDR or log), audio sample rate, rotation, drift between cameras. State what was analyzed before editing ("38 of 40 clips analyzed, 2 unreadable").
3. **See and hear.** Transcribe with word timestamps, once per source, cached by the audio's hash. Build contact sheets with timecodes, detect shots and, when there is music, beats. Look at the sheets yourself.
4. **Plan the cut.** For a rough cut: an edit decision list from the transcript (source, in, out, sentence, reason). For clips: candidate moments ranked by the method in `clips-from-long.md`. Show the plan before cutting when the strategy is still open (which story, which clips); skip the stop when the user already approved it.
5. **Cut.** Transcript first, then silence refinement, with speech handles and declick fades (`cutting.md`). Then jump-cut treatment, b-roll, reframe.
6. **Captions, audio, color.** Captions from the final edit's timings; dialogue cleaned and matched across takes; music under the voice with ducking; loudness normalized in two passes and measured again after encoding.
7. **Verify.** Run `scripts/video_qa.py` on the export, listen to every cut (or re-transcribe around each one), check both sides of every cut in the exported file, check captions against a fresh transcript of the final file, and look at phone-size frames with the platform interface in mind.
8. **Deliver.** Finals per platform, the edit list, captions as a file too, a short report: what was cut and why, measured loudness, what could not be checked. Keep every version.

## Rules that do not bend

- **The originals are read-only.** Every edit writes a new file; prove the source is unchanged (size and modification time) at the end.
- **Cuts follow words, never invented times.** Cut points come from word timestamps and measured silences, snapped to word boundaries, never from times the model guessed.
- **Do not change what was said.** Removing fillers, stutters and retakes is editing; reordering sentences so they mean something new is not. A cut that changes the meaning needs the user's yes.
- **Protect the person.** Never put text over a face, never cut the end of a word, never leave a click at a join. Keep slang, swearing and the speaker's way of talking unless asked.
- **Measure, then claim.** Loudness, peaks, sync and silences come from meters; say "measured, not heard" when you could not listen.
- **One fix at a time when a defect repeats.** If three rounds do not fix the same defect, diagnose the cause or report the blocker.
- **Ask before anything outward or paid.** Uploading footage to a cloud transcription or vision service, paid tools, publishing, connecting accounts. Prefer local transcription when the footage is private.
- **Licences.** Music, sound effects, stock b-roll and fonts need a licence that covers the use; log them in `CREDITS.md`.
