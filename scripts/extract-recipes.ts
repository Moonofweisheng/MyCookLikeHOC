#!/usr/bin/env node
/* eslint-disable node/prefer-global/process */
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()
if (fs.existsSync(path.join(process.cwd(), '.env.local'))) {
  dotenv.config({ path: path.join(process.cwd(), '.env.local') })
}

const SUPABASE_URL = process.env.SUPABASE_URL as string
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY as string
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// 菜谱目录路径
const COOKBOOK_DIR = path.join(__dirname, '../cook-book')
const DRY_RUN = process.argv.includes('--dry-run')

/**
 * 将图片文件转换为base64格式
 * @param {string} imagePath 图片文件路径
 * @returns {string|null} base64编码的图片数据或null
 */
function imageToBase64(imagePath: string) {
  try {
    if (!fs.existsSync(imagePath)) {
      console.warn(`图片文件不存在: ${imagePath}`)
      return null
    }

    const imageBuffer = fs.readFileSync(imagePath)
    const ext = path.extname(imagePath).toLowerCase()
    let mimeType = 'image/jpeg'

    switch (ext) {
      case '.png':
        mimeType = 'image/png'
        break
      case '.jpg':
      case '.jpeg':
        mimeType = 'image/jpeg'
        break
      case '.gif':
        mimeType = 'image/gif'
        break
      case '.webp':
        mimeType = 'image/webp'
        break
    }

    return `data:${mimeType};base64,${imageBuffer.toString('base64')}`
  }
  catch (error) {
    console.error(`转换图片失败: ${imagePath}`, (error as Error).message)
    return null
  }
}

/**
 * 解析Markdown文件内容，支持所有可能的标题格式
 * @param {string} content Markdown文件内容
 * @param {string} filePath 文件路径
 * @returns {object} 解析后的菜谱数据
 */
function parseMarkdown(content: string, filePath: string) {
  const lines = content.split('\n')
  let title = ''
  let imagePath = ''
  let ingredients = ''
  let steps = ''
  let currentSection = ''
  const foundSections = { ingredients: false, steps: false }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // 提取标题
    if (line.startsWith('# ') && !title) {
      title = line.substring(2).trim()
      continue
    }

    // 提取图片路径
    if (line.startsWith('![') && line.includes('](')) {
      const match = line.match(/!\[.*?\]\((.+?)\)/)
      if (match) {
        imagePath = match[1]
      }
      continue
    }

    // 识别章节 - 支持二级和三级标题
    if (line.startsWith('## ') || line.startsWith('### ')) {
      const sectionTitle = line.startsWith('### ') ? line.substring(4).trim() : line.substring(3).trim()
      const normalizedTitle = sectionTitle.replace(/[：:]/g, '').toLowerCase()

      if (['配料', '原料', '品类', '已知成分', '成分', '食材', '材料', '用料'].includes(normalizedTitle)) {
        currentSection = 'ingredients'
        foundSections.ingredients = true
      }
      else if (['步骤', '制作步骤', '做法'].includes(normalizedTitle)) {
        currentSection = 'steps'
        foundSections.steps = true
      }
      else {
        currentSection = 'other'
      }
      continue
    }

    // 处理没有明确章节标题的配料（如茶叶蛋文件）
    if (line.startsWith('- ') && !foundSections.ingredients && !foundSections.steps && currentSection === '') {
      currentSection = 'ingredients'
      foundSections.ingredients = true
    }

    // 收集内容
    if (line && currentSection === 'ingredients') {
      ingredients += `${line}\n`
    }
    else if (line && currentSection === 'steps') {
      steps += `${line}\n`
    }
  }

  // 处理图片路径
  let fullImagePath = ''
  let base64Image: string | null = null

  if (imagePath) {
    // 处理相对路径
    if (imagePath.startsWith('../')) {
      fullImagePath = path.resolve(path.dirname(filePath), imagePath)
    }
    else {
      fullImagePath = path.resolve(path.dirname(filePath), imagePath)
    }

    base64Image = imageToBase64(fullImagePath)
  }

  // 数据验证和清理
  const cleanedIngredients = ingredients.trim()
  const cleanedSteps = steps.trim()
  const finalTitle = title || path.basename(filePath, '.md')

  return { title: finalTitle, ingredients: cleanedIngredients, steps: cleanedSteps, imagePath, coverImage: base64Image, foundSections, hasIngredients: !!cleanedIngredients, hasSteps: !!cleanedSteps, hasImage: !!base64Image }
}

