# 从 0.1.0 升级到 0.2.0

0.2.0 使用官方 dsh 0.2.1-alpha.2 的插件接口，不能作为旧开发快照的直接替换。请先确认 dsh 本体版本；本插件不会升级 dsh 或改写你的 session 数据。

## 配置变化

- 原先：插件自行注册 `global-prompt`，本地设置提供者写 `$DSH_HOME/settings.yaml`。
- 现在：插件声明 `enabled`、`text` 为官方 volatile Config；条目 id 固定为 `global-prompt`，值由官方配置编辑器写入 profile patch。
- 原先需要旧 Web bundle 中的 `ui-global-prompt` 行和覆盖文件；现在安装包自带组合层，安装时自动启用。
- 旧 `./invariant` companion 不再提供，新版官方没有旧 invariants 服务。
- 保留原文，包括 `{{…}}`；无需手动转义成 dsh 模板变量。

关闭当前 dsh，保留旧 `settings.yaml`（官方若已导入，可能叫 `settings.yaml.imported`）和现有 profile patch 的备份，停止使用旧版启动覆盖文件，再安装新版预览包并重启。先检查设置中是否已有旧文本：官方迁移器可能已经完成导入。

首次安装组合包会自动启用；更新 profile 中已有的普通依赖时，官方管理器会保留原有启用状态。若升级后设置里没有入口，打开侧栏「插件」，找到社区组合包 `dsh-global-prompt` 并启用，然后按应用提示重启。不要通过版本豁免绕过本包的版本要求。

## 生成迁移建议文件

没有自动恢复旧文本时，可用仓库中的 `scripts/migrate-settings.mjs`。它读取旧设置和当前 profile patch，生成一份保留其他条目、注释和原文的新建议文件；不会覆盖这两个输入文件，也不会覆盖已经存在的输出文件。

```sh
node scripts/migrate-settings.mjs /path/settings.yaml.imported /path/profiles/web/cordis.patch.yml /path/global-prompt-proposed.yml
```

检查建议文件，确认保留其他设置，再用它替换对应 profile 的 patch 并重新启动 dsh。不要把它作为带固定 config 的 `--patch` 启动覆盖：高优先级覆盖会阻止之后的界面保存。多个旧覆盖项同时存在时，工具会拒绝自动合并，留给你检查。

Web 与 Desktop 是不同的 profile；迁移目标必须是你实际使用的那个。Desktop 需先完成自身初始化，并完全退出后才能管理其 profile；本次未验证 Desktop 的实际安装。

## 回退

保留 0.1.0 的源码/预览包和旧 dsh 快照；需要回到旧环境时恢复旧设置文件与原启动方式。不要将旧插件加载到新版官方 dsh。0.2.0 预览包可以通过对应 profile 的插件管理器卸载。
