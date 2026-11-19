# OpenMotion workflows

Use OpenMotion for a motion specification, a reference-led film, an editable template or an existing OpenMotion project. Its creative methods and recipes work with the Studio's existing render engines. Choose the OpenMotion runtime when the deliverable needs its project, catalog, editor or export tools.

## Choose the operation

Keep the Content Studio brief, approved copy and brand, project scope and review gates. Treat examples as studies and replace sample copy, logos and metrics with approved material.

| Request | Guide |
|---|---|
| First use of the local Studio or MCP | [OpenMotion entry](openmotion/skills/openmotion/guide.md) and [installation](openmotion/docs/install.md) |
| Design an original film, narrative, action script or sound | [Director](openmotion/skills/openmotion-director/guide.md) |
| Make an original branded film informed by a reference video | [Recreate](openmotion/skills/openmotion-recreate/guide.md) |
| Turn a reference into a reusable editable project | [Video to template](openmotion/skills/openmotion-video-to-template/guide.md) |
| Browse, preview or adapt an existing template, project or ZIP | [Template to video](openmotion/skills/openmotion-template-to-video/guide.md) |
| Continue established work, replace assets, review or export | [Production](openmotion/skills/openmotion-production/guide.md) |
| Generate an image, clip, speech or music cue using OpenMotion | [Media](openmotion/skills/openmotion-media/guide.md) and the Generative Media Studio asset ledger |

Find a visual treatment, static layout, brand kit, script or editing recipe in the [local catalog](openmotion/catalog.md). Inspect relevant `MOTION.md` and `MOTION_DESIGN.md` examples before making a template. Use the linked upstream folder when a recipe depends on full executable template sources or reference media stored outside this snapshot.

## Transfer creative decisions into a project

1. **Intake.** Decide whether the output is a one-off film, an editable template or a revision. Collect the approved story, replaceable material, destination, format and rights. Study the reference with the user's authorized local file or accessible source. Determine what you can observe, what you infer and what you still need to measure.
2. **Specify.** Use the [Motion.md format](openmotion/docs/motion-md.md) to record provenance, brand and linked design rules, aspect ratio, shot order, time boundaries, composition, typography, action, easing, transitions, sound, invariants, replaceable inputs and review evidence. For a reusable job, add asset roles, text limits and behavior for missing inputs or format changes. Keep the evidence and editable project source alongside the spec.
3. **Observe and build.** Start with the highest-risk visual or sound relationship. Use timestamped contacts, crops, trajectories or masks where required. The [reconstruction guide](openmotion/skills/openmotion-recreate/references/reconstruction.md) and its helpers support frame comparisons, mark observation, motion measurement and camera registration. Separate held elements from moving layers, and source timing from the timing of new copy and narration. Use observed evidence to choose a representation, then build editable layers and verify they scrub deterministically.
4. **Revise and verify.** Make substitutions in a working version. Preserve established motion and content for scoped edits. Compare corresponding beats at matched timestamps, including pauses and cuts. Inspect first, last, static and fastest frames, readability, replaced assets, audio sync and playback. Run the existing Studio QA on the MP4. For a reusable project, exercise another valid input and verify the editable files, fonts, licenses and replacement instructions travel with it.
5. **Deliver.** Supply the requested format, a reviewed preview or export, editable source or ZIP when requested, and credits. Report visual inspection, export success, preview visibility and user acceptance separately.

## Runtime

- Discover an existing OpenMotion connection and confirm the project ID and workspace with `openmotion_get_project` before changing anything. Otherwise, continue with the portable workflow and existing engines, or follow the upstream installation guide when the user requests the runtime. The Studio, MCP server, template gallery and providers have their own setup.
- In a managed project, reuse its identity and stable request IDs, confirm revision and version before edits, use returned asset paths and inspect job state before retrying a timed-out mutation. Use the native preflight, preview handoff and export lifecycle in the [runtime guide](openmotion/skills/openmotion-production/references/native.md).
- Use the approved provider, model and inputs for generation. Record job and output identities. Apply the package's permissions for cloud uploads, paid generation and publishing. Keep keys in the configured provider store. Upstream provider preferences and onboarding apply within an authorized OpenMotion runtime task.
- A recipe may need optional tooling or upstream assets. Read its notice and check dependencies before executing it. Check individual terms for fonts, code, footage and other assets.

## Source and notices

The snapshot comes from [OpenMotion at `f27124d`](https://github.com/nexu-io/openmotion/tree/f27124d598d2e54cbb069d74fde666e922b7430e). It includes seven workflows, 104 recipes, 302 motion specifications and their bundled helpers. Upstream `SKILL.md` entrypoints are stored as `guide.md` references. Modified Markdown files carry a notice, and the remix helper uses the renamed guide. The catalog links reference media held in Git LFS. The original material retains the [Apache-2.0 license](openmotion/LICENSE) and the additional notices next to its assets.
