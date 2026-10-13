# 验证记录

验证日期：2026-10-13（Asia/Shanghai）。
环境：Windows x64；Node 24.15.0；pnpm 11.7.0。
兼容基线：`Humengjiu/deepseek-harness@efdbb6694b639cf9bf7aeac727d7c0a79a18c0b6`。

## 已通过

- 原始实现：`pnpm exec vitest run packages/client/ui-global-prompt/tests`，4 个文件、13 个用例通过。
- 独立社区实现：`npm test`，4 个文件、13 个用例通过。仅将插件自引用名改为 `dsh-global-prompt`，保留原功能。
- Host 共享接口：对应 dsh 快照的 `pnpm run build:lib:host` 通过。
- 相关 Client 类型：对应快照的 `pnpm exec tsc -b packages/client/ui-global-prompt/tsconfig.json` 通过。
- 独立插件类型检查和双端构建：`npm run build` 通过。产物含 Node `lib/index.js`、companion `lib/invariant.js`、浏览器工厂 `lib/client.js` 和声明文件。
- 构建产物验收：`npm run smoke` 通过。使用普通 Node、真实 Loader/Include、真实 FileSettingsProvider 和构建后的插件，确认从 YAML 配置启动、默认关闭、persona 后注入、设置落盘、销毁后重启恢复、关闭/空白过滤、卸载清理。
- 浏览器工厂验收：在受控 VM 中确认 id 为 `dsh-global-prompt`、仅请求预期的共享模块、导出 apply/inject 并注入带插件归属的 CSS。它不是 Chromium 界面验收。
- 打包：`npm run pack` 通过，生成 `dist/dsh-global-prompt-0.1.0.tgz`，包含入口、类型、安装覆盖配置和许可证。

## 限制

本记录不证明官方当前主分支、其他 dsh 版本或全部平台兼容。未运行全仓库覆盖率、真实 Chromium 的完整插件安装/设置旅程、with-key 模型请求或日志回放；没有宣称这些检查通过。原始一次直接 Client 编译曾因未生成 Host 接口失败，按实际构建顺序生成 Host 后已通过。

首次 GitHub Actions 已通过：[Plugin checks](https://github.com/Humengjiu/dsh-global-prompt/actions/runs/38418824937)，提交 `ce19bf8322b7ca6b5ed1737fe39f03dd14f79d4c`。它在 Linux 上完成独立测试、构建、产物验收和打包。发布流程再次验证通过后才公开预览版下载包。

## 复现

```sh
npm run setup
npm test
npm run build
npm run smoke
npm run pack
```

已有对应源码快照时，通过 `DSH_HARNESS_DIR` 指定其绝对路径。脚本会校验提交和干净源码状态，不接受不同基线。
