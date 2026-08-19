## Why

当前骨架屏使用黄、蓝、绿三色渐变、网格纹理和深色描边，和鱼哥菜谱现有的暖纸张与粗线条插画风格叠加后产生较强的视觉噪声。用户在首页、分类、搜索和菜谱详情的加载阶段会感到页面花哨、脏乱，骨架屏反而抢过了真实内容应有的注意力；现在统一调整可以一次覆盖所有复用场景。

## What Changes

- 将骨架屏默认视觉改为低对比度的暖中性色，以纸张和图片占位色板为基础，移除黄蓝绿混合渐变。
- 移除骨架块内部的网格纹理，并降低或按语义移除骨架块自身的深色边框，避免与外层插画卡片重复描边。
- 为通用 `SkeletonBlock` 增加文字、图片、头像/图标等语义变体，使不同占位区域拥有合适的层级表现。
- 保留轻量 shimmer 动效，但降低高光对比度并放慢节奏，使动效用于表达加载中而不是成为主要视觉。
- 调整首页、分类、搜索和详情页骨架组件的变体使用，保持骨架结构与最终内容结构一致。
- 保持现有加载时序、空态、错误态、重试行为、数据接口和页面路由不变。

## Capabilities

### New Capabilities

- `skeleton-loading-visuals`: 定义跨 H5 和微信小程序复用的骨架屏颜色、纹理、描边、动效和语义变体行为。

### Modified Capabilities

- 无。现有页面业务需求和数据契约不变，本次仅补充统一加载状态的用户可观察视觉契约。

## Impact

- 受影响代码：`src/App.vue` 中的视觉 token、`src/components/SkeletonBlock.vue`、`RecipeCardSkeleton.vue`、`CategoryShortcutSkeleton.vue`、`src/pages/recipe-detail/components/RecipeDetailSkeleton.vue`，以及必要的 UI smoke 检查。
- 受影响平台：H5、微信小程序；需验证两端的 scoped CSS、渐变和动画兼容性。
- API、Supabase、数据库、Storage、路由、权限和外部依赖：不涉及。
- 兼容性：保持现有组件调用可用，默认变体继续提供向后兼容的文字占位表现；不引入新依赖。
