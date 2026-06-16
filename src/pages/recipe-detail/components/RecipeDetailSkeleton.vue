<script setup lang="ts">
import RecipeCardSkeleton from '@/components/RecipeCardSkeleton.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'
</script>

<script lang="ts">
export default {
  options: {
    virtualHost: true,
  },
}
</script>

<template>
  <view class="bg-[var(--cook-bg)] pb-56rpx">
    <SkeletonBlock height="540rpx" radius="0" />

    <view class="bg-[var(--cook-surface)] px-32rpx pb-32rpx pt-30rpx">
      <view class="mb-18rpx flex items-center gap-12rpx">
        <SkeletonBlock width="92rpx" height="34rpx" radius="6rpx" />
        <SkeletonBlock width="156rpx" height="22rpx" radius="6rpx" />
      </view>
      <SkeletonBlock width="78%" height="42rpx" radius="8rpx" />
      <SkeletonBlock class="mt-18rpx" width="100%" height="26rpx" radius="6rpx" />
      <SkeletonBlock class="mt-10rpx" width="64%" height="26rpx" radius="6rpx" />
    </view>

    <view class="px-32rpx pt-34rpx">
      <view class="mb-24rpx">
        <SkeletonBlock width="170rpx" height="34rpx" radius="8rpx" />
        <SkeletonBlock class="mt-10rpx" width="220rpx" height="24rpx" radius="6rpx" />
      </view>
      <view class="grid grid-cols-2 gap-16rpx">
        <view
          v-for="item in 6"
          :key="item"
          class="rounded-8rpx bg-[var(--cook-surface)] px-20rpx py-18rpx shadow-[0_8rpx_24rpx_rgba(36,28,20,0.05)]"
        >
          <SkeletonBlock width="86%" height="26rpx" radius="6rpx" />
          <SkeletonBlock class="mt-10rpx" width="48%" height="22rpx" radius="6rpx" />
        </view>
      </view>
    </view>

    <view class="mt-44rpx px-32rpx">
      <view class="mb-24rpx">
        <SkeletonBlock width="180rpx" height="34rpx" radius="8rpx" />
        <SkeletonBlock class="mt-10rpx" width="210rpx" height="24rpx" radius="6rpx" />
      </view>
      <view class="rounded-8rpx bg-[var(--cook-surface)] px-26rpx py-8rpx shadow-[0_12rpx_32rpx_rgba(36,28,20,0.06)]">
        <view
          v-for="item in 3"
          :key="item"
          class="flex gap-22rpx border-b border-[var(--cook-border)] py-26rpx last:border-b-0"
        >
          <SkeletonBlock width="54rpx" height="54rpx" radius="999rpx" />
          <view class="min-w-0 flex-1 pt-4rpx">
            <SkeletonBlock width="100%" height="26rpx" radius="6rpx" />
            <SkeletonBlock class="mt-12rpx" width="78%" height="26rpx" radius="6rpx" />
          </view>
        </view>
      </view>
    </view>

    <view class="mt-34rpx px-32rpx">
      <view class="rounded-8rpx bg-[var(--cook-blue-soft)] px-28rpx py-24rpx">
        <SkeletonBlock width="160rpx" height="28rpx" radius="8rpx" />
        <SkeletonBlock class="mt-16rpx" width="100%" height="24rpx" radius="6rpx" />
        <SkeletonBlock class="mt-10rpx" width="72%" height="24rpx" radius="6rpx" />
      </view>
    </view>

    <view class="mt-44rpx px-32rpx">
      <view class="mb-24rpx">
        <SkeletonBlock width="170rpx" height="34rpx" radius="8rpx" />
        <SkeletonBlock class="mt-10rpx" width="180rpx" height="24rpx" radius="6rpx" />
      </view>
      <scroll-view scroll-x class="whitespace-nowrap">
        <view class="flex gap-20rpx pb-6rpx">
          <RecipeCardSkeleton
            v-for="item in 3"
            :key="item"
            variant="mini"
          />
        </view>
      </scroll-view>
    </view>
  </view>
</template>