/**
 * 获取分类名称
 * @param {string} filePath 文件路径
 * @returns {string} 分类名称
 */
function getCategory(filePath: string) {
  const relativePath = path.relative(COOKBOOK_DIR, filePath)
  const parts = relativePath.split(path.sep)
  return parts[0] || '未分类'
}

/**
 * 递归遍历目录，查找所有.md文件
 * @param {string} dir 目录路径
 * @returns {string[]} Markdown文件路径数组
 */
function findMarkdownFiles(dir: string) {
  const files: string[] = []

  try {
    const items = fs.readdirSync(dir)

    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        // 跳过images目录
        if (item !== 'images') {
          files.push(...findMarkdownFiles(fullPath))
        }
      }
      else if (stat.isFile() && path.extname(item) === '.md' && item !== 'README.md') {
        files.push(fullPath)
      }
    }
  }
  catch (error) {
    console.error(`读取目录失败: ${dir}`, (error as Error).message)
  }

  return files
}

/**
 * 上传菜谱数据到Supabase
 * @param {object} recipe 菜谱数据
 * @returns {Promise<boolean>} 上传是否成功
 */
async function uploadRecipe(recipe: { title: string, category: string, ingredients: string, steps: string, coverImage: string | null, imagePath: string }) {
  try {
    // 检查是否已存在相同标题的菜谱
    const { data: existing, error: checkError } = await supabase
      .from('recipes')
      .select('id, ingredients, steps')
      .eq('title', recipe.title)
      .single()

    if (checkError && (checkError as any).code !== 'PGRST116') {
      console.error('检查重复数据失败:', checkError.message)
      return false
    }

    if (existing) {
      // 检查是否需要更新（配料或步骤为空）
      const needsUpdate = !existing.ingredients || !existing.steps
        || existing.ingredients.trim() === '' || existing.steps.trim() === ''

      if (needsUpdate && (recipe.ingredients || recipe.steps)) {
        console.log(`🔄 更新菜谱: ${recipe.title}`)
        const { error: updateError } = await supabase
          .from('recipes')
          .update({
            ingredients: recipe.ingredients || existing.ingredients,
            steps: recipe.steps || existing.steps,
            cover_image: recipe.coverImage || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)

        if (updateError) {
          console.error('更新菜谱失败:', updateError)
          return false
        }
        console.log(`✅ 菜谱更新成功: ${recipe.title}`)
        return true
      }
      else {
        console.log(`菜谱已存在且数据完整，跳过: ${recipe.title}`)
        return true
      }
    }

    // 插入新菜谱
    const { error } = await supabase
      .from('recipes')
      .insert([
        {
          title: recipe.title,
          category: recipe.category,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          cover_image: recipe.coverImage,
          image_path: recipe.imagePath,
        },
      ])

    if (error) {
      console.error(`上传菜谱失败: ${recipe.title}`, error.message)
      return false
    }

    console.log(`✅ 成功上传菜谱: ${recipe.title}`)
    return true
  }
  catch (error) {
    console.error(`上传菜谱异常: ${recipe.title}`, (error as Error).message)
    return false
  }
}

/**
 * 主函数
 */
async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('缺少环境变量 SUPABASE_URL 或 SUPABASE_SERVICE_KEY')
    process.exit(1)
  }
  console.log('🍳 开始提取菜谱数据...')
  console.log(`📁 菜谱目录: ${COOKBOOK_DIR}`)

  // 检查目录是否存在
  if (!fs.existsSync(COOKBOOK_DIR)) {
    console.error('❌ 菜谱目录不存在:', COOKBOOK_DIR)
    process.exit(1)
  }

  // 查找所有Markdown文件
  const markdownFiles = findMarkdownFiles(COOKBOOK_DIR)
  console.log(`📄 找到 ${markdownFiles.length} 个菜谱文件`)

  if (markdownFiles.length === 0) {
    console.log('没有找到菜谱文件')
    return
  }

  let successCount = 0
  let failCount = 0
  const issues = { emptyIngredients: 0, emptySteps: 0, noIngredientsSection: 0, noStepsSection: 0, noImage: 0 }

  // 处理每个文件
  for (const filePath of markdownFiles) {
    try {
      console.log(`\n📖 处理文件: ${path.relative(COOKBOOK_DIR, filePath)}`)

      // 读取文件内容
      const content = fs.readFileSync(filePath, 'utf-8')

      // 解析Markdown
      const recipe = parseMarkdown(content, filePath)
      recipe.category = getCategory(filePath)

      console.log(`   标题: ${recipe.title}`)
      console.log(`   分类: ${recipe.category}`)
      console.log(`   配料: ${recipe.hasIngredients ? `${recipe.ingredients.length} 字符` : '❌ 空'}`)
      console.log(`   步骤: ${recipe.hasSteps ? `${recipe.steps.length} 字符` : '❌ 空'}`)
      console.log(`   图片: ${recipe.hasImage ? '✅ 已转换为base64' : '❌ 无图片'}`)

      const warnings: string[] = []
      if (!recipe.foundSections.ingredients)
        warnings.push('未找到配料章节')
      if (!recipe.foundSections.steps)
        warnings.push('未找到步骤章节')
      if (!recipe.hasIngredients && recipe.foundSections.ingredients)
        warnings.push('配料内容为空')
      if (!recipe.hasSteps && recipe.foundSections.steps)
        warnings.push('步骤内容为空')
      if (!recipe.hasImage)
        warnings.push('缺少图片')

      if (warnings.length > 0) {
        console.log(`   ⚠️  警告: ${warnings.join(', ')}`)
      }

      if (DRY_RUN) {
        if (!recipe.foundSections.ingredients)
          issues.noIngredientsSection++
        else if (!recipe.ingredients)
          issues.emptyIngredients++
        if (recipe.category !== '配料') {
          if (!recipe.foundSections.steps)
            issues.noStepsSection++
          else if (!recipe.steps)
            issues.emptySteps++
        }
        if (!recipe.hasImage && recipe.category !== '配料')
          issues.noImage++
      }
      else {
        const success = await uploadRecipe(recipe)
        if (success)
          successCount++
        else failCount++
      }

      // 添加延迟避免请求过快
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    catch (error) {
      console.error(`处理文件失败: ${filePath}`, (error as Error).message)
      failCount++
    }
  }

  if (DRY_RUN) {
    console.log('\n📊 数据完整性检查结果:')
    console.log(`❌ 缺少配料章节: ${issues.noIngredientsSection}`)
    console.log(`⚠️  配料内容为空: ${issues.emptyIngredients}`)
    console.log(`❌ 缺少步骤章节: ${issues.noStepsSection}`)
    console.log(`⚠️  步骤内容为空: ${issues.emptySteps}`)
    console.log(`📷 缺少图片: ${issues.noImage}`)
  }
  else {
    console.log('\n🎉 提取完成!')
    console.log(`✅ 成功: ${successCount} 个`)
    console.log(`❌ 失败: ${failCount} 个`)
    console.log(`📊 总计: ${markdownFiles.length} 个`)
  }
}

// 运行主函数
if (require.main === module) {
  main().catch((error) => {
    console.error('脚本执行失败:', error)
    process.exit(1)
  })
}
export { parseMarkdown, imageToBase64, findMarkdownFiles, uploadRecipe }
