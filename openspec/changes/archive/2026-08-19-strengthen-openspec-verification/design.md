## Context

参见 `proposal.md` 的 Why。当前全局 OpenSpec 配置为 `profile: core`，项目因此生成 propose、explore、apply、update、sync、archive 六个 Codex 技能；Verify 不在 core 集合中。OpenSpec profile 是全局配置，`openspec update` 才会把当前 profile 的工作流生成到本项目 `.agents/skills/`。

当前技能由 OpenSpec 1.9.0 生成，并直接调用 PATH 中的 `openspec` 命令。因此版本策略需要兼顾技能与全局 CLI，而不是只增加一个无法被技能直接解析的项目局部依赖。

## Goals / Non-Goals

**Goals:**

- 在保留现有六个 core 工作流的基础上，只增加 Verify 工作流。
- 把 Verify 放在 apply 与 archive 之间，检查产出物、实现、测试及任务完成状态的一致性。
- 让新环境默认安装与生成技能一致的 OpenSpec 1.9.0。
- 建立明确、可审计的 CLI 升级步骤，避免只升级命令而遗漏项目技能刷新。

**Non-Goals:**

- 不启用 new、continue、ff、bulk-archive、onboard 等其他 expanded 工作流。
- 不将 OpenSpec 加入应用运行时依赖或业务构建产物。
- 不增加 CI、pre-commit 强制门禁或其他 AI 工具集成。
- 不修改应用代码、数据库或业务规格。

## Decisions

### 1. 使用 custom profile 表达 core + verify

将全局 OpenSpec 配置设为 `profile: custom`，工作流固定为：

```text
propose, explore, apply, update, sync, archive, verify
```

随后在项目根目录运行 `openspec update`，生成 `.agents/skills/openspec-verify-change/SKILL.md` 并保留现有六个技能。

选择该方案是因为 core profile 无法单独启用 Verify，而完整选择全部工作流会给项目增加无关命令。替代方案是手工复制 Verify 技能，但下一次 `openspec update` 可能按 profile 将其移除，无法形成稳定配置。

### 2. Verify 成为归档前的显式阶段

仓库流程调整为：

```text
explore（可选） → propose → 人工确认 → apply → verify → archive
```

`openspec-verify-change` 负责独立核对规格、设计、任务、实现和验证证据。Standalone sync 继续保留，但主路径不要求在 Verify 前同步；archive 自身会评估并执行 delta specs 同步，避免主规格提前描述尚未验证的行为。

替代方案是继续依赖 apply 的任务复选框和 `openspec validate`。该方案只能证明产出物结构及任务声明完成，不能独立证明实现满足 Scenario，因此不采用。

### 3. 固定全局 CLI 安装版本，不增加项目依赖

README 将安装命令改为：

```bash
npm install -g @fission-ai/openspec@1.9.0
```

不向 `package.json` 增加 OpenSpec，因为生成技能直接调用 PATH 中的全局命令，并且 OpenSpec 官方初始化流程以全局 CLI 为入口。版本升级必须作为显式维护操作：安装目标版本、运行 `openspec --version`、在项目根目录执行 `openspec update`、审查并提交生成文件。

替代方案是继续使用 `@latest`，但它无法保证新开发环境与仓库中 `generatedBy: "1.9.0"` 的技能一致；仅增加 devDependency 也不能自动改变技能对 PATH 命令的调用。

## Risks / Trade-offs

- [OpenSpec profile 是全局配置，会影响其他项目下一次执行 update 的结果] → 只选择 core + verify，并在实施前记录原配置；其他项目仍需显式运行 `openspec update` 才会改变项目文件。
- [固定 1.9.0 会错过后续修复] → README 提供显式升级流程；升级作为可审查的仓库维护改动执行。
- [Verify 增加一次 Agent 工作流调用] → 仅在实现完成、归档前执行，以较小流程成本换取规格与实现一致性检查。
- [Verify 仍是 Agent 驱动，不等同于 CI 强制门禁] → 保持当前单人/Codex 项目的轻量策略；团队规模扩大后再评估自动门禁。

## Migration Plan

1. 记录当前 `openspec config list` 输出和已安装技能集合。
2. 将全局 profile 更新为 custom，并选择六个 core 工作流加 verify。
3. 在项目根目录运行 `openspec update`，确认生成 Verify 技能且现有技能未丢失。
4. 更新 `AGENTS.md`、README 和必要的 OpenSpec 项目指导，使主流程包含 Verify。
5. 运行 `openspec config list`、`openspec doctor`、change 严格校验以及适用的项目检查。

回滚时执行 `openspec config profile core` 和 `openspec update`，移除 Verify 生成技能，并回退对应文档变更。该回滚不影响应用代码和数据。

## Verification Note

2026-08-19 验证通过：11/11 tasks complete，OpenSpec 严格校验、`openspec doctor`、类型检查和 lint 均通过。记录一个非阻塞 WARNING：custom profile 是用户级配置，不会随仓库提交；新环境若只安装 CLI 后直接执行 `openspec update`，可能使用默认 core profile 并移除 Verify 技能。后续升级或新环境初始化时，必须先恢复 core + verify 的 custom profile，再执行 `openspec update`。
