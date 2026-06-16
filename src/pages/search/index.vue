<script setup lang="ts">
import { type Recipe, type SearchParams, getRecipeList } from '../../api/modules/recipe'
import { requestWithRetry } from '../../utils/network'
import EmptyState from '@/components/EmptyState.vue'
import RecipeCard from '@/components/RecipeCard.vue'
import RecipeCardSkeleton from '@/components/RecipeCardSkeleton.vue'

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
const searchError = ref('')
const searchedKeyword = ref('')

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

function normalizeRouteValue(value: unknown) {
  const rawValue = Array.isArray(value) ? value[0] : value
  if (!rawValue)
    return ''

  return decodeURIComponent(String(rawValue))
}

function getKeywordFromLocation() {
  if (typeof window === 'undefined')
    return ''

  try {
    const url = new URL(window.location.href)
    const searchKeyword = url.searchParams.get('keyword')
    if (searchKeyword)
      return decodeURIComponent(searchKeyword)

    const hashQuery = url.hash.includes('?') ? url.hash.split('?')[1] : ''
    return decodeURIComponent(new URLSearchParams(hashQuery).get('keyword') || '')
  }
  catch {
    return ''
  }
}

function applyIncomingKeyword(value: string) {
  const incomingKeyword = value.trim()
  if (!incomingKeyword || incomingKeyword === searchedKeyword.value)
    return

  keyword.value = incomingKeyword
  searchResults.value = []
  page.value = 1
  hasMore.value = true
  searchError.value = ''
  performSearch(incomingKeyword, true)
}

function mergeRecipes(current: Recipe[], incoming: Recipe[]) {
  const existingIds = new Set(current.map(item => item.id))
  return [
    ...current,
    ...incoming.filter(item => !existingIds.has(item.id)),
  ]
}

