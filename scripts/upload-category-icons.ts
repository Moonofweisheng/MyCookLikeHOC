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

const CATEGORY_ICONS_DIR = path.join(__dirname, '../cook-book/images/cook-category')
const STORAGE_BUCKET = 'category-icons'
const RECREATE_BUCKET = process.argv.includes('--recreate-bucket')
const UPSERT = process.argv.includes('--upsert')

const categoryKeyMap: Record<string, string> = {
  主食: 'staple',
  凉拌: 'cold-dish',
  卤菜: 'braised',
  早餐: 'breakfast',
  汤: 'soup',
  炒菜: 'stir-fry',
  炖菜: 'stew',
  炸品: 'deep-fry',
  烤类: 'grill',
  烫菜: 'hot-dish',
  煮锅: 'hotpot',
  蒸菜: 'steam',
  砂锅菜: 'casserole',
  饮品: 'drink',
}

const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp']

async function ensureBucketExists() {
  const { data: buckets } = await supabase.storage.listBuckets()
  const bucketExists = Array.isArray(buckets) && buckets.some(b => b.name === STORAGE_BUCKET)

  if (RECREATE_BUCKET && bucketExists) {
    const { data: files } = await supabase.storage.from(STORAGE_BUCKET).list()
    if (files?.length) {
      const paths = files.map(f => f.name)
      await supabase.storage.from(STORAGE_BUCKET).remove(paths)
    }
    await supabase.storage.deleteBucket(STORAGE_BUCKET)
  }

  if (!bucketExists || RECREATE_BUCKET) {
    await supabase.storage.createBucket(STORAGE_BUCKET, {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      fileSizeLimit: 10 * 1024 * 1024,
    })
  }
}

function findCategoryIconFiles() {
  const items = fs.readdirSync(CATEGORY_ICONS_DIR)
  const files: Array<{ fullPath: string, categoryName: string, fileKey: string, extension: string, fileName: string }> = []
  for (const item of items) {
    const fullPath = path.join(CATEGORY_ICONS_DIR, item)
    const stat = fs.statSync(fullPath)
    if (!stat.isFile())
      continue
    const ext = path.extname(item).toLowerCase()
    if (!SUPPORTED_FORMATS.includes(ext))
      continue
    const fileKey = path.basename(item, ext)
    const categoryName = Object.keys(categoryKeyMap).find(k => categoryKeyMap[k] === fileKey) || fileKey
    files.push({ fullPath, categoryName, fileKey, extension: ext, fileName: item })
  }
  return files
}

async function uploadIconToStorage(iconFile: { fullPath: string, fileKey: string, extension: string }) {
  const fileBuffer = fs.readFileSync(iconFile.fullPath)
  const storagePath = `${iconFile.fileKey}${iconFile.extension}`

  const { data: existingFile } = await supabase.storage.from(STORAGE_BUCKET).list('', { search: storagePath })
  if (existingFile && existingFile.length > 0 && !UPSERT) {
    const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath)
    return urlData.publicUrl
  }

  let contentType = 'image/png'
  switch (iconFile.extension.toLowerCase()) {
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

  await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, fileBuffer, { contentType, upsert: UPSERT })
  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath)
  return urlData.publicUrl
}

function showProgress(current: number, total: number, message: string) {
  const percentage = Math.round((current / total) * 100)
  const progressBar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5))
  console.log(`[${progressBar}] ${percentage}% (${current}/${total}) ${message}`)
}

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

  console.log('🖼️  开始上传分类图标...')
  console.log(`📁 图标目录: ${CATEGORY_ICONS_DIR}`)

  if (!fs.existsSync(CATEGORY_ICONS_DIR)) {
    console.error('❌ 图标目录不存在:', CATEGORY_ICONS_DIR)
    process.exit(1)
  }

  await ensureBucketExists()

  const iconFiles = findCategoryIconFiles()
  console.log(`🖼️  找到 ${iconFiles.length} 个图标文件`)
  if (iconFiles.length === 0)
    return

  let successCount = 0
  let failCount = 0
  const skipCount = 0

  for (let i = 0; i < iconFiles.length; i++) {
    const iconFile = iconFiles[i]
    try {
      showProgress(i + 1, iconFiles.length, `处理: ${iconFile.fileName}`)
      const imageUrl = await uploadIconToStorage(iconFile)
      if (!imageUrl) {
        failCount++
        continue
      }
      successCount++
      console.log(`   📤 图标URL: ${imageUrl}`)
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    catch (e) {
      console.error(`处理图标失败: ${iconFile.fileName}`, (e as Error).message)
      failCount++
    }
  }

  console.log('\n🎉 处理完成!')
  console.log(`✅ 成功: ${successCount} 个`)
  console.log(`❌ 失败: ${failCount} 个`)
  console.log(`⏭️  跳过: ${skipCount} 个`)
  console.log(`📊 总计: ${iconFiles.length} 个图标文件`)
}

if (require.main === module) {
  main().catch((error) => {
    console.error('脚本执行失败:', error)
    process.exit(1)
  })
}
