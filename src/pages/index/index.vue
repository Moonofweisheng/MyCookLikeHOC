<script setup lang="ts">
import { type Recipe, getCategoryList, getDailyRecommendedRecipes } from '../../api/modules/recipe'

definePage({
  name: 'home',
  layout: 'tabbar',
  style: {
    navigationBarTitleText: '像老乡鸡那样做饭',
  },
})

const router = useRouter()

// 推荐菜谱数据
const recommendedRecipes = ref<Recipe[]>([])
// 分类数据 - 后端返回 {category, icon_url} 对象数组
const categories = ref<{ category: string, icon_url: string }[]>([])
const categoryPages = computed(() => {
  const arr = categories.value || []
  const pages: Array<{ category: string, icon_url: string }[]> = []
  for (let i = 0; i < arr.length; i += 8) {
    pages.push(arr.slice(i, i + 8))
  }
  return pages
})

const current = ref(0)
const swiperList = computed(() => categoryPages.value)

function handleClick() {}
function onChange(val: number) {
  current.value = val
}

// 获取推荐菜谱
const today = computed(() => new Date().toISOString().slice(0, 10))
const { loading: recommendLoading, data: recommendData, send: fetchRecommended } = useRequest(() => getDailyRecommendedRecipes({ date: today.value }), {
  immediate: true,
})

// 获取分类列表
const { loading: categoryLoading, data: categoryData, send: fetchCategories } = useRequest(getCategoryList, {
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
    name: 'recipe-detail',
    params: { id: recipe.id },
  })
}

// 跳转到分类页面
function goToCategory(categoryItem: { category: string, icon_url: string }) {
  router.push({
    name: 'category',
    params: { category: categoryItem.category },
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
    title: '像老乡鸡那样做饭小程序，你一定能像老乡鸡一样会做饭！',
    path: '/pages/index/index',
  }
})

onShareTimeline(() => {
  return {
    title: '像老乡鸡那样做饭小程序，你一定能像老乡鸡一样会做饭！',
    path: '/pages/index/index',
  }
})
</script>

<template>
  <view class="min-h-screen bg-gray-50">
    <!-- 搜索栏 -->
    <view class="bg-white px-32rpx py-24rpx shadow-sm">
      <view
        class="flex items-center rounded-full bg-gray-100 px-32rpx py-20rpx"
        @click="goToSearch"
      >
        <wd-icon name="search" size="32rpx" color="#999" />
        <text class="ml-16rpx text-28rpx text-gray-500">
          搜索菜谱...
        </text>
      </view>
    </view>

    <!-- 主要内容 -->
    <scroll-view
      scroll-y
      class="flex-1"
    >
      <!-- 分类导航 -->
      <view class="mb-20rpx bg-white px-32rpx py-32rpx">
        <view class="mb-24rpx flex items-center justify-between">
          <text class="text-32rpx text-gray-800 font-bold">
            菜品分类
          </text>
        </view>

        <view v-if="categoryLoading" class="grid grid-cols-4 gap-24rpx">
          <view
            v-for="n in 8"
            :key="n"
            class="flex flex-col items-center rounded-16rpx bg-gray-50 p-24rpx"
          >
            <wd-skeleton :row-col="[{ size: '80rpx', type: 'circle' }]" animation="gradient" :custom-style="{ width: '80rpx', height: '80rpx' }" />
            <wd-skeleton :row-col="[{ width: '60%', height: '24rpx', marginTop: '16rpx' }]" animation="gradient" />
          </view>
        </view>

        <wd-swiper
          v-else
          v-model:current="current"
          :list="swiperList"
          :autoplay="false"
          :indicator="{ type: 'dots-bar' }"
          custom-class="h-440rpx"
          @click="handleClick"
          @change="onChange"
        >
          <template #default="{ item }">
            <view class="grid grid-cols-4 w-full gap-24rpx">
              <view
                v-for="categoryItem in item"
                :key="categoryItem.category"
                class="flex flex-col items-center rounded-16rpx bg-gray-50 p-24rpx"
                @click="goToCategory(categoryItem)"
              >
                <view class="mb-16rpx h-80rpx w-80rpx flex items-center justify-center overflow-hidden rounded-full bg-orange-100">
                  <image
                    :src="applyImagePreset(categoryItem.icon_url, 'CATEGORY_ICON')"
                    class="h-full w-full object-cover"
                    mode="aspectFill"
                    :lazy-load="true"
                  />
                </view>
                <text class="text-center text-24rpx text-gray-700">
                  {{ categoryItem.category }}
                </text>
              </view>
            </view>
          </template>
        </wd-swiper>
      </view>

      <!-- 推荐菜谱 -->
      <view class="bg-white px-32rpx py-32rpx">
        <view class="mb-24rpx flex items-center justify-between">
          <text class="text-32rpx text-gray-800 font-bold">
            今日推荐
          </text>
        </view>

        <view v-if="recommendLoading" class="space-y-24rpx">
          <view
            v-for="n in 3"
            :key="n"
            class="flex overflow-hidden rounded-16rpx bg-gray-50"
          >
            <view class="h-250rpx w-200rpx bg-gray-200">
              <wd-skeleton :row-col="[{ width: '200rpx', height: '250rpx' }]" animation="gradient" />
            </view>
            <view class="flex-1 p-24rpx">
              <wd-skeleton
                :row-col="[
                  { width: '60%', height: '28rpx' },
                  { width: '40%', height: '24rpx', marginTop: '12rpx' },
                  { width: '100%', height: '24rpx', marginTop: '16rpx' },
                ]" animation="gradient"
              />
            </view>
          </view>
        </view>

        <view v-else class="space-y-24rpx">
          <view
            v-for="recipe in recommendedRecipes"
            :key="recipe.id"
            class="flex overflow-hidden rounded-16rpx bg-gray-50"
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
        </view>
      </view>

      <!-- 底部间距 -->
    </scroll-view>
  </view>
</template>
