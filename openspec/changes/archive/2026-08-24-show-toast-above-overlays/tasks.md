## 1. 全局 Toast 层级修复

- [x] 1.1 在全局 Toast 默认配置中设置高于普通业务弹层的 `zIndex`，并确认调用方显式配置仍可覆盖默认值。
- [x] 1.2 在 `scripts/smoke-ui.ts` 增加全局 Toast 与洗碗值日业务弹层的层级契约检查。

## 2. 工程验证

- [x] 2.1 运行 `pnpm smoke:ui`、`pnpm type-check` 和 `pnpm lint`。
- [x] 2.2 运行 `pnpm build:h5` 与 `pnpm build:mp-weixin`，确认两个目标端均能编译全局 Toast 配置。
- [x] 2.3 在 390x844 H5 视口复现“添加饭搭子”弹层内 Toast，确认提示完整显示在弹层上方且弹层状态不变。
