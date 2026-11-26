# Kivo workflow for the installed Antigravity plugin

## Connection and tool discovery

The plugin's root `mcp_config.json` configures `https://kivst.com/mcp`; the resulting server is `kivo-studio_kivo`. Use its connected tools directly. Antigravity can call lazy tools via `call_mcp_tool` with the discovered server/tool names, or expose a prefixed direct tool. Read the live schema, then use that binding. Dotted action names and old `user-kivst` wrappers are not callable Antigravity tool names.

Authenticate through Antigravity's MCP sign-in UI. Kivo supports OAuth PKCE, Client ID Metadata Documents and dynamic registration. Never embed API keys, website sessions or bearer tokens in skill files. Verify identity with `kivo_account_get` and project access/payer with `kivo_projects_get`. Read/write/generation scopes are required for production; billing is only needed for the caller's ledger or checkout. An `offline_access` grant enables refresh. If scopes are missing, reconnect rather than working around them.

## Discover current capabilities

Use `kivo_catalog_get` before model selection, quoting or submitting. Read model IDs, enabled state, per-stage resolutions, ratios, duration, per-type reference limits, audio policy, Draft/final availability, expiry and platform limits. Do not copy fixed model lists, prices, tool counts or ceilings from an older skill version. Only choose a native Draft/final workflow when the selected model advertises it.

Core tools include account/catalog, `kivo_projects_*`, `kivo_assets_*`, `kivo_prompts_*` and `kivo_jobs_*`. The server may also expose template and editor tools; inspect their actual schemas before using them. The production workflow does not require calling every exposed tool.

## Upload authorized references

1. Inspect the exact local file and byte size. Obtain authorization for the destination/project and rights to the material.
2. `kivo_assets_prepare`: use current required fields, including `projectId`, name, MIME type, actual byte size, category and authorized `rightsConfirmed:true`. Set `noRealPeople:true` only when accurate.
3. Send real bytes outside MCP to the returned HTTPS S3 `upload.url`, with all `upload.fields` and the file field last in multipart/form-data. No base64 via MCP. Keep signed fields in a private temporary file, never in source control or logs.
4. `kivo_assets_complete` with the returned asset ID; poll `kivo_assets_list` until ready. Reconcile interrupted uploads before preparing duplicates. Uploaded references already belong to the library; `kivo_assets_addToLibrary` is for eligible generated results.

## Save video prompts

Use `kivo_prompts_save` for reusable VIDEO prompts. Bind ready asset IDs using `@[name](asset:ID)` and `referenceIds`; Kivo translates provider-specific notation. Keep returned prompt ID/version. Updates include `promptId` and `expectedVersion`; resolve conflicts by reading the current prompt before editing. Image/audio text belongs in the generation request rather than the saved video-prompt library.

## Quote and submit within budget

Quote the exact intended request with `kivo_jobs_quote`. Stages are `asset`, `draft`, `production`; use `draft` with a saved prompt ID/version when the model supports native Drafts. Show total credits and obtain spending authorization. A user-provided budget can cover subsequent quotes within that scope; count completed charges and accepted pending work against the cap.

Create with the same creative inputs, model and normalized parameters, plus `name`, one logical-request `idempotencyKey`, and the quote's `totalCredits` as `acceptedCredits`, `billingVersion` and `modelVersion` unchanged. Do not manufacture missing versions or reuse an old price after parameters change. Quote does not reserve credits. Project creators pay for shared-project generation; the connected account's personal balance is not always the payer balance.

Poll `kivo_jobs_get` or `kivo_jobs_list` roughly every 10 seconds with a deadline/backoff. Persist job IDs immediately. Pending and `submission_unknown` jobs remain counted against the budget; reconcile their existing state after timeouts, never blindly create with a new key. Surface failures with safe diagnostics. Only a genuinely new authorized attempt gets a new key. Cancellation is limited to queued work before provider submission.

## Select, upgrade and deliver

Review playable Drafts and lock the selected Kivo job/asset mapping. Quote production with `stage:production`, the successful unexpired same-model Kivo `sourceJobId`, and a catalog-supported final resolution. The source snapshot supplies content, references and duration; do not silently change the shot. Use native final output rather than relabeling an upscaled Draft.

Fetch current short-lived URLs with `kivo_assets_url`; download only to authorized local/private storage. Signed URLs are not stable identifiers and must not enter public manifests. Keep immutable clean parents, EDL, subtitles, checksums and QC notes in the writable project. Inspect the assembled film for audiovisual timing, continuity, legibility and native source quality.

## Optional browser editor collaboration

If the user wants Kivo's editor, ask them to use Connect Agent in their editor, then discover `kivo_editor_sessions` and the appropriate read/edit tools. Select the intended edit/session. Read current revisions before mutation; quote any paid export/generation separately. Do not replace their timeline with local assumptions. This is optional; offline EDL/QC does not require an editor connection.
