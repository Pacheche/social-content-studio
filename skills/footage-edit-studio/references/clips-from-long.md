# Clips from long videos

Cutting and captioning are solved problems. What decides whether a clip works is which moment you pick and its first two seconds.

## Find candidate moments: rank, then select

1. Cut the transcript into scoring windows of about 90 s (at least 1.5 times the longest clip allowed, so a window can always hold one).
2. **Score every window 0-100**, using the full range. Most windows are not clippable: filler, housekeeping, intros, outros and rambling transitions go under 30; 70 and up is reserved for windows that pass the **2-second test**: would the first two seconds make a cold viewer, with no context, keep watching? Prefer a hook, conflict, surprise, emotion, novelty, a big number, a clear payoff.
3. Rank in code, where scores are comparable: take the global top N, about `min(10, duration_minutes × 60 / 90 + 2)`, at least 3. Batches of near-equal size, so a lone trailing window never wins by default. Never ask the model to "pick up to 3 per batch": that caps the shortlist.
4. **Detail pass** on the shortlist: exact start and end, a hook line, a title and a one-line reason. Rules:
   - the clip opens on its strongest moment;
   - it stands alone: no opening pronoun without its referent, no "so anyway"; fix it by moving the start earlier, never by trimming the payoff;
   - start slightly before the hook and end slightly after the payoff;
   - snap cuts to word boundaries;
   - no two clips make the same point;
   - the hook names something concrete in this moment, not the video's topic.
5. Collapse overlapping candidates, keeping the higher score. If a source yields nothing good, return fewer clips instead of padding; batches of 4-9 clips retained better than 1-3 in one tool's data, but a weak clip still hurts.

Signals beyond text help as tie-breakers: laughter and applause, a face on screen, low silence share, speech density, visual saliency. One scoring formula used in a production app: `0.3 × min(highlights / 3, 1) + 0.2 × has_face + 0.2 × max(0, 1 − 5 × silence_share) + 0.2 × has_caption + 0.1 × saliency`, over sliding windows of the target length with 50% overlap and at least 5 s between chosen clips.

Sparse or silent footage (fewer than about 8 words, or under 5 words per minute) cannot be ranked from the transcript: look at frames instead.

Typical clip length 15-60 s.

## Hooks

Five patterns: an open question, a hot take, a shocking number or fact, a story loop, a point-of-view or pattern interrupt. At most about 10 words, in the speaker's language, naming what is in the clip. When a quarter or more of the clip is screen content, look at 3 frames before writing the hook, so it names what is shown.

The first frame carries the hook (visible text or motion at t = 0), speech starts within about 0.5 s, and there is no logo card or intro. The only reliable measure of a hook is the platform's own retention curve for that account; numbers quoted online about "the first 1.7 seconds" are vendor claims.

## Reframe to 9:16

Decide the layout with a closed choice, not a measurement: look at about 12 frames per source at 1024 px wide and choose among labeled options. Resolution matters more than frame count (spreadsheets are unreadable at 640 px).

| Source | Layout |
|---|---|
| Already vertical (within 1% of 9:16) | Pass through untouched |
| One speaker | Tracked crop on the face, heavily smoothed (a "heavy tripod": several confirmations, about 0.4 s, before switching subject; capped switch rate). Zoom inversely to face size, `min(1.5, max(1.0, 0.3 / face_size))`, smoothed |
| Group, landscape, wide action | Full-width foreground (about 42% of the height) over a blurred, slightly darkened copy of itself |
| Two speakers in the same frame for at least half the samples | Stacked split screen, captions on the seam |
| Shot and reverse shot (one speaker per shot) | Tracked crop per shot; never the split screen, which would stack the same person twice |
| Active speaker switching | Hard cuts to whoever is talking, from mouth activity normalized per speaker (raw frame differences change with lighting) |
| Screen recording, tutorial | Content-aware crop on the reading area; a webcam in a corner (small, off-center, still) becomes an inset |

Analysis can run at 640 px; the delivered clip is at least 1080 px wide. A gentle 12% push on audio-energy beats adds life to a static talking head.

## Topic to short (narrated stock video)

When the user wants a short from a topic with no footage:

1. Script without intros ("welcome to this video"), headings or speaker tags, in the audience's language, from facts the user approved.
2. Voice first (TTS with word timings), then measure the real audio length from the file.
3. Search terms of 1-3 words per beat, in order; stock from licensed sources (Pexels, Pixabay, Coverr) or the user's library.
4. Look at each candidate before using it: keyword search alone returns off-topic footage.
5. Fill the audio length plus about 0.1 s, in sub-clips of at most about 5 s from distinct sources, at least 480 px on the short side; fit by cover or by a blurred letterbox.
6. Captions from the TTS word timings; music at about 0.2 of the voice level.

Handle API rate limits (429 with `Retry-After`) and empty results without crashing; never ship a video shorter than its audio.
