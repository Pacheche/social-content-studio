# Rights, consent and labels

Legal and platform rules as of 2026-11-04, mostly from law-firm summaries and platform help pages read through secondary sources. This is practice for an agent, not legal advice: when a deliverable is high-stakes (an ad campaign, a client in a regulated sector), tell the user to confirm with counsel.

## Licences

- Read the model card's licence and the plan's terms before any commercial deliverable. Several "open" models are non-commercial or changed licence in 2026 (Qwen-Image-2.1 moved to a research licence; FLUX.2 dev and klein 9B, RMBG-2.0, MusicGen, AudioGen, F5-TTS and XTTS-v2 weights are non-commercial; LTX-2 and HunyuanVideo have community licences with thresholds or territory limits).
- Permissive defaults: Apache 2.0 or MIT (FLUX.2 klein 4B, Z-Image-Turbo, Qwen-Image-Edit-2511, BiRefNet, Wan 2.2, Chatterbox, Qwen3-TTS, Kokoro, ACE-Step).
- Paid plans: commercial rights often depend on the plan at the moment of creation or download (Suno, ElevenLabs Music). Free tiers usually exclude commercial use or add watermarks.
- Third-party assets inside a prompt or reference (a logo, a photo, a song) keep their own rights.
- Record the licence of every asset in the ledger and `CREDITS.md`.

## Consent

- A real person's face, body or voice needs documented consent for this use, this medium and this period: staff, clients, family and the user too. Store a consent id with the asset.
- Never: public figures and politicians, anyone under 18, impersonation, fake endorsements or testimonials, deceased people without the estate's consent.
- Avatar and cloning services ask for a consent recording for custom avatars and professional voice clones; follow their process.
- In the US the NO FAKES Act is not law (it stalled in the Senate in autumn 2026); state laws such as Tennessee's ELVIS Act cover voice. EU, UK and Latin American personality and data-protection rules apply to likeness and voice as personal data.

## Labels and disclosure

- **EU AI Act, Article 50:** transparency duties apply from 2026-08-02. Whoever publishes a deepfake (realistic content that could pass as real, including a digital replica of a person) must disclose it; clearly fictional or artistic content is lighter. The duty on providers to mark outputs in a machine-readable way has a transition for systems already on the market (reported to 2026-12-02); fines reach €15M or 3% of turnover. A voluntary Code of Practice on marking and labeling exists.
- **YouTube:** the "altered or synthetic content" setting in Studio is mandatory for realistic synthetic content; since May 2026 the label sits under the player and C2PA is read automatically. Undisclosed realistic synthetic content can be labeled, removed or demonetized; mass-produced repetitive content is a monetization risk.
- **TikTok:** label realistic AI content; it auto-labels from C2PA metadata and its own effects. Misleading AI content is banned.
- **Instagram and Facebook:** the "AI info" label, applied from C2PA or IPTC signals, classifiers or self-disclosure. Accounts built on synthetic people reportedly get a profile label.
- **LinkedIn:** a small content-credentials tag on AI-generated visuals from C2PA.
- **X:** no dedicated AI label switch; deceptive synthetic media is against policy.
- Default: label realistic synthetic people, voices and events everywhere; add a visible or spoken line in the post when the voice is cloned or synthetic.

## Provenance

- Keep C2PA content credentials, SynthID and tool watermarks (Chatterbox, VibeVoice). Do not strip metadata to avoid a label; that breaks platform rules.
- Screenshots and re-encodes often lose C2PA. When the pipeline allows, keep the original file with its credentials in the project.
- Log per asset: tool, model id, route, prompt, references, seed, date, plan or licence, consent id (`scripts/media_ledger.py`).

## Copyright

- In the US, prompts alone do not make a work protectable; human selection, arrangement and modification can. Add real human decisions and keep the records. Other countries differ.
- Do not name living artists or reproduce a recognizable protected character or brand look.
