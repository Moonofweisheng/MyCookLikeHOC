<script setup lang="ts">
interface Props {
  title: string
  description?: string
  icon?: string
  actionText?: string
}

withDefaults(defineProps<Props>(), {
  description: '',
  icon: 'search',
  actionText: '',
})

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
  <view class="empty-state flex flex-col items-center justify-center px-48rpx py-120rpx text-center">
    <view class="empty-icon mb-28rpx h-108rpx w-108rpx flex items-center justify-center rounded-full">
      <wd-icon :name="icon" size="48rpx" color="var(--cook-ink)" />
    </view>
    <text class="text-30rpx text-[var(--cook-text)] font-700">
      {{ title }}
    </text>
    <text v-if="description" class="mt-12rpx text-24rpx text-[var(--cook-text-muted)] leading-relaxed">
      {{ description }}
    </text>
    <view
      v-if="actionText"
      class="empty-action cook-pressable mt-28rpx px-28rpx py-14rpx"
      @click="$emit('action')"
    >
      <text class="text-25rpx text-[var(--cook-ink)] font-900">
        {{ actionText }}
      </text>
    </view>
  </view>
</template>

<style scoped>
.empty-icon {
  border: 5rpx solid var(--cook-ink);
  background: var(--cook-blue-soft);
  box-shadow: 6rpx 7rpx 0 rgba(47, 47, 45, 0.96);
}

.empty-action {
  border: 4rpx solid var(--cook-ink);
  border-radius: 18rpx;
  background: var(--cook-primary);
  box-shadow: 5rpx 6rpx 0 rgba(47, 47, 45, 0.96);
}
</style>
