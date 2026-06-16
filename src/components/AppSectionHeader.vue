<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
  actionText?: string
}

defineProps<Props>()
defineEmits<{
  action: []
}>()
</script>

<script lang="ts">
export default {
  options: {
    virtualHost: true,
  },
}
</script>

<template>
  <view class="mb-24rpx flex items-end justify-between gap-24rpx">
    <view class="min-w-0">
      <text class="section-title inline-block text-34rpx text-[var(--cook-text)] font-900 leading-tight">
        {{ title }}
      </text>
      <text v-if="subtitle" class="mt-8rpx block text-24rpx text-[var(--cook-text-muted)] leading-snug">
        {{ subtitle }}
      </text>
    </view>
    <view v-if="actionText" class="section-action cook-pressable shrink-0" @click="$emit('action')">
      <text class="text-24rpx text-[var(--cook-ink)] font-900">
        {{ actionText }}
      </text>
    </view>
  </view>
</template>

<style scoped>
.section-title {
  background:
    linear-gradient(180deg, transparent 0 58%, var(--cook-yellow) 58% 88%, transparent 88% 100%);
  padding-right: 18rpx;
}

.section-action {
  border: 4rpx solid var(--cook-ink);
  border-radius: 999rpx;
  background: var(--cook-paper);
  box-shadow: 4rpx 5rpx 0 rgba(47, 47, 45, 0.96);
  padding: 8rpx 16rpx;
}
</style>
