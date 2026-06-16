<script setup lang="ts">
import { applyImagePreset } from '@/utils/image'

type ImagePresetKey = Parameters<typeof applyImagePreset>[1]

interface Props {
  src?: string
  preset?: ImagePresetKey
  mode?: 'aspectFill' | 'aspectFit' | 'widthFix' | 'heightFix' | 'scaleToFill'
  placeholder?: string
  showMenuByLongpress?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  preset: 'RECIPE_COVER',
  mode: 'aspectFill',
  placeholder: '暂无图片',
  showMenuByLongpress: false,
})

const hasError = ref(false)
const imageSrc = computed(() => props.src && !hasError.value ? applyImagePreset(props.src, props.preset) : '')

watch(() => props.src, () => {
  hasError.value = false
})
</script>

<template>
  <view class="recipe-image relative flex items-center justify-center overflow-hidden bg-[var(--cook-image-bg)]">
    <image
      v-if="imageSrc"
      :src="imageSrc"
      :class="mode === 'widthFix' ? 'w-full' : 'h-full w-full object-cover'"
      :mode="mode"
      :show-menu-by-longpress="showMenuByLongpress"
      :lazy-load="true"
      @error="hasError = true"
    />
    <view v-else class="placeholder-pattern h-full w-full flex flex-col items-center justify-center px-18rpx text-center">
      <view class="placeholder-badge mb-12rpx h-58rpx w-58rpx flex items-center justify-center rounded-full">
        <text class="text-24rpx text-[var(--cook-ink)] font-900">
          食
        </text>
      </view>
      <text class="text-22rpx text-[var(--cook-text-soft)] font-700">
        {{ placeholder }}
      </text>
    </view>
  </view>
</template>

<style scoped>
.recipe-image {
  min-width: 0;
  width: 100%;
  height: 100%;
}

.placeholder-pattern {
  background:
    linear-gradient(90deg, rgba(47, 47, 45, 0.05) 1px, transparent 1px),
    linear-gradient(180deg, rgba(47, 47, 45, 0.05) 1px, transparent 1px),
    linear-gradient(135deg, rgba(255, 244, 184, 0.62) 0%, rgba(234, 244, 255, 0.88) 100%);
  background-size:
    30rpx 30rpx,
    30rpx 30rpx,
    100% 100%;
}

.placeholder-badge {
  border: 4rpx solid var(--cook-ink);
  background: var(--cook-yellow);
  box-shadow: 3rpx 4rpx 0 rgba(47, 47, 45, 0.96);
}
</style>
