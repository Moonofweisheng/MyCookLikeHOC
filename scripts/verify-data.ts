#!/usr/bin/env node
/* eslint-disable node/prefer-global/process */
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()
if (fs.existsSync(path.join(process.cwd(), '.env.local'))) {
  dotenv.config({ path: path.join(process.cwd(), '.env.local') })
}

const SUPABASE_URL = process.env.SUPABASE_URL as string
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY as string
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const CHECK_EMPTY = process.argv.includes('--check-empty')
const samplesArg = process.argv.find(a => a.startsWith('--samples='))
const SAMPLES = samplesArg ? Number(samplesArg.split('=')[1]) : 3

async function verifyData() {
  console.log('🔍 验证上传的菜谱数据...')

  try {
    // 获取总数
    const { count, error: countError } = await supabase.from('recipes').select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('获取总数失败:', countError.message)
      return
    }

    console.log(`📊 总菜谱数量: ${count}`)

    // 按分类统计
    const { data: categories, error: catError } = await supabase.from('recipes').select('category').order('category')

    if (catError) {
      console.error('获取分类失败:', catError.message)
      return
    }

    const categoryCount = {}
    categories.forEach((item) => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1
    })

    console.log('\n📂 分类统计:')
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} 个`)
    })

    // 获取几个样本数据
    const { data: samples, error: sampleError } = await supabase
      .from('recipes')
      .select('title, category, ingredients, steps, image_path')
      .limit(Math.max(1, Math.min(SAMPLES, 10)))

    if (sampleError) {
      console.error('获取样本数据失败:', sampleError.message)
      return
    }

    console.log('\n📋 样本数据:')
    samples.forEach((recipe, index) => {
      console.log(`\n${index + 1}. ${recipe.title} (${recipe.category})`)
      console.log(`   配料: ${recipe.ingredients ? `${recipe.ingredients.substring(0, 50)}...` : '无'}`)
      console.log(`   步骤: ${recipe.steps ? `${recipe.steps.substring(0, 50)}...` : '无'}`)
      console.log(`   图片: ${recipe.image_path || '无'}`)
    })

    // 检查有图片的菜谱
    const { count: imageCount, error: imageError } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })
      .not('cover_image', 'is', null)

    if (!imageError) {
      console.log(`\n🖼️  有封面图片的菜谱: ${imageCount} 个`)
    }

    if (CHECK_EMPTY) {
      const { data: allRecipes } = await supabase.from('recipes').select('title, category, ingredients, steps')
      const emptyIngredients = (allRecipes || []).filter(r => !r.ingredients || r.ingredients.trim() === '')
      const emptySteps = (allRecipes || []).filter(r => !r.steps || r.steps.trim() === '')
      console.log(`\n❌ 配料为空的菜谱数量: ${emptyIngredients.length}`)
      emptyIngredients.slice(0, 10).forEach(r => console.log(`   - ${r.title} (${r.category})`))
      console.log(`\n⚠️  步骤为空的菜谱数量: ${emptySteps.length}`)
      emptySteps.slice(0, 10).forEach(r => console.log(`   - ${r.title} (${r.category})`))
    }

    console.log('\n✅ 数据验证完成!')
  }
  catch (error) {
    console.error('验证过程中出错:', (error as Error).message)
  }
}

if (require.main === module) {
  verifyData()
}
