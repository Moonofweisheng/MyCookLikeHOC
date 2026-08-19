## 1. 视觉 Token 与通用骨架组件

- [x] 1.1 在 `src/App.vue` 增加骨架屏暖中性色、图片占位色、高光色和动效节奏 token，并确认不改变现有页面主色 token。
- [x] 1.2 为 `src/components/SkeletonBlock.vue` 增加文字、图片、头像/图标语义变体，默认保持文字变体兼容现有调用。
- [x] 1.3 移除骨架块网格纹理和黄蓝绿混合渐变，按语义控制描边、圆角和单色 shimmer 动效，保证尺寸稳定且兼容 H5/微信小程序。

## 2. 页面骨架语义接入

- [x] 2.1 更新 `src/components/RecipeCardSkeleton.vue`，将封面区域标记为图片语义，将标题、分类和摘要保持为文字语义，并检查 feature、horizontal、grid、mini 四种布局。
- [x] 2.2 更新 `src/components/CategoryShortcutSkeleton.vue`，将分类图标和名称分别使用头像/图标与文字语义，避免内部重复深色边框。
- [x] 2.3 更新 `src/pages/recipe-detail/components/RecipeDetailSkeleton.vue`，将主图、头像和正文占位按语义接入，保持详情页各区块的高度与间距。
- [x] 2.4 检查首页、分类、搜索和详情页加载状态，确认空态、错误态、重试行为和真实内容渲染未被改变。

## 3. 自动化与跨端验证

- [x] 3.1 更新 `scripts/smoke-ui.ts`，补充骨架 token、语义变体和无网格纹理等关键样式契约检查。
- [x] 3.2 运行 `pnpm smoke:ui`、`pnpm type-check` 和 `pnpm lint`，修复发现的问题。
- [x] 3.3 运行 `pnpm build:h5` 和 `pnpm build:mp-weixin`，确认渐变、动画、scoped CSS 与组件类型在两端构建通过。
- [x] 3.4 在 H5 `390x844` 视口人工验收首页推荐、分类网格、搜索列表和详情页加载状态，记录无彩色噪声、无水平溢出、文本不越界和动效不过度闪烁。
