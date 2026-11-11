---
name: social-content-studio
description: "Use when planning, writing, designing, producing, adapting or fixing static and text content for any brand: single posts, carousels, stories or statuses, YouTube thumbnails and covers, memes, GIFs and stickers, LinkedIn document carousels, slides and decks, threads, long posts, LinkedIn articles, newsletters and blog posts, captions, hooks and brand voice. Works from loose ideas, briefs, references or existing pieces and turns them into clear, visually careful, verifiable content. Covers editorial review, art direction, editable sources, export QA and measurement of results. Not for general web development, and it never publishes automatically. For video, reels or motion, use the sibling skills."
metadata:
  version: "2.2.0"
---

# Social Content Studio

Turn an idea into a piece the audience understands, with a reason to save, share or reply and, when it applies, a real path to the offer. The method is portable, brand independent and needs no specific external service.

For reels, motion graphics or code-made video, use the `motion-video-studio` skill. For editing existing footage, podcasts or cutting clips, use `footage-edit-studio`. For AI-generated images, video, voice or music, use `generative-media-studio`. When unsure which skill applies, or for a campaign across formats, use `content-studio`.

## Setup

On first use, run `python <skill>/scripts/setup_deps.py` (`python3` on macOS and Linux). It installs what this skill needs and is missing (Pillow, Playwright with headless Chromium, and Poppler for PDF checks) with the system package manager (winget, Chocolatey or Scoop; Homebrew; apt, dnf, pacman or zypper) and pip, then reports what is present. Optional tools install only when a task needs them, with `--with <name>`: FFmpeg, gifski. Ask before a download over 1 GB. Run it again with `--check` when a tool fails. If Python itself is missing, install it first (`winget install Python.Python.3.12`, `brew install python`, or the distribution's `python3` package). The script's report is the evidence of what is installed; a tool named in this skill is not.

## Scope and context

- Read the project's instructions and assets first. A recent user correction outranks a forwarded brief. Do not turn a one-off correction into a universal prohibition.
- Analysis request: deliver a diagnosis. Copy request: finish at copy. Production request: reach the reviewed export. Fix request: preserve content and approved decisions outside the change.
- Take the brief as it comes. Fill gaps from existing context. Ask only what materially changes truth, identity, format, offer or delivery. State minor assumptions explicitly.
- For each brand, gather identity, official logos, colors, fonts, voice, offer, reader and references as described in [brand profile and contract](references/brand-profile-and-contract.md). Never inherit preferences from another project.
- Publishing, scheduling, sending messages or connecting accounts needs authorization for that action. Creating local files and reviewing them does not imply it.

## Gate A: resolve the content

Read [strategy and copy](references/strategy-and-copy.md) for a new piece or a message change.

Extract goal, reader, situation, idea, evidence, expected action, channel and format. Pick the arc that delivers the promise: demonstration, explanation, case, comparison, tutorial, reflection or announcement. Do not impose a slide count, a closed taxonomy or artificial urgency.

Produce literal copy per slide or scene, a complementary caption and the real dependencies of the CTA. Identify every verifiable claim and separate data, interpretation and illustrative example. A material claim without evidence is resolved by source, removal or rewording before the final export. Do not publish pending markers.

Apply the anti-slop review in the reference. Preserve the voice. Do not guess whether the author used AI. Headline and support must carry different information.

For copy, captions, comments or adaptation between networks, read [voice and hooks](references/voice-and-hooks.md): brand evidence bank, hook mechanisms, a template extracted from pieces that worked, pattern density and text limits per network. If the user provides metrics or asks what to repeat, read [measurement](references/measurement.md) and carry the hypothesis into the brief.

Respect the user's or project's approval mode. If they asked to evaluate first, present the script and stop production. If they already authorized analysis and production, resolve Gate A internally and continue. Do not require two turns because of an external recipe. An identity decision or a missing essential fact does require an answer.

## Art direction and contract

Read [visual direction](references/visual-direction.md). Before choosing colors and ornaments, write what each slide must make the reader understand and which asset demonstrates it.

Record in the contract the sequence, copy, anchor with a literal example, composition, fonts, material, navigation and exact format. Use [brand profile and contract](references/brand-profile-and-contract.md) as a proportional guide: a spacing fix does not need the full brief redone.

Produce and review the cover and the hardest scene internally before extending the direction. Do not repeat the same card or gradient with different icons. Alternate compositions for a narrative reason. A typographic piece can be enough when the message justifies it.

## Static production

Read [static production](references/static-production.md) for posts, carousels, digital flyers, and static stories or statuses. For thumbnails, covers, memes, GIFs, stickers, LinkedIn documents, slides and the spec table of every network, read [other visual formats](references/formats.md). For threads, long posts, articles, newsletters and blog posts, read [text formats](references/text-formats.md). For a pure audit or fix of final files, go straight to [review and delivery](references/review-and-delivery.md).

Keep editable files separate from finals. Adapt content, composition, CTA and safe zone to each destination. Stretching the feed does not create a story. The tool follows the deliverable and the user's choice.

The production guides work as a self-contained base. Reuse the project's proven renderer when one exists. No dependency counts as installed because this skill mentions it.

When several skills, tools or new resources are in play, consult [choosing tools](references/choosing-tools.md). Choose by the piece's problem and leave a concrete decision: which criterion is adopted, where it applies and how it is checked. Load only the instructions of the chosen capabilities.

## Gate B: review the real file

Read [review and delivery](references/review-and-delivery.md). Inspect each file enlarged and at phone width, then the full sequence. If the `unslop-anything` skill is installed, run its visual-design and writing checks on the exports and the caption before delivery.

For PNG, [scripts/audit_exports.py](scripts/audit_exports.py) checks the exact file list, binary format, decoding, dimensions, aspect ratio and hashes against `export-contract.json`. It does not render or approve the design. Usage:

```text
python <skill>/scripts/audit_exports.py <final-folder> --contract <export-contract.json> --report <technical-qa.json>
```

It needs Python 3 and Pillow. Use the runtime available in the environment. If it is not available, verify with another real tool and report the scope. Never claim a check that was not run.

Fix known defects and review every affected file again. The hash ties the review to one version: a shared change invalidates the earlier evidence for the affected files. Do not repeat polishing once the criteria are met.

Deliver links to the finals, a preview when possible, the copy and the real limitations. Distinguish ready for review from authorized for publication.

## Measure and improve the method

Measure according to the goal, using the user's own available data: comprehension or replies, saves or shares, retention, qualified conversations or conversions. Record the period, the denominator and attribution limits. Test one identifiable variable. The skill does not guarantee virality or sales.

With repeated feedback, link symptom -> cause -> control -> evidence. Update the responsible rule instead of adding prohibitions. Apply persistent changes only within the requested scope.

To evaluate changes to the skill, use [eval cases](references/eval-cases.md).
