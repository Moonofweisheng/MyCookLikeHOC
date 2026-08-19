# Repository Development Instructions

本项目采用 SDD（Spec-Driven Development）和 OpenSpec 管理行为变更。

## Required workflow

- 新功能、缺陷修复、用户可观察行为、公共接口、数据模型、架构或跨模块重构，必须先创建 OpenSpec change，再修改实现代码。
- 需求尚不清晰时先使用 `$openspec-explore`；需求明确时使用 `$openspec-propose` 生成 proposal、specs、design 和 tasks。
- 提案和规格经用户确认后，使用 `$openspec-apply-change` 实施；实现期间保持 `tasks.md` 状态真实。
- 实现发现新约束时，先使用 `$openspec-update-change` 更新产出物，禁止让代码与规格长期分叉。
- 实现完成后使用 `$openspec-verify-change` 独立核对规格、设计、任务、实现和验证证据；存在 CRITICAL 问题时禁止归档。
- Verify 通过且用户确认完成后，使用 `$openspec-archive-change` 归档并同步 delta specs。
- `$openspec-sync-specs` 仅用于需要在不归档 change 的情况下提前更新主规格；它不是默认主流程步骤。
- 纯文案错别字、注释、格式化和不改变行为的文档维护可不创建 change；一旦边界不确定，按 OpenSpec 流程处理。

## Source of truth

- `openspec/specs/` 描述已交付的系统行为。
- `openspec/changes/<change-name>/` 描述进行中的变更及实现任务。
- `openspec/config.yaml` 提供项目上下文、产出规则和验证要求。
- 不为存量代码一次性补写猜测性的规格；规格随真实变更逐步增长。

## Quality gate

- OpenSpec 产出物使用简体中文正文，并保留校验所需的英文结构关键字。
- 编码前检查 change 的必需 planning artifacts 已完成；纯工具或文档 change 可按 `.openspec.yaml` 使用 `skip_specs: true`。
- 完成前执行 `openspec validate <change-name> --strict`，并运行 `openspec/config.yaml` 中适用于本次改动的工程验证命令。
- 归档前必须完成 `$openspec-verify-change`；WARNING 需要记录处理结论，CRITICAL 必须修复。
- 未执行或无法执行的验证必须在交付说明中明确记录。
