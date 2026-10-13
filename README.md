# dsh-global-prompt

给 DeepSeek Harness 增加一处可持久保存的全局提示词设置：开启后，固定指令会注入所有会话后续请求的系统提示词。

[English](README.en.md) · [原始实现](https://github.com/Humengjiu/deepseek-harness/pull/1)

这是 Humengjiu 维护的独立社区插件，采用 MIT 协议；不是 DeepSeek 官方插件，也未被官方收录。

## 支持范围

**v0.1.0 是锁定旧开发版本的社区预览版。** 支持的完整代码快照是：

- 仓库：`Humengjiu/deepseek-harness`
- 提交：`efdbb6694b639cf9bf7aeac727d7c0a79a18c0b6`
- 该快照的工作区包版本：`0.1.0-rc.5`

没有验证官方最新版本或 npm 上的 `0.0.1-rc.1`。不要仅凭类似版本号判断兼容性。对应的开发包没有以同一版本全部公开到 npm，因此本仓库通过锁定的源码快照提供开发依赖，而不是自动安装另一个 dsh。

## 功能

- 在 Web 设置中注册「全局提示词」入口，提供开关和多行文本框。
- 默认关闭，默认文本为空。
- 使用既有 `global-prompt` 设置命名空间保存 `enabled` 和 `text`。
- 启用且文本非空白时，以 `user:global-prompt` 段、order 5 插入 persona 之后，保留输入原文。
- 每次提示词组装读取最新设置；关闭或清空后，后续请求不再包含该段。
- 加载时禁用控件，关闭时禁用文本框；聚焦编辑保留草稿，失焦时同步已提交值。
- 提供中英文界面。

## 开发与打包

准备 Git、Node `^22.19.0 || >=24` 和 pnpm 11.7.0。本仓库的脚本会把开发依赖放在 `.work/harness`，不改动该快照的源码。

```sh
npm run setup
npm test
npm run build
npm run smoke
npm run pack
```

已有干净的对应 dsh 快照时，可设置 `DSH_HARNESS_DIR` 指向它，减少重复下载。脚本会拒绝其他提交或含已跟踪源码修改的快照。

`npm run build` 先生成 Host 共享接口并检查相关 Client 类型，再构建本插件的 Node 入口、invariant 入口和浏览器闭包工厂。浏览器包使用锁定快照的官方打包预设，CSS 随插件注入。

`npm run pack` 在 `dist/` 生成 `dsh-global-prompt-0.1.0.tgz`。运行时工厂 id 为 `dsh-global-prompt`；本插件不使用官方 npm 命名空间。Host 提供的 peer 标记为 optional，仅用于防止包管理器自动下载第二套不兼容的 dsh；实际运行仍需要上面的对应 Host 服务。

## 安装到支持的 Web profile

以下步骤仅适用于上面的锁定快照。先确认该快照已完成完整 dsh 构建，下载本插件的预览包，然后在 dsh 仓库根目录运行：

```sh
pnpm dsh plugin --profile web add /absolute/path/dsh-global-prompt-0.1.0.tgz
pnpm dsh web --patch /absolute/path/global-prompt.patch.yml
```

`examples/global-prompt.patch.yml` 用相同的 `ui-global-prompt` 行 id 替换旧实现，避免两份插件同时注册同一设置和提示词段。首次使用社区版也需要这个覆盖文件。可使用绝对 Windows 路径，并给含空格的路径加引号。

启动后打开设置 → 全局提示词，打开开关并输入文本。持久存储遵循 Host 既有设置服务，本地提供者默认写入 `$DSH_HOME/settings.yaml`。远端浏览器是否写入 Host 遵循该快照的 settings-scope 策略，不能视为任意远端都支持持久化。

## 验证范围

原实现与独立版本的检查结果见 [验证记录](docs/validation.md)。

现有测试覆盖 Host 注入/关闭/空白过滤、设置绑定/写入路由/卸载、组件草稿/失焦交互及 companion 注册。它们使用内存设置提供者、测试传输和 jsdom，不能替代真实浏览器、磁盘持久化重启、或模型请求日志验收。

## Model Experience

启用的文本会出现在所有会话的后续模型请求中，带来对应 token 开销；关闭或空白文本不增加该段。修改或切换设置会改变系统提示词，可能使 KV-cache 前缀失效。它仅提供全局偏好，单个会话的差异仍由 agent preset/persona 管理。

## Known Limitations and Deferred Work

- 尚未适配官方当前版本。
- 每次文本变化都会触发写入，未实现防抖。
- 已通过 Loader 配置加载和文件持久化重启检查；仍需真实 Web 场景、模型请求日志和失败路径的验证。
- 尚未发布到 npm；本次交付是 GitHub 社区源码与可打包的预览版本。

## 来源与协议

代码源于 Humengjiu 的全局提示词 PR 和 MIT 授权的 DeepSeek Harness。保留原始版权与许可证，详见 [LICENSE](LICENSE) 和 [NOTICE](NOTICE)。官方目前建议通过带有 `dsh-plugin` topic 的社区项目贡献插件，见 [贡献说明](https://github.com/deepseek-ai/deepseek-harness/blob/master/CONTRIBUTING.zh.md)。
