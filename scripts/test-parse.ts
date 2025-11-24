#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { parseMarkdown } from './extract-recipes'

// 测试特定文件的解析
function testParseFile(filePath: string) {
  console.log(`\n🧪 测试解析文件: ${filePath}`)

  if (!fs.existsSync(filePath)) {
    console.error('❌ 文件不存在')
    return
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const result = parseMarkdown(content, filePath)

  console.log('解析结果:')
  console.log(`  标题: ${result.title}`)
  console.log(`  配料章节: ${result.foundSections.ingredients ? '✅ 找到' : '❌ 未找到'}`)
  console.log(`  步骤章节: ${result.foundSections.steps ? '✅ 找到' : '❌ 未找到'}`)
  console.log(`  配料内容: ${result.hasIngredients ? `${result.ingredients.length} 字符` : '❌ 空'}`)
  console.log(`  步骤内容: ${result.hasSteps ? `${result.steps.length} 字符` : '❌ 空'}`)
  console.log(`  图片: ${result.hasImage ? '✅ 有' : '❌ 无'}`)

  if (result.ingredients) {
    console.log(`\n配料内容预览:`)
    console.log(result.ingredients.substring(0, 100) + (result.ingredients.length > 100 ? '...' : ''))
  }

  if (result.steps) {
    console.log(`\n步骤内容预览:`)
    console.log(result.steps.substring(0, 100) + (result.steps.length > 100 ? '...' : ''))
  }
}

// 测试几个有问题的文件
const testFiles = [
  '../cook-book/早餐/茶叶蛋.md',
  '../cook-book/饮品/原味豆浆.md',
  '../cook-book/配料/鸡油料.md',
  '../cook-book/早餐/饭团.md',
]

console.log('🔍 开始测试文件解析...')

testFiles.forEach((file) => {
  const fullPath = path.join(__dirname, file)
  testParseFile(fullPath)
})

console.log('\n✅ 测试完成')
