# Social Content Studio

A package of five agent skills that covers every way of making content: posts, carousels, thumbnails, memes, GIFs, LinkedIn documents, slides, threads and newsletters; videos made from code; edited footage, clips, podcasts, screen recordings and live streams; and AI-generated images, video, avatars, voice and music through any route (vendor APIs, fal, Replicate, OpenRouter, Hugging Face, ComfyUI or local models). Each skill makes the agent decide the message first, build with real assets, and check the exported file before calling it done.

Works with Claude Code, Codex, Gemini CLI, OpenCode and any agent that loads `SKILL.md` skills.

| Skill | For | Checks it runs |
|---|---|---|
| [`content-studio`](skills/content-studio/SKILL.md) | Any request: routes it to the right skill, and plans one story across many formats for a campaign | |
| [`social-content-studio`](skills/social-content-studio/SKILL.md) | Posts, carousels, stories, thumbnails and covers, memes, GIFs and stickers, LinkedIn documents, slides and decks, threads, long posts, newsletters, blog posts: strategy, copy, hooks, art direction, HTML/CSS to PNG and PDF | PNG audit against an export contract, review at full size and at phone width |
| [`motion-video-studio`](skills/motion-video-studio/SKILL.md) | Videos made from code: product launches, ads, explainers, UI animations, kinetic type, data stories, logo reveals, 3D shots, campaign variants. Remotion, HyperFrames, a `seek(t)` renderer or three.js | Video QA (specs, loudness, black and frozen stretches), contact sheets, seam strips, P0-P2 review |
| [`footage-edit-studio`](skills/footage-edit-studio/SKILL.md) | Editing real footage: rough cuts, silences and fillers, retakes, jump cuts, b-roll, captions, music and ducking, vertical reframing, long videos into short clips, podcasts and audiograms, screen recordings and demos, live streams | The same video QA, every cut listened to or re-transcribed, captions checked against the final file |
| [`generative-media-studio`](skills/generative-media-studio/SKILL.md) | AI images and edits, background removal, upscaling, vectors, video clips, avatars and lip-sync, dubbing, voice-over and cloning, music, sound effects, stems, transcription, two-voice podcasts | Cost estimate before paid runs, a provenance and spend ledger, licence and consent checks, AI labels, artifact review |

## Install

All five:

```bash
npx skills add Pacheche/social-content-studio -g -y
```

One of them:

```bash
npx skills add Pacheche/social-content-studio --skill motion-video-studio -g -y
```

Or copy a folder from `skills/` into your agent's skills folder (`~/.claude/skills/`, `~/.codex/skills/`, `~/.agents/skills/`).

### Dependencies

Each skill installs its own tools the first time the agent uses it: `scripts/setup_deps.py` finds what is missing and installs it with winget, Chocolatey or Scoop on Windows, Homebrew on macOS, apt, dnf, pacman or zypper on Linux, and pip for Python packages. You only need Python 3.9 or newer. To set everything up yourself right after installing:

```bash
python ~/.claude/skills/motion-video-studio/scripts/setup_deps.py --all
```

| Skill | Installs on first use | On demand (`--with <name>`) |
|---|---|---|
| `social-content-studio` | Pillow, Playwright with Chromium, Poppler | FFmpeg, gifski |
| `motion-video-studio` | FFmpeg, Node.js 22+ | Playwright, OpenCV, Blender, gifski |
| `footage-edit-studio` | FFmpeg, faster-whisper | Node.js, OpenCV, Demucs |
| `generative-media-studio` | FFmpeg | rembg, Demucs, faster-whisper |

`--check` only reports, `--dry-run` prints the commands without running them. Downloads over 1 GB (Demucs with PyTorch) are asked first. On Linux the system packages need `sudo`.

## Use

```text
Turn this brief into a 7-slide Instagram carousel for my brand
Make a 25-second launch video for this product with its real screenshots, in 9:16 and 16:9
Generate a product scene for the carousel cover and a voice-over in rioplatense Spanish
Plan the launch: a film, a carousel, a thread, five clips and a thumbnail from one story
Cut this 40-minute podcast into five vertical clips with captions
Remove the silences and filler words from this tutorial and add music under it
Audit this carousel without changing the message
```

## What makes the output better

- **The message comes first.** Goal, reader, one idea, real evidence and the action you want are settled before anything is designed or animated.
- **Real assets, real facts.** Screens, logos, numbers and quotes come from you or your product. Nothing is invented; unverifiable claims come back to you.
- **Numbers instead of adjectives.** "Premium" and "dynamic" become curves, durations, sizes and a beat grid, starting from values measured on professional films and tuned to your brand.
- **A banned list of generated-video defaults** (glows, floating particles, everything fading up the same way, a whoosh on every cut) that grows after each render.
- **Sound designed and measured.** Music cut on bar lines, effects derived from the animation code and placed within perceptual sync windows, loudness at -14 LUFS with the true peak checked again after encoding.
- **Editing by evidence.** Word-level transcripts, calibrated silence gates, speech handles, retake detection, phrase-aware captions, and a moment picker that ranks every window of a long video before choosing clips.
- **The file is reviewed, not the code.** Scripts check the export; contact sheets and seam strips show what the frames really look like; findings come with the exact change.
- **Any model, any route, with the bill in view.** The generative skill picks the model by need (cheap, best, local, free), reads live ids and prices before spending, asks before paid runs, and logs every asset with its licence.
- **Your brand stays yours.** Brand rules live in a profile next to your project, not inside the shared skills.

## Scripts

| Script | Needs | Does |
|---|---|---|
| `skills/social-content-studio/scripts/audit_exports.py` | Python 3, Pillow | Exact file list, real decoding, dimensions, aspect ratio and hashes of PNG exports against a contract |
| `skills/generative-media-studio/scripts/media_ledger.py` | Python 3 | Logs every generated asset (tool, model, prompt, cost, licence, consent), totals spend, enforces a budget, flags missing licences or changed files |
| `skills/*/scripts/video_qa.py` | Python 3, FFmpeg | Duration, size, frame rate, pixel format and color tags against a spec; loudness and true peak; empty first frame, black, frozen and silent stretches, short audio dropouts and flash frames; contact, phone and seam sheets |
| `skills/*/scripts/setup_deps.py` | Python 3 | Checks and installs each skill's tools with the system package manager and pip |

Each script has its own tests (`python3 -I scripts/test_*.py` from the skill folder). A pass removes mechanical failures; it never approves the design.

## Nothing is published for you

The skills create local files and review them. Publishing, scheduling, uploading footage to cloud services, paid generation and connecting accounts each need your explicit yes. Real people's faces and voices are used only with their consent, and realistic AI content gets the platform's label.

## License

MIT
