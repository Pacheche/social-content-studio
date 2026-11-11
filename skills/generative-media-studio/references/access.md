# Reaching the models

Any route works as long as it is authorized, affordable and returns the asset with its metadata. Model ids and prices churn: models are retired within months (for example, OpenAI shut down the Sora API on 2026-09-24 and Google retired the Veo 3.1 preview ids). Resolve ids from the live catalog every time, and handle a 404 or 410 by moving to a documented alternative.

## Check what is available first

- Never paste API keys into design or editing tool chats. Use the configured secret environment.
- Keys present in the environment (names only, never values): `OPENAI_API_KEY`, `GEMINI_API_KEY` or `GOOGLE_API_KEY`, `FAL_KEY`, `REPLICATE_API_TOKEN`, `OPENROUTER_API_KEY`, `HF_TOKEN`, `ELEVENLABS_API_KEY`, `RUNWAY_API_KEY`, and others the project uses.
- MCP connectors in the session (Canva, Hugging Face, Gamma and the like): use them through their tools, within their permissions.
- Local hardware: GPU and VRAM (`nvidia-smi`), Apple Silicon, free disk; an installed ComfyUI.
- If nothing is available, propose the cheapest route and ask; do not sign up for anything for the user.

## Routes

| Route | Use when | Notes |
|---|---|---|
| Vendor API (OpenAI, Google Gemini/Vertex, Black Forest Labs, Ideogram, Recraft, Runway, Kling, ElevenLabs, Stability) | The user has the key, or the model only lives there | Official SDK or REST; terms and watermarks from the vendor |
| fal.ai | Many image, video and audio models behind one key, per-unit prices, fast queues | Async queue: submit, poll status, fetch result, or a webhook. Field names differ per model: read `fal.ai/models/<id>/api` before calling |
| Replicate | Same idea; some models are only here | Often pricier than fal for the same model; check |
| OpenRouter | One key for text models plus some image and audio models (GPT Image, Gemini image, Recraft, Lyria) | Image output through chat completions with `modalities: ["image", "text"]`; images come back as base64 data URLs |
| Higgsfield | Several image/video models through an existing account | Verify routes, model limits, credits, retention and terms on the live site before spending; see below |
| Other aggregators (WaveSpeed, Sunra and similar) | The user has an account there | Same checks: live ids, live prices, terms |
| Hugging Face Inference Providers | A model page lists providers (fal, Replicate, Together, WaveSpeed and others) | `huggingface_hub.InferenceClient(provider=...)` with `HF_TOKEN`; billing goes through the provider or HF |
| Hugging Face Spaces | Free demos, tests, one-off assets | `from gradio_client import Client; c = Client("owner/space"); c.view_api()` first, then `c.predict(..., api_name=...)`. Queues and ZeroGPU quotas apply; pass `hf_token` for more quota. Spaces change or vanish. Never upload private material to a public Space |
| ComfyUI (local or remote) | Open models, complex graphs (edit + LoRA + upscale), batch work | Export the workflow with "Save (API format)", then POST it to `/prompt` and read results from `/history/<id>`; set seeds and file names in the JSON |
| Local Python (diffusers, faster-whisper, chatterbox-tts, audio-separator) | Open models with a commercial licence, private material, no budget | Pin versions; check VRAM; Linux-first repos may need WSL on Windows |

## Higgsfield access

Verify these routes on the live site before spending: CLI `npm i -g @higgsfield/cli`, then `higgsfield auth login`; optional skills `npx skills add higgsfield-ai/skills`; MCP connector `https://mcp.higgsfield.ai/mcp` uses OAuth rather than an API key. Check the selected model's clip limit and assemble longer pieces in the editing skills.

CLI calls consume subscription credits even when a web model is marked unlimited. Pay-as-you-go uses a separate balance and an API key from the configured secret environment; check balance expiry and file retention, then download immediately. Show and confirm the cost card before each generation, including every billed regeneration. A card-backed trial can auto-renew.

For Katana, supply an authorized catalogue reference or a direct video-file link, not a social profile URL; images dropped into chat do not replace the video reference. Verify the current photo limit (up to five) and reference-rights terms before uploading.

## Money

- Price = units × unit price (images, megapixels, seconds of video, characters or minutes of audio) × tier × resolution × extras (audio on, search grounding, references).
- Read the price on the provider's page at call time. Sellers of the same model can differ by 2-3x.
- Print the estimate before running, ask before the first paid call in a session, and stop at the user's budget. Track spend with `scripts/media_ledger.py` (`total` shows spend by day and by tool).
- Draft at the lowest tier and resolution; render finals only for approved items. Cache results and never regenerate without changing the prompt, seed or reference.
- Free tiers often add watermarks, queues or non-commercial terms; say so before using them for a deliverable.
- A free trial that asks for a card may renew as a paid plan: that decision is the user's.

## Reliability

- Poll async jobs with backoff and a cap (5-15 minutes for video); report a timeout instead of resubmitting blindly.
- Download outputs at once; store them in the project with a stable name (`asset-<slug>-v1.png`).
- Check what came back: dimensions, duration, aspect ratio, format. Models sometimes ignore the requested size.
- Content-policy refusals often come back as blank or generic output, not an error. Treat a suspicious result as a refusal and adjust the brief (real faces, brands, minors and celebrities trigger filters).
- Rate limits: honor `Retry-After` on 429.
