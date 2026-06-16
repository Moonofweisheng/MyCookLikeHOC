<script setup lang="ts">
import SkeletonBlock from '@/components/SkeletonBlock.vue'
</script>

<template>
  <view class="flex flex-col items-center gap-12rpx">
    <view class="category-skeleton-icon">
      <SkeletonBlock width="88rpx" height="88rpx" radius="20rpx" />
    </view>
    <SkeletonBlock width="56rpx" height="22rpx" radius="6rpx" />
  </view>
</template>

<style scoped>
.category-skeleton-icon {
  border: 4rpx solid var(--cook-ink);
  border-radius: 24rpx;
  box-shadow: 5rpx 6rpx 0 rgba(47, 47, 45, 0.96);
  overflow: hidden;
}
</style>
