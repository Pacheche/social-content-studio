# Instructions for agents

This repository holds three skills under `skills/`:

- `skills/social-content-studio/`: static posts, carousels, stories, copy and hooks.
- `skills/motion-video-studio/`: videos made from code.
- `skills/footage-edit-studio/`: editing existing footage and cutting clips.

To make content, open the `SKILL.md` of the skill that matches the request and follow it.

To change a skill, run its tests before finishing, from the skill folder:

- `python3 -I scripts/test_audit_exports.py` (social-content-studio, needs Pillow)
- `python3 -I scripts/test_video_qa.py` (motion-video-studio and footage-edit-studio; end-to-end tests need FFmpeg)

`video_qa.py` exists in both video skills so each installs on its own; keep the two copies identical.
