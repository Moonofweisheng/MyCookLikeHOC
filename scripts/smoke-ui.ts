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
    'src/layouts/tabbar.vue',
    '.codex/skills/cook-illustration-ui/SKILL.md',
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
  assertIncludes('.codex/skills/cook-illustration-ui/SKILL.md', 'cook-illo-card')
  assertIncludes('.codex/skills/cook-illustration-ui/SKILL.md', 'New Page Checklist')
  assertIncludes('.codex/skills/cook-illustration-ui/SKILL.md', 'Component Rules')
  assertIncludes('.codex/skills/cook-illustration-ui/SKILL.md', 'State Patterns')
  assertIncludes('.codex/skills/cook-illustration-ui/SKILL.md', 'Mini-Program Compatibility')
  assertIncludes('.codex/skills/cook-illustration-ui/SKILL.md', 'Recipe detail')
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
  assertIncludes('src/layouts/tabbar.vue', 'cook-tabbar-item')
  assertIncludes('src/layouts/tabbar.vue', 'tabbar-icon-shell')
  assertIncludes('src/layouts/tabbar.vue', '--wot-tabbar-height')
  assertIncludes('src/components/RecipeCard.vue', 'category-sticker')
  assertIncludes('src/components/CategoryShortcut.vue', 'category-icon')
  assertIncludes('src/components/EmptyState.vue', 'empty-action')
  assertIncludes('src/components/SkeletonBlock.vue', 'cook-skeleton-wave')
  assertIncludes('src/components/RecipeCardSkeleton.vue', 'SkeletonBlock')
  assertIncludes('src/pages/recipe-detail/components/RecipeDetailSkeleton.vue', 'SkeletonBlock')
  assertIncludes('src/pages/index/index.vue', 'CategoryShortcutSkeleton')

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
