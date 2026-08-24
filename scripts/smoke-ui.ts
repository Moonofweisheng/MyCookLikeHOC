#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

function read(relativePath: string) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

function assertFile(relativePath: string) {
  const fullPath = path.join(root, relativePath)
  if (!fs.existsSync(fullPath)) {
    throw new Error(`缺少文件: ${relativePath}`)
  }
}

function assertIncludes(relativePath: string, expected: string) {
  const source = read(relativePath)
  if (!source.includes(expected)) {
    throw new Error(`${relativePath} 缺少关键片段: ${expected}`)
  }
}

function assertNotIncludes(relativePath: string, unexpected: string) {
  const source = read(relativePath)
  if (source.includes(unexpected)) {
    throw new Error(`${relativePath} 不应包含旧视觉片段: ${unexpected}`)
  }
}

function assertHookNotIncludes(relativePath: string, hookName: string, unexpected: string) {
  const source = read(relativePath)
  const hookStart = source.indexOf(`${hookName}(`)
  const hookEnd = source.indexOf('\n}))', hookStart)
  if (hookStart === -1 || hookEnd === -1) {
    throw new Error(`${relativePath} 缺少可检查的 ${hookName} 钩子`)
  }
  const hookSource = source.slice(hookStart, hookEnd)
  if (hookSource.includes(unexpected)) {
    throw new Error(`${relativePath} 的 ${hookName} 不应包含: ${unexpected}`)
  }
}

