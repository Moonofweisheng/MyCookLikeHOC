## Context

`wd-toast` 在没有显式配置时使用 `z-index: 100`。洗碗值日页的 `.sheet-mask` 使用 `z-index: 120`，因此全局 Toast 虽然已经挂载在应用根节点，视觉上仍会被自定义弹层覆盖。全局 Toast 的所有调用会先经过 `useGlobalToast` 统一合并默认配置。

## Goals / Non-Goals

**Goals:**

- 在全局 Toast 入口建立高于普通业务弹层的默认层级。
- 让现有字符串和对象形式的调用自动获得修复，无需逐页修改。
- 保持显式 `zIndex` 覆盖及其他 Toast 参数的现有合并语义。

**Non-Goals:**

- 不降低 `.sheet-mask` 或其他业务弹层的层级。
- 不改变全局 Loading、Dialog、隐私弹窗等组件的交互优先级。
- 不重构弹层系统或引入新的层级管理依赖。

## Decisions

1. **在 `useGlobalToast` 的默认选项中设置 `zIndex: 200`。**
   该值高于当前普通业务弹层 `120`，又保持在易理解的局部层级范围内。因为 `show` 先合并默认值再合并调用参数，调用方显式传入的 `zIndex` 仍能覆盖默认值。

2. **不降低业务弹层层级。**
   降低 `.sheet-mask` 只能修复当前页面，还可能让底部导航或其他页面内容穿透到弹层上方。全局临时反馈本就应位于普通业务弹层之上，在全局入口修复更符合组件职责。

3. **通过 UI smoke 固化层级契约。**
   在现有静态 smoke 脚本中断言全局 Toast 默认层级，并保留洗碗值日弹层层级断言，使两者的相对关系在后续改动中可见。

## Risks / Trade-offs

- [Risk] 未来新增层级高于 `200` 的特殊弹层仍可能覆盖 Toast → 特殊系统弹层应明确记录其层级意图；普通业务弹层不得越过全局反馈层。
- [Risk] Toast 使用 `cover: true` 时透明 Overlay 也位于高层，可能短时拦截点击 → 本变更不改变现有 `cover` 默认值，调用方只有显式开启时才承担该语义。

## Migration Plan

无需数据或部署迁移。发布后所有未显式指定层级的全局 Toast 自动使用新默认值；回滚只需移除默认 `zIndex` 配置及对应 smoke 断言。

## Test Strategy

- 运行 `pnpm smoke:ui`，验证层级契约。
- 运行 `pnpm type-check` 与 `pnpm lint`。
- 运行 `pnpm build:h5` 和 `pnpm build:mp-weixin`，确认组件参数跨端可编译。
- 在 390x844 H5 视口复现“添加饭搭子”弹层并触发 Toast，确认提示完整位于弹层之上且弹层不关闭。

