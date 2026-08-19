## Why

当前 OpenSpec 接入能够生成、实施和归档变更，但缺少独立检查“实现是否满足规格”的 Verify 阶段；同时 README 使用 `@latest` 安装 CLI，与仓库内由 OpenSpec 1.9.0 生成的技能存在版本漂移风险。现在补齐这两点，可以在不引入 CI 强制门禁的前提下形成更可靠、可复现的 SDD 闭环。

## What Changes

- 在项目的 OpenSpec 工作流中启用独立 Verify 能力，并生成 Codex 对应的验证技能。
- 将仓库级流程调整为 propose → 人工确认 → apply → verify → archive；规格同步由 archive 流程处理，保留 standalone sync 作为按需能力。
- 将 README 中的 OpenSpec 安装版本固定为 `@fission-ai/openspec@1.9.0`，与当前生成技能保持一致。
- 补充统一升级步骤：更新全局 CLI 后在项目内运行 `openspec update`，并检查、提交重新生成的技能文件。
- 更新 `AGENTS.md` 和 README，使 Verify 成为实现完成后的必经质量检查。
- 不增加 CI 强制 SDD 门禁，不扩展 Cursor/Trae 集成，不改变应用功能或运行时依赖。

## Capabilities

### New Capabilities

无。本次改动只涉及开发工具和流程文档，已通过 `.openspec.yaml` 的 `skip_specs: true` 明确跳过业务规格。

### Modified Capabilities

无。当前尚无需要修改的应用行为规格。

## Impact

- 受影响文件：`.agents/skills/` 下的 OpenSpec 生成技能、`.agents/skills/.openspec-target`、`AGENTS.md`、`README.md`，以及必要时的 OpenSpec profile 配置结果。
- 外部依赖：开发者全局安装的 `@fission-ai/openspec` CLI；版本固定为 1.9.0。
- 兼容性：不影响 H5、微信小程序、Supabase、业务代码或构建产物；现有 OpenSpec change 结构保持兼容。
- 数据迁移、安全与隐私：不涉及数据库、Storage、凭据或用户数据。
- 非目标：不新增 CI 门禁，不为存量应用补写基线 specs，不配置 Codex 之外的 AI 工具。
