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

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) as string
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY as string
let supabase: ReturnType<typeof createClient>

// 手绘流程图目录路径
const PROCESS_IMAGES_DIR = path.join(__dirname, '../cook-book/images/cook-process')

// Storage bucket名称
const STORAGE_BUCKET = 'process-images'

// 支持的图片格式
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp']

/**
 * 确保Storage bucket存在
 */
async function ensureBucketExists() {
  const { data: buckets } = await supabase.storage.listBuckets()
  const bucketExists = Array.isArray(buckets) && buckets.some(b => b.name === STORAGE_BUCKET)
  if (!bucketExists) {
    await supabase.storage.createBucket(STORAGE_BUCKET, {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      fileSizeLimit: 10 * 1024 * 1024,
    })
  }
}

/**
 * 递归遍历目录，查找所有图片文件
 * @param {string} dir 目录路径
 * @returns {Array} 图片文件信息数组
 */
function findImageFiles(dir: string) {
  const files: Array<{ fullPath: string, relativePath: string, category: string, fileName: string, extension: string }> = []

  try {
    const items = fs.readdirSync(dir)

    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        files.push(...findImageFiles(fullPath))
      }
      else if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase()
        if (SUPPORTED_FORMATS.includes(ext)) {
          const relativePath = path.relative(PROCESS_IMAGES_DIR, fullPath)
          const category = path.dirname(relativePath)
          const fileName = path.basename(item, ext)

          files.push({ fullPath, relativePath, category, fileName, extension: ext })
        }
      }
    }
  }
  catch (error) {
    console.error(`读取目录失败: ${dir}`, (error as Error).message)
  }

  return files
}

/**
 * 根据文件名查找对应的菜谱
 * @param {string} fileName 文件名（不含扩展名）
 * @param {string} category 分类
 * @returns {Promise<object|null>} 菜谱数据或null
 */
async function findRecipeByName(fileName: string, category: string) {
  try {
    // 首先尝试精确匹配
    const { data: exactMatch, error: exactError } = await supabase
      .from('recipes')
      .select('id, title, category, process_image_url')
      .eq('title', fileName)
      .eq('category', category)
      .single()

    if (!exactError && exactMatch) {
      return exactMatch
    }

    // 如果精确匹配失败，尝试模糊匹配
    const { data: fuzzyMatches, error: fuzzyError } = await supabase
      .from('recipes')
      .select('id, title, category, process_image_url')
      .eq('category', category)
      .ilike('title', `%${fileName}%`)

    if (fuzzyError) {
      console.warn(`查找菜谱失败: ${fileName}`, fuzzyError.message)
      return null
    }

    if (fuzzyMatches && fuzzyMatches.length > 0) {
      if (fuzzyMatches.length === 1) {
        return fuzzyMatches[0]
      }
      else {
        // 多个匹配结果，选择最相似的
        const bestMatch = fuzzyMatches.find(recipe => recipe.title === fileName) || fuzzyMatches.find(recipe => recipe.title.includes(fileName)) || fuzzyMatches[0]

        console.warn(`找到多个匹配结果，选择: ${bestMatch.title}，文件: ${fileName}`)
        return bestMatch
      }
    }

    return null
  }
  catch (error) {
    console.error(`查找菜谱异常: ${fileName}`, (error as Error).message)
    return null
  }
}

/**
 * 将中文路径转换为安全的存储路径
 * @param {string} text 原始文本
 * @returns {string} 安全的路径
 */
function sanitizePath(text: string) {
  // 将中文和特殊字符转换为安全的路径
  return encodeURIComponent(text).replace(/%/g, '_')
}

/**
 * 上传图片到Supabase Storage
 * @param {object} imageFile 图片文件信息
 * @returns {Promise<string|null>} 上传后的公共URL或null
 */
async function uploadImageToStorage(imageFile: { fullPath: string, category: string, fileName: string, extension: string }) {
  try {
    // 读取图片文件
    const fileBuffer = fs.readFileSync(imageFile.fullPath)

    // 生成安全的存储路径
    const safeCategory = sanitizePath(imageFile.category)
    const safeFileName = sanitizePath(imageFile.fileName)
    const storagePath = `${safeCategory}/${safeFileName}${imageFile.extension}`

    // 检查文件是否已存在
    const { data: existingFile } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(safeCategory, {
        search: safeFileName,
      })

    if (existingFile && existingFile.length > 0) {
      console.log(`📁 文件已存在，跳过上传: ${storagePath}`)

      // 获取公共URL
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(storagePath)

      return urlData.publicUrl
    }

    // 确定正确的MIME类型
    let contentType = 'image/jpeg'
    switch (imageFile.extension.toLowerCase()) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg'
        break
      case '.png':
        contentType = 'image/png'
        break
      case '.webp':
        contentType = 'image/webp'
        break
    }

    // 上传文件
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType,
        upsert: false,
      })

    if (error) {
      console.error(`上传图片失败: ${storagePath}`, error.message)
      return null
    }

    // 获取公共URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath)

    console.log(`✅ 图片上传成功: ${storagePath}`)
    return urlData.publicUrl
  }
  catch (error) {
    console.error(`上传图片异常: ${imageFile.fullPath}`, (error as Error).message)
    return null
  }
}

