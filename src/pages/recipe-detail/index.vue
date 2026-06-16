<script setup lang="ts">
import { type Recipe, getRandomRecipesByCategory, getRecipeDetail } from '../../api/modules/recipe'
import AppSectionHeader from '@/components/AppSectionHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import RecipeCard from '@/components/RecipeCard.vue'
import RecipeImage from '@/components/RecipeImage.vue'
import RecipeDetailSkeleton from './components/RecipeDetailSkeleton.vue'

definePage({
  name: 'recipe-detail',
  style: {
    navigationBarTitleText: '菜谱详情',
  },
})

const router = useRouter()
const route = useRoute()

// 获取菜谱ID
const recipeId = ref('')

// 菜谱详情数据
const recipe = ref<Recipe | null>(null)
const loading = ref(false)
const loadError = ref('')
const recommendedRecipes = ref<Recipe[]>([])
const ingredientsList = computed(() => recipe.value ? formatIngredients(recipe.value.ingredients) : [])
const stepsList = computed(() => recipe.value ? formatSteps(recipe.value.steps) : [])
// 移除所有模拟数据，只保留真实数据

function normalizeRouteValue(value: unknown) {
  const rawValue = Array.isArray(value) ? value[0] : value
  if (!rawValue)
    return ''

  return decodeURIComponent(String(rawValue))
}

function getRecipeIdFromLocation() {
  if (typeof window === 'undefined')
    return ''

  try {
    const url = new URL(window.location.href)
    const searchId = url.searchParams.get('id')
    if (searchId)
      return decodeURIComponent(searchId)

    const hashQuery = url.hash.includes('?') ? url.hash.split('?')[1] : ''
    return decodeURIComponent(new URLSearchParams(hashQuery).get('id') || '')
  }
  catch {
    return ''
  }
}

function resolveRecipeId(options?: Record<string, unknown>) {
  return normalizeRouteValue(options?.id)
    || normalizeRouteValue(route.query?.id)
    || normalizeRouteValue(route.params?.id)
    || getRecipeIdFromLocation()
}

function syncRecipeId(options?: Record<string, unknown>) {
  const nextRecipeId = resolveRecipeId(options)
  if (nextRecipeId && nextRecipeId !== recipeId.value) {
    recipeId.value = nextRecipeId
  }
}

// 获取菜谱详情
async function fetchRecipeDetail() {
  if (!recipeId.value)
    return

  loading.value = true
  loadError.value = ''
  recipe.value = null
  recommendedRecipes.value = []

  try {
    const data = await getRecipeDetail(recipeId.value)

    if (data && data.length > 0) {
      recipe.value = data[0]
      // 获取推荐菜谱
      fetchRecommendedRecipes()
    }
    else {
      loadError.value = '菜谱不存在'
      uni.showToast({
        title: '菜谱不存在',
        icon: 'error',
      })
    }
  }
  catch (error) {
    console.error('获取菜谱详情失败:', error)
    loadError.value = '菜谱加载失败'
    uni.showToast({
      title: '加载失败',
      icon: 'error',
    })
  }
  finally {
    loading.value = false
  }
}

// 获取推荐菜谱
async function fetchRecommendedRecipes() {
  try {
    const cat = recipe.value?.category || ''
    if (!cat)
      return
    const data = await getRandomRecipesByCategory(cat, recipeId.value, 5)
    recommendedRecipes.value = data
  }
  catch (error) {
    console.error('获取推荐菜谱失败:', error)
  }
}

// 移除收藏功能（模拟数据）

// 查看推荐菜谱
function viewRecommendedRecipe(id: string) {
  router.replace({
    path: '/pages/recipe-detail/index',
    query: { id },
  })
}

function handleDetailStateAction() {
  if (recipeId.value) {
    fetchRecipeDetail()
    return
  }

  router.back()
}

