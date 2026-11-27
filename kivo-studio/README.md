# Kivo Studio

Create original city cinematics, white-model camera previs, and films with a shared Kivo Studio account and project library. This Antigravity plugin includes three skills and a remote Kivo MCP connection.

## Included skills

| Skill | Workflow | Local requirements |
| --- | --- | --- |
| `/kivo-city-cinematics` | City brief → concept map → references → comparable Drafts → selected native final → edited MP4 | Node.js ≥22.12, npm, FFmpeg/FFprobe with libx264; a CJK font for Chinese graphic labels |
| `/kivo-white-model-video` | Shot brief → editable Three.js camera/blocking previs → local preview and inspected MP4 → optional authorized Kivo reference upload | Node.js ≥22, npm, Chromium with WebGL, FFmpeg/FFprobe |
| `/kivo-studio-production` | Shot planning, scene consistency, Draft selection, native finals, sound/subtitle QC and delivery | Local files/editor; FFmpeg/FFprobe for media QC |

Skills and the connection are installed together. Local previs and planning do not require a Kivo account or spend credits. Kivo generation needs a Kivo account, authorized project access and sufficient project-payer credits. Additional model, upload and resolution limits come from the current catalog.

## Install before Marketplace publication

From a clone of [the source repository](https://github.com/miraga-kivo/kivo-studio-antigravity-plugin), validate and install its `kivo-studio/` folder:

```sh
agy plugin validate --strict ./kivo-studio
agy plugin install ./kivo-studio
agy plugin list
```

This is a source-distributed plugin; it is not yet listed or certified in the Antigravity Marketplace. After installing, open Customizations → Installed to verify the plugin and its skills.

## Connect your Kivo account

1. Under Customizations → Installed → MCP Servers, Authenticate the Kivo server if prompted.
2. Complete Kivo browser sign-in with email or Google, review the requested access and approve it.
3. Return to Antigravity and follow its authorization-code/connection prompt. Ask it to list your projects first, without generating.

The bundled configuration uses remote Streamable HTTP at `https://kivst.com/mcp`. Antigravity discovers OAuth PKCE and the client metadata/registration flow. Do not add a second server or paste API keys, website tokens or passwords into JSON. The installed server is namespaced as `kivo-studio_kivo`; actual tool bindings are discovered at runtime.

Read/write/generation access is needed for creative workflows; billing access is optional for personal ledger/checkout. Refresh requires `offline_access`. If a grant lacks required access, reconnect through the client with those scopes. Disconnect from Kivo's connected-app settings or sign out from the MCP connection when desired. Kivo project permissions still apply; shared-project generation bills the project creator.

## First use

- “List my Kivo projects and available models. Do not generate anything.”
- “Use `/kivo-city-cinematics` to plan an original city trailer. Start with the map and shot list, then show the credit quote.”
- “Use `/kivo-white-model-video` for a five-second alley orbit. Give me the local preview and MP4; do not upload yet.”
- “Use `/kivo-studio-production` to make a short film. Start with the shot list, continuity notes and budget.”

The installed plugin directory is read-only and replaced during updates. City cinematics copies its entire skill to a writable project folder before `npm ci`. White-model previs copies only its bundled starter into a writable shot folder. Production saves scripts, ledgers, EDLs and exports in the user's project. Dependencies are locked in the copied package files, and installed only when those local workflows are used.

## Credits, files and privacy

Generation and optional model operations use Kivo's existing credit system. The agent quotes exact parameters before paid jobs and submits only within user-approved scope/budget. Failed/unknown submissions must be reconciled before retry; selected Drafts are upgraded only after a new quote. Installing the plugin does not buy credits or authorize spending.

Authorized uploads send the chosen source bytes to Kivo's signed storage endpoint, followed by Kivo inspection. MCP is not a base64 file tunnel. Do not upload private work to this public source repository. Keep account identifiers, project receipts, signed links and generated customer media in the user's workspace/private storage.

White-model local exports are reference animation, not guaranteed model motion transfer. City maps are fictional concepts, not navigational data or copied game maps. Native source quality and audiovisual/continuity QC must be inspected; a higher-resolution container is not a native model upgrade.

## Troubleshooting

- No tools: verify the plugin/server is enabled, authenticate, reconnect and rediscover schemas.
- Insufficient scope: reconnect with the needed Kivo scope; do not substitute browser credentials.
- Local render fails: verify Node, FFmpeg/FFprobe, Chromium/WebGL and the copied workspace dependencies. Each local skill has detailed troubleshooting references.
- Expired download/upload URL: request a fresh signed URL through Kivo; reconcile an uncertain existing upload/job before creating another.

[Kivo MCP guide](https://kivst.com/en/mcp) · [Privacy](https://kivst.com/privacy) · [Terms](https://kivst.com/terms) · [Support](https://kivst.com/contact)

## License

This plugin is released under the [MIT License](LICENSE). The license applies to the plugin source code and documentation in this repository. Kivo hosted services, accounts, and generation services remain subject to their [Terms of Service](https://kivst.com/terms).

## 中文说明

安装插件后，三个 Skill 和 Kivo MCP 连接一起生效。首次使用云端功能时，在 Antigravity 的 Customizations → Installed → MCP Servers 完成 Kivo 登录授权；无需再手动添加 MCP 地址或填写 API Key。

白模预演和本地规划可以先离线完成。城市地图、Three.js/HyperFrames 渲染与剪辑仍需本机 Node.js、FFmpeg 等依赖，使用时安装到可写的项目副本中。插件本身不会自动安装系统软件。云端生成前先报价并确认预算，积分和项目权限沿用 Kivo 网站；不会因安装插件自动充值或扣费。

当前为可本地安装的源码插件，尚未完成市场审核。源仓库的适配说明、来源版本与验证记录位于仓库根目录文档中。
