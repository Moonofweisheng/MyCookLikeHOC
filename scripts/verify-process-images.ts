import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()
if (fs.existsSync(path.join(process.cwd(), '.env.development'))) {
  dotenv.config({ path: path.join(process.cwd(), '.env.development') })
}
const SUPABASE_URL = process.env.SUPABASE_URL as string
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY as string
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

/**
 * 验证流程图上传结果
 */
async function verifyProcessImages() {
  console.log('🔍 验证流程图上传结果...')

  try {
    // 查询有流程图的菜谱数量
    const { data: recipesWithProcessImages, error: queryError } = await supabase
      .from('recipes')
      .select('id, title, category, process_image_url')
      .not('process_image_url', 'is', null)

    if (queryError) {
      console.error('查询失败:', queryError.message)
      return
    }

    console.log(`\n📊 统计结果:`)
    console.log(`✅ 有流程图的菜谱: ${recipesWithProcessImages.length} 个`)

    // 按分类统计
    const categoryStats = {}
    recipesWithProcessImages.forEach((recipe) => {
      if (!categoryStats[recipe.category]) {
        categoryStats[recipe.category] = 0
      }
      categoryStats[recipe.category]++
    })

    console.log(`\n📋 分类统计:`)
    Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count} 个`)
      })

    // 查询总菜谱数量
    const { data: allRecipes, error: allError } = await supabase
      .from('recipes')
      .select('id', { count: 'exact' })

    if (!allError) {
      const totalRecipes = allRecipes.length
      const coverage = ((recipesWithProcessImages.length / totalRecipes) * 100).toFixed(1)
      console.log(`\n📈 覆盖率: ${coverage}% (${recipesWithProcessImages.length}/${totalRecipes})`)
    }

    // 显示前5个示例
    console.log(`\n🖼️  示例菜谱 (前5个):`)
    recipesWithProcessImages.slice(0, 5).forEach((recipe, index) => {
      console.log(`   ${index + 1}. ${recipe.title} (${recipe.category})`)
      console.log(`      URL: ${recipe.process_image_url}`)
    })
  }
  catch (error) {
    console.error('验证过程出错:', (error as Error).message)
  }
}

// 运行验证
if (require.main === module) {
  verifyProcessImages().catch((error) => {
    console.error('验证脚本执行失败:', error)
    // eslint-disable-next-line node/prefer-global/process
    process.exit(1)
  })
}
