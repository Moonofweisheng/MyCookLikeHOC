## Why

洗碗值日页的自定义弹层使用 `z-index: 120`，而全局 Toast 沿用 Wot UI 默认层级 `100`，导致用户在“添加饭搭子”等弹层内触发提示时，Toast 被遮罩和面板挡住。提示反馈不可见会让用户误以为操作没有响应，需要统一全局临时反馈与业务弹层的层级关系。

## What Changes

- 为全局 Toast 建立明确且高于普通业务弹层的默认显示层级。
- 保留调用方覆盖 Toast 层级的能力，不改变现有提示位置、时长、图标和关闭逻辑。
- 增加 UI smoke 契约，防止全局 Toast 层级退回组件库默认值。
- 验证 H5 与微信小程序中，弹层保持打开时 Toast 仍完整可见。

## Capabilities

### New Capabilities

- `global-feedback-layering`: 定义全局临时反馈在业务弹层之上的跨端显示行为。

### Modified Capabilities

- 无

## Impact

- 受影响代码：`src/composables/useGlobalToast.ts`、`scripts/smoke-ui.ts`，不需要修改各业务弹层。
- 受影响平台：H5、微信小程序及其他使用全局 Toast 的 uni-app 目标端。
- 兼容性：现有 Toast 调用保持兼容；显式传入 `zIndex` 的调用仍优先于默认值。
- 不涉及 API、数据库、数据迁移、安全、隐私或外部依赖。

