# Video, avatars, lip-sync

Snapshot of 2026-11-04. Almost every price comes from secondary sources and they disagree; sellers of the same model differ by 2-3x. Read the live model page before spending.

## The landscape now

- **Gone:** OpenAI shut the Sora app on 2026-04-26 and the Sora API on 2026-09-24. Veo 3.1 preview ids were retired; GA ids are `veo-3.1-generate-001` and `veo-3.1-fast-generate-001` on Vertex. One source says some fal Veo endpoints deprecate on 2026-11-17: check before relying on them.
- **Closed leaders:** Veo 3.1 (Full, Fast, Lite; native dialogue and effects; first and last frame; up to 3 reference images; 4K), Kling 3.0 (3-15 s, native multi-shot storyboard of up to about 6 cuts, strong people and physics; Kling 4.0 with up to 30 s and stereo audio is rolling out, status unclear), Seedance 2.0 and 2.5 (ByteDance; many reference inputs, joint audio, 2.5 claims 30 s), Wan 3.0 (Alibaba, cheapest family), Runway Gen-4.5 (best-known camera control; silent; Aleph for video editing, Act-Two for performance transfer), Hailuo 2.3 (MiniMax), Luma Ray, Pika.
- **Open weights:** Wan 2.2 (Apache 2.0; 5B runs on about 24 GB; Animate for character animation and replacement, VACE for pose, depth and mask editing), LTX-2.x (Lightricks; synchronized audio; community licence free under a revenue threshold of about $10M: read its LICENSE), MiniMax-H3 (heavily downloaded on Hugging Face, with GGUF builds and LoRAs), Pika-H3-Flex, HunyuanVideo 1.5 (Tencent community licence with territory and user-count limits; not Apache).

Indicative prices per second (October 2026): Veo 3.1 Lite $0.05-0.08, Fast $0.10-0.12, Full $0.40 with audio; Kling 3.0 $0.08-0.17; Seedance 2.0 $0.11-0.36 at 720p depending on seller; Wan 3.0 $0.05-0.20; Runway Gen-4.5 $0.12, Gen-4 Turbo $0.05.

## Decision table

| Need | Cheap | Best | Local or open | Free |
|---|---|---|---|---|
| 5-8 s b-roll, no dialogue | Wan 3.0 or Hailuo via fal | Kling 3.0/4.0, Seedance 2.x | Wan 2.2 | A Wan Space; vendor free credits |
| A clip with spoken dialogue and sound | Veo 3.1 Lite | Veo 3.1, Kling 4, Seedance 2.5 | LTX-2.x (check licence) | Few |
| Precise camera moves, product shots | Runway Gen-4 Turbo | Runway Gen-4.5, Luma Ray | Wan with a camera LoRA | |
| Same character across shots | Anchor image plus image-to-video on a cheap model | Seedance references, Kling elements, Veo references | Wan with a character LoRA | |
| 15-30 s single take | Chain 8 s clips | Kling 4, Seedance 2.5 native | LTX chaining | |
| Talking presenter from a photo and a voice | Kling Avatar, VEED Fabric, OmniHuman via API | HeyGen Avatar IV, OmniHuman 1.5, Hedra Character-3 | InfiniteTalk, Wan speech-to-video | Limited free tiers |
| Dub or translate with lip-sync | Draft-tier lip-sync | HeyGen Video Translate, Kling Lipsync | LatentSync | |
| Restyle or edit footage | | Runway Aleph | Wan VACE, LTX IC-LoRAs | |
| Motion transfer, character swap | | Runway Act-Two | Wan 2.2 Animate | |
| Upscale to 1080p or 4K | FlashVSR, SeedVR2 hosted | Topaz (Astra, Starlight) | SeedVR2, FlashVSR in ComfyUI | Real-ESRGAN (flickers) |
| 24 to 60 fps, slow motion | | Topaz Apollo | RIFE, FILM | RIFE |

Models with native audio (Veo 3.1, Kling 3/4, Seedance, LTX-2) can make 5-15 s talking shots straight from the prompt, often enough for a social clip without an avatar product.

## Prompting

Skeleton: `[shot size and lens] [subject with fixed identifying traits] [one action] [setting and light] [camera move] [style and grade] [audio: dialogue in quotes with the speaker, effects, ambience]`.

- One action and one camera move per clip. Vocabulary: static, push-in, pull-out, pan, tilt, tracking, orbit, crane, handheld, FPV, whip pan, rack focus; eye-level, low, high, over-the-shoulder; extreme close-up, close-up, medium, wide.
- 4-8 s clips are the most reliable; identity drift and morphing grow with length.
- Dialogue: one short sentence per 4-6 s, the voice type stated; "no music" if music comes in post. Subtitles are added separately: text burned in by video models is unreliable.
- Positive phrasing plus a short "avoid" line for closed models; real negative prompts work locally on Wan and LTX.
- Avoid morphing: simple backgrounds, no hands handling small objects, no crowds or crossing limbs, no on-screen text, the same lens and light words in every prompt.

## Keeping a character consistent (cheapest first)

1. Generate one clean anchor image (a portrait and a full body) with an image model and use it as the first frame for every shot.
2. Use the model's reference inputs (Veo up to 3 images, which forces 8 s; Seedance many; Kling elements and subjects; Runway and Luma references). Check that the model really accepts several references, not just one upload.
3. Chain the last frame of one shot into the first frame of the next; re-anchor on a clean frame every two hops.
4. Use native multi-shot generation when one generation can hold all the cuts.
5. For a mascot used often, train a character LoRA on Wan or LTX (consent needed for a real person).

## Multi-shot sequence

1. Shot list: id, duration, size, action, camera, dialogue, anchor image.
2. Approve the anchors. Generate every shot at a cheap tier and 720p; re-render only approved shots at the final tier.
3. Trim 3-6 frames at each end: the edges of generated clips are the worst frames.
4. Assemble in `footage-edit-studio` or `motion-video-studio`: hard cuts over dissolves, matched frame rate and size before joining, one color treatment, loudness at -14 LUFS.
5. Upscale or interpolate once, at the end.

## Avatars, lip-sync, dubbing

- Avatar products need a consent recording from the person for a custom avatar; stock avatars avoid that. Never build an avatar of a public figure.
- Lip-sync on existing video: LatentSync (open) ranks above MuseTalk for quality; HeyGen Lipsync, Kling Lipsync and VEED as services. Keep the same audio file driving lip-sync and captions.
- Dubbing: transcribe, translate, synthesize the target language (the same voice only with consent), fit timing, lip-sync if the face is on screen, then mix with the original background kept from stem separation. See `audio.md`.

## Video-to-video

- Extend: chain from the last frames; quality drops each hop, so extend at most twice and re-anchor.
- Object removal and inpainting: Wan VACE with a mask, Runway Aleph.
- Interpolation: avoid on clips that already morph; it amplifies artifacts.
- Background removal for video: matting pipelines based on SAM2, RVM or MatAnyone, or a service.

## Failure modes

Silent content-policy refusals (real faces, celebrities, minors, brands), morphing and identity drift, hands and text artifacts, audio out of sync after lip-sync, queue timeouts, expiring result URLs, ignored aspect ratios, watermarks on free tiers, audio switched on by default and charged.
