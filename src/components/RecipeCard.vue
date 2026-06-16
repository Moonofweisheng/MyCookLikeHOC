<script setup lang="ts">
import type { Recipe } from '@/api/modules/recipe'
import RecipeImage from '@/components/RecipeImage.vue'

interface Props {
  recipe: Recipe
  variant?: 'feature' | 'horizontal' | 'grid' | 'mini'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'horizontal',
})

defineEmits<{
  select: [recipe: Recipe]
}>()

function cleanText(value: string) {
  return value
    .replace(/\[[^\]]+\]\([^)]+\)/g, match => match.replace(/^\[|\]\([^)]+\)$/g, ''))
    .replace(/^-\s*/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const summary = computed(() => {
  const lines = props.recipe.ingredients
    .split('\n')
    .map(item => cleanText(item))
    .filter(Boolean)
    .slice(0, props.variant === 'feature' ? 4 : 3)

  return lines.join(' / ')
})

const preset = computed(() => props.variant === 'mini' ? 'THUMBNAIL' : 'RECIPE_COVER')
</script>

<template>
  <view
    v-if="variant === 'feature'"
    class="recipe-card recipe-card-feature cook-illo-card cook-pressable overflow-hidden"
    @click="$emit('select', recipe)"
  >
    <view class="recipe-image-wrap feature-image relative h-320rpx w-full overflow-hidden bg-[var(--cook-image-bg)]">
      <RecipeImage
        :src="recipe.cover_image"
        :preset="preset"
        class="h-full w-full object-cover"
        placeholder="暂无封面"
      />
      <view class="feature-scrim absolute bottom-0 left-0 right-0 px-28rpx py-24rpx">
        <text class="category-sticker mb-12rpx inline-block px-14rpx py-6rpx text-22rpx text-[var(--cook-ink)] font-900">
          {{ recipe.category }}
        </text>
        <text class="line-clamp-2 block text-38rpx text-white font-800 leading-tight">
          {{ recipe.title }}
        </text>
      </view>
    </view>
    <view class="px-28rpx py-24rpx">
      <text class="line-clamp-2 text-26rpx text-[var(--cook-text-muted)] leading-relaxed">
        {{ summary || '查看详细食材和制作步骤' }}
      </text>
    </view>
  </view>

  <view
    v-else-if="variant === 'grid'"
    class="recipe-card cook-illo-card-soft cook-pressable overflow-hidden"
    @click="$emit('select', recipe)"
  >
    <view class="recipe-image-wrap stacked-image h-220rpx w-full flex items-center justify-center overflow-hidden bg-[var(--cook-image-bg)]">
      <RecipeImage
        :src="recipe.cover_image"
        :preset="preset"
        class="h-full w-full object-cover"
        placeholder="暂无封面"
      />
    </view>
    <view class="p-20rpx">
      <text class="line-clamp-1 block text-28rpx text-[var(--cook-text)] font-700">
        {{ recipe.title }}
      </text>
      <text class="category-sticker mt-10rpx inline-block px-10rpx py-3rpx text-21rpx text-[var(--cook-ink)] font-900">
        {{ recipe.category }}
      </text>
      <text class="line-clamp-2 mt-10rpx text-23rpx text-[var(--cook-text-muted)] leading-snug">
        {{ summary }}
      </text>
    </view>
  </view>

  <view
    v-else-if="variant === 'mini'"
    class="recipe-card cook-illo-card-soft cook-pressable inline-block w-252rpx overflow-hidden"
    @click="$emit('select', recipe)"
  >
    <view class="recipe-image-wrap stacked-image h-156rpx w-full flex items-center justify-center overflow-hidden bg-[var(--cook-image-bg)]">
      <RecipeImage
        :src="recipe.cover_image"
        :preset="preset"
        class="h-full w-full object-cover"
        placeholder="暂无封面"
      />
    </view>
    <view class="p-18rpx">
      <text class="line-clamp-2 block text-25rpx text-[var(--cook-text)] font-700 leading-snug">
        {{ recipe.title }}
      </text>
      <text class="mt-8rpx block text-21rpx text-[var(--cook-text-muted)]">
        {{ recipe.category }}
      </text>
    </view>
  </view>

  <view
    v-else
    class="recipe-card cook-illo-card-soft cook-pressable flex overflow-hidden"
    @click="$emit('select', recipe)"
  >
    <view class="recipe-image-wrap side-image h-196rpx w-176rpx flex shrink-0 items-center justify-center overflow-hidden bg-[var(--cook-image-bg)]">
      <RecipeImage
        :src="recipe.cover_image"
        :preset="preset"
        class="h-full w-full object-cover"
        placeholder="暂无封面"
      />
    </view>
    <view class="min-w-0 flex-1 px-24rpx py-20rpx">
      <view class="mb-10rpx flex items-center gap-12rpx">
        <text class="category-sticker px-12rpx py-4rpx text-21rpx text-[var(--cook-ink)] font-900">
          {{ recipe.category }}
        </text>
      </view>
      <text class="line-clamp-1 block text-30rpx text-[var(--cook-text)] font-800">
        {{ recipe.title }}
      </text>
      <text class="line-clamp-2 mt-12rpx text-24rpx text-[var(--cook-text-muted)] leading-relaxed">
        {{ summary || '查看详细食材和制作步骤' }}
      </text>
    </view>
  </view>
</template>

<style scoped>
.recipe-card {
  transform-origin: center;
}

.feature-image,
.stacked-image {
  border-bottom: 4rpx solid var(--cook-ink);
}

.side-image {
  border-right: 4rpx solid var(--cook-ink);
}

.category-sticker {
  box-sizing: border-box;
  border: 3rpx solid var(--cook-ink);
  border-radius: 999rpx;
  background: var(--cook-yellow);
}

.feature-scrim {
  background: linear-gradient(180deg, rgba(20, 18, 16, 0) 0%, rgba(20, 18, 16, 0.72) 100%);
}
</style>
