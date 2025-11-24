<script setup lang="ts">
import { type Recipe, type SearchParams, getCategoryRecipeCount, getRecipeList } from '../../api/modules/recipe'
import { applyImagePreset } from '../../utils/image'

definePage({
  name: 'category',
  style: {
    navigationBarTitleText: '分类菜谱',
  },
})

const router = useRouter()
const route = useRoute()

// 获取分类参数
const category = computed(() => decodeURIComponent(route.params?.category as string || ''))

// 菜谱列表数据
const recipes = ref<Recipe[]>([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const limit = 20
const totalCount = ref<number>(0)

// 获取菜谱列表
async function fetchRecipes(isRefresh = false) {
  if (loading.value)
    return

  loading.value = true

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
    name: 'recipe-detail',
    params: { id: recipe.id },
  })
}

// 页面加载时获取数据
onMounted(() => {
  fetchRecipes(true)
  fetchCount()
})

// // 监听分类变化
// watch(category, () => {
//   recipes.value = []
//   page.value = 1
//   hasMore.value = true
//   fetchRecipes(true)
//   fetchCount()
// })

async function fetchCount() {
  try {
    const res = await getCategoryRecipeCount(category.value)
    totalCount.value = Array.isArray(res) && res[0]?.count ? Number(res[0].count) : 0
  }
  catch (e) {
    totalCount.value = 0
  }
}

onShareAppMessage(() => {
  return {
    title: `${category.value} 菜谱`,
    path: `/pages/category/index?category=${category.value}`,
  }
})

onShareTimeline(() => {
  return {
    title: `${category.value} 菜谱`,
    path: `/pages/category/index?category=${category.value}`,
  }
})
</script>

<template>
  <view class="min-h-screen bg-gray-50">
    <!-- 分类标题 -->
    <view class="border-b border-gray-100 bg-white px-32rpx py-32rpx">
      <text class="text-36rpx text-gray-800 font-bold">
        {{ category }}
      </text>
      <text class="mt-8rpx block text-24rpx text-gray-500">
        共 {{ totalCount }} 道菜谱
      </text>
    </view>

    <!-- 菜谱列表 -->
    <view class="flex-1">
      <view class="px-32rpx py-24rpx">
        <!-- 加载状态 -->
        <view v-if="loading && recipes.length === 0" class="grid grid-cols-2 gap-24rpx">
          <view
            v-for="n in 6"
            :key="n"
            class="overflow-hidden rounded-16rpx bg-white shadow-sm"
          >
            <view class="h-240rpx w-full bg-gray-200">
              <wd-skeleton :row-col="[{ height: '240rpx' }]" animation="gradient" :custom-style="{ width: '100%' }" />
            </view>
            <view class="p-24rpx">
              <wd-skeleton :row-col="[{ width: '70%', height: '28rpx' }, { width: '100%', height: '24rpx', marginTop: '8rpx' }]" animation="gradient" />
            </view>
          </view>
        </view>

        <!-- 菜谱网格 -->
        <view v-else class="grid grid-cols-2 gap-24rpx">
          <view
            v-for="recipe in recipes"
            :key="recipe.id"
            class="overflow-hidden rounded-16rpx bg-white shadow-sm"
            @click="goToRecipeDetail(recipe)"
          >
            <!-- 菜谱图片 -->
            <view class="h-240rpx w-full flex items-center justify-center bg-gray-200">
              <image
                v-if="recipe.cover_image"
                :src="applyImagePreset(recipe.cover_image, 'RECIPE_COVER')"
                class="h-full w-full object-cover"
                mode="aspectFill"
                :lazy-load="true"
              />
              <text v-else class="text-64rpx">
                🍽️
              </text>
            </view>

            <!-- 菜谱信息 -->
            <view class="p-24rpx">
              <text class="line-clamp-1 mb-8rpx block text-28rpx text-gray-800 font-medium">
                {{ recipe.title }}
              </text>
              <text class="line-clamp-2 text-24rpx text-gray-500">
                {{ recipe.ingredients.slice(0, 30) }}...
              </text>
            </view>
          </view>
        </view>

        <!-- 加载更多状态 -->
        <view v-if="loading && recipes.length > 0" class="px-32rpx py-40rpx">
          <view class="grid grid-cols-2 gap-24rpx">
            <view
              v-for="n in 2"
              :key="n"
              class="overflow-hidden rounded-16rpx bg-white shadow-sm"
            >
              <view class="h-240rpx w-full bg-gray-200">
                <wd-skeleton :row-col="[{ height: '240rpx' }]" animation="gradient" :custom-style="{ width: '100%' }" />
              </view>
              <view class="p-24rpx">
                <wd-skeleton :row-col="[{ width: '70%', height: '28rpx' }, { width: '100%', height: '24rpx', marginTop: '8rpx' }]" animation="gradient" />
              </view>
            </view>
          </view>
        </view>

        <!-- 没有更多数据 -->
        <view v-else-if="!hasMore && recipes.length > 0" class="flex justify-center py-40rpx">
          <text class="text-24rpx text-gray-400">
            没有更多菜谱了
          </text>
        </view>

        <!-- 空状态 -->
        <view v-if="!loading && recipes.length === 0" class="flex flex-col items-center justify-center py-120rpx">
          <text class="mb-24rpx text-96rpx">
            🍽️
          </text>
          <text class="text-28rpx text-gray-500">
            暂无菜谱
          </text>
        </view>
      </view>

      <!-- 底部间距 -->
      <view class="h-120rpx" />
    </view>
  </view>
</template>

<style scoped>

</style>
