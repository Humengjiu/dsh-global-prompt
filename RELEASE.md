# v0.2.0：适配官方 dsh 0.2.1-alpha.2

从旧开发快照迁移到官方已发布的 npm 插件接口。保留设置里的开关、多行编辑和跨会话原文注入。

- 改用官方 volatile Config、ConfigForms 和 profile patch 持久化。
- 安装包自带组合层，安装到 Web profile 后自动启用，无需改源码或加旧覆盖文件。
- `{{…}}` 按字面保留；保存失败提供草稿和重试；readonly/non-loopback 不写 Host。
- 增加真实官方 Loader/profile、官方浏览器工厂、组件和保留原文件的迁移检查。
- 已在 Windows 的官方 Web 0.2.1-alpha.2 上完成实际安装、保存、刷新恢复和关闭验收。
- 仅声明已验证的这个官方版本；未进行真实模型请求、Desktop 安装或移动端验收。

下载 `dsh-global-prompt-0.2.0.tgz`，执行：

```sh
dsh plugin --profile web add /absolute/path/dsh-global-prompt-0.2.0.tgz
```

重新启动，打开设置 → 全局提示词。升级旧设置前请阅读仓库的 `docs/upgrade-v0.2.md`。0.1.0 历史预览包仍保留。

社区项目，未经 DeepSeek 官方收录；未发布到 npm。
