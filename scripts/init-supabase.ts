/*
 * @Author: weisheng
 * @Date: 2025-11-24 15:11:00
 * @LastEditTime: 2025-11-24 15:21:23
 * @LastEditors: weisheng
 * @Description:
 * @FilePath: /cook-cook/scripts/init-supabase.ts
 * 记得注释
 */
import 'dotenv/config'
import { execSync } from 'node:child_process'

function run(cmd: string) {
  try {
    console.log(`$ ${cmd}`)
    execSync(cmd, { stdio: 'inherit' })
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (e) {
    console.error(`命令执行失败: ${cmd}`)
  }
}

function main() {
  console.log('🚀 初始化 Supabase 与 Storage')
  run('supabase db push')
  run('pnpm esno scripts/upload-category-icons.ts --recreate-bucket')
  run('pnpm esno scripts/upload-process-images.ts')
  run('pnpm esno scripts/extract-recipes.ts')
  run('pnpm esno scripts/verify-data.ts --check-empty --samples=5')
}

if (require.main === module) {
  main()
}
