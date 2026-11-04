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
| OmniVoice, Fish drama-3, Breeze-TTS-2, Ming TTS | Check each card | Trending on Hugging Face in November 2026 |
| CosyVoice 2 | Apache 2.0 | Cross-lingual cloning for dubbing (check v3's licence) |
| Orpheus, Dia, Sesame CSM | Apache 2.0 | Mostly English |
| VibeVoice (Microsoft) | Research only per its card, English and Chinese only | Not for Spanish or Portuguese social content |
| F5-TTS, XTTS-v2 | Non-commercial weights | Avoid for monetized content |

**Rioplatense Spanish:** no model is certified for it. Clone from an Argentine reference clip (the accent mostly comes from the reference) with ElevenLabs, Chatterbox, Qwen3-TTS or Fish, and judge by ear. An Argentine XTTS-v2 fine-tune exists but is non-commercial. Write voseo into the script ("vos tenés"); models do not convert it.

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

Transcribe (Whisper), translate (an LLM, reviewed by a speaker of the language), synthesize with a cross-lingual clone of the speaker (with consent), fit timing, lip-sync if the face is on screen, and mix with the original music and effects kept through stem separation. ElevenLabs Dubbing does this end to end (v1 about $0.33-0.50 per minute, v2 about $2.20).

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