// 预览制作流程图
function previewProcessImage() {
  if (!recipe.value?.process_image_url)
    return

  uni.previewImage({
    urls: [recipe.value.process_image_url],
    current: recipe.value.process_image_url,
    fail: (err) => {
      console.error('预览图片失败:', err)
      uni.showToast({
        title: '图片加载失败',
        icon: 'error',
      })
    },
  })
}

function cleanRecipeText(value: string) {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^-\s*/g, '')
    .trim()
}

// 格式化配料列表
function formatIngredients(ingredients: string) {
  if (!ingredients)
    return []
  return ingredients.split('\n').map(item => cleanRecipeText(item)).filter(Boolean)
}

// 格式化制作步骤
function formatSteps(steps: string) {
  if (!steps)
    return []
  return steps.split('\n').map(item => cleanRecipeText(item)).filter(Boolean)
}

onLoad((options) => {
  syncRecipeId(options as Record<string, unknown>)
})

// 监听ID变化
watch(recipeId, () => {
  if (recipeId.value)
    fetchRecipeDetail()
})

watch(() => [route.query?.id, route.params?.id], () => {
  syncRecipeId()
})

onMounted(() => {
  syncRecipeId()
})

onShareAppMessage(() => {
  const encodedRecipeId = encodeURIComponent(recipeId.value)
  return {
    title: recipe.value?.title || '菜谱详情',
    path: encodedRecipeId ? `/pages/recipe-detail/index?id=${encodedRecipeId}` : '/pages/recipe-detail/index',
  }
})

onShareTimeline(() => {
  const encodedRecipeId = encodeURIComponent(recipeId.value)
  return {
    title: recipe.value?.title || '菜谱详情',
    path: encodedRecipeId ? `/pages/recipe-detail/index?id=${encodedRecipeId}` : '/pages/recipe-detail/index',
  }
})
</script>

