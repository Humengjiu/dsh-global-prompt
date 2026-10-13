# v0.1.0 社区预览版

为 DeepSeek Harness 增加可保存的全局提示词：从 Web 设置启用并编辑，作用于所有会话的后续系统提示词组装。

这是独立社区项目，未经 DeepSeek 官方收录。仅验证 `Humengjiu/deepseek-harness@efdbb6694b639cf9bf7aeac727d7c0a79a18c0b6`，没有承诺兼容官方最新版。

下载 `dsh-global-prompt-0.1.0.tgz`，按照 README 的对应版本安装方法使用，附带 `examples/global-prompt.patch.yml` 替换旧实现。原始代码与独立版本各有 13 个通过的单元测试；独立类型/构建、真实 Loader 和设置文件重启恢复检查通过。完整 Web 浏览器和模型请求验收尚待补充。

包未发布到 npm。本版本通过 GitHub 社区源码与预览包交付。
