# 0.2.0 适配验证记录

日期：2026-10-14（Asia/Shanghai）。
目标：官方发布版 `dsh-v0.2.1-alpha.2`，提交 `d743267388641bc76f17c45ce8b4c231aed1d32c`。
运行环境：Windows x64、Node 24.15.0、pnpm 11.28.5；直接使用官方 npm 包，而非旧开发分支的链接依赖。

## 已完成的证据

完整测试运行：4 个文件、17 个用例全部通过。

- Host：真实官方 Loader、profile 组合层、SettingsForms 和 ConfigEditor。默认值、自定义页面策略、volatile 原地更新、字面括号、提示词变更通知、持久化/重启、版本冲突和卸载清理通过。
- 浏览器接线：执行官方发布的 ui-renderer、ui-settings、locale 闭包工厂，使用其真实 ConfigForms，验证加载状态、字段写入、revision、非 loopback 拒绝写入及卸载。
- 组件：实际官方 Switch 原子组件、只读/加载状态、聚焦草稿、失焦同步、保存拒绝/异常保留草稿与重试、开关失败回退。
- 迁移：提议文件保留旧设置、当前 profile 文件、邻近条目和注释；不覆盖现有输出。
- 类型与构建：独立 TypeScript 编译、Host ESM、浏览器 CJS 工厂和内联 CSS 通过。
- 构建产物：普通 Node 加载实际 `lib/index.js`，再经官方 profile/Loader 验证字面注入、profile patch 落盘与重启恢复。
- 安装：使用官方 npm CLI 将打包产物安装到隔离的 Web profile。组合包自动加入 `dsh.profile.bundles`；没有设置版本豁免。
- 实际网页：官方 0.2.1-alpha.2 Web 正常加载；设置里出现全局提示词，启用后可输入，保存含 `{{literal}}` 的文本，刷新后开关/文本恢复，关闭被保存。浏览器没有相关 warning/error。
- UI 证据：Codex 内置浏览器、1280×720 桌面视口；没有空白页、框架错误遮罩、控件溢出或不可读文本。测试过程中跳过模型密钥配置，不发送模型请求。

## 检查命令

```sh
pnpm test
pnpm run build
pnpm run smoke
pnpm run pack
```

实际 CLI 安装使用隔离的 `DSH_HOME`，没有改动用户现有 dsh 环境。Web 测试服务器仅监听 127.0.0.1，端口由系统分配。

## 边界

未运行真实模型 API 调用、桌面应用安装或移动端验收。验证的是模型输入的官方组装路径及真实设置链路，不能据此宣称模型一定遵循每条指令。部分官方 npm 包带有未随包发布的 source-map 引用，Vitest 会输出找不到 map 的调试警告；它不影响通过的运行检查或实际浏览器，且没有修改第三方安装文件。
