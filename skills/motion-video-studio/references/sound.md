# Sound

You cannot hear the mix. So every claim about audio comes from a measurement or it is not made. Report numbers ("integrated -14.2 LUFS, true peak -1.3 dBTP, effects 4-9 dB over the bed"), and say what was measured and what was not heard.

The numbers below come from measured professional launch films (a small, hand-picked set). They are starting values, not laws.

## Decide the sound first

- A film over about 15 s that tells something gets a music bed and effects on visible actions, unless the user wants silence or it will autoplay muted. Even with sound, the film must read with sound off.
- Choose the track first and cut the picture to it. 120 BPM gives 2 s bars, which makes the beat grid easy.
- One material family per film (felt and wood, glass and soft plastic, metal and air), one click voice, one keyboard sound, one music track.
- Match the sound to the brand: calm = soft piano, felt, strings; fast and exact = tight drums, plucks, a drop on true silence; bright and friendly = marimba, claps, pops; precise and expensive = sparse piano, low strings, air; raw and mechanical = ticks, latches, metal.

## Sources and licences

- The user's own music first. Otherwise licensed or royalty-free tracks searched by feel and tempo, not by subject. Instrumental, 4/4, about 110-130 BPM (median of the films measured: 123), with a soft intro, a groove, a breakdown at 40-80% and a drop for the hero moment. Avoid vocals, overused stock tracks, trailer braams on product films.
- Effects: real recordings with clear licences (CC0, CC BY with credit, or a library licence that allows the use). NC, ND, SA and unverified sources are out. Log each source and licence in `CREDITS.md`, with paste-ready credit text for the post description when CC BY requires it. Some sites block scripted downloads; then ask the user.
- Where to find real effects: the Openverse API (`https://api.openverse.org/v1/audio/?q=whoosh&license=cc0`), over five million sounds gathered from Freesound and others, no key needed but rate-limited. Search in English by the sound itself (whoosh, impact, mouse click, page turn) and filter only by licence: adding words like "sound effects" returns nothing. Check each result's licence field, not the search filter. Mixkit has free effects under its own licence (use in videos, no credit, no redistributing the files); read it before using them. Keep what you download in one `sounds/` folder per user so the next film reuses it.
- Code-synthesized sounds are fine for UI-like or synth-brand films, but beeps, sine pings and plain noise sweeps are cheap tells. Prefer real recordings for "premium".
- Voice: the user's own recording first. TTS options: ElevenLabs (paid API), Kokoro (small, open-weight, runs locally), CosyVoice (multilingual, open, local GPU). Write the script first. Ask before any paid or cloud call; keys come from the environment. A synthetic voice of a real person needs that person's consent.

## Music edit

