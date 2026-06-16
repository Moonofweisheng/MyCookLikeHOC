<script setup lang="ts">
interface Props {
  width?: string
  height?: string
  radius?: string
}

withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '24rpx',
  radius: '8rpx',
})
</script>

<template>
  <view
    class="skeleton-block"
    :style="{ width, height, borderRadius: radius }"
  />
</template>

<style scoped>
.skeleton-block {
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  border: 3rpx solid rgba(47, 47, 45, 0.18);
  background:
    linear-gradient(90deg, rgba(255, 244, 184, 0.62) 0%, rgba(234, 244, 255, 0.9) 42%, rgba(236, 255, 217, 0.76) 78%);
  background-size: 240% 100%;
  animation: cook-skeleton-wave 1.5s ease-in-out infinite;
}

.skeleton-block::after {
  position: absolute;
  inset: 0;
  content: '';
  background:
    linear-gradient(90deg, rgba(47, 47, 45, 0.04) 1px, transparent 1px),
    linear-gradient(180deg, rgba(47, 47, 45, 0.04) 1px, transparent 1px);
  background-size: 28rpx 28rpx;
}

@keyframes cook-skeleton-wave {
  0% {
    background-position: 120% 0;
  }

  100% {
    background-position: -120% 0;
  }
}
</style>
