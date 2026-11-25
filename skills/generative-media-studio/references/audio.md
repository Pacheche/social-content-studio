# Voice, music and sound

Snapshot of 2026-11-04. Verified on primary pages: ElevenLabs API prices, Suno plans, and the Hugging Face cards of VibeVoice, Qwen3-TTS and Chatterbox. The rest comes from secondary sources: confirm before quoting a price or a licence.

## Text to speech and cloning

**Paid:**

| Tool | Notes |
|---|---|
| ElevenLabs | Best overall quality and tooling (speech, effects, music, transcription, dubbing, voice isolation). v3 and v4 about $0.08 per 1,000 characters; Flash and Turbo about $0.04. Instant and professional cloning (professional needs verification). Large voice library: check each voice's rights |
| OpenAI `gpt-4o-mini-tts` | Cheap (about $0.015 per minute), steerable by an instructions field (tone, accent); no reliable custom voices |
| Google Cloud TTS and Gemini TTS | Good Spanish and Portuguese variants; Gemini TTS can render two named speakers in one call (podcasts) |
| Azure Speech | Enterprise; custom neural voice is limited-access with a consent statement |
| Cartesia, Fish Audio, MiniMax | Cheap, fast, good cloning; Fish open weights need a paid licence for commercial use |

**Open:**

