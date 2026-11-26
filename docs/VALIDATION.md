# Validation record

Checked 2026-11-26 (Asia/Shanghai). Package validation is distinct from real-client acceptance. Upstream repositories’ older paid tests are not counted as evidence for this plugin.

## Passed

- Official Antigravity CLI **1.5.18**, downloaded from the vendor’s release manifest with its SHA-512 verified; used from a temporary tools directory without changing shell setup.
- `agy plugin validate --strict ./kivo-studio`: **Validation passed**. Discovered **3 skills, 1 MCP server, 0 agents/rules/hooks/sidecars**. Strict mode completed with no errors or warnings.
- Manifest validated against the current official `https://antigravity.google/schemas/v1/plugin.json` JSON Schema.
- All three skills passed the skill-creator frontmatter/naming validator.
- **15 JavaScript modules** passed Node syntax checks; **9 JSON files** parsed, **17 relative Markdown links** resolved. The package contains no symlinks or generated runtime dependency/media directories.
- City workflow tests in a writable copy: **5 passed, 0 failed, 1 skipped**. Covered both plans, brief validation, Chinese prompts, escaped names and portrait/CJK graphics.
- White-model starter dependencies installed from its lockfile in a writable copy; Three.js/GSAP vendor staging succeeded. `hyperframes lint`: **0 errors, 0 warnings**.
- Scanned the allowlisted source bundle for common credential/private-key/signed-URL markers; none found. No application backend, environment files, account receipts or private media were copied.
- Read-only online checks: Kivo OAuth authorization-server and protected-resource metadata returned 200; unauthenticated MCP returned 401 with a resource-metadata challenge. Official Antigravity client metadata returned the public-client identity and `https://antigravity.google/oauth-callback` redirect.

## Not yet verified

- The media-assembly integration test was skipped because FFmpeg/FFprobe are not installed on this machine. The installed plugin still documents these as required local dependencies.
- Full HyperFrames preview/MP4 rendering and visual beat-based QC were not performed in this packaging task.
- Installation into a signed-in Antigravity App, actual OAuth consent/scopes, refresh/revocation behavior, and an end-to-end paid generation/download have not been tested here. Strict validation does not establish these outcomes.
- Marketplace review, listing and co-marketing approval have not occurred. No intake form was submitted.

No customer generation, payment or private asset upload was performed. See [submission checklist](SUBMISSION.md) for the remaining real-client acceptance steps.