<template>
  <view class="cook-illo-page">
    <!-- 骨架屏加载状态 -->
    <RecipeDetailSkeleton v-if="loading" />

    <!-- 菜谱详情 -->
    <view v-else-if="recipe" class="pb-56rpx pt-24rpx">
      <view class="detail-cover cook-illo-card mx-24rpx h-500rpx overflow-hidden">
        <RecipeImage
          :src="recipe.cover_image"
          preset="DETAIL_IMAGE"
          class="h-full w-full object-cover"
          placeholder="暂无封面"
        />
      </view>

      <view class="detail-title-card cook-illo-card mx-24rpx mt-24rpx px-28rpx pb-30rpx pt-28rpx">
        <view class="mb-18rpx flex items-center gap-12rpx">
          <text class="cook-illo-tag px-14rpx py-6rpx text-22rpx font-900">
            {{ recipe.category }}
          </text>
          <text class="text-22rpx text-[var(--cook-text-soft)] font-700">
            老乡鸡同款做法
          </text>
        </view>
        <text class="block text-42rpx text-[var(--cook-text)] font-900 leading-tight">
          {{ recipe.title }}
        </text>
        <text class="mt-18rpx block text-26rpx text-[var(--cook-text-muted)] leading-relaxed">
          食材和步骤已整理成清单，照着做更省心。
        </text>
      </view>

      <view class="px-32rpx pt-34rpx">
        <AppSectionHeader title="食材清单" :subtitle="`共 ${ingredientsList.length} 项食材`" />
        <view class="grid grid-cols-2 gap-16rpx">
          <view
            v-for="(ingredient, index) in ingredientsList"
            :key="index"
            class="ingredient-chip min-h-88rpx px-20rpx py-18rpx"
          >
            <text class="line-clamp-2 text-26rpx text-[var(--cook-text)] font-700 leading-snug">
              {{ ingredient }}
            </text>
          </view>
        </view>
      </view>

      <view v-if="recipe.process_image_url" class="mt-44rpx px-32rpx">
        <AppSectionHeader title="制作流程图" subtitle="点击图片查看大图" />
        <view class="cook-illo-card-soft overflow-hidden">
          <view
            class="w-full bg-[var(--cook-image-bg)]"
            @click="previewProcessImage"
          >
            <RecipeImage
              :src="recipe.process_image_url"
              preset="DETAIL_IMAGE"
              class="min-h-360rpx w-full"
              mode="widthFix"
              placeholder="暂无流程图"
              :show-menu-by-longpress="true"
            />
          </view>
        </view>
      </view>

      <view class="mt-44rpx px-32rpx">
        <AppSectionHeader title="制作步骤" :subtitle="`${stepsList.length} 个步骤，按顺序来`" />
        <view class="steps-panel cook-illo-card-soft px-24rpx py-8rpx">
          <view
            v-for="(step, index) in stepsList"
            :key="index"
            class="relative flex gap-22rpx border-b border-[var(--cook-border)] py-26rpx last:border-b-0"
          >
            <view class="shrink-0">
              <view class="step-badge h-56rpx w-56rpx flex items-center justify-center rounded-full">
                <text class="text-22rpx text-[var(--cook-ink)] font-900">
                  {{ String(index + 1).padStart(2, '0') }}
                </text>
              </view>
            </view>
            <view class="min-w-0 flex-1 pt-4rpx">
              <text class="text-28rpx text-[var(--cook-text-soft)] leading-relaxed">
                {{ step.replace(/^\d+\.?\s*/, '') }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <view class="mt-34rpx px-32rpx">
        <view class="tip-card px-28rpx py-24rpx">
          <text class="mb-12rpx block text-28rpx text-[var(--cook-ink)] font-900">
            制作小贴士
          </text>
          <text class="text-26rpx text-[var(--cook-text-soft)] font-600 leading-relaxed">
            制作过程中请注意火候控制，根据个人口味适量调整调料用量。建议提前准备好所有配料，确保制作过程顺畅。
          </text>
        </view>
      </view>

      <view v-if="recommendedRecipes.length > 0" class="mt-44rpx px-32rpx">
        <AppSectionHeader title="相关推荐" subtitle="同分类里再看看" />
        <scroll-view scroll-x class="whitespace-nowrap">
          <view class="flex gap-20rpx pb-6rpx">
            <RecipeCard
              v-for="item in recommendedRecipes"
              :key="item.id"
              :recipe="item"
              variant="mini"
              @select="viewRecommendedRecipe(item.id)"
            />
          </view>
        </scroll-view>
      </view>
    </view>

    <view v-else-if="!loading">
      <EmptyState
        :title="loadError || '菜谱加载失败'"
        :description="recipeId ? '重新加载后继续查看做法' : '返回上一页重新选择菜谱'"
        icon="search"
        :action-text="recipeId ? '重新加载' : '返回上一页'"
        @action="handleDetailStateAction"
      />
    </view>
  </view>
</template>

<style scoped>
.detail-cover {
  background: var(--cook-image-bg);
}

.detail-title-card {
  background:
    linear-gradient(135deg, rgba(255, 254, 249, 0.98) 0%, rgba(255, 248, 217, 0.92) 100%);
}

.ingredient-chip {
  box-sizing: border-box;
  border: 4rpx solid var(--cook-ink);
  border-radius: 20rpx;
  background: var(--cook-paper);
  box-shadow: 4rpx 5rpx 0 rgba(47, 47, 45, 0.96);
}

.steps-panel {
  background: var(--cook-paper);
}

.step-badge {
  border: 4rpx solid var(--cook-ink);
  background: var(--cook-primary);
  box-shadow: 3rpx 4rpx 0 rgba(47, 47, 45, 0.96);
}

.tip-card {
  box-sizing: border-box;
  border: 4rpx solid var(--cook-ink);
  border-radius: 24rpx;
  background: var(--cook-blue-soft);
  box-shadow: 5rpx 6rpx 0 rgba(47, 47, 45, 0.96);
}
</style>
