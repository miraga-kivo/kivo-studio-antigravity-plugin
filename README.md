# Kivo Studio for Antigravity

An Antigravity plugin bundling Kivo's remote MCP connection and three creative skills: **City Cinematics**, **White-model Video**, and **Studio Production**.

The plugin root is [`kivo-studio/`](kivo-studio/). Start with its [README](kivo-studio/README.md) for authentication, prerequisites, credits, privacy and usage.

```sh
git clone https://github.com/miraga-kivo/kivo-studio-antigravity-plugin.git
cd kivo-studio-antigravity-plugin
agy plugin validate --strict ./kivo-studio
agy plugin install ./kivo-studio
```

After installation, authenticate Kivo from Customizations → Installed → MCP Servers. Skills use the bundled connection directly; no second MCP setup or API key is required. Node/FFmpeg/Chromium are needed only for the corresponding local rendering workflows.

**Status:** source plugin prepared for local installation and Marketplace review. This repository does not imply Marketplace acceptance, Google certification or a completed Antigravity end-to-end generation test. See [validation](docs/VALIDATION.md) and [submission checklist](docs/SUBMISSION.md).

## Included workflows

| Skill | Use it for |
| --- | --- |
| `/kivo-city-cinematics` | Original open-world city/character trailers with editable map graphics and selected native finals |
| `/kivo-white-model-video` | Local Three.js/HyperFrames camera and blocking previs, then optional Kivo reference upload |
| `/kivo-studio-production` | Film planning, shot consistency, candidate selection, production upgrades, audiovisual QC and delivery |

Source repositories and pinned commits are recorded in [SOURCES.json](SOURCES.json). MIT notices and original-author copyright statements for the city and white-model skill files are preserved in those subtrees. The upstream production skill repository originally had no selected license; that historical fact is unchanged. This repository's grant covers the corresponding content here that Mira AI Limited owns.

## License

This plugin is released under the [MIT License](LICENSE). The license applies to the plugin source code and documentation in this repository.

Kivo hosted services, accounts, and generation services remain subject to their [Terms of Service](https://kivst.com/terms).

## 中文

这是 Kivo Studio 的 Antigravity 插件源码，包含三个 Skill 和已配置的 MCP 连接。安装后在客户端完成一次 Kivo 登录授权，Skill 即可使用插件工具。云端生成沿用 Kivo 的积分、权限与报价流程；本地预演仍需要 Node.js、FFmpeg、Chromium 等依赖。

插件目录是 `kivo-studio/`。当前尚未上架市场，真实客户端安装、OAuth 刷新与生成录屏的完成状态见验证文档。
