# Social Content Studio

Three agent skills that turn ideas, briefs and raw footage into social content you can publish: posts and carousels, videos made from code, and edited clips. Each one makes the agent decide the message first, build with real assets, and check the exported file before calling it done.

Works with Claude Code, Codex, Gemini CLI, OpenCode and any agent that loads `SKILL.md` skills.

| Skill | For | Checks it runs |
|---|---|---|
| [`social-content-studio`](skills/social-content-studio/SKILL.md) | Posts, carousels, stories and statuses: strategy, copy, hooks, art direction, HTML/CSS to PNG | PNG audit against an export contract, review at full size and at phone width |
| [`motion-video-studio`](skills/motion-video-studio/SKILL.md) | Videos made from code: product launches, ads, explainers, UI animations, kinetic type, data stories, logo reveals, 3D shots, campaign variants. Remotion, HyperFrames, a `seek(t)` renderer or three.js | Video QA (specs, loudness, black and frozen stretches), contact sheets, seam strips, P0-P2 review |
| [`footage-edit-studio`](skills/footage-edit-studio/SKILL.md) | Editing real footage: rough cuts, silences and fillers, retakes, jump cuts, b-roll, captions, music and ducking, vertical reframing, long videos into short clips | The same video QA, every cut listened to or re-transcribed, captions checked against the final file |

## Install

All three:

```bash
npx skills add Pacheche/social-content-studio -g -y
```

One of them:

```bash
npx skills add Pacheche/social-content-studio --skill motion-video-studio -g -y
```

Or copy a folder from `skills/` into your agent's skills folder (`~/.claude/skills/`, `~/.codex/skills/`, `~/.agents/skills/`).

## Use

```text
Turn this brief into a 7-slide Instagram carousel for my brand
Make a 25-second launch video for this product with its real screenshots, in 9:16 and 16:9
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
- **Your brand stays yours.** Brand rules live in a profile next to your project, not inside the shared skills.

## Scripts

| Script | Needs | Does |
|---|---|---|
| `skills/social-content-studio/scripts/audit_exports.py` | Python 3, Pillow | Exact file list, real decoding, dimensions, aspect ratio and hashes of PNG exports against a contract |
| `skills/*/scripts/video_qa.py` | Python 3, FFmpeg | Duration, size, frame rate, pixel format and color tags against a spec; loudness and true peak; empty first frame, black, frozen and silent stretches; contact, phone and seam sheets |

Each script has its own tests (`python3 -I scripts/test_*.py` from the skill folder). A pass removes mechanical failures; it never approves the design.

## Nothing is published for you

The skills create local files and review them. Publishing, scheduling, uploading footage to cloud services, paid generation and connecting accounts each need your explicit yes.

## License

MIT
