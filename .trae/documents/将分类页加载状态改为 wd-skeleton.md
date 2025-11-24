## 目标
- 在 `src/pages/category/index.vue` 按现有页面与卡片结构，用 `wd-skeleton` 替换两处 `wd-loading`。

## 结构遵循
- 保持原有网格与卡片容器：`grid grid-cols-2 gap-24rpx` + `overflow-hidden rounded-16rpx bg-white shadow-sm`。
- 每个骨架卡片仍分为两块：
  - 图片区域容器：`h-240rpx w-full bg-gray-200`（仅替换内容为骨架）
  - 文本区域容器：`p-24rpx`（用两行文本骨架）

## 修改点
- 移除 `wd-loading`：
  - 首次加载占位：`src/pages/category/index.vue:131-133`
  - 加载更多占位：`src/pages/category/index.vue:169-174`
- 新增 2 段骨架屏：
  - 首次加载占位（列表为空）：在现有网格中渲染 6 个骨架卡片，完全复用卡片结构与样式。
  - 加载更多占位（列表不空）：在底部用相同卡片结构渲染 2 个骨架卡片。

## 实现步骤
1. 首次加载占位替换（对应 131-167 区域逻辑）：
```
<view v-if="loading && recipes.length === 0" class="grid grid-cols-2 gap-24rpx">
  <view v-for="n in 6" :key="n" class="overflow-hidden rounded-16rpx bg-white shadow-sm">
    <view class="h-240rpx w-full bg-gray-200">
      <wd-skeleton :row-col="[{ height: '240rpx' }]" animation="gradient" :custom-style="{ width: '100%' }" />
    </view>
    <view class="p-24rpx">
      <wd-skeleton :row-col="[{ width: '70%', height: '28rpx' }, { width: '100%', height: '24rpx', marginTop: '8rpx' }]" animation="gradient" />
    </view>
  </view>
</view>
```
2. 加载更多占位替换（对应 169-174 区域）：
```
<view v-if="loading && recipes.length > 0" class="px-32rpx py-24rpx">
  <view class="grid grid-cols-2 gap-24rpx">
    <view v-for="n in 2" :key="n" class="overflow-hidden rounded-16rpx bg-white shadow-sm">
      <view class="h-240rpx w-full bg-gray-200">
        <wd-skeleton :row-col="[{ height: '240rpx' }]" animation="gradient" :custom-style="{ width: '100%' }" />
      </view>
      <view class="p-24rpx">
        <wd-skeleton :row-col="[{ width: '70%', height: '28rpx' }, { width: '100%', height: '24rpx', marginTop: '8rpx' }]" animation="gradient" />
      </view>
    </view>
  </view>
</view>
```
3. 其他逻辑不变：
- 保持 `loading/hasMore/page` 与分页逻辑，无需改动 `<script setup>`。
- 空状态与“没有更多数据”逻辑保持原样。

## 注意
- 使用统一的卡片结构与样式，骨架屏严格对齐现有布局，避免视觉跳动。
- 如需细化骨架视觉，可后续微调 `row-col` 尺寸或切换动画（`gradient`/`flashed`）。

确认后我将执行上述替换并进行本地预览验证。