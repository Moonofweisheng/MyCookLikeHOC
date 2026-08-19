<script setup lang="ts">
interface Props {
  width?: string
  height?: string
  radius?: string
  variant?: 'text' | 'image' | 'avatar'
}

withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '24rpx',
  radius: '8rpx',
  variant: 'text',
})
</script>

<script lang="ts">
export default {
  options: {
    virtualHost: true,
  },
}
</script>

<template>
  <view
    class="skeleton-block"
    :class="`skeleton-block--${variant}`"
    :style="{ width, height, borderRadius: radius }"
  />
</template>

<style scoped>
.skeleton-block {
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  background: var(--cook-skeleton-text);
}

.skeleton-block--image {
  background: var(--cook-skeleton-image);
  box-shadow: inset 0 0 0 2rpx rgba(47, 47, 45, 0.08);
}

.skeleton-block--avatar {
  background: var(--cook-skeleton-avatar);
  box-shadow: inset 0 0 0 2rpx rgba(47, 47, 45, 0.1);
}

.skeleton-block::after {
  position: absolute;
  inset: 0;
  content: '';
  background: linear-gradient(90deg, transparent 0%, var(--cook-skeleton-highlight) 50%, transparent 100%);
  transform: translateX(-100%);
  animation: cook-skeleton-wave var(--cook-skeleton-duration) ease-in-out infinite;
}

@keyframes cook-skeleton-wave {
  100% {
    transform: translateX(100%);
  }
}
</style>
