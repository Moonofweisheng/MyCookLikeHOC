<script setup lang="ts">
import { type Recipe, type SearchParams, getCategoryRecipeCount, getRecipeList } from '../../api/modules/recipe'
import AppSectionHeader from '@/components/AppSectionHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import RecipeCard from '@/components/RecipeCard.vue'
import RecipeCardSkeleton from '@/components/RecipeCardSkeleton.vue'

definePage({
  name: 'category',
  style: {
    navigationBarTitleText: '分类菜谱',
  },
})

const router = useRouter()
const route = useRoute()

// 获取分类参数
const category = ref('')

// 菜谱列表数据
const recipes = ref<Recipe[]>([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const limit = 20
const totalCount = ref<number>(0)
const loadError = ref('')

function normalizeRouteValue(value: unknown) {
  const rawValue = Array.isArray(value) ? value[0] : value
  if (!rawValue)
    return ''

  return decodeURIComponent(String(rawValue))
}

function getCategoryFromLocation() {
  if (typeof window === 'undefined')
    return ''

  try {
    const url = new URL(window.location.href)
    const searchCategory = url.searchParams.get('category')
    if (searchCategory)
      return decodeURIComponent(searchCategory)

    const hashQuery = url.hash.includes('?') ? url.hash.split('?')[1] : ''
    return decodeURIComponent(new URLSearchParams(hashQuery).get('category') || '')
  }
  catch {
    return ''
  }
}

function resolveCategory(options?: Record<string, unknown>) {
  return normalizeRouteValue(options?.category)
    || normalizeRouteValue(route.query?.category)
    || normalizeRouteValue(route.params?.category)
    || getCategoryFromLocation()
}

function syncCategory(options?: Record<string, unknown>) {
  const nextCategory = resolveCategory(options)
  if (nextCategory && nextCategory !== category.value)
    category.value = nextCategory
}

// 获取菜谱列表
async function fetchRecipes(isRefresh = false) {
  if (loading.value || !category.value)
    return

  loading.value = true
  loadError.value = ''

  try {
    const requestPage = isRefresh ? 1 : page.value
    const params: SearchParams = {
      category: category.value,
      page: requestPage,
      limit,
    }

    const data = await getRecipeList(params)

    if (isRefresh) {
      recipes.value = data || []
    }
    else {
      recipes.value.push(...(data || []))
    }

    // 判断是否还有更多数据
    hasMore.value = (data?.length || 0) === limit

    // 下一次请求页码，避免前两次 offset 都为 0
    page.value = requestPage + (hasMore.value ? 1 : 0)
  }
  catch (error) {
    console.error('获取菜谱列表失败:', error)
    loadError.value = '菜谱列表加载失败'
    uni.showToast({
      title: '加载失败',
      icon: 'error',
    })
  }
  finally {
    loading.value = false
  }
}

// 下拉刷新
function onRefresh() {
  fetchRecipes(true)
}

// 上拉加载更多
function onLoadMore() {
  if (hasMore.value && !loading.value) {
    fetchRecipes()
  }
}

// 页面触底事件
onReachBottom(() => {
  onLoadMore()
})

// 下拉刷新事件
onPullDownRefresh(() => {
  onRefresh()
  // 停止下拉刷新动画
  setTimeout(() => {
    uni.stopPullDownRefresh()
  }, 1000)
})

// 跳转到菜谱详情
function goToRecipeDetail(recipe: Recipe) {
  router.push({
    path: '/pages/recipe-detail/index',
    query: { id: recipe.id },
  })
}

function refreshCategoryData() {
  recipes.value = []
  page.value = 1
  hasMore.value = true
  loadError.value = ''
  fetchRecipes(true)
  fetchCount()
}

onLoad((options) => {
  syncCategory(options as Record<string, unknown>)
})

watch(category, () => {
  refreshCategoryData()
})

watch(() => [route.query?.category, route.params?.category], () => {
  syncCategory()
})

onMounted(() => {
  syncCategory()
  if (category.value && recipes.value.length === 0 && !loading.value)
    refreshCategoryData()
})

async function fetchCount() {
  try {
    if (!category.value) {
      totalCount.value = 0
      return
    }

    const res = await getCategoryRecipeCount(category.value)
    totalCount.value = Array.isArray(res) && res[0]?.count ? Number(res[0].count) : 0
  }
  catch (e) {
    totalCount.value = 0
  }
}

onShareAppMessage(() => {
  const encodedCategory = encodeURIComponent(category.value)
  return {
    title: category.value ? `鱼哥菜谱：${category.value} 做法合集` : '鱼哥菜谱：分类菜谱',
    path: encodedCategory ? `/pages/category/index?category=${encodedCategory}` : '/pages/category/index',
  }
})

onShareTimeline(() => {
  const encodedCategory = encodeURIComponent(category.value)
  return {
    title: category.value ? `鱼哥菜谱：${category.value} 做法合集` : '鱼哥菜谱：分类菜谱',
    path: encodedCategory ? `/pages/category/index?category=${encodedCategory}` : '/pages/category/index',
  }
})
</script>

<template>
  <view class="cook-illo-page pb-120rpx">
    <view class="category-hero cook-illo-card mx-24rpx mt-24rpx px-28rpx py-30rpx">
      <view class="flex items-start justify-between gap-24rpx">
        <view class="min-w-0 flex-1">
          <text class="cook-illo-tag mb-16rpx inline-block px-14rpx py-5rpx text-22rpx font-900">
            分类
          </text>
          <text class="block text-44rpx text-[var(--cook-text)] font-900 leading-tight">
            {{ category }}
          </text>
          <text class="mt-12rpx block text-26rpx text-[var(--cook-text-soft)] leading-relaxed">
            慢慢挑一道鱼哥菜谱里的顺手做法
          </text>
        </view>
        <view class="count-badge flex shrink-0 flex-col items-center justify-center">
          <text class="text-34rpx text-[var(--cook-ink)] font-900">
            {{ totalCount }}
          </text>
          <text class="text-20rpx text-[var(--cook-ink)] font-800">
            道菜
          </text>
        </view>
      </view>
    </view>

    <view class="px-32rpx py-32rpx">
      <AppSectionHeader title="菜谱列表" subtitle="按最近整理顺序展示" />

      <view v-if="loading && recipes.length === 0" class="grid grid-cols-2 gap-22rpx">
        <RecipeCardSkeleton
          v-for="n in 6"
          :key="n"
          variant="grid"
        />
      </view>

      <EmptyState
        v-else-if="loadError && recipes.length === 0"
        title="菜谱列表加载失败"
        description="重新加载后继续挑菜"
        icon="search"
        action-text="重新加载"
        @action="refreshCategoryData"
      />

      <view v-else-if="recipes.length > 0" class="grid grid-cols-2 gap-22rpx">
        <RecipeCard
          v-for="recipe in recipes"
          :key="recipe.id"
          :recipe="recipe"
          variant="grid"
          @select="goToRecipeDetail"
        />
      </view>

      <view v-if="loading && recipes.length > 0" class="grid grid-cols-2 gap-22rpx pt-22rpx">
        <RecipeCardSkeleton
          v-for="n in 2"
          :key="n"
          variant="grid"
        />
      </view>

      <view v-else-if="!hasMore && recipes.length > 0" class="flex justify-center py-44rpx">
        <text class="cook-illo-status px-20rpx py-12rpx text-24rpx text-[var(--cook-text-soft)] font-700">
          没有更多菜谱了
        </text>
      </view>

      <EmptyState
        v-if="!loading && recipes.length === 0"
        title="暂无菜谱"
        description="换个分类看看"
        icon="search"
      />
    </view>
  </view>
</template>

<style scoped>
.category-hero {
  background:
    linear-gradient(135deg, rgba(255, 254, 249, 0.98) 0%, rgba(240, 255, 217, 0.9) 100%);
}

.count-badge {
  box-sizing: border-box;
  width: 108rpx;
  height: 108rpx;
  border: 5rpx solid var(--cook-ink);
  border-radius: 999rpx;
  background: var(--cook-primary);
  box-shadow: 5rpx 6rpx 0 rgba(47, 47, 45, 0.96);
}
</style>
