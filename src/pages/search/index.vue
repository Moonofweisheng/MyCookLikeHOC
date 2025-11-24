<script setup lang="ts">
import { type Recipe, type SearchParams, getRecipeList } from '../../api/modules/recipe'
import { applyImagePreset } from '../../utils/image'
import { requestWithRetry } from '../../utils/network'

definePage({
  name: 'search',
  style: {
    navigationBarTitleText: '搜索菜谱',
  },
})

const router = useRouter()

// 搜索相关数据
const keyword = ref('')
const searchResults = ref<Recipe[]>([])
const loading = ref(false)
const hasSearched = ref(false)
const hasMore = ref(true)
const page = ref(1)
const limit = 20

// 搜索历史
const searchHistory = ref<string[]>([])

// 从本地存储加载搜索历史
function loadSearchHistory() {
  try {
    const history = uni.getStorageSync('search_history')
    if (history) {
      searchHistory.value = JSON.parse(history)
    }
  }
  catch (error) {
    console.error('加载搜索历史失败:', error)
  }
}

// 保存搜索历史
function saveSearchHistory(keyword: string) {
  if (!keyword.trim())
    return

  // 移除重复项并添加到开头
  const newHistory = [keyword, ...searchHistory.value.filter(item => item !== keyword)]
  // 限制历史记录数量为20条
  searchHistory.value = newHistory.slice(0, 20)

  try {
    uni.setStorageSync('search_history', JSON.stringify(searchHistory.value))
  }
  catch (error) {
    console.error('保存搜索历史失败:', error)
  }
}

// 清空搜索历史
function clearSearchHistory() {
  searchHistory.value = []
  try {
    uni.removeStorageSync('search_history')
  }
  catch (error) {
    console.error('清空搜索历史失败:', error)
  }
}

// 执行搜索
async function performSearch(searchKeyword: string, isRefresh = false) {
  if (!searchKeyword.trim())
    return

  if (loading.value)
    return

  loading.value = true

  try {
    const params: SearchParams = {
      keyword: searchKeyword.trim(),
      page: isRefresh ? 1 : page.value,
      limit,
    }

    const data = await requestWithRetry(() => getRecipeList(params))

    if (isRefresh) {
      searchResults.value = data || []
      page.value = 1
    }
    else {
      searchResults.value.push(...(data || []))
    }

    // 判断是否还有更多数据
    hasMore.value = (data?.length || 0) === limit

    if (!isRefresh) {
      page.value++
    }

    hasSearched.value = true

    // 保存搜索历史
    if (isRefresh) {
      saveSearchHistory(searchKeyword)
    }
  }
  catch (error) {
    console.error('搜索失败:', error)
    uni.showToast({
      title: '搜索失败',
      icon: 'error',
    })
  }
  finally {
    loading.value = false
  }
}

// 搜索按钮点击
function onSearch() {
  if (!keyword.value.trim()) {
    uni.showToast({
      title: '请输入搜索关键词',
      icon: 'none',
    })
    return
  }

  searchResults.value = []
  page.value = 1
  hasMore.value = true
  performSearch(keyword.value, true)
}

// 历史记录点击
function onHistoryClick(historyKeyword: string) {
  keyword.value = historyKeyword
  onSearch()
}

// 删除历史记录项
function removeHistoryItem(index: number) {
  searchHistory.value.splice(index, 1)
  saveSearchHistory('')
}

// 上拉加载更多
function onLoadMore() {
  if (hasMore.value && !loading.value && keyword.value.trim()) {
    performSearch(keyword.value)
  }
}

// 跳转到菜谱详情
function goToRecipeDetail(recipe: Recipe) {
  router.push({
    name: 'recipe-detail',
    params: { id: recipe.id },
  })
}

// 清空搜索结果
function clearSearch() {
  keyword.value = ''
  searchResults.value = []
  hasSearched.value = false
  page.value = 1
  hasMore.value = true
}

// 页面加载时获取搜索历史
onMounted(() => {
  loadSearchHistory()
})
</script>

