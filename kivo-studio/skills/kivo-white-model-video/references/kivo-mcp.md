# Kivo MCP handoff in Antigravity

Reuse the Kivo connection bundled with this plugin: server `kivo-studio_kivo`, remote Streamable HTTP endpoint `https://kivst.com/mcp`. Do not create another connection. For sign-in, use Authenticate under Customizations → Installed → MCP Servers, complete Kivo login/consent, and verify the connected account and authorized project.

Antigravity lazy-loads tool schemas. Discover `kivo_catalog_get`, `kivo_projects_get` and the tools below on the installed server. It may expose them through `call_mcp_tool` or direct prefixed names; use the actual discovered binding rather than another host’s wrappers. Local preview runs in the writable shot folder, independently of the MCP connection.

Upload needs read/write access. Paid generation also needs `kivo:generate`; refresh support needs `offline_access`. If a permission is missing, reconnect using the required scopes; do not extract browser credentials or bypass authorization.

## Publish the approved MP4 to the library

1. Confirm the exact project, clip revision and right to upload. Use `kivo_projects_get` for project permissions and payer information. Use `kivo_catalog_get` to check Seedance 2.5's current video reference limits, including duration, total video duration, size and aspect ratio.
2. Inspect the MP4 with `scripts/inspect-mp4.mjs`. Call `kivo_assets_prepare` with the chosen `projectId`, a stable revisioned asset `name`, `contentType: "video/mp4"`, the exact `byteSize`, `category: "scene"` and authorized `rightsConfirmed: true`. Set `noRealPeople: true` only for a wholly synthetic scene with no real-person likeness.
3. Submit the actual file bytes with the returned `upload.url` and every `upload.fields` value. The S3 request is multipart POST with the file field last. If using the included uploader, extract only the returned `upload` object into a temporary file readable only by you. Pass it via stdin and remove it after use. The uploader checks the reviewed SHA-256 and does not print signed fields.
4. On a successful POST, call `kivo_assets_complete` with `assetId` set to the `id` returned by prepare. Poll `kivo_assets_list` until the asset is `ready`. If necessary, use `scope: "all"` to check an upload still being inspected. A ready uploaded reference belongs in the project library. `kivo_assets_addToLibrary` is for generated results.
5. Record the revision, digest and asset ID. If the POST response was lost, reconcile the existing asset and try completion for that ID before preparing a second upload. If inspection fails, report the current state and safe error details. For expired credentials with no uploaded object, prepare a replacement for the same approved bytes. Keep the local MP4 available.

```sh
node "$SKILL_DIR/scripts/upload-s3.mjs" renders/door-r01.mp4 "$APPROVED_SHA256" < private-upload.json
```

Set `SKILL_DIR` to the installed skill directory and `APPROVED_SHA256` to the digest of the reviewed MP4.

## Bind it as a Seedance 2.5 reference

Use the current model ID from the catalog. A white-model MP4 is a video reference. Name the reference's role in the prompt. Put the asset ID in `referenceIds` and bind the same ID in `text` when calling `kivo_prompts_save`. The following is an example with placeholders for ready Kivo asset IDs.

> Follow @[Door blockout](asset:WHITE_MODEL_ASSET_ID) for camera path, shot size, actor trajectory, timing and the final turn. Keep one continuous shot and preserve the actor's starting and stopping positions. Use @[Character design](asset:CHARACTER_IMAGE_ASSET_ID) for appearance and wardrobe. Render the room as a dimly lit concrete hallway, with soft overhead light and a dark wooden door.

For a requested paid shot, quote a small Draft using the saved `promptId` and `promptVersion`. Show the payer the quote, then submit only within the approved scope. Use `acceptedCredits`, `billingVersion` and `modelVersion` from the quote and a stable `idempotencyKey` for that submission. Track existing jobs before retrying an uncertain request. After a successful Draft, quote the production upgrade using that Kivo Draft job ID as `sourceJobId`. Inspect framing, action and timing on the Draft and again after the final.

The bundled `/kivo-studio-production` skill · [Seedance 2.5 model documentation](https://seed.bytedance.com/en/seedance2_5)
