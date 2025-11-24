## 目标
- 在 `src/pages/index/index.vue` 中，按页面现有卡片与网格结构，用 `wd-skeleton` 替换加载状态：分类导航与今日推荐两个区域。

## 结构遵循
- 分类导航：保持 `grid grid-cols-4 gap-24rpx` 与每个项的容器 `flex flex-col items-center rounded-16rpx bg-gray-50 p-24rpx`。骨架项内部用圆形头像占位 + 一行文本占位。
- 今日推荐：保持卡片容器 `flex overflow-hidden rounded-16rpx bg-gray-50`，左侧图片区域 `h-250rpx w-200rpx`，右侧文本区域三行占位，尺寸与现有标题/分类/简介相匹配。

## 修改点
1. 分类导航区域：当 `categoryLoading` 为真时，渲染 8 个骨架项，替换现有直接渲染分类列表；当为假时渲染真实分类列表。
2. 今日推荐区域：将现有 `recommendLoading` 的居中加载指示替换为 3 个推荐卡片骨架，保持卡片布局。

## 实现步骤
1. 分类导航骨架（替换现有列表渲染）：
```
<view v-if="categoryLoading" class="grid grid-cols-4 gap-24rpx">
  <view v-for="n in 8" :key="n" class="flex flex-col items-center rounded-16rpx bg-gray-50 p-24rpx">
    <wd-skeleton :row-col="[{ size: '80rpx', type: 'circle' }]" animation="gradient" />
    <wd-skeleton :row-col="[{ width: '60%', height: '24rpx', marginTop: '16rpx' }]" animation="gradient" />
  </view>
</view>
<view v-else class="grid grid-cols-4 gap-24rpx">...现有分类列表...</view>
```
2. 推荐菜谱骨架（替换现有 `wd-loading`）：
```
<view v-if="recommendLoading" class="space-y-24rpx">
  <view v-for="n in 3" :key="n" class="flex overflow-hidden rounded-16rpx bg-gray-50">
    <view class="h-250rpx w-200rpx bg-gray-200">
      <wd-skeleton :row-col="[{ width: '200rpx', height: '250rpx' }]" animation="gradient" />
    </view>
    <view class="flex-1 p-24rpx">
      <wd-skeleton :row-col="[
        { width: '60%', height: '28rpx' },
        { width: '40%', height: '24rpx', marginTop: '12rpx' },
        { width: '100%', height: '24rpx', marginTop: '16rpx' }
      ]" animation="gradient" />
    </view>
  </view>
</view>
<view v-else class="space-y-24rpx">...现有推荐列表...</view>
```

## 注意事项
- 不改动数据与交互逻辑，仅替换视觉占位；单位与布局使用页面既有的 `rpx` 与类名以避免视觉跳动。
- `wd-skeleton` 为全局组件，无需 import；仅按行列配置即可渲染对应形状。

确认后我将按上述计划修改文件并进行验证。