# Images

Snapshot of 2026-11-04 from the Artificial Analysis leaderboards, Hugging Face model cards and provider pages. Rankings move monthly and many prices come from secondary sources: confirm the model id and price live before using them.

## Who leads

**Closed models, generation:** GPT Image 2.5 (Sunburst for precision, Flare for speed) and GPT Image 2 (OpenAI) lead, then Nano Banana 2.1 (Google Gemini image), Grok Imagine Image 2.0 (xAI), MAI-Image-2.6 (Microsoft), Nano Banana 2, Muse Image (Meta), FLUX 3 Image (Black Forest Labs).

**Closed models, editing:** GPT Image 2.5 Sunburst, MAI-Image-2.7, GPT Image 2.5 Flare, Krea 3 Ultra, Nano Banana 2.1, Seedream 5.0 Pro (ByteDance).

**Open weights** trail the closed leaders noticeably. Their licences decide what you can use commercially:

| Model | Hugging Face id | Licence | Notes |
|---|---|---|---|
| FLUX.2 klein 4B | `black-forest-labs/FLUX.2-klein-4B` | Apache 2.0 | Generation and editing; runs on 8 GB with FP8 or GGUF |
| Z-Image-Turbo | `Tongyi-MAI/Z-Image-Turbo` | Apache 2.0 | Fast few-step photoreal, bilingual text, good base for LoRAs |
| Qwen-Image-Edit-2511 | `Qwen/Qwen-Image-Edit-2511` | Apache 2.0 | Best open instruction editor |
| BiRefNet | `ZhengPeng7/BiRefNet` | MIT | Background removal |
| Qwen-Image-2.1 | `Qwen/Qwen-Image-2.1` | Research licence (no commercial use without a separate licence) | Top open quality, native 2048 px and transparent output |
| FLUX 3 Image klein | `black-forest-labs/flux-3-image-klein` | Community licence with a revenue threshold: read it | Up to 10 reference images |
| FLUX.2 dev, FLUX.2 klein 9B | | Non-commercial | |
| Krea 2 (Turbo, Raw) | `krea/Krea-2-Turbo` | Gated: read the licence | |
| RMBG-2.0 | `briaai/RMBG-2.0` | Non-commercial; commercial needs a Bria agreement | |

Default for commercial local work: FLUX.2 klein 4B, Z-Image-Turbo, Qwen-Image-Edit-2511 and BiRefNet.

## Decision table

| Need | Cheap | Best quality | Local | Free |
|---|---|---|---|---|
| Text-heavy graphic (quote card, poster, infographic) | GPT Image 2.5 at low or medium quality; Ideogram Turbo | GPT Image 2.5 Sunburst, high | Z-Image-Turbo (weak on long text) | Local |
| Photoreal people, lifestyle | Nano Banana 2.1 | GPT Image 2.5, Nano Banana 2.1, Grok Imagine 2 | Z-Image-Turbo, FLUX.2 klein 4B | Local |
| Product shot or mockup from real photos | Nano Banana 2.1 edit, Seedream 4.5 | GPT Image 2.5 edit, Nano Banana Pro | Qwen-Image-Edit-2511, FLUX.2 klein edit | Local, with BiRefNet cutouts |
| Illustration, stylized art | Seedream, FLUX 3 klein API | Krea 3, Seedream 5 Pro, GPT Image | klein or Z-Image with a style LoRA | Local |
| Logo, icon, vector | Recraft V4 Vector (native SVG) | Recraft V4.1 Pro Vector | Generate flat, then trace with vtracer or potrace | vtracer |
| Consistent character or brand series | Nano Banana 2.1 with fixed references | Nano Banana Pro or GPT Image with multiple references, plus a LoRA | Z-Image or klein LoRA trained locally | Local LoRA |
| Instruction edit ("change only X") | Nano Banana 2.1 | GPT Image 2.5 Sunburst | Qwen-Image-Edit-2511 | Local |
| Background removal | BiRefNet on a hosted endpoint, Canva's remove-background | Bria RMBG API (licensed) | BiRefNet, rembg | BiRefNet |
| Upscale | SeedVR2 hosted, Real-ESRGAN | Topaz | Real-ESRGAN, Upscayl, SeedVR2 | Upscayl |
| Many quick drafts | FLUX.2 dev Turbo, FLUX 3 klein API, GPT Image low | | Z-Image-Turbo | Local |

