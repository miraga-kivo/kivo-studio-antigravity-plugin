---
name: kivo-city-cinematics
description: Create original open-world game-style city trailers and character-introduction videos from a city, locations and character brief, using Kivo Studio MCP plus local concept-map and video assembly tools. Use for GTA-like urban cinematic aesthetics with original worlds and assets, not playable games or navigational maps.
---

# Kivo City Cinematics

Turn a short city brief into an original concept map, consistent environment and character references, comparable video Drafts, and a selected final cut. Deliver the video and editable local sources; leave the project and generation results accessible in Kivo Studio.

## Use the installed Kivo connection

Antigravity installs the connection with this plugin. Use its `kivo-studio_kivo` server and discover the live `kivo_*` tools; do not add a second MCP connection or ask for API keys. If sign-in is needed, use Authenticate under Customizations → Installed → MCP Servers, then complete Kivo login and consent. Read the tool schema before calling it. Antigravity may expose tools through `call_mcp_tool` or a prefixed direct tool; use the actual discovered binding.

## Start with the brief

Use the user's city, 1–6 places, character name/appearance, aspect ratio and budget. Infer reasonable visual details and show a compact proposed direction. Preserve the user's prompt language. The local graphic renderer has English and Chinese labels; for other languages adapt labels without translating the user's creative intent into English by default.

Choose `character-intro` for a compact 12-second proof (two reference images, a five-second hero clip, local map and titles). Choose `city-trailer` for a 15-second cut with a separate moving city shot. Templates are starting points, not promised generation prices or mandatory durations. Read [shot recipes](references/shot-recipes.md) when composing or reviewing shots.

Use original characters, architecture and graphic assets. Translate a franchise-style request into concrete camera, lighting and game-rendering characteristics; do not put franchise titles or logos on the film or reproduce an existing game map. A supplied real city can inspire the world, but the generated map is explicitly fictional and cannot be described as geographically accurate. This produces a cinematic, not an interactive game or captured gameplay.

## Prepare without spending

The installed plugin directory is read-only and replaced on update. Copy this **entire skill directory** into a new writable folder in the user's project; run all planning, dependency installation, rendering and tests from that copy. Do not run `npm ci` inside the installed plugin. From the writable copy, run `npm ci` once. Require Node ≥22.12 and FFmpeg/FFprobe with libx264. Set `FFMPEG_BIN` / `FFPROBE_BIN` only when binaries are not on PATH.

```bash
npm run doctor
node scripts/plan.mjs --brief examples/neon-harbor.json --out work/my-city
node scripts/render-map.mjs --brief examples/neon-harbor.json --out work/my-city
```

Copy and edit the example brief first; never overwrite an existing user's work directory. These scripts make no model/API requests. `plan.json` contains prompt scaffolds and a generation checklist; `assembly.json` is an editable local cut. Inspect map PNGs, including localized labels, before upload. Create a private journal outside the distributable skill: project ID, asset IDs, prompt versions, quotes, job IDs, idempotency keys, budget and selection decisions. Resume from that journal; do not persist signed URLs, tokens or private user information in public examples.

## Generate through Kivo MCP

Read [the MCP workflow](references/mcp-workflow.md) before the first upload or generation. Discover the connected account, catalog and project payer; never assume the browser account is the MCP account. Reuse the plugin’s authenticated Kivo connection. If authorization lacks `kivo:generate`, ask the user to reconnect; do not work around permissions.

1. Create a project or reuse the user-selected one. Upload the locally rendered map when it helps relative city composition. Obtain actual file size before `assets.prepare`; upload real bytes directly to S3, complete, then wait for `ready`.
2. Generate one environment reference. Inspect it before generating the character reference using that environment as an image reference. Keep a small city/character bible: outfit, proportions, time of day, geography and palette. Generated reference images are downloadable outputs; use their returned asset IDs and add them to the library when appropriate.
3. Save a named **video** prompt with stable asset bindings. Request a small candidate batch using the live model's Draft resolution. Do not write a new image prompt into the project's video-prompt library.
4. Quote each stage and show the complete estimated budget before paid work. Obtain agreement, or use the user's existing explicit test budget. Count delivered charges plus accepted pending quotes against that cap. Request fresh quotes after parameters change. There is no universal fixed credit price in this skill.
5. Poll returned job IDs about ten seconds apart. Keep one idempotency key per logical submission; reconcile unknown submissions using jobs.list rather than submitting again. Stop on terminal failure and surface diagnostics; retry only with a concrete correction and within the approved budget. A pending/unknown job still counts against the budget.
6. Compare playable candidates and inspect first/middle/last frames for character identity, terrain continuity, limbs, camera motion and unwanted cuts. Let the user choose unless they authorized autonomous selection. Record why a candidate was chosen.
7. Quote a single final with its successful, unexpired, same-model `sourceJobId`. A final inherits the selected Draft's snapshot; do not rewrite its prompt or add references. Use the model's supported final resolution. Download the actual final for assembly; do not label a locally enlarged Draft as an HD/4K model output.

Do not hardcode reference tags for upstream providers. Save `@[name](asset:ID)` bindings and `referenceIds`; Kivo performs provider-specific translation. Check the selected model’s per-type and aggregate reference-duration limits from the live catalog; video and depth references share the applicable video-duration budget. Use actual metadata seconds; unknown duration needs inspection before submission. A concept-map PNG is an image reference and has no video duration.

## Assemble and verify

Download short-lived asset URLs only into the user's work directory. Supply `city.png`, `hero-selected.mp4` and (for `city-trailer`) `city-selected.mp4` alongside the map, HUD and endcard, or edit manifest paths. Keep the raw selected final separately.

```bash
node scripts/assemble.mjs --manifest work/my-city/assembly.json --out work/my-city/cinematic.mp4
```

The renderer makes a 1920×1080 or 1080×1920 MP4. It uses a static city plate in the compact template and an optional original minimap overlay on the hero clip. Set `hudPosition` to `bottom-right` (default), `bottom-left`, `top-right` or `top-left` after checking character placement; remove `hud` when a clean cinematic is preferred. It intentionally makes a **silent** edit unless `assembly.json` supplies an `audio` file. It does not preserve source clip sound automatically: confirm sound requirements before generation, use `generateAudio:false` for a silent plan, and never silently discard requested sound. Any music/voice generation needs its own quote and budget. Assembly resolution does not change the source model's native quality.

Inspect the encoded cut, not only source frames. Check duration, orientation, black frames, map/title legibility and overlay placement. Include a preview, the selected raw final, editable brief/map/manifest and a short report with actual credit cost and limitations. Clearly distinguish a single five-second generated hero shot in a 12-second edited film from twelve seconds of generated animation. Do not publish to social media or GitHub unless requested.

`node scripts/review-clip.mjs --video work/my-city/hero-selected.mp4 --out work/my-city/hero-review.png` creates six time-spaced frames and a JSON report with native dimensions, duration and audio-stream count. Use this for every compared candidate and the final edit; frame sampling complements playback and cannot prove that no artifact occurs between samples.
