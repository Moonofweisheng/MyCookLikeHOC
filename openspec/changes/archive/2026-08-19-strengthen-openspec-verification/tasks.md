## 1. OpenSpec Profile 与技能

- [x] 1.1 记录当前 `openspec config list`、CLI 版本和 `.agents/skills/openspec-*` 技能集合，作为变更与回滚基线
- [x] 1.2 将全局 OpenSpec profile 配置为 custom，保留六个 core 工作流并增加 verify
- [x] 1.3 在项目根目录运行 `openspec update`，确认生成 `openspec-verify-change` 且现有六个 OpenSpec 技能均被保留

## 2. 仓库开发约束与文档

- [x] 2.1 更新 `AGENTS.md`，将 apply → verify → archive 设为主流程，并把 standalone sync 明确为按需操作
- [x] 2.2 更新 README，将 OpenSpec 安装版本固定为 1.9.0，并补充 CLI 升级后必须运行 `openspec update` 的步骤
- [x] 2.3 更新 README 的 Codex 命令示例和目录说明，加入 `$openspec-verify-change` 与新的归档顺序

## 3. 验证与验收准备

- [x] 3.1 运行 `openspec config list` 和 `openspec doctor`，确认 custom profile、verify 工作流及项目根目录解析正确
- [x] 3.2 检查全部生成技能的 `generatedBy` 版本、`.openspec-target` 和文件集合，确认版本与工具目标一致
- [x] 3.3 运行 `openspec validate strengthen-openspec-verification --strict` 和 `git diff --check`
- [x] 3.4 运行 `pnpm type-check` 与 `pnpm lint`，记录结果及任何非阻塞警告
- [x] 3.5 人工核对 README、`AGENTS.md` 与实际安装技能的命令名称和流程顺序一致