function main() {
  const requiredFiles = [
    'src/components/AppSectionHeader.vue',
    'src/components/CategoryShortcut.vue',
    'src/components/CategoryShortcutSkeleton.vue',
    'src/components/EmptyState.vue',
    'src/components/RecipeCard.vue',
    'src/components/RecipeCardSkeleton.vue',
    'src/components/RecipeImage.vue',
    'src/components/SkeletonBlock.vue',
    'src/pages/index/index.vue',
    'src/pages/category/index.vue',
    'src/pages/search/index.vue',
    'src/pages/recipe-detail/index.vue',
    'src/pages/about/index.vue',
    'src/pages/dish-duty/index.vue',
    'src/components/dish-duty/BuddySticker.vue',
    'src/components/dish-duty/DishDutyStage.vue',
    'src/components/dish-duty/DishDutyHomeCard.vue',
    'src/store/dishDutyStore.ts',
    'src/features/dish-duty/draw.ts',
    'src/features/dish-duty/motion.ts',
    'src/static/dish-duty/characters/buddy-egg.svg',
    'src/static/dish-duty/characters/buddy-tomato.svg',
    'src/static/dish-duty/plate-dirty.svg',
    'src/static/dish-duty/sponge.svg',
    'src/static/dish-duty/water-swoosh.svg',
    'src/static/dish-duty/lottie/reveal.json',
    'src/static/dish-duty/lottie/reveal-reduced.json',
    'src/layouts/tabbar.vue',
    '.agents/skills/cook-illustration-ui/SKILL.md',
  ]

  requiredFiles.forEach(assertFile)

  assertIncludes('src/components/RecipeImage.vue', '@error="hasError = true"')
  assertIncludes('src/components/RecipeImage.vue', 'height: 100%')
  assertIncludes('src/components/RecipeImage.vue', 'applyImagePreset(props.src, props.preset)')
  assertIncludes('src/components/CategoryShortcut.vue', '@error="hasIconError = true"')
  assertIncludes('src/App.vue', '--cook-ink')
  assertIncludes('src/App.vue', 'cook-illo-card')
  assertIncludes('src/App.vue', 'cook-illo-page')
  assertIncludes('src/App.vue', 'cook-illo-button')
  assertIncludes('src/App.vue', '--cook-skeleton-text')
  assertIncludes('src/App.vue', '--cook-skeleton-image')
  assertIncludes('src/App.vue', '--cook-skeleton-avatar')
  assertIncludes('src/App.vue', '--cook-skeleton-highlight')
  assertIncludes('src/App.vue', '--cook-skeleton-duration')
  assertIncludes('.agents/skills/cook-illustration-ui/SKILL.md', 'cook-illo-card')
  assertIncludes('.agents/skills/cook-illustration-ui/SKILL.md', 'New Page Checklist')
  assertIncludes('.agents/skills/cook-illustration-ui/SKILL.md', 'Component Rules')
  assertIncludes('.agents/skills/cook-illustration-ui/SKILL.md', 'State Patterns')
  assertIncludes('.agents/skills/cook-illustration-ui/SKILL.md', 'Mini-Program Compatibility')
  assertIncludes('.agents/skills/cook-illustration-ui/SKILL.md', 'Recipe detail')
  assertIncludes('src/pages/index/index.vue', 'home-hero cook-illo-card')
  assertIncludes('src/pages/index/index.vue', 'home-search cook-pressable')
  assertIncludes('src/pages/search/index.vue', 'search-hero cook-illo-card')
  assertIncludes('src/pages/search/index.vue', 'history-chip cook-illo-pill')
  assertIncludes('src/pages/category/index.vue', 'category-hero cook-illo-card')
  assertIncludes('src/pages/category/index.vue', 'count-badge')
  assertIncludes('src/pages/recipe-detail/index.vue', 'detail-title-card cook-illo-card')
  assertIncludes('src/pages/recipe-detail/index.vue', 'detail-cover cook-illo-card mx-24rpx h-500rpx')
  assertIncludes('src/pages/recipe-detail/index.vue', 'ingredient-chip')
  assertIncludes('src/pages/about/index.vue', 'about-card cook-illo-card')
  assertIncludes('src/pages/about/index.vue', 'Moonofweisheng/MyCookLikeHOC')
  assertIncludes('src/pages/about/index.vue', 'repo-action cook-pressable')
  assertIncludes('src/pages/about/index.vue', 'openSourceRepository')
  assertIncludes('src/layouts/tabbar.vue', 'cook-tabbar-item')
  assertIncludes('src/layouts/tabbar.vue', 'tabbar-icon-shell')
  assertIncludes('src/layouts/tabbar.vue', '--wot-tabbar-height')
  assertIncludes('src/components/RecipeCard.vue', 'category-sticker')
  assertIncludes('src/components/CategoryShortcut.vue', 'category-icon')
  assertIncludes('src/components/EmptyState.vue', 'empty-action')
  assertIncludes('src/components/SkeletonBlock.vue', 'cook-skeleton-wave')
  assertIncludes('src/components/SkeletonBlock.vue', 'variant?: \'text\' | \'image\' | \'avatar\'')
  assertIncludes('src/components/SkeletonBlock.vue', 'skeleton-block--image')
  assertIncludes('src/components/SkeletonBlock.vue', 'skeleton-block--avatar')
  assertNotIncludes('src/components/SkeletonBlock.vue', 'background-size: 28rpx 28rpx')
  assertNotIncludes('src/components/SkeletonBlock.vue', 'rgba(255, 244, 184, 0.62)')
  assertNotIncludes('src/components/SkeletonBlock.vue', 'rgba(234, 244, 255, 0.9)')
  assertNotIncludes('src/components/SkeletonBlock.vue', 'rgba(236, 255, 217, 0.76)')
  assertIncludes('src/components/RecipeCardSkeleton.vue', 'SkeletonBlock')
  assertIncludes('src/components/RecipeCardSkeleton.vue', 'variant="image"')
  assertIncludes('src/components/RecipeCardSkeleton.vue', 'variant="text"')
  assertIncludes('src/components/CategoryShortcutSkeleton.vue', 'variant="avatar"')
  assertIncludes('src/pages/recipe-detail/components/RecipeDetailSkeleton.vue', 'SkeletonBlock')
  assertIncludes('src/pages/recipe-detail/components/RecipeDetailSkeleton.vue', 'variant="image"')
  assertIncludes('src/pages/recipe-detail/components/RecipeDetailSkeleton.vue', 'variant="avatar"')
  assertIncludes('src/pages/index/index.vue', 'CategoryShortcutSkeleton')
  assertIncludes('src/pages/index/index.vue', 'DishDutyHomeCard')
  assertIncludes('src/pages/index/index.vue', 'goToDishDuty')
  assertIncludes('src/pages/dish-duty/index.vue', 'dish-duty-hero cook-illo-card')
  assertIncludes('src/pages/dish-duty/index.vue', '还没有饭搭子')
  assertIncludes('src/pages/dish-duty/index.vue', '今天有谁吃饭')
  assertIncludes('src/pages/dish-duty/index.vue', '添加饭搭子')
  assertIncludes('src/pages/dish-duty/index.vue', '@click="openNewMember"')
  assertIncludes('src/pages/dish-duty/index.vue', 'onShareTimeline(() => ({')
  assertIncludes('src/pages/dish-duty/index.vue', 'title: showResult.value && currentWinner.value')
  assertIncludes('src/pages/dish-duty/index.vue', '? `今天轮到')
  assertIncludes('src/pages/dish-duty/index.vue', 'currentWinner.value.nickname}刷碗`')
  assertIncludes('src/pages/dish-duty/index.vue', ': \'今天谁刷碗？来公平抽一个\'')
  assertHookNotIncludes('src/pages/dish-duty/index.vue', 'onShareTimeline', 'query:')
  assertHookNotIncludes('src/pages/dish-duty/index.vue', 'onShareTimeline', 'path:')
  assertIncludes('src/composables/useGlobalToast.ts', 'zIndex: 200')
  assertIncludes('src/pages/dish-duty/index.vue', '.sheet-mask { position: fixed; inset: 0; z-index: 120;')
  assertIncludes('src/components/dish-duty/DishDutyStage.vue', '跳过动效')
  assertIncludes('src/pages/dish-duty/index.vue', 'result-card cook-illo-card')
  assertIncludes('src/pages/dish-duty/index.vue', '再开一局')
  assertIncludes('src/pages/dish-duty/index.vue', 'closeMemberEditor')
  assertIncludes('src/pages/dish-duty/index.vue', 'redrawVisible = false')
  assertIncludes('src/pages/dish-duty/index.vue', '今天有情况')
  assertIncludes('src/pages/dish-duty/index.vue', 'requestDeleteMember')
  assertIncludes('src/pages/dish-duty/index.vue', 'requestPurgeMember')
  assertIncludes('src/pages/dish-duty/index.vue', '彻底删除这位饭搭子？')
  assertIncludes('src/pages/dish-duty/index.vue', '确认彻底删除')
  assertIncludes('src/pages/dish-duty/index.vue', '删除这位饭搭子？')
  assertIncludes('src/pages/dish-duty/index.vue', 'sheet-close')
  assertIncludes('src/pages/dish-duty/index.vue', '确认删除')
  assertIncludes('src/pages/dish-duty/index.vue', '已删除 · 历史仍保留')
  assertIncludes('src/pages/dish-duty/index.vue', '@click.stop')
  assertNotIncludes('src/pages/dish-duty/index.vue', '@click.self')
  assertIncludes('src/pages/dish-duty/index.vue', 'requestDeleteMeal')
  assertNotIncludes('src/pages/dish-duty/index.vue', '临时加入')
  assertNotIncludes('src/pages/dish-duty/index.vue', '仅本次有效')
  assertNotIncludes('src/pages/dish-duty/index.vue', '保存为常用饭搭子')
  assertNotIncludes('src/pages/dish-duty/index.vue', '先试玩一次')
  assertNotIncludes('src/pages/dish-duty/index.vue', '常用饭搭子')
  assertIncludes('src/pages/dish-duty/index.vue', '删除这条饭局记录？')
  assertIncludes('src/pages/dish-duty/index.vue', '确认删除记录')
  assertIncludes('src/pages/dish-duty/index.vue', 'formatMealTime(meal.createdAt)')
  assertIncludes('src/pages/dish-duty/index.vue', '关于公平与数据')
  assertIncludes('src/pages/dish-duty/index.vue', '本轮所有参与者机会均等')
  assertNotIncludes('src/pages/dish-duty/index.vue', '近 7 天刷碗次数最少')
  assertNotIncludes('src/pages/dish-duty/index.vue', '本局切换为等概率')
  assertNotIncludes('src/pages/dish-duty/index.vue', '精简动效')
  assertNotIncludes('src/pages/dish-duty/index.vue', 'motion-toggle')
  assertIncludes('src/components/dish-duty/DishDutyStage.vue', 'getParticipantMotionPath')
  assertIncludes('src/components/dish-duty/DishDutyStage.vue', 'buddy-vortex')
  assertIncludes('src/components/dish-duty/DishDutyStage.vue', 'foam-cloud')
  assertIncludes('src/components/dish-duty/DishDutyStage.vue', 'lottieHost')
  assertIncludes('src/components/dish-duty/DishDutyStage.vue', 'createLottieController')
  assertIncludes('src/components/dish-duty/DishDutyStage.vue', 'lottieController = createLottieController(')
  assertNotIncludes('src/components/dish-duty/DishDutyStage.vue', 'if (!lottieHost.value) return')
  assertNotIncludes('src/components/dish-duty/DishDutyStage.vue', 'replayReveal')
  assertNotIncludes('src/components/dish-duty/DishDutyStage.vue', '重播动画')
  assertIncludes('src/components/dish-duty/DishDutyStage.vue', 'v-if="showFoam"')
  assertIncludes('src/components/dish-duty/DishDutyStage.vue', 'nextTick(() =>')
  assertIncludes('src/components/dish-duty/DishDutyStage.vue', 'revealRequested')
  assertIncludes('src/components/dish-duty/DishDutyStage.vue', '泡沫正在自动清场')
  assertNotIncludes('src/components/dish-duty/DishDutyStage.vue', 'winner-result-stamp')
  assertNotIncludes('src/components/dish-duty/DishDutyStage.vue', '本轮刷碗官')
  assertIncludes('src/pages/dish-duty/index.vue', 'resultTitle')
  assertIncludes('src/components/dish-duty/DishDutyStage.vue', 'stage-revealed .plate-wrap')
  assertIncludes('src/components/dish-duty/DishDutyStage.vue', '.dish-stage.stage-revealed,')
  assertIncludes('src/components/dish-duty/DishDutyStage.vue', 'height: 500rpx')
  assertIncludes('src/components/dish-duty/DishDutyStage.vue', '.is-paused .stage-buddy')
  assertNotIncludes('src/components/dish-duty/DishDutyStage.vue', '.is-paused *')
  assertIncludes('src/components/dish-duty/DishDutyStage.vue', 'show-name')
  assertIncludes('src/features/dish-duty/lottie.ts', 'loadAnimation')
  assertIncludes('src/features/dish-duty/lottie.ts', 'fallbackDuration')
  assertIncludes('src/features/dish-duty/lottie.ts', 'catch')
  assertIncludes('src/static/dish-duty/lottie/reveal.json', 'foam-swirl')
  assertIncludes('src/static/dish-duty/lottie/reveal.json', 'water-splash')
  assertIncludes('src/static/dish-duty/lottie/reveal-reduced.json', 'short-clear')
  assertNotIncludes('src/components/dish-duty/DishDutyStage.vue', 'buddy-shuffle')
  assertNotIncludes('src/components/dish-duty/DishDutyStage.vue', 'foam-block')
  assertIncludes('src/components/dish-duty/BuddySticker.vue', 'buddy-avatar')
  assertNotIncludes('src/components/dish-duty/BuddySticker.vue', 'buddy-temp-mark')
  assertNotIncludes('src/components/dish-duty/BuddySticker.vue', '临时饭搭子')
  assertIncludes('src/store/dishDutyStore.ts', 'startDraw')
  assertIncludes('src/store/dishDutyStore.ts', 'next.draft.participants.push(memberToParticipant(member))')
  assertIncludes('src/store/dishDutyStore.ts', 'startNewMeal')
  assertIncludes('src/store/dishDutyStore.ts', 'deleteMember')
  assertIncludes('src/store/dishDutyStore.ts', 'purgeMember')
  assertIncludes('src/store/dishDutyStore.ts', 'deleteMeal')
  assertIncludes('src/features/dish-duty/draw.ts', 'mode: \'equal-random\'')
  assertIncludes('src/store/dishDutyStore.ts', 'redraw')
  assertIncludes('src/store/dishDutyStore.ts', 'DISH_DUTY_STORAGE_VERSION')

  assertIncludes('src/pages/recipe-detail/index.vue', 'getRecipeIdFromLocation')
  assertIncludes('src/pages/recipe-detail/index.vue', 'encodeURIComponent(recipeId.value)')
  assertIncludes('src/pages/recipe-detail/index.vue', '@action="handleDetailStateAction"')

  assertIncludes('src/pages/category/index.vue', 'getCategoryFromLocation')
  assertIncludes('src/pages/category/index.vue', 'encodeURIComponent(category.value)')
  assertIncludes('src/pages/category/index.vue', '@action="refreshCategoryData"')

  assertIncludes('src/pages/search/index.vue', 'getKeywordFromLocation')
  assertIncludes('src/pages/search/index.vue', 'onReachBottom')
  assertIncludes('src/pages/search/index.vue', 'onPullDownRefresh')
  assertIncludes('src/pages/search/index.vue', '加载更多')
  assertIncludes('src/pages/search/index.vue', 'encodeURIComponent(nextKeyword)')

  console.log('UI smoke checks passed')
}

main()
