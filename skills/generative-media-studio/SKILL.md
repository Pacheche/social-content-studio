---
name: generative-media-studio
description: "Use when content needs media generated or edited by AI models: images (photoreal, illustration, product shots, text graphics, logos and vectors, consistent characters), image editing (instruction edits, inpainting, background removal, upscaling, relighting), video clips (text or image to video, multi-shot sequences, restyle, extend, upscale, frame interpolation), talking avatars and lip-sync, dubbing, voice-over and voice cloning, music, sound effects, stem separation, audio cleanup, transcription, or two-voice podcasts. Works through any route (vendor APIs, aggregators (fal, Replicate, OpenRouter), Hugging Face Inference Providers and Spaces, ComfyUI, or local open models), with cost control, licence and consent checks, and provenance. Pairs with social-content-studio, motion-video-studio and footage-edit-studio."
metadata:
  version: "2.2.0"
---

# Generative Media Studio

Models make the asset; you make the decisions. A generated image or clip is only as good as the brief, the references and the review behind it, and it carries costs, licences and duties a photo from the user does not. This skill gets the right model for the job through whatever route is available, keeps spending visible, and ships nothing unchecked.

The model landscape changes every month. The references hold a dated snapshot (2026-11-04) to start from: before any paid call, read the provider's live model list and price page, and prefer what is current over what is written here.

## Setup

On first use, run `python <skill>/scripts/setup_deps.py` (`python3` on macOS and Linux). It installs what this skill needs and is missing (FFmpeg) with the system package manager (winget, Chocolatey or Scoop; Homebrew; apt, dnf, pacman or zypper) and pip, then reports what is present. Optional tools install only when a task needs them, with `--with <name>`: rembg, Demucs (~2 GB with PyTorch), faster-whisper. Ask before a download over 1 GB. Run it again with `--check` when a tool fails. If Python itself is missing, install it first (`winget install Python.Python.3.12`, `brew install python`, or the distribution's `python3` package). The script's report is the evidence of what is installed; a tool named in this skill is not.

## How to use this skill

| Need | Read |
|---|---|
| How to reach any model: APIs, aggregators, Hugging Face, ComfyUI, local; keys, queues, budgets | `references/access.md` |
| Images: generate, edit, remove backgrounds, upscale, vectorize, keep a series consistent | `references/image.md` |
| Video clips, multi-shot sequences, avatars, lip-sync, dubbing, restyle, upscale | `references/video.md` |
| Voice, cloning, music, sound effects, stems, cleanup, transcription, podcasts | `references/audio.md` |
| Licences, commercial terms, consent, AI labels, copyright | `references/rights-and-labels.md` |
| Checking generated media before it ships | `references/review.md` |

Where the asset goes next: static posts and carousels in `social-content-studio`; code-made films (generated clips as layers, voice-over, music) in `motion-video-studio`; edits of real footage (dubbing, cleanup, b-roll) in `footage-edit-studio`.

## Workflow

1. **Decide whether to generate at all.** Real beats generated when it exists: the user's product, photos, screens, voice and customers. Generate what cannot be shot or recorded, or what would cost far more to make. Never generate proof (a screenshot of a feature, a result, a testimonial, a customer).
2. **Brief.** What the asset must show or say, where it goes (platform, size, duration), the brand's style block (palette in hex, light, lens, texture, composition rules), the references, and what must stay fixed. Write prompts as decisions, not adjectives.
3. **Pick the model and the route.** Use the decision tables in the medium's reference. Check what the user already has access to (keys in the environment, a GPU, ComfyUI, paid plans). Prefer, in order: what the user already pays for, open models with a commercial licence when local hardware allows, then the cheapest paid model that meets the quality bar.
4. **Estimate and confirm.** Print the estimate (units × price, with the price page you read) before any paid run. Ask before the first paid call in a session and whenever a job exceeds the budget the user set. Remember every regeneration is charged again.
5. **Draft cheap, then final.** Lowest tier, resolution and duration first; approve with a still or a short draft; re-render only approved items at the final tier. Fix by editing the same output rather than re-rolling from zero.
6. **Download and log.** Download outputs immediately (provider URLs expire). Record each asset with `scripts/media_ledger.py add` (tool, model id, route, prompt, references, seed, cost, licence, consent id). Keep credits in `CREDITS.md`.
7. **Review.** Inspect every asset with `references/review.md`: at 100% and 200%, for artifacts, text errors, identity drift, morphing, audio defects and AI-slop tells. Measure audio. Nothing ships on a model's word.
8. **Label and deliver.** Apply the platform labels and keep provenance metadata (`references/rights-and-labels.md`). Deliver the files, the ledger entries and the prompts.

## Rules that do not bend

- **Consent for real people.** No face, body or voice of a real, identifiable person (including staff, clients, family, public figures and anyone under 18) without documented consent for that use. No cloned voice without recorded consent from its owner.
- **No deception.** No fake endorsements, fake testimonials, fake customers, fake product capabilities, fake news events. Realistic synthetic people or events are labeled.
- **Licence before use.** Check the model's licence and the plan's commercial terms before a commercial deliverable. "Open weights" often means non-commercial.
- **Keys from the environment.** Never ask for an API key in the chat, never write one into a file, never print one.
- **Private material stays private.** Do not upload private, client or unreleased material to public Spaces or free services that keep or train on uploads; ask before sending anything to a cloud model.
- **No style theft.** Do not prompt with the name of a living artist or a brand's protected look; describe the qualities instead.
- **Do not strip provenance.** Keep C2PA, SynthID and watermarks the tools add; never remove them to avoid a label.
- **Budget is the user's.** Stay inside the budget; stop and report when a job would exceed it.