// 执行搜索
async function performSearch(searchKeyword: string, isRefresh = false) {
  const normalizedKeyword = searchKeyword.trim()
  if (!normalizedKeyword)
    return

  if (loading.value)
    return

  loading.value = true
  searchError.value = ''

  try {
    const requestPage = isRefresh ? 1 : page.value
    const params: SearchParams = {
      keyword: normalizedKeyword,
      page: requestPage,
      limit,
    }

    const data = await requestWithRetry(() => getRecipeList(params))
    const incomingRecipes = data || []

    if (isRefresh) {
      searchResults.value = incomingRecipes
    }
    else {
      searchResults.value = mergeRecipes(searchResults.value, incomingRecipes)
    }

    // 判断是否还有更多数据
    hasMore.value = incomingRecipes.length === limit
    page.value = requestPage + (hasMore.value ? 1 : 0)

    hasSearched.value = true
    searchedKeyword.value = normalizedKeyword

    // 保存搜索历史
    if (isRefresh) {
      saveSearchHistory(normalizedKeyword)
    }
  }
  catch (error) {
    console.error('搜索失败:', error)
    searchError.value = '搜索失败'
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
  searchError.value = ''
  searchedKeyword.value = keyword.value.trim()
  performSearch(keyword.value, true)
}

function retrySearch() {
  if (!keyword.value.trim())
    return

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
  const nextKeyword = searchedKeyword.value || keyword.value.trim()
  if (hasMore.value && !loading.value && nextKeyword) {
    performSearch(nextKeyword)
  }
}

// 跳转到菜谱详情
function goToRecipeDetail(recipe: Recipe) {
  router.push({
    path: '/pages/recipe-detail/index',
    query: { id: recipe.id },
  })
}

// 清空搜索结果
function clearSearch() {
  keyword.value = ''
  searchResults.value = []
  hasSearched.value = false
  page.value = 1
  hasMore.value = true
  searchError.value = ''
  searchedKeyword.value = ''
}

function refreshSearch() {
  const nextKeyword = searchedKeyword.value || keyword.value.trim()
  if (!hasSearched.value || !nextKeyword)
    return

  keyword.value = nextKeyword
  retrySearch()
}

onReachBottom(() => {
  onLoadMore()
})

onPullDownRefresh(() => {
  refreshSearch()
  setTimeout(() => {
    uni.stopPullDownRefresh()
  }, 1000)
})

onLoad((options) => {
  applyIncomingKeyword(normalizeRouteValue((options as Record<string, unknown>)?.keyword))
})

onMounted(() => {
  loadSearchHistory()
  applyIncomingKeyword(getKeywordFromLocation())
})

onShareAppMessage(() => {
  const nextKeyword = searchedKeyword.value || keyword.value.trim()
  return {
    title: nextKeyword ? `搜索 ${nextKeyword} 菜谱` : '搜索菜谱',
    path: nextKeyword ? `/pages/search/index?keyword=${encodeURIComponent(nextKeyword)}` : '/pages/search/index',
  }
})

onShareTimeline(() => {
  const nextKeyword = searchedKeyword.value || keyword.value.trim()
  return {
    title: nextKeyword ? `搜索 ${nextKeyword} 菜谱` : '搜索菜谱',
    path: nextKeyword ? `/pages/search/index?keyword=${encodeURIComponent(nextKeyword)}` : '/pages/search/index',
  }
})
</script>

<template>
  <view class="cook-illo-page pb-120rpx">
    <view class="search-hero cook-illo-card mx-24rpx mt-24rpx px-26rpx pb-28rpx pt-26rpx">
      <text class="cook-illo-tag mb-18rpx inline-block px-14rpx py-5rpx text-22rpx font-900">
        找菜
      </text>
      <text class="mb-22rpx block text-40rpx text-[var(--cook-text)] font-900 leading-tight">
        搜索菜谱
      </text>
      <view class="flex items-center gap-16rpx">
        <view class="search-input flex flex-1 items-center px-22rpx py-18rpx">
          <wd-icon name="search" size="32rpx" color="var(--cook-ink)" />
          <input
            v-model="keyword"
            class="ml-16rpx flex-1 bg-transparent text-28rpx text-[var(--cook-text)] outline-none"
            placeholder="搜索菜谱、配料..."
            placeholder-class="text-gray-400"
            @confirm="onSearch"
          >
          <view v-if="keyword" class="ml-16rpx" @click="clearSearch">
            <wd-icon name="close-bold" size="28rpx" color="var(--cook-text-muted)" />
          </view>
        </view>
        <view
          class="cook-illo-button cook-pressable shrink-0 px-24rpx py-18rpx"
          @click="onSearch"
        >
          <text class="text-28rpx text-[var(--cook-ink)] font-900">
            搜索
          </text>
        </view>
      </view>
    </view>

    <view v-if="!hasSearched" class="px-32rpx py-36rpx">
      <view v-if="searchHistory.length > 0">
        <view class="mb-24rpx flex items-center justify-between">
          <text class="text-34rpx text-[var(--cook-text)] font-900">
            搜索发现
          </text>
          <view class="cook-illo-pill cook-pressable px-16rpx py-8rpx" @click="clearSearchHistory">
            <text class="text-23rpx text-[var(--cook-text)] font-800">
              清空
            </text>
          </view>
        </view>

        <view class="flex flex-wrap gap-16rpx">
          <view
            v-for="(historyItem, index) in searchHistory"
            :key="index"
            class="history-chip cook-illo-pill cook-pressable px-22rpx py-13rpx"
            @click="onHistoryClick(historyItem)"
          >
            <text class="text-24rpx text-[var(--cook-text)] font-800">
              {{ historyItem }}
            </text>
          </view>
        </view>
      </view>

      <EmptyState
        v-else
        title="暂无搜索历史"
        description="试试搜索你想做的菜"
        icon="search"
      />
    </view>

    <view v-else>
      <view class="px-32rpx pt-26rpx">
        <view class="cook-illo-status px-22rpx py-16rpx">
          <text class="text-26rpx text-[var(--cook-text-soft)] font-700">
            搜索 "{{ searchedKeyword || keyword }}" 共找到 {{ searchResults.length }} 个结果
          </text>
        </view>
      </view>

      <view>
        <view class="px-32rpx py-24rpx">
          <view v-if="loading && searchResults.length === 0" class="space-y-22rpx">
            <RecipeCardSkeleton
              v-for="n in 4"
              :key="n"
              variant="horizontal"
            />
          </view>

          <EmptyState
            v-else-if="searchError && searchResults.length === 0"
            title="搜索失败"
            description="重新搜索后继续找菜"
            icon="search"
            action-text="重新搜索"
            @action="retrySearch"
          />

          <view v-else-if="searchResults.length > 0" class="space-y-22rpx">
            <RecipeCard
              v-for="recipe in searchResults"
              :key="recipe.id"
              :recipe="recipe"
              variant="horizontal"
              @select="goToRecipeDetail"
            />

            <view v-if="loading" class="flex justify-center py-40rpx">
              <wd-loading type="ring" size="24rpx" color="var(--cook-primary)" />
              <text class="ml-16rpx text-24rpx text-[var(--cook-text-muted)]">
                加载中...
              </text>
            </view>

            <view
              v-else-if="hasMore"
              class="flex justify-center py-40rpx"
              @click="onLoadMore"
            >
              <view class="cook-illo-button cook-pressable px-28rpx py-14rpx">
                <text class="text-24rpx text-[var(--cook-ink)] font-900">
                  加载更多
                </text>
              </view>
            </view>

            <view v-else-if="!hasMore" class="flex justify-center py-40rpx">
              <text class="text-24rpx text-[var(--cook-text-muted)]">
                没有更多结果了
              </text>
            </view>
          </view>

          <EmptyState
            v-else
            title="没有找到相关菜谱"
            description="试试其他关键词"
            icon="search"
          />
        </view>

        <view class="h-120rpx" />
      </view>
    </view>
  </view>
</template>

<style scoped>
.search-hero {
  background:
    linear-gradient(135deg, rgba(255, 254, 249, 0.98) 0%, rgba(234, 244, 255, 0.92) 100%);
}

.search-input {
  box-sizing: border-box;
  min-width: 0;
  border: 4rpx solid var(--cook-ink);
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.92);
}

.history-chip {
  background: var(--cook-paper);
}
</style>
