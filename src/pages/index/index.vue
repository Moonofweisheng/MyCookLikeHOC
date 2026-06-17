<script setup lang="ts">
import { type Category, type Recipe, getCategoryList, getDailyRecommendedRecipes } from '../../api/modules/recipe'
import AppSectionHeader from '@/components/AppSectionHeader.vue'
import CategoryShortcut from '@/components/CategoryShortcut.vue'
import CategoryShortcutSkeleton from '@/components/CategoryShortcutSkeleton.vue'
import EmptyState from '@/components/EmptyState.vue'
import RecipeCard from '@/components/RecipeCard.vue'
import RecipeCardSkeleton from '@/components/RecipeCardSkeleton.vue'

definePage({
  name: 'home',
  layout: 'tabbar',
  style: {
    navigationBarTitleText: '鱼哥菜谱',
  },
})

const router = useRouter()

// 推荐菜谱数据
const recommendedRecipes = ref<Recipe[]>([])
// 分类数据 - 后端返回 {category, icon_url} 对象数组
const categories = ref<Category[]>([])
const featuredRecipe = computed(() => recommendedRecipes.value[0])
const secondaryRecipes = computed(() => recommendedRecipes.value.slice(1))

// 获取推荐菜谱
const today = computed(() => new Date().toISOString().slice(0, 10))
const { loading: recommendLoading, data: recommendData, error: recommendError, send: fetchRecommended } = useRequest(() => getDailyRecommendedRecipes({ date: today.value }), {
  immediate: true,
})

// 获取分类列表
const { loading: categoryLoading, data: categoryData, error: categoryError, send: fetchCategories } = useRequest(getCategoryList, {
  immediate: true,
})

// 监听数据变化
watch(recommendData, (data) => {
  if (data) {
    recommendedRecipes.value = data
  }
})

watch(categoryData, (data) => {
  if (data) {
    categories.value = data
  }
})

// 跳转到菜谱详情
function goToRecipeDetail(recipe: Recipe) {
  router.push({
    path: '/pages/recipe-detail/index',
    query: { id: recipe.id },
  })
}

// 跳转到分类页面
function goToCategory(categoryItem: Category) {
  router.push({
    path: '/pages/category/index',
    query: { category: categoryItem.category },
  })
}

// 跳转到搜索页面
function goToSearch() {
  router.push({
    name: 'search',
  })
}

// 下拉刷新
function onRefresh() {
  fetchRecommended()
  fetchCategories()
}

onShareAppMessage(() => {
  return {
    title: '鱼哥菜谱：家常菜照着做，今天吃什么不用愁',
    path: '/pages/index/index',
  }
})

onShareTimeline(() => {
  return {
    title: '鱼哥菜谱：家常菜照着做，今天吃什么不用愁',
    path: '/pages/index/index',
  }
})
</script>

