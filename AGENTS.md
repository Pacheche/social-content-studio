# Instructions for agents

This repository holds five skills under `skills/`:

- `skills/content-studio/`: routes any content request and plans campaigns across formats.
- `skills/social-content-studio/`: static posts, carousels, thumbnails, memes, documents, slides and text formats.
- `skills/motion-video-studio/`: videos made from code.
- `skills/footage-edit-studio/`: editing existing footage, clips, podcasts, screen recordings and live streams.
- `skills/generative-media-studio/`: AI images, video, avatars, voice, music and sound, through any route.

To make content, open the `SKILL.md` of the skill that matches the request and follow it.

To change a skill, run its tests before finishing, from the skill folder:

- `python3 -I scripts/test_audit_exports.py` (social-content-studio, needs Pillow)
- `python3 -I scripts/test_media_ledger.py` (generative-media-studio)
- `python3 -I scripts/test_video_qa.py` (motion-video-studio and footage-edit-studio; end-to-end tests need FFmpeg)

`video_qa.py` exists in both video skills so each installs on its own; keep the two copies identical.
`setup_deps.py` exists in every skill for the same reason; keep the five copies identical, and add a new tool to its tables when a skill starts to need it.
