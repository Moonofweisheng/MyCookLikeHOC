<script setup lang="ts">
import { type Recipe, getRandomRecipesByCategory, getRecipeDetail } from '../../api/modules/recipe'
import { applyImagePreset } from '../../utils/image'
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
const recipeId = computed(() => decodeURIComponent(route.params?.id as string || ''))

// 菜谱详情数据
const recipe = ref<Recipe | null>(null)
const loading = ref(false)
const recommendedRecipes = ref<Recipe[]>([])
// 移除所有模拟数据，只保留真实数据

// 获取菜谱详情
async function fetchRecipeDetail() {
  if (!recipeId.value)
    return

  loading.value = true

  try {
    const data = await getRecipeDetail(recipeId.value)

    if (data && data.length > 0) {
      recipe.value = data[0]
      // 获取推荐菜谱
      fetchRecommendedRecipes()
    }
    else {
      uni.showToast({
        title: '菜谱不存在',
        icon: 'error',
      })
      setTimeout(() => {
        router.back()
      }, 1500)
    }
  }
  catch (error) {
    console.error('获取菜谱详情失败:', error)
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
  router.replace(`/pages/recipe-detail/index?id=${id}`)
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

// 格式化配料列表
function formatIngredients(ingredients: string) {
  if (!ingredients)
    return []
  return ingredients.split('\n').filter(item => item.trim())
}

// 格式化制作步骤
function formatSteps(steps: string) {
  if (!steps)
    return []
  return steps.split('\n').filter(item => item.trim())
}

// 页面加载时获取数据
onMounted(() => {
  fetchRecipeDetail()
})

// 监听ID变化
watch(recipeId, () => {
  if (recipeId.value) {
    fetchRecipeDetail()
  }
})

onShareAppMessage(() => {
  return {
    title: recipe.value?.title || '菜谱详情',
    path: `/pages/recipe-detail/index?id=${recipeId.value}`,
  }
})

onShareTimeline(() => {
  return {
    title: recipe.value?.title || '菜谱详情',
    path: `/pages/recipe-detail/index?id=${recipeId.value}`,
  }
})
</script>

<template>
  <view class="min-h-screen bg-gray-100">
    <!-- 骨架屏加载状态 -->
    <RecipeDetailSkeleton v-if="loading" />

    <!-- 菜谱详情 -->
    <view v-else-if="recipe" class="pb-40rpx">
      <!-- 顶部大图 -->
      <view class="relative h-500rpx w-full overflow-hidden">
        <image
          v-if="recipe.cover_image"
          :src="applyImagePreset(recipe.cover_image, 'DETAIL_IMAGE')"
          class="h-full w-full object-cover"
          mode="aspectFill"
          :lazy-load="true"
        />
        <view v-else class="h-full w-full flex items-center justify-center bg-gray-200">
          <text class="text-120rpx">
            🍽️
          </text>
        </view>
      </view>

      <!-- 菜谱基本信息 -->
      <view class="bg-white px-32rpx py-24rpx">
        <!-- 标题 -->
        <text class="mb-16rpx block text-36rpx text-gray-900 font-bold leading-tight">
          {{ recipe.title }}
        </text>

        <!-- 分类标签 -->
        <view class="mb-16rpx flex items-center">
          <view class="rounded-8rpx bg-orange-100 px-12rpx py-4rpx">
            <text class="text-22rpx text-orange-600">
              {{ recipe.category }}
            </text>
          </view>
        </view>
      </view>

      <!-- 配料清单 -->
      <view class="mt-16rpx bg-white">
        <view class="border-b border-gray-100 px-32rpx py-24rpx">
          <text class="text-32rpx text-gray-900 font-bold">
            食材清单
          </text>
        </view>

        <!-- 配料表格 -->
        <view class="px-32rpx pb-24rpx">
          <view class="grid grid-cols-2 gap-16rpx">
            <view
              v-for="(ingredient, index) in formatIngredients(recipe.ingredients)"
              :key="index"
              class="flex items-center justify-between border-b border-gray-50 py-16rpx"
            >
              <text class="flex-1 text-28rpx text-gray-800">
                {{ ingredient.replace(/^-\s*/, '').split(' ')[0] || ingredient.replace(/^-\s*/, '') }}
              </text>
              <text class="text-26rpx text-gray-500">
                {{ ingredient.replace(/^-\s*/, '').split(' ').slice(1).join(' ') || '适量' }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 制作流程图 -->
      <view v-if="recipe.process_image_url" class="mt-16rpx bg-white">
        <!-- <view class="border-b border-gray-100 px-32rpx py-24rpx">
          <text class="text-32rpx text-gray-900 font-bold">
            制作流程图
          </text>
        </view> -->

        <view class="py-24rpx">
          <view
            class="w-full bg-gray-50"
            @click="previewProcessImage"
          >
            <image
              :src="applyImagePreset(recipe.process_image_url, 'DETAIL_IMAGE')"
              class="h-600rpx w-full object-contain"
              mode="widthFix"
              :show-menu-by-longpress="true"
              :lazy-load="true"
            />
          </view>
          <!-- <text class="mt-16rpx block text-center text-24rpx text-gray-500">
            点击查看大图
          </text> -->
        </view>
      </view>

      <!-- 制作步骤 -->
      <view class="mt-16rpx bg-white">
        <view class="border-b border-gray-100 px-32rpx py-24rpx">
          <text class="text-32rpx text-gray-900 font-bold">
            步骤
          </text>
        </view>

        <view class="px-32rpx pb-24rpx">
          <view
            v-for="(step, index) in formatSteps(recipe.steps)"
            :key="index"
            class="flex border-b border-gray-50 py-24rpx last:border-b-0"
          >
            <!-- 步骤编号 -->
            <view class="mr-24rpx">
              <view class="h-48rpx w-48rpx flex items-center justify-center rounded-full bg-orange-500 text-white">
                <text class="text-24rpx font-bold">
                  {{ String(index + 1).padStart(2, '0') }}
                </text>
              </view>
            </view>

            <!-- 步骤内容 -->
            <view class="flex-1">
              <text class="text-28rpx text-gray-800 leading-relaxed">
                {{ step.replace(/^-\s*\d+\.?\s*/, '') }}
              </text>

              <!-- 步骤图片 -->
              <!-- <view class="mt-16rpx h-200rpx w-full flex items-center justify-center rounded-12rpx bg-gray-100">
                <view class="text-center">
                  <wd-icon name="camera" size="40rpx" color="#9ca3af" />
                  <text class="mt-8rpx block text-22rpx text-gray-400">
                    步骤图片
                  </text>
                </view>
              </view> -->
            </view>
          </view>
        </view>
      </view>

      <!-- 小贴士 -->
      <view class="mt-16rpx bg-white">
        <view class="border-b border-gray-100 px-32rpx py-24rpx">
          <text class="text-32rpx text-gray-900 font-bold">
            制作小贴士
          </text>
        </view>
        <view class="px-32rpx py-24rpx">
          <text class="text-28rpx text-gray-600 leading-relaxed">
            制作过程中请注意火候控制，根据个人口味适量调整调料用量。建议提前准备好所有配料，确保制作过程顺畅。
          </text>
        </view>
      </view>

      <!-- 相关推荐 -->
      <view v-if="recommendedRecipes.length > 0" class="mt-16rpx bg-white">
        <view class="border-b border-gray-100 px-32rpx py-24rpx">
          <text class="text-32rpx text-gray-900 font-bold">
            相关推荐
          </text>
        </view>

        <view class="px-32rpx py-24rpx">
          <scroll-view scroll-x class="whitespace-nowrap">
            <view class="flex space-x-20rpx">
              <view
                v-for="item in recommendedRecipes"
                :key="item.id"
                class="inline-block w-240rpx flex-shrink-0"
                @click="viewRecommendedRecipe(item.id)"
              >
                <view class="overflow-hidden rounded-12rpx bg-gray-100">
                  <view class="h-160rpx w-full">
                    <image
                      v-if="item.cover_image"
                      :src="applyImagePreset(item.cover_image, 'THUMBNAIL')"
                      class="h-full w-full object-cover"
                      mode="aspectFill"
                      :lazy-load="true"
                    />
                    <view v-else class="h-full w-full flex items-center justify-center bg-gray-200">
                      <text class="text-48rpx">
                        🍽️
                      </text>
                    </view>
                  </view>
                  <view class="p-16rpx">
                    <text class="line-clamp-2 text-24rpx text-gray-900 font-medium">
                      {{ item.title }}
                    </text>
                    <text class="mt-8rpx text-20rpx text-gray-500">
                      {{ item.category }}
                    </text>
                  </view>
                </view>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>
    </view>

    <!-- 错误状态 -->
    <view v-else-if="!loading" class="h-screen flex flex-col items-center justify-center">
      <text class="mb-24rpx text-96rpx">
        😕
      </text>
      <text class="text-28rpx text-gray-500">
        菜谱加载失败
      </text>
    </view>
  </view>
</template>

<style lang="scss" scoped></style>