<template>
  <view class="home-page min-h-screen bg-[var(--cook-bg)] pb-152rpx pt-24rpx">
    <view class="home-hero cook-illo-card mx-24rpx px-28rpx pb-30rpx pt-28rpx">
      <view class="mb-26rpx flex items-end justify-between gap-24rpx">
        <view class="min-w-0">
          <text class="home-eyebrow mb-12rpx inline-block text-22rpx font-900">
            今日菜单
          </text>
          <text class="block text-44rpx text-[var(--cook-text)] font-900 leading-tight">
            今天想做点什么？
          </text>
          <text class="mt-12rpx block text-26rpx text-[var(--cook-text-soft)] leading-relaxed">
            找一道鱼哥菜谱里的顺手做法
          </text>
        </view>
        <view class="hero-badge h-82rpx w-82rpx flex shrink-0 items-center justify-center rounded-full">
          <text class="text-30rpx text-[var(--cook-ink)] font-900">
            做
          </text>
        </view>
      </view>

      <view
        class="home-search cook-pressable flex items-center px-24rpx py-20rpx"
        @click="goToSearch"
      >
        <view class="search-icon h-48rpx w-48rpx flex shrink-0 items-center justify-center rounded-full">
          <wd-icon name="search" size="30rpx" color="var(--cook-ink)" />
        </view>
        <text class="ml-18rpx flex-1 text-28rpx text-[var(--cook-text-muted)]">
          搜索菜名、食材
        </text>
        <text class="search-action rounded-10rpx px-18rpx py-8rpx text-23rpx text-[var(--cook-ink)] font-900">
          搜索
        </text>
      </view>
    </view>

    <view class="px-32rpx pt-32rpx">
      <AppSectionHeader title="今日推荐" subtitle="每天换一组，少想一点吃什么" />

      <view v-if="recommendLoading" class="space-y-22rpx">
        <RecipeCardSkeleton variant="feature" />
        <RecipeCardSkeleton
          v-for="n in 2"
          :key="n"
          variant="horizontal"
        />
      </view>
      <view v-else-if="featuredRecipe" class="space-y-22rpx">
        <RecipeCard :recipe="featuredRecipe" variant="feature" @select="goToRecipeDetail" />
        <RecipeCard
          v-for="recipe in secondaryRecipes.slice(0, 3)"
          :key="recipe.id"
          :recipe="recipe"
          variant="horizontal"
          @select="goToRecipeDetail"
        />
      </view>
      <EmptyState
        v-else
        :title="recommendError ? '今日推荐加载失败' : '今日还没有推荐'"
        :description="recommendError ? '网络开了小差，重新试试' : '稍后再回来看看'"
        icon="search"
        action-text="重新加载"
        @action="fetchRecommended"
      />
    </view>

    <view class="mt-44rpx px-32rpx">
      <AppSectionHeader title="菜品分类" subtitle="按做法和菜系快速找菜" />

      <view v-if="categoryLoading" class="grid grid-cols-4 gap-x-22rpx gap-y-28rpx">
        <CategoryShortcutSkeleton
          v-for="n in 8"
          :key="n"
        />
      </view>
      <EmptyState
        v-else-if="categoryError || categories.length === 0"
        :title="categoryError ? '分类加载失败' : '暂无分类'"
        :description="categoryError ? '重新加载后继续找菜' : '分类整理中'"
        icon="search"
        action-text="重新加载"
        @action="fetchCategories"
      />
      <view v-else class="grid grid-cols-4 gap-x-22rpx gap-y-30rpx">
        <CategoryShortcut
          v-for="(categoryItem, index) in categories"
          :key="categoryItem.category"
          :category="categoryItem.category"
          :icon-url="categoryItem.icon_url"
          :tone="index"
          @select="goToCategory(categoryItem)"
        />
      </view>
    </view>

    <view v-if="secondaryRecipes.length > 3" class="mt-44rpx px-32rpx">
      <AppSectionHeader title="继续看看" subtitle="从今日推荐里再挑几道" />
      <view class="space-y-22rpx">
        <RecipeCard
          v-for="recipe in secondaryRecipes.slice(3)"
          :key="recipe.id"
          :recipe="recipe"
          variant="horizontal"
          @select="goToRecipeDetail"
        />
      </view>
    </view>
  </view>
</template>

<style scoped>
.home-page {
  background:
    linear-gradient(90deg, rgba(47, 47, 45, 0.035) 1px, transparent 1px),
    linear-gradient(180deg, rgba(47, 47, 45, 0.035) 1px, transparent 1px),
    linear-gradient(135deg, #fff6f7 0%, #fffdf2 46%, #f1fbff 100%);
  background-size:
    44rpx 44rpx,
    44rpx 44rpx,
    100% 100%;
}

.home-hero {
  background:
    linear-gradient(135deg, rgba(255, 254, 249, 0.98) 0%, rgba(240, 255, 217, 0.9) 100%);
}

.home-eyebrow {
  border: 4rpx solid var(--cook-ink);
  border-radius: 999rpx;
  background: var(--cook-yellow);
  padding: 5rpx 16rpx;
  color: var(--cook-ink);
}

.hero-badge {
  border: 5rpx solid var(--cook-ink);
  background: var(--cook-primary);
  box-shadow: 5rpx 6rpx 0 rgba(47, 47, 45, 0.96);
}

.home-search {
  box-sizing: border-box;
  min-height: 92rpx;
  border: 5rpx solid var(--cook-ink);
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 5rpx 6rpx 0 rgba(47, 47, 45, 0.96);
}

.search-icon {
  border: 4rpx solid var(--cook-ink);
  background: var(--cook-blue-soft);
}

.search-action {
  border: 4rpx solid var(--cook-ink);
  background: var(--cook-primary);
}
</style>
