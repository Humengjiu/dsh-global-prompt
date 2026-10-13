# dsh-global-prompt

在 DeepSeek Harness 设置里保存跨会话的固定指令：一个开关、一段文本，作用于安装此插件的 profile。

[下载 v0.2.0 预览版](https://github.com/Humengjiu/dsh-global-prompt/releases/tag/v0.2.0) · [English](README.en.md) · [验证记录](docs/validation.md)

独立社区插件，由 Humengjiu 维护，采用 MIT 协议；未经 DeepSeek 官方收录。

## 兼容范围

| 插件版本 | 已验证的 dsh |
| --- | --- |
| 0.2.0 | 官方发布版 **0.2.1-alpha.2**，tag `dsh-v0.2.1-alpha.2`，提交 `d743267388641bc76f17c45ce8b4c231aed1d32c` |
| 0.1.0 | 原开发分支快照，见 [历史预览版](https://github.com/Humengjiu/dsh-global-prompt/releases/tag/v0.1.0) |

本次已在 Windows 上使用官方 npm 发布包验证 Web 安装和实际网页操作。桌面应用使用相同的 Web 插件协议，但尚未单独进行桌面安装验收。未来 dsh 版本可能改变插件 API；本包声明准确的版本要求，不需要设置兼容性豁免。

## 安装到 Web

1. 确认 dsh 版本为 `0.2.1-alpha.2`。
2. 下载 `dsh-global-prompt-0.2.0.tgz`。
3. 在终端执行：

```sh
dsh plugin --profile web add /absolute/path/dsh-global-prompt-0.2.0.tgz
```

然后重新启动 dsh Web，打开 **设置 → 全局提示词**。打开开关后输入固定指令，等待保存完成。

安装包自带 profile 组合层，会自动注册 `global-prompt` 条目；无需修改 dsh 源码，也不需要旧版 `--patch global-prompt.patch.yml`。含空格的文件路径请加引号。也可在 dsh 的社区插件安装界面使用该预览版安装包的下载 URL。

首次安装默认启用。若这是更新已安装的旧包，官方会保留其启用状态；设置入口未出现时，在侧栏「插件」中启用 `dsh-global-prompt`，再按提示重启。

默认关闭、文本为空。设置通过官方实时 ConfigForms 保存到对应 profile 的 `cordis.patch.yml`，默认 Web 路径为 `$DSH_HOME/profiles/web/cordis.patch.yml`。服务端对过期的编辑版本进行冲突检查；保存失败会显示提示，当前页面的文本草稿保留并可重试。远端连接或只读状态下不进行 Host 写入。

## 从 0.1.0 升级

旧版使用独立的 `settings.yaml` 命名空间；新版使用官方 volatile Config 和 profile patch。请保留旧文件，移除旧版启动覆盖文件的使用，再安装新版组合包。详细步骤和不覆盖原文件的迁移工具见 [升级指南](docs/upgrade-v0.2.md)。

## 行为与模型影响

启用且文本非空白时，`user:global-prompt` 在 deployment persona prefix 之后贡献原文；关闭、清空或只有空白时不贡献内容。包括 `{{variable}}` 在内的文本会按字面保留，不作为 dsh 插值表达式执行。每次组装读取当前实时配置；修改会通知提示词消费者，不重启插件。

内容增加对应的模型输入 token；修改会改变 KV-cache 前缀。作用范围是安装该组合包的 profile 内的会话。官方明确声明的完整 system prompt 会覆盖其他 section，这个规则仍然有效。

## 开发

开发依赖直接来自官方已发布的 npm 包，不再依赖克隆旧开发分支。

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm run build
pnpm run smoke
pnpm run pack
```

Node `^22.19.0 || >=24`，pnpm 11.28.5。构建生成 Node 入口、浏览器闭包工厂、CSS 和类型声明；预览包输出到 `dist/`。GitHub Actions 验证通过后，带版本的 tag 会发布预览包、源码包和校验文件。

## 验证与限制

已验证真实 Loader/profile 持久化与重启、官方浏览器设置/renderer/locale 工厂、保存失败草稿和重试、真实 dsh Web 安装、启用、输入、刷新恢复和关闭。具体结果见 [验证记录](docs/validation.md)。

未进行真实模型 API 调用、桌面应用安装或移动端验收。每次文本变化仍单独排队保存，尚未增加防抖。该插件没有发布到 npm，本次通过 GitHub 预览包交付。

## 来源与许可证

源于 Humengjiu 的 [原始实现](https://github.com/Humengjiu/deepseek-harness/pull/1)，保留 MIT 授权和原始版权说明，见 [LICENSE](LICENSE)、[NOTICE](NOTICE)。