## Editing toolbox

- **Instruction edit:** say what changes and what stays: "Change only the jacket to forest green; keep the face, pose, background and light identical."
- **Inpaint and outpaint:** closed models mostly edit by instruction; open pipelines take a mask (Flux or Qwen inpaint in ComfyUI, differential diffusion).
- **References:** give each reference a role ("image 1 is the person, image 2 is the outfit, image 3 is the style") and keep the text from contradicting them. A clean, front-facing reference holds identity best.
- **LoRA** for a persistent character or brand style: 15-40 varied, consistently captioned images; a LoRA only works with the base model family it was trained on. Hosted trainers cost a few dollars per thousand steps; ai-toolkit or musubi-tuner train locally.
- **Text replacement:** quote the exact new text, describe the font, check at 100%.
- **Relighting and style transfer:** by instruction on Nano Banana or GPT Image; relight LoRAs on Qwen-Image-Edit locally.
- **Upscaling:** for text and logos use a faithful upscaler (Real-ESRGAN, Topaz standard); generative upscalers rewrite text and fine detail.
- **Vectorizing:** generate flat on a plain background, trace with vtracer or potrace, clean up in an editor.

## Prompting

- Models with large language encoders (GPT Image, Nano Banana, Qwen-Image, FLUX.2 and 3, Z-Image, Seedream) want a written brief, in this order: subject, action, setting, composition and camera, light, style or medium, text to render, constraints. Keyword soup and weights like `(word:1.3)` are habits from older models.
- Negative prompts: most of these have no negative field; phrase positively and add a short constraint line ("no extra text, no watermark, no logos"). Distilled turbo and klein variants ignore guidance and negatives.
- **Text in images:** the exact string in quotes, its placement, font style, color and language. Keep each text element to about six words except on GPT Image 2.x and Ideogram. Proofread every letter. Better still, add real text in layout afterwards (HTML, SVG, Canva) instead of asking the model to draw it.
- **Size:** generate in the destination ratio, never crop afterwards: 1:1 feed, 4:5 Instagram portrait (1080x1350), 9:16 stories and reels (1080x1920), 16:9 YouTube and link cards, 1.91:1 open graph.
- **Seeds:** FLUX, Qwen and Z-Image honor seeds for reproducible drafts; OpenAI and Gemini do not guarantee it, so use a reference image for stability.
- **Iterate by edit:** fix defects on the same image ("keep the layout; change the headline to ...") instead of re-rolling.
- **Realism:** name the camera, lens, light and small imperfections; skip "ultra-detailed 8k masterpiece".

## Brand-consistent series

1. Write a style block (palette in hex, light, lens, texture, composition, logo-safe zones) and append it verbatim to every prompt.
2. Feed the same one to three approved references to every call: one for style, one for the character or product.
3. Lock ratio and resolution.
4. For strict identity at scale, train a LoRA or use a trainer product.
5. Composite the real logo and real type afterwards; never ask a model to draw the brand's logo.
6. Log model, seed, references and prompt per asset.
7. Review the whole series side by side before anything ships.

## Local hardware

| VRAM | Comfortable with |
|---|---|
| 8 GB | FLUX.2 klein 4B in FP8 or GGUF, quantized FLUX 3 klein, Z-Image-Turbo GGUF |
| 12-16 GB | klein 4B FP8, klein 9B FP8, Z-Image-Turbo BF16, quantized Qwen-Image |
| 24 GB | Quantized Qwen-Image-Edit-2511 (20B), FLUX.2 dev in 4-bit |
| 48-80 GB | FLUX.2 dev at full precision, very large models |

NVFP4 quantizations on RTX 50-series cards cut VRAM by about half. Apple Silicon works through diffusers or stable-diffusion.cpp, slower.

Useful ComfyUI graphs: few-step generation with Z-Image or klein; instruction edit with several input images; mask inpaint with differential diffusion; character LoRA plus reference; BiRefNet cutout to an alpha PNG; tiled upscale with SeedVR2 or Real-ESRGAN; flat generation plus vtracer for SVG.
