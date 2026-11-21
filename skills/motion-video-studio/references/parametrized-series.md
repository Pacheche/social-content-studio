# Parametrized series with a component catalog

Use when producing a repeatable family of pieces that share the same approved brand blocks and differ mainly in copy, screenshots, data or aspect ratios — for example, a batch of product demos, feature announcements or localized campaign variants rendered through Remotion.

For a single piece or a one-off campaign, stay with HTML/CSS to PNG (`social-content-studio`) or the direct video engine (`references/engines.md`). Building and maintaining a catalog only pays off when multiple pieces reuse it.

## When to pilot first

Before adopting a catalog across a whole brand:

1. Pick one real family of pieces (e.g. 5–10 short product demos or social cards that share structure).
2. Define the smallest set of approved components that covers that family.
3. Render two or three variants end to end and run the normal export checks (`scripts/video_qa.py`, contact sheets, seam strips, and phone-width review).
4. Expand the catalog only after the pilot proves the format repeats without fighting the schema.

## Catalog and spec boundary

- **Catalog (code, owned by the brand):** Approved scene, overlay, transition and effect components with strict Zod prop schemas, brand tokens, safe zones and duration bounds. The model does not invent layout primitives or arbitrary styling outside the catalog.
- **Spec (JSON, generated per variant):** Composition settings (`fps`, `width`, `height`, `durationInFrames`), tracks, clip sequence, component names and validated props sourced from the approved facts file and content deck.
- **Renderer (Remotion):** Maps each validated JSON timeline spec to the Remotion composition (`@json-render/remotion`'s `Renderer` with `standardComponents` plus brand-specific custom components). Keep every frame deterministic from `useCurrentFrame()` (`references/remotion.md`).

## Guardrails

- Validate every JSON spec against the catalog schema before rendering; reject missing assets or unverified claims rather than substituting placeholders.
- Keep brand typography, palette, safe zones and read-time floors enforced inside the catalog components, not left to per-variant JSON props.
- Check each exported variant, not just the JSON spec. A valid schema can still clip text, crowd a 9:16 safe zone or cut audio early.

Adapted from [vercel-labs/json-render](https://github.com/vercel-labs/json-render/tree/c926907855d95dde328264350ac5464b60be201d) and its [Remotion renderer skill](https://github.com/vercel-labs/json-render/tree/c926907855d95dde328264350ac5464b60be201d/skills/remotion).