/**
 * 更新菜谱的流程图URL
 * @param {number} recipeId 菜谱ID
 * @param {string} imageUrl 图片URL
 * @returns {Promise<boolean>} 更新是否成功
 */
async function updateRecipeProcessImage(recipeId: string, imageUrl: string) {
  try {
    const { error } = await supabase
      .from('recipes')
      .update({
        process_image_url: imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', recipeId)

    if (error) {
      console.error(`更新菜谱流程图失败: ID ${recipeId}`, error.message)
      return false
    }

    return true
  }
  catch (error) {
    console.error(`更新菜谱流程图异常: ID ${recipeId}`, (error as Error).message)
    return false
  }
}

/**
 * 显示进度信息
 * @param {number} current 当前进度
 * @param {number} total 总数
 * @param {string} message 消息
 */
function showProgress(current: number, total: number, message: string) {
  const percentage = Math.round((current / total) * 100)
  const progressBar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5))
  console.log(`[${progressBar}] ${percentage}% (${current}/${total}) ${message}`)
}

/**
 * 主函数
 */
async function main() {
  if (!SUPABASE_URL) {
    console.error('缺少 SUPABASE_URL，请在 .env(.development) 设置 SUPABASE_URL 或 VITE_SUPABASE_URL')
    process.exit(1)
  }
  if (!SUPABASE_SERVICE_KEY) {
    console.error('缺少 SUPABASE_SERVICE_KEY（服务角色密钥），请在 .env(.development) 设置')
    process.exit(1)
  }
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  console.log('🖼️  开始上传手绘流程图...')
  console.log(`📁 流程图目录: ${PROCESS_IMAGES_DIR}`)

  // 检查目录是否存在
  if (!fs.existsSync(PROCESS_IMAGES_DIR)) {
    console.error('❌ 流程图目录不存在:', PROCESS_IMAGES_DIR)
    process.exit(1)
  }

  // 确保Storage bucket存在
  await ensureBucketExists()

  // 查找所有图片文件
  const imageFiles = findImageFiles(PROCESS_IMAGES_DIR)
  console.log(`🖼️  找到 ${imageFiles.length} 个图片文件`)

  if (imageFiles.length === 0) {
    console.log('没有找到图片文件')
    return
  }

  let successCount = 0
  let failCount = 0
  let skipCount = 0
  let uploadCount = 0
  let updateCount = 0

  // 处理每个图片文件
  for (let i = 0; i < imageFiles.length; i++) {
    const imageFile = imageFiles[i]

    try {
      showProgress(i + 1, imageFiles.length, `处理: ${imageFile.relativePath}`)

      console.log(`\n📸 处理图片: ${imageFile.relativePath}`)
      console.log(`   分类: ${imageFile.category}`)
      console.log(`   文件名: ${imageFile.fileName}`)

      // 查找对应的菜谱
      const recipe = await findRecipeByName(imageFile.fileName, imageFile.category)

      if (!recipe) {
        console.log(`   ⚠️  未找到对应菜谱: ${imageFile.fileName}`)
        skipCount++
        continue
      }

      console.log(`   🍳 找到菜谱: ${recipe.title} (ID: ${recipe.id})`)

      // 检查是否已有流程图
      if (recipe.process_image_url) {
        console.log(`   📁 菜谱已有流程图，跳过: ${recipe.process_image_url}`)
        skipCount++
        continue
      }

      // 上传图片到Storage
      const imageUrl = await uploadImageToStorage(imageFile)

      if (!imageUrl) {
        console.log(`   ❌ 图片上传失败`)
        failCount++
        continue
      }

      uploadCount++
      console.log(`   📤 图片URL: ${imageUrl}`)

      // 更新菜谱记录
      const updateSuccess = await updateRecipeProcessImage(recipe.id, imageUrl)

      if (updateSuccess) {
        updateCount++
        console.log(`   ✅ 菜谱更新成功`)
        successCount++
      }
      else {
        console.log(`   ❌ 菜谱更新失败`)
        failCount++
      }

      // 添加延迟避免请求过快
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    catch (error) {
      console.error(`处理图片失败: ${imageFile.relativePath}`, (error as Error).message)
      failCount++
    }
  }

  console.log('\n🎉 处理完成!')
  console.log(`✅ 成功: ${successCount} 个`)
  console.log(`❌ 失败: ${failCount} 个`)
  console.log(`⏭️  跳过: ${skipCount} 个`)
  console.log(`📤 上传: ${uploadCount} 个图片`)
  console.log(`🔄 更新: ${updateCount} 个菜谱`)
  console.log(`📊 总计: ${imageFiles.length} 个图片文件`)
}

// 运行主函数
if (require.main === module) {
  main().catch((error) => {
    console.error('脚本执行失败:', error)
    process.exit(1)
  })
}
