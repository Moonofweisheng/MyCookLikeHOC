<script setup lang="ts">
import SkeletonBlock from '@/components/SkeletonBlock.vue'

interface Props {
  variant?: 'feature' | 'horizontal' | 'grid' | 'mini'
}

withDefaults(defineProps<Props>(), {
  variant: 'horizontal',
})
</script>

<template>
  <view
    v-if="variant === 'feature'"
    class="cook-illo-card overflow-hidden"
  >
    <SkeletonBlock height="320rpx" radius="0" />
    <view class="px-28rpx py-24rpx">
      <SkeletonBlock width="36%" height="24rpx" radius="6rpx" />
      <SkeletonBlock class="mt-16rpx" width="72%" height="34rpx" radius="6rpx" />
      <SkeletonBlock class="mt-16rpx" width="100%" height="24rpx" radius="6rpx" />
      <SkeletonBlock class="mt-10rpx" width="66%" height="24rpx" radius="6rpx" />
    </view>
  </view>

  <view
    v-else-if="variant === 'grid'"
    class="cook-illo-card-soft overflow-hidden"
  >
    <SkeletonBlock height="220rpx" radius="0" />
    <view class="p-20rpx">
      <SkeletonBlock width="78%" height="28rpx" radius="6rpx" />
      <SkeletonBlock class="mt-12rpx" width="34%" height="22rpx" radius="6rpx" />
      <SkeletonBlock class="mt-14rpx" width="100%" height="22rpx" radius="6rpx" />
      <SkeletonBlock class="mt-8rpx" width="64%" height="22rpx" radius="6rpx" />
    </view>
  </view>

  <view
    v-else-if="variant === 'mini'"
    class="cook-illo-card-soft inline-block w-252rpx overflow-hidden"
  >
    <SkeletonBlock height="156rpx" radius="0" />
    <view class="p-18rpx">
      <SkeletonBlock width="82%" height="24rpx" radius="6rpx" />
      <SkeletonBlock class="mt-10rpx" width="44%" height="20rpx" radius="6rpx" />
    </view>
  </view>

  <view v-else class="cook-illo-card-soft flex overflow-hidden">
    <SkeletonBlock width="176rpx" height="196rpx" radius="0" />
    <view class="min-w-0 flex-1 px-24rpx py-20rpx">
      <SkeletonBlock width="92rpx" height="24rpx" radius="6rpx" />
      <SkeletonBlock class="mt-18rpx" width="66%" height="30rpx" radius="6rpx" />
      <SkeletonBlock class="mt-16rpx" width="100%" height="24rpx" radius="6rpx" />
      <SkeletonBlock class="mt-8rpx" width="74%" height="24rpx" radius="6rpx" />
    </view>
  </view>
</template>
