# Cutting

## Transcript first

Cut from the transcript, then refine with silence. Cutting a 34-minute lecture by audio threshold alone produced 800-plus robotic fragments; transcript first with silence refinement produced 120 clean segments.

The edit decision list holds, per segment: source file, in, out, the sentence or beat, and the reason. Keep source time and output time separate. At normal speed, if source 10-14 s starts at 6 s of the edit, a word at 11 s lands at 7 s: `output = source − segment_in + segment_start_in_edit`. With speed changes, use the renderer's real mapping. Captions and overlays use output time.

Keep the last complete, fluent take of a repeated sentence after checking its meaning. Protect sentence-initial vowels such as "And" and "In". After the final cut, re-transcribe and compare every word with the script.

## Silence gate

Fixed thresholds fail: a noise-floor reading shifts by up to 19 dB depending on how much silence the clip holds, and the mean level sits inside speech. Calibrate per clip:

- Measure the RMS trough and the RMS peak of the dialogue (FFmpeg `astats`). Require at least 12 dB between them.
- Set the gate at 60% of the way from trough to peak, clamped to -60 to -24 dB (on digital silence, peak − 24 dB).
- Starting points when you cannot calibrate: -35 dBFS (-40 to -45 in a quiet room, -30 in a noisy one), minimum silence 0.6 s.
- A gap is cuttable when the word gap is at least 0.25 s and at least 85% of it is below the gate.
- A silent stretch over 15 s in a tutorial is probably a screen demo, not dead air: check before removing it.

## Pauses and handles

| Content | Longest pause kept | Pause left after the cut |
|---|---|---|
| Tutorial, class, short-form | 0.5 s | 0.3 s |
| Vlog, conversational | 1.0 s | 0.6 s |
| Interview turn changes | 0.5 s | 0.25 s |

- Split the air you keep 40% before the cut and 60% after.
- Pad words: start −0.08 s, end +0.12 s, snapped to the nearest silence edge within 0.25-0.3 s.
- Protect the decay of the outgoing vowel (about 2 frames before the cut) and the onset of the next consonant or breath (about 4 frames after): 67 ms and 133 ms at 30 fps.
- Scene heads get about 0.5 s of lead-in and tails about 0.6 s, checked on the picture so a hand reaching for the camera is out.
- A 20 ms audio fade at every butt join removes clicks.
- Measure the level in a 50 ms window around each cut; a cut within 10 dB of the gate is suspect.

For each join, decode PCM and compare the absolute sample step across the splice with adjacent sample steps in a 50 ms window. A boundary spike above the local peak step is a click candidate: audition, adjust the cut or fade, and measure again.

## Fillers and stutters

- Remove true interjections (um, uh, eh, este, ehm) and false starts. Do not strip discourse words by pattern alone (like, so, right, actually, you know, tipo, o sea, digamos, bueno): they often carry meaning. Decide in context, or leave them.
- Ignore held words over 1.2 s (sung or stretched vowels) as fillers; they are usually retakes (see `seeing-footage.md`).
- Keep deliberate repetition ("very, very").
- Test every removal: splice it, compare with the uncut audio, and reject the cut if it clips a phoneme or adds a click. Re-transcribe around each cut, ideally with a second model, to catch swallowed or cut words.

## Jump cuts

Pick one treatment per cut:

1. **Smooth join:** when the speaker barely moved (face shift at most 0.25 face heights, size change at most 10%, brightness change at most about 2%), replace about 6 frames (0.2 s at 30 fps) across the cut with optical-flow interpolation.
2. **Zoom alternation** within the same scene: alternate 100% and about 107.5% framing across jump cuts. Always reset to 100% on a new scene or after full-screen b-roll.
3. **Punch-in** for a punchline: 115% (or a quick 1.5x punch: 2 frames in, hold at least 0.6 s, 4 frames out), split exactly at the start and end of that sentence so the zoom never bleeds into normal talk; at most every 8 s, ideally every 2-3 minutes in long videos.
4. **Step-in:** 1.15x, 1.30x, 1.45x across consecutive cuts, resetting after three steps, a take change, a pause of 0.5 s or more, or a graphic.
5. An **opening push** from 1.0x to 1.3x over 0.8-4 s, ending on a clause boundary.

Screen recordings: zoom toward each click, starting 0.1 s before it, to 1.5x over 0.5 s, hold 1 s, out over 0.5 s, at least 0.3 s between zooms; the camera follows the cursor on a spring.

For Ken Burns zooms up to 1.2x, keep centered crop coordinates as floats and resample onto a fixed canvas with bilinear `Image.Transform.EXTENT`; integer crop rounding causes jitter.

## B-roll

- Inspect every candidate with a 2 fps contact sheet and use only the clean sub-range.
- Enter about 0.1 s before the spoken noun it illustrates, and inside a story beat with about 0.15 s left uncovered at each edge of the beat.
- Durations: a cutaway 2-4 s, a transition sequence 6-8 s, an outro 10-15 s; never under 1.2 s on its own.
- Pacing caps for talking-head content: at most about 3 inserts per minute, at most 25% of the runtime full-screen b-roll, the speaker's face on screen at least 65% of the time. Never cover a protected moment (an emotional beat, a reveal on the face).
- Match its color to the surrounding take. Mute silent b-roll (or reset its gain after normalization, or room noise jumps up); dip b-roll with its own ambient sound by about 8 dB under the voice.
- Stock b-roll chosen by keyword is often off-topic: look at it before using it.

## Split edits and rhythm

- Use J-cuts (sound of the next shot first) and L-cuts (sound of this shot carries over) of 3 frames or more in dialogue; a dialogue sequence with eight or more joins and no split edit plays mechanical.
- Rhythm audit: six or more shots in a row with nearly equal durations (coefficient of variation 0.15 or less) is monotony; a shot 1.8 times longer or shorter than the average of the four before it, more than 2 s from a story beat, is an unmotivated break. Dialogue often runs about 14-16 cuts per minute.
- Judge cuts in this order of weight (Walter Murch's rule of six): emotion, story, rhythm, eye trace, the 2D plane, 3D space. Emotion and story are judged by watching and reading; never claim them from a waveform.

Group camera setups using a 6x10 BGR background grid with the subject masked out; a mean cell difference at most 18 suggests the same setup. If at least 60% of cuts fall in speech pauses within 0.25 s, the edit uses breath-led pacing. Confirm both on the footage.

## Edit discipline

- Keep the original order unless a new order was agreed; record the strategy and approval in the edit list.
- Never cut on a guessed time. Never trim the payoff to fix a start: move the start.
- Hand off to an editor when asked: export the timeline as FCP7 XML, EDL or OpenTimelineIO.

## End cards

Start with `0.2 * word_count + recognition + 1` seconds, where recognition is 2 seconds or 3 above ten words; clamp a static end card to 4-4.5 seconds. If the text cannot be read on a phone in that hold, shorten it or stage it with animation.

## Optional reference implementation

`https://github.com/browser-use/video-use` provides a transcript-to-EDL pipeline with segment rendering, captions and review passes. Pin a reviewed commit (the inspected checkout is `43cfc566833548093455c9d4a46bd69913b7e552`). Its transcription requires `ELEVENLABS_API_KEY`, incurs charges and uploads audio; prefer local transcription for private footage. Animation slots use Remotion or HyperFrames; review dependencies before running.
