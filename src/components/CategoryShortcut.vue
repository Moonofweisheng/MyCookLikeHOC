<script setup lang="ts">
import { applyImagePreset } from '@/utils/image'

interface Props {
  category: string
  iconUrl?: string
  tone?: number
}

const props = withDefaults(defineProps<Props>(), {
  iconUrl: '',
  tone: 0,
})

defineEmits<{
  select: []
}>()

const hasIconError = ref(false)

const tones = [
  { bg: '#FFE9DF', fg: '#B84E2A' },
  { bg: '#ECFFD9', fg: '#4B8E2E' },
  { bg: '#EAF4FF', fg: '#2E6EDB' },
  { bg: '#FFF4B8', fg: '#8A6512' },
  { bg: '#F2EEFF', fg: '#6A52A8' },
]

const toneStyle = computed(() => {
  const item = tones[props.tone % tones.length]
  return {
    backgroundColor: item.bg,
    color: item.fg,
  }
})

const fallbackText = computed(() => props.category.slice(0, 1))
const iconSrc = computed(() => props.iconUrl && !hasIconError.value ? applyImagePreset(props.iconUrl, 'CATEGORY_ICON') : '')

watch(() => props.iconUrl, () => {
  hasIconError.value = false
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
  <view class="category-shortcut cook-pressable flex flex-col items-center gap-12rpx" @click="$emit('select')">
    <view
      class="category-icon h-92rpx w-92rpx flex items-center justify-center overflow-hidden rounded-24rpx"
      :style="toneStyle"
    >
      <image
        v-if="iconSrc"
        :src="iconSrc"
        class="h-full w-full object-cover"
        mode="aspectFill"
        :lazy-load="true"
        @error="hasIconError = true"
      />
      <text v-else class="text-34rpx font-900">
        {{ fallbackText }}
      </text>
    </view>
    <text class="category-label max-w-124rpx truncate text-center text-24rpx text-[var(--cook-text)] font-800">
      {{ category }}
    </text>
  </view>
</template>

<style scoped>
.category-shortcut {
  min-width: 0;
}

.category-icon {
  box-sizing: border-box;
  border: 4rpx solid var(--cook-ink);
  box-shadow: 5rpx 6rpx 0 rgba(47, 47, 45, 0.96);
}

.category-label {
  border-radius: 999rpx;
  background: rgba(255, 254, 249, 0.76);
  padding: 2rpx 8rpx;
}
</style>