<template>
  <view class="min-h-screen bg-gray-50">
    <!-- 搜索栏 -->
    <view class="border-b border-gray-100 bg-white px-32rpx py-24rpx">
      <view class="flex items-center">
        <view class="flex flex-1 items-center rounded-full bg-gray-100 px-24rpx py-16rpx">
          <wd-icon name="search" size="32rpx" color="#999" />
          <input
            v-model="keyword"
            class="ml-16rpx flex-1 bg-transparent text-28rpx outline-none"
            placeholder="搜索菜谱、配料..."
            placeholder-class="text-gray-400"
            @confirm="onSearch"
          >
          <view v-if="keyword" class="ml-16rpx" @click="clearSearch">
            <wd-icon name="close-bold" size="28rpx" color="#999" />
          </view>
        </view>
        <view
          class="ml-24rpx rounded-full bg-orange-400 px-24rpx py-16rpx"
          @click="onSearch"
        >
          <text class="text-28rpx text-white font-medium">
            搜索
          </text>
        </view>
      </view>
    </view>

    <!-- 搜索发现（仅历史记录） -->
    <view v-if="!hasSearched" class="px-32rpx py-32rpx">
      <view v-if="searchHistory.length > 0">
        <view class="mb-24rpx flex items-center justify-between">
          <text class="text-32rpx text-gray-800 font-bold">
            搜索发现
          </text>
          <view @click="clearSearchHistory">
            <text class="text-24rpx text-gray-500">
              清空
            </text>
          </view>
        </view>

        <view class="flex flex-wrap gap-16rpx">
          <view
            v-for="(historyItem, index) in searchHistory"
            :key="index"
            class="border border-gray-100 rounded-full bg-white px-24rpx py-12rpx shadow-sm"
            @click="onHistoryClick(historyItem)"
          >
            <text class="text-24rpx text-gray-700">
              {{ historyItem }}
            </text>
          </view>
        </view>
      </view>

      <view v-else class="flex flex-col items-center justify-center py-80rpx">
        <text class="mb-16rpx text-32rpx text-gray-600">
          暂无搜索历史
        </text>
        <text class="text-24rpx text-gray-400">
          试试搜索你想做的菜吧
        </text>
      </view>
    </view>

    <!-- 搜索结果 -->
    <view v-else>
      <!-- 搜索结果标题 -->
      <view class="border-b border-gray-100 bg-white px-32rpx py-24rpx">
        <text class="text-28rpx text-gray-600">
          搜索 "{{ keyword }}" 共找到 {{ searchResults.length }} 个结果
        </text>
      </view>

      <!-- 搜索结果列表 -->
      <scroll-view
        scroll-y
        class="flex-1"
        @scrolltolower="onLoadMore"
      >
        <view class="px-32rpx py-24rpx">
          <!-- 加载状态 -->
          <view v-if="loading && searchResults.length === 0" class="flex justify-center py-80rpx">
            <wd-loading type="ring" />
          </view>

          <!-- 搜索结果 -->
          <view v-else-if="searchResults.length > 0" class="space-y-24rpx">
            <view
              v-for="recipe in searchResults"
              :key="recipe.id"
              class="flex overflow-hidden rounded-16rpx bg-white shadow-sm"
              @click="goToRecipeDetail(recipe)"
            >
              <!-- 菜谱图片 -->
              <view class="h-250rpx w-200rpx flex items-center justify-center bg-gray-200">
                <image
                  v-if="recipe.cover_image"
                  :src="applyImagePreset(recipe.cover_image, 'RECIPE_COVER')"
                  class="h-full w-full object-cover"
                  mode="aspectFill"
                  :lazy-load="true"
                />
                <text v-else class="text-48rpx">
                  🍽️
                </text>
              </view>

              <!-- 菜谱信息 -->
              <view class="flex-1 p-24rpx">
                <text class="mb-8rpx block text-28rpx text-gray-800 font-medium">
                  {{ recipe.title }}
                </text>
                <text class="mb-16rpx block text-24rpx text-gray-500">
                  {{ recipe.category }}
                </text>
                <text class="line-clamp-2 text-24rpx text-gray-600">
                  {{ recipe.ingredients.slice(0, 50) }}...
                </text>
              </view>
            </view>

            <!-- 加载更多状态 -->
            <view v-if="loading" class="flex justify-center py-40rpx">
              <wd-loading type="ring" size="24rpx" />
              <text class="ml-16rpx text-24rpx text-gray-500">
                加载中...
              </text>
            </view>

            <!-- 没有更多数据 -->
            <view v-else-if="!hasMore" class="flex justify-center py-40rpx">
              <text class="text-24rpx text-gray-400">
                没有更多结果了
              </text>
            </view>
          </view>

          <!-- 空搜索结果 -->
          <view v-else class="flex flex-col items-center justify-center py-120rpx">
            <text class="mb-24rpx text-96rpx">
              🔍
            </text>
            <text class="mb-16rpx text-28rpx text-gray-500">
              没有找到相关菜谱
            </text>
            <text class="text-24rpx text-gray-400">
              试试其他关键词吧
            </text>
          </view>
        </view>

        <!-- 底部间距 -->
        <view class="h-120rpx" />
      </scroll-view>
    </view>
  </view>
</template>

<style scoped>

</style>