- Detect tempo and downbeats from the real file (for example librosa, or an engine's `beats` command); accept the grid only if beats line up within about 10 ms, and check the downbeat against the first note or a section entrance, because trackers lag attacks by 20-50 ms and often miss the downbeat by half a bar.
- Cut on bar lines, back to back, with about 5 ms fades at each splice, so the grid runs through the joins. Splice between matching chords. Put the drop's downbeat on the hero frame and the final chord on the logo. Cut slow intros.
- Stretch only if tempo is off by more than about 0.2%, and never more than about 6%.
- Map the song to the story: hello on a sparse bar, first punchlines where the drums enter, busy features on the full groove, the strong moment on the drop, the last punchline on a big hit, the headline where the bass drops out, the ending on the ring-out.
- Library loops of 15-30 s: loop with a 0.4 s fade-in and a 1.5 s fade-out, ending on a bar line.

## Cue list from code

Derive every sound time from the animation code, never type it in: typed times land 8-11 frames off. Give each event a stable id (`scene:thing:n`) and export `cues.json`. Each class has an alignment mode:

| Mode | For | Aligns |
|---|---|---|
| Attack | hits, clicks, keys, pops | the sound's onset on the contact or press frame |
| Peak | whooshes | the loudest point on the velocity peak of the move |
| End | risers, zips up | the end of the sound 30-250 ms before the hit |
| Start | beds, ambiences | the beginning of the section |

Place a sample at `cue − its measured peak offset`, so the transient lands on the frame. Move the picture to the beat, not the sound away from its cause.

## Sync windows

- Viewers detect audio about 45 ms early or 125 ms late. Keep sound leading by at most about 45 ms; an impact peak at most +75 ms late; a whoosh apex within ±45 ms of its target; a riser ending 30-250 ms before the hit.
- Clicks land 10-30 ms before the visible press; press and release 60-110 ms apart, the release 0-3 dB quieter. The click goes on the frame the cursor presses, not when the UI reacts.
- When unsure, let sound lead by at most one frame; never lag two frames (a frame is 33 ms at 30 fps).
- A whoosh starts 100-450 ms before the cut and peaks at 50-70% of its length. Pop-ins land 25-40 ms after the cut. The logo sound lands on the frame the wordmark becomes readable.

## What gets a sound

- Nothing for cursor moves, hovers, scrolls, progress bars, streaming text, rolling counters and about 85% of hard cuts.
- Accents go to the reveal, the logo, the key UI action and section changes.
- About 5 designed effects per 10 s, clustered where the music is sparse (cold open, typing, logo build) and thinning after the drop. About two swishes per film; a riser in about 40% of films.
- Once a class of action has a sound, every instance gets it at the same level. Partial coverage is a tell.
- Typing: at most about 12 keys per second; most on-screen typing in professional films is silent.
- Variation: a pool of 4 or more takes, never the same take twice in a row, ±1-2 dB. Real keys do not change pitch per press, so vary takes, not pitch. A UI click is one voice at one level.
- Tonal effects in the key of the music; booms and subs on the root or unpitched.

## Mix

- Set each effect's level from the bed measured just before it, not a fixed level: effects sit about +13 to +17 dB over the quiet bed between beats (whooshes up to +21, tonal zips +7 to +9), never over -1 dBFS peak.
- Before a hit, a drop or a big whoosh, pull the music down 6-12 dB for 0.3-0.5 s and return on the hit. Do not duck under every effect. Under typing, dip the music 6-10 dB; under a voice, 3-6 dB, and keep effects out of 1-4 kHz.
- Effects dry, mono and centered; only whooshes, risers, ambiences and music are wide. Everything under about 120 Hz is mono, and only one element owns the sub at a time.
- High-pass everything at 20-25 Hz; high-pass effects and ambiences unless they are impacts.
- Harshness: an effect's 2-6 kHz peak must not exceed the music's loudest presence in that band by more than 6 dB; keep its spectral centroid at or under 6.5 kHz. Pings at 9-14 kHz fatigue, and phones hurt there first.
- Each effect must stand at least 3 dB over the bed in its own best band (6 dB is clear); a layer that adds nothing measurable is wasted.
- Phones play mono and drop the low end: check the mono fold-down, and give sub drops a saturated copy or harmonics so the missing fundamental is implied.
- Layered effects: 2-4 layers peaking together, each with one job (transient, body, sub, tail). Movement (filter, pitch, level) is the effect; a static whoosh with only a volume fade sounds cheap.

## Starting recipes for designed effects

Starting values; verify each by measurement and a spectrogram.

- **Whoosh:** pink noise through 2-3 band-passes (ratio 1 : 1.6 : 2.5, Q 1-3) sweeping from 300-600 Hz up to 1.5-5 kHz and back to 400-800 Hz; accelerating rise, decay about twice as fast; peak at 50-70%. UI swipe 0.1-0.25 s, quick 0.25-0.5 s, product fly-by about 1.1 s. Make separate short, medium and long versions; time-stretching smears.
- **Hook riser and marker sounds:** end a riser exactly on the last syllable of the hook. Trim a marker sound (a pen stroke, a highlighter) to the duration of the stroke it accompanies. Set the gain per effect: a soft marker can vanish at the level where a punchy hit sits well.
- **Riser:** 3-4 elements at most, one motion leading (filter for noise, pitch for tonal); most of the change in the last third; 1-4 s; ends 30-250 ms before the hit, then near silence.
- **Impact:** a transient (2-10 ms noise burst above 1-2 kHz), a body (sine falling from 100-180 Hz to 45-70 Hz), a sub (30-60 Hz falling over 200-400 ms) and a reverb tail; pull back to near silence before it.
- **UI click:** 10-80 ms, noise through a narrow band-pass around 5 kHz, 1 ms attack, about 20 ms decay, high-pass at 120 Hz, no leading silence.
- **Pop-in:** a sine rising from 300-500 Hz to 800-1500 Hz in 15-40 ms with a tiny noise tick; 0.2-0.4 s; step up a pentatonic scale in key across a run.
- **Logo sting:** build 0.5-2 s, stop-down 0.1-0.5 s, hit with a sub, then a tonal bloom in key; 2-5 s total, finishing within 0.5 s of the last frame.

## Delivery targets

- Social and web: integrated about -14 LUFS, true peak at or under -1 dBTP on the lossless master, then measure again after AAC encoding (it can add up to about 1 dB). Some editors push punchy social cuts louder; keep the true peak limit.
- YouTube normalizes loud uploads down, not quiet ones up; some players (X, LinkedIn, site autoplay) do not normalize at all.
- Loudness range 5-9 LU for a film with an arc. The loudest moment is the drop or hero at 30-60% of the runtime, not the logo and not the last 15%; the logo sits 8-20 dB under the film's peak.
- Opening: sound from frame 0 (first sound within about 0.1-0.5 s), no fade over the first bar, the first 5 ms at or under -40 dBFS (no click on sample 0).
- Ending: the last 3 s at body level, a short fade (median about 0.3 s), the last 50 ms under -45 dBFS RMS and the last 10 ms under -60 dBFS. No silent holes over 40 ms except deliberate silence.

## Optional tool: earshot

`earshot` (MIT) gives an agent ears: tag audio, compare it with a description, summarize a video minute by minute, generate sound effects from code (`sfx`, `kit`, no sample licences) and measure loudness (`measure`: LUFS, true peak). It runs on CPU; its model is about 1.1 GB from Hugging Face. Its optional `llm` tool uploads audio to Gemini, so keep it off without explicit consent. The `sfx`, `kit` and `measure` commands need no model; run them in a separate Python venv.

It also has `critique`, which compares a finished film with a set of professional launch films and lists fixes by second, and `forge`, which generates a whoosh, click or impact and refines it by listening. Treat its grade as one more measurement, not a verdict. It needs Python 3.10 or newer. Connect it as an MCP server from its folder: `claude mcp add earshot --scope user -- <venv python> -m earshot mcp`, then restart the agent so the tools appear.

## Measure with FFmpeg

```bash
# Integrated loudness, loudness range, true peak
ffmpeg -i film.mp4 -af ebur128=peak=true -f null - 2>&1 | tail -15
# Two-pass normalization to -14 LUFS / -1 dBTP: first pass prints the measured values
ffmpeg -i mix.wav -af loudnorm=I=-14:TP=-1:LRA=9:print_format=json -f null -
# Spectrogram to look at
ffmpeg -i film.mp4 -lavfi showspectrumpic=s=1600x600:legend=1 spectrum.png
# Silences
ffmpeg -i film.mp4 -af silencedetect=noise=-50dB:d=0.04 -f null -
```

`scripts/video_qa.py` runs the loudness and silence checks for you. Open the spectrogram image; a number you did not look at is not a review.

## Deliver the effects separately

With the mixed film, hand over the effects alone as a WAV stem on the same timeline, so an editor can rebalance it, and a short placement list (time, cue id, file, level, licence). End it with the five or so seconds a person should listen to first: the hero hit, the logo, any effect over a voice and any spot a check flagged. Measuring is not hearing; ask the user to listen there before publishing.

## Audio QA

- Integrated within ±0.5 LU of the target; true peak at or under -1 dBTP on the final file.
- No click at the head, the tail or any splice; no chopped decays (fade-outs under 30 ms on a sounding tail), no music chopped mid-note.
- Cut alignment: as a starting check, at least about 30% of visual cuts land within 100 ms of a beat or sound onset; a lower share on a music-driven film means the picture and the track are working separately.
- Every cue covered, every class sounded consistently, no machine-gun (the same sample four or more times with no variation).
- Judge in context against the music and on small speakers, never solo only. After each change, re-render and re-run every check, and compare with the previous results so nothing that passed now fails.
- When several fixes conflict (a louder body and a softer 2-6 kHz), one editor merges them.
