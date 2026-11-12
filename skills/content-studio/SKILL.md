---
name: content-studio
description: "Use for any content creation request when it is not obvious which skill applies, or when one idea must become several formats: posts, carousels, stories, thumbnails, memes, GIFs, LinkedIn documents, slides, threads, long posts, newsletters, reels, launch videos, explainers, animations, edited footage, clips, podcasts, screen recordings, live streams, AI images, AI video, voice, music. Routes each part to social-content-studio, motion-video-studio, footage-edit-studio or generative-media-studio, and plans a campaign across formats from one story."
metadata:
  version: "2.3.0"
---

# Content Studio

One package for every kind of content. This skill decides which skill does what, in which order, and keeps one story, one brand and one set of facts across all the pieces.

## Setup

This skill needs no tools. Each skill it routes to runs its own `scripts/setup_deps.py` on first use. To prepare the whole package at once, run `python <skill>/scripts/setup_deps.py --all` (`python3` on macOS and Linux); ask before it downloads optional tools over 1 GB.

## Route the request

| The user wants | Skill | Reference to open first |
|---|---|---|
| A post, carousel, story, status, quote card, infographic, flyer | `social-content-studio` | `references/static-production.md` |
| A YouTube thumbnail, a cover for a reel, short or podcast | `social-content-studio` | `references/formats.md` |
| A meme, reaction image, sticker, GIF | `social-content-studio` (static), `motion-video-studio` (animated GIF from code) | `references/formats.md` |
| A LinkedIn document carousel (PDF), slides, a deck | `social-content-studio` | `references/formats.md` |
| A thread, a long post, a LinkedIn article, a newsletter, a blog post, captions and comments | `social-content-studio` | `references/text-formats.md`, `references/voice-and-hooks.md` |
| A reel, ad, launch film, explainer, UI animation, kinetic type, data story, logo reveal, animated captions or lower thirds, made from code | `motion-video-studio` | `references/story-and-spec.md` |
| Editing real footage: rough cut, silences, captions, music, reframing, clips from a long video | `footage-edit-studio` | `references/cutting.md` |
| A podcast (audio or video), an audiogram | `footage-edit-studio` | `references/podcasts-and-recordings.md` |
| A screen recording, product demo, live stream, clips from a VOD | `footage-edit-studio` | `references/podcasts-and-recordings.md` |
| An AI-generated image, video clip, avatar, voice-over, cloned voice, music, sound effect, dubbing | `generative-media-studio` | the medium's reference |
| Text that reads as AI, a design that looks generated | `unslop-anything`, if installed | |

When a piece needs two skills, the one that owns the final deliverable leads, and the others supply assets: a launch film is `motion-video-studio` with a voice-over and generated b-roll from `generative-media-studio`; a carousel with a generated product scene is `social-content-studio` with one image from `generative-media-studio`.

## One idea, many formats

For a campaign or a launch, plan the set before producing any piece:

1. **One story.** Goal, reader, one idea, the real facts and the action wanted, settled once (`social-content-studio`, Gate A). Every piece takes its claims from the same facts file.
2. **One brand profile.** Colors, fonts, logo files, voice, banned defaults, in one file next to the project, used by every skill.
3. **A format plan.** Which pieces, for which platform, in which order, and what each one does: for example a 25 s launch film (hook on the result), its 9:16 and 1:1 versions, a 7-slide carousel that explains the how, a thread with the story behind it, five clips from the founder's recorded demo, a thumbnail, a newsletter section. Each piece is adapted to its platform, not stretched or cropped from another. Give each stage an input, an output, an owner and a quality gate, keep a human gate for claims about results, and start the next cycle from observed results (`social-content-studio`, `references/measurement.md`), not generic trends. Do not build a chain of agents because a source lists one.
4. **Shared assets first.** Generate or prepare what several pieces reuse (product shots, the voice-over, the music bed, the key frame) once, log them, and approve them before building the pieces.
5. **Produce, then review each piece with its own skill's checks.**
6. **Deliver the set:** files per platform, copy and captions per piece, credits, AI labels where they apply, and a publishing order. Publishing and scheduling need the user's explicit yes.

## Rules for the whole package

- Real assets and real facts beat generated ones; nothing is invented.
- The brand profile and the user's corrections win over any default in the skills.
- Every skill reviews the exported file, not the code or the prompt.
- Ask before anything outward or paid: publishing, uploads to cloud services, paid generation, accounts.