| Model | Licence | Notes |
|---|---|---|
| Chatterbox (Resemble AI) | MIT | Best open default for Spanish and Portuguese with cloning: language packs for Latin American and Spain Spanish, Brazilian and European Portuguese. Every output carries a watermark (keep it) |
| Qwen3-TTS | Apache 2.0 | Clones from about 3 s with a transcript of the reference; Spanish and Portuguese among 10 languages |
| Kokoro 82M | Apache 2.0 | No cloning; runs on CPU; fast and cheap for drafts and bulk narration |
| OmniVoice | Non-commercial default weights (as of 2026-11-25) | Default engine in VoiceStudio; avoid for commercial work unless an explicitly licensed model is selected |
| Fish drama-3, Breeze-TTS-2, Ming TTS | Check each card | Trending on Hugging Face in November 2026 |
| CosyVoice 2 | Apache 2.0 | Cross-lingual cloning for dubbing (check v3's licence) |
| Orpheus, Dia, Sesame CSM | Apache 2.0 | Mostly English |
| VibeVoice (Microsoft) | Research only per its card, English and Chinese only | Not for Spanish or Portuguese social content |
| F5-TTS, XTTS-v2 | Non-commercial weights | Avoid for monetized content |

**Local studio: VoiceStudio** (AGPL-3.0 app licence, free desktop app for macOS, Windows, Linux and Docker, phones in preview). Distinguish the app licence from each model's weight licence: as of 2026-11-25, VoiceStudio's default OmniVoice weights are non-commercial. Before any commercial work, verify the exact model's licence and voice consent, log the rights basis in the ledger, probe audio validity and real duration after export, and judge Rioplatense pronunciation by ear. It wraps OmniVoice and opt-in engines (CosyVoice 3, VoxCPM2, IndexTTS2 and others) for cloning, voice design from attributes, dubbing, transcription and audiobooks, and runs offline once models are downloaded. If the user runs it, drive its backend (default `http://localhost:3900`): check `GET /health`, read `GET /openapi.json` for the running version's routes and `GET /v1/audio/voices` for real voice ids (never invent one). Speech and transcription also answer on OpenAI-compatible routes (`/v1/audio/speech`, `/v1/audio/transcriptions`), and an MCP server is mounted at `/mcp`. Its own agent skill installs with `npx skills add debpalash/VoiceStudio`. Rules: an error body can land in the output file, so probe every file before calling it audio and report its real duration; a 401 or 403 means credentials, never a reason to disable auth; never download a model, switch to a cloud provider or connect a remote backend without the user's yes; from inside a container, `localhost` is the container. Its takes carry a provenance watermark; keep it on.

**Rioplatense Spanish:** no model is certified for it. Clone from an Argentine reference clip (the accent mostly comes from the reference) with ElevenLabs, Chatterbox, Qwen3-TTS or Fish, and judge by ear. An Argentine XTTS-v2 fine-tune exists but is non-commercial. Write voseo into the script ("vos tenés"); models do not convert it.

## Directing a synthetic voice

- **Tags reach the model as typed.** A tag an engine does not know is read aloud as words, so `[excited]` or `[whispers]` pasted from an ElevenLabs script ruins a take on most open engines. Use only the tags listed for the engine in use, and listen for spoken tags in review.
- **Per engine** (check the installed version): CosyVoice 3 takes `[breath]` and `[laughter]` inline, `<strong>word</strong>` for emphasis, and a written instruction ("sound exhausted"), but in that instruction mode it takes delivery from the words and ignores the reference, so the clone can drift. VoxCPM2 reads a direction as a parenthetical at the start of the text: `(tired, almost whispering) We shipped it at four in the morning.` IndexTTS2 is the one with graded emotion: eight weights (happy, angry, sad, afraid, disgusted, melancholic, surprised, calm), an emotion reference clip (in VoiceStudio, only through its streaming API), or a written emotion at an intensity up to about 0.6; in VoiceStudio scripts, `[emotion:quietly tense]` sets it per line until an empty `[emotion:]`. OmniVoice (VoiceStudio's default) knows `[laughter]`, `[sigh]` and a set of interjections tuned for Mandarin (for Spanish or Portuguese, rely on `[laughter]` and `[sigh]`), has `whisper` as its only style, and has no breath tag.
- **Change emotion only at the start of a sentence.** Splitting a sentence to change emotion mid-way renders the halves separately and loses the intonation. A speaking style such as whispering comes from the voice (design or record a whispered reference), not from an emotion tag.
- **The reference is the direction.** Zero-shot cloning copies the delivery and the room of the reference as well as the timbre: a flat clip clones flat, an echoey room clones echoey. Record 8-15 s, dry and close to the mic, in the delivery the script needs.
- **Punctuation and pauses** shape pacing cheaply: ellipses, dashes, short fragments. Prefer real inserted silence for exact pauses (VoiceStudio's `[pause 500ms]`, up to 10 s, works on every engine it runs) over hoping a comma lands.
- **Pronunciation:** respell brand names, people and loanwords in a per-project or per-voice dictionary (or inline) and apply it before synthesis, so every render and every re-render says them the same way.
- **Breaths on an engine without a breath tag:** put real breathing in the reference clip; write short fragments with pauses; turn off silence trimming so the gaps where breaths live survive; raise sampling temperature a little (about 0.3-0.7 where the default is greedy) and render several takes; keep the winner by pinning its seed. Higher temperature also brings slurred words and timbre drift, so check every take.
- **Seeds:** unpinned seeds give a different take every time. Pin the seed of an approved take (with the same reference) to reproduce it, and say so in the ledger.
- **Joins between lines:** engines pad each render with their own lead-in and tail, so the gaps between lines are accidental. Trim each render below about -40 dBFS at both ends, keeping about 40 ms, then insert the gaps you choose (about 250 ms between lines and 350 ms between paragraphs suit narration). Fill gaps with room tone shaped like the take's own quiet floor, faded over about 40 ms, not digital zero.
- **Repeated lines:** a cache replays one recording for an identical line. Render separate takes when a repeated line (a refrain, a catchphrase) must not sound copied.
- **Export:** 24-bit WAV for editing, 16-bit for playback, 32-bit float when the edit will push levels hard; a higher bit depth cannot recover detail a model already discarded. More sampling steps sound cleaner but cost time; lower them only for drafts.

## Music

| Tool | Rights and access |
|---|---|
| ElevenLabs Music | Trained on licensed data; API about $0.15 per minute, up to 5 minutes per generation; commercial use from the Starter plan. The cleanest-rights option with an API |
| Google Lyria 3 | Through the Gemini API and OpenRouter; about $0.04 per 30 s clip and $0.08 per song (secondary price); SynthID watermark |
| Suno | Best songs with vocals; Pro ($8 a month, 20 downloads) and Premier ($24, 60 downloads) include commercial rights for tracks made while subscribed; the free plan has none. No public API (an invite-only partner program exists): use the web app manually; unofficial wrappers break its terms. Suno does not guarantee copyright in outputs |
| Stable Audio 2.5 and 3.0 | API, plus open weights for some 3.0 models under Stability's community licence (check the threshold). Good for loops, instrumentals and effects |
| ACE-Step 1.5, HeartMuLa | Open, permissive (MIT or Apache); full songs with lyrics; the best open options |
| Udio | Downloads disabled after label settlements: not usable for exports |
| MusicGen, AudioGen | Non-commercial weights: avoid |

Never prompt with "in the style of" a living artist, and never upload copyrighted audio to remix. Keep the prompt, plan and download date as evidence in case of a Content ID claim.

## Sound effects

- ElevenLabs Sound Effects (about $0.12 per minute, royalty-free) for text-to-effect.
- Stable Audio for foley, loops and effects.
- MOSS-SoundEffect v2.0 (Apache 2.0, open weights, also an opt-in engine in VoiceStudio): text prompt in English or Chinese, 1-30 s, with a seed to reproduce a take.
- Prefer a licensed recording when one fits; generate to fill a gap, and mark generated effects as such in the cue sheet (`motion-video-studio`'s sound reference).
- Effects synced to a video: MMAudio, HunyuanVideo-Foley (about 12-20 GB VRAM), ThinkSound; check each licence.
- For timing and mixing effects into a film, see `motion-video-studio`'s sound reference.

## Stems, cleanup, transcription

- **Stems:** BS-RoFormer or Mel-Band RoFormer for vocals (through `python-audio-separator` or UVR5), then Demucs `htdemucs_ft` on the instrumental. The original Demucs repo is archived.
- **Cleanup:** DeepFilterNet (fast noise suppression, CPU), Resemble Enhance (stronger restoration, GPU), ElevenLabs Voice Isolator. Adobe Podcast is a manual web tool.
- **Transcription:** Whisper large-v3-turbo through faster-whisper or whisper.cpp is the safe local default for Spanish and Portuguese with word timestamps; Parakeet TDT 0.6B v3 is much faster for 25 European languages; ElevenLabs Scribe v2 (about $0.22 per hour) in the cloud with speaker separation and audio events.

## Podcasts from text

- Two hosts: an LLM writes a script with speaker tags, then Gemini multi-speaker TTS renders it in one call, or each line is synthesized per speaker (two consented reference voices on Chatterbox or Qwen3-TTS) and joined with FFmpeg. Rendering per line gives control and cheap retries.
- NotebookLM audio overviews are the best ready-made result but have no consumer API: a manual path.
- Mix: loudness -16 LUFS for podcast platforms, -14 LUFS for social clips; a music bed ducked under speech (see `footage-edit-studio`).

## Dubbing

Transcribe (Whisper), translate (an LLM, reviewed by a speaker of the language), synthesize with a cross-lingual clone of the speaker (with consent), fit timing, lip-sync if the face is on screen, and mix with the original music and effects kept through stem separation. ElevenLabs Dubbing does this end to end (v1 about $0.33-0.50 per minute, v2 about $2.20); VoiceStudio does it locally.

- **Speakers first.** Separate speakers with diarization (pyannote needs a free Hugging Face token and accepting its licence) and fix wrong or merged speakers before translating; a wrong speaker found after rendering costs a re-dub. Give the tool the number of speakers when you know it: two characters merged into one is the usual failure.
- **Glossary** for names, product terms and recurring phrases, so they translate the same way every time.
- **One reference per character.** Cloning every line from its own source line follows the delivery closely but drifts between lines; for a steady character, clone all its lines from one clean reference. A character with only very short lines lacks a usable reference: give them a saved voice. To keep the original actor's delivery, use the tool's option to mirror the source line's delivery (VoiceStudio: Mirror source delivery).
- **Direction per line** ("whispered", "urgent") can steer three things at once: the translation's wording, the voice's delivery and the speaking rate. Keep it to a small vocabulary (energy, emotion, pace, closeness, formality).
- **Fit before export.** A line that overruns its slot is shortened in translation first, then fitted by rate (or by a bounded slowdown of the picture, VoiceStudio's Smart Fit); check missing and failed segments, overruns and timing against the source before exporting.
- **Export:** keep the original audio as a second track with the dub as the default; the separated music and effects bed under the dub (raised only with a limiter); captions as SRT or VTT, or burned in, with word-by-word highlight only when word timings still match the burned text.

## Decision table

| Need | Cheap | Best | Local or open | Free |
|---|---|---|---|---|
| Narration, no cloning | OpenAI mini TTS, ElevenLabs Flash | ElevenLabs v3/v4 | Kokoro | Kokoro |
| Cloned voice (own, consented) | Cartesia, Fish | ElevenLabs professional clone | Chatterbox, Qwen3-TTS | Chatterbox on a Space |
| Rioplatense accent | Clone from an Argentine reference | ElevenLabs with that reference | Chatterbox with that reference | Same |
| Two-voice podcast | Gemini multi-speaker | NotebookLM (manual), ElevenLabs | LLM script plus Chatterbox per speaker | NotebookLM |
| Song with vocals | Lyria | Suno Pro or Premier (manual) | ACE-Step 1.5 | Suno free (no commercial rights) |
| Instrumental bed with clear rights via API | Lyria | ElevenLabs Music | ACE-Step 1.5 | |
| Sound effect from text | ElevenLabs | ElevenLabs | Stable Audio open (check licence) | |
| Effects synced to video | | HunyuanVideo-Foley, MMAudio | Same | A Space |
| Stems | Suno stems in plan | RoFormer plus Demucs | audio-separator | Same |
| Denoise | Cleanvoice | Adobe Podcast (manual), ElevenLabs Isolator | DeepFilterNet, Resemble Enhance | Same |
| Transcription | Scribe v2 | Scribe v2, Whisper large-v3 | faster-whisper turbo, Parakeet v3 | Same |
| Dubbing | ElevenLabs Dubbing v1 | ElevenLabs Dubbing v2 plus lip-sync | Whisper, LLM, Chatterbox, Demucs, LatentSync | |
