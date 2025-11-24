## 重复与冗余分析

* `scripts/check-db-empty.js` 与 `scripts/verify-data.js`：功能重叠，建议合并为一个校验脚本，支持参数启用空字段检查。

* `scripts/upload-category-icons.js` 与 `scripts/upload-category-images.js`：同源目录、同桶、同职责，保留一个并以参数控制重建与 upsert。

* `scripts/check-empty-data.js` 与 `scripts/extract-recipes.js`：前者可并入后者的 `--dry-run` 模式以输出汇总统计。

* `supabase/migrations/*get_unique_categories*.sql`：多版同名函数，开源时收敛为最终版（006）。

* `src/config/supabase.ts:3-5` 与所有脚本硬编码 URL/Key（如 `scripts/extract-recipes.js:8-10`）：统一改为环境变量加载，移除硬编码。

## 合并与废弃建议

* `verify-data.js` 合并 `check-db-empty.js`，新增参数：`--check-empty`、`--samples=N`；废弃 `check-db-empty.js`。

* `upload-category-icons.js` 合并 `upload-category-images.js` 的 upsert 与轻量桶检查，统一参数：`--recreate-bucket`、`--upsert`；废弃 `upload-category-images.js`。

* `extract-recipes.js` 增加 `--dry-run` 与问题汇总；废弃 `check-empty-data.js`；`test-parse.js` 保留为开发辅助。

* `supabase/migrations` 收敛：

  * `001_create_recipes_table.sql` 直接包含 `process_image_url` 与索引（并入 `add_process_image_url_to_recipes.sql`）。

  * `002_get_unique_categories.sql` 采用 006 的最终实现；删除 002/003/004/005 与 `add_process_image_url_to_recipes.sql`。

* 移除未被使用的 `src/config/category-icons.ts` 生成逻辑，图标 URL 以 RPC 或约定路径提供。

## 一键初始化目标方案

* CLI 路线（推荐）：`supabase db push` 应用 `supabase/migrations`。

* Node 初始化编排：按序执行

  * 上传分类图标到 `category-icons`（可选重建）；

  * 上传流程图到 `process-images` 并写入 `recipes.process_image_url`；

  * 解析 Markdown 并导入 `recipes`（含重复检测/缺失更新）；

  * 运行数据校验（总量、分类、空字段、样本预览）。

* 环境变量统一：`SUPABASE_URL`、`SUPABASE_ANON_KEY`（前端）、`SUPABASE_SERVICE_KEY`（脚本）；移除所有硬编码。

* 包命令：`setup:supabase`、`setup:storage`、`setup:data`、`setup:verify`、`setup:all` 串联上述步骤。

## 脚本 TypeScript 化与 esno 执行

* 将 `scripts/*.js` 迁移为 `scripts/*.ts`，统一使用 ESM/TS 语法（`import`、`export`）。

* 引入 `esno` 作为执行器：在 `package.json` 中将脚本改为 `esno scripts/<name>.ts`。

* 引入 `dotenv` 以在 Node/TS 环境加载 `.env`（脚本顶部 `import 'dotenv/config'`）。

* 新增适配的 `tsconfig.json`（Node/ESNext，`module`=ESNext，`target`=ES2020，`moduleResolution`=Bundler）。

* 约定：脚本仅使用 `SERVICE_KEY`（本地），前端仅使用 `ANON_KEY`；严禁在 TS 代码中内嵌密钥。

## 所需改动清单

* 配置：`src/config/supabase.ts:3-5` 与所有 `scripts/*` 改为读取环境变量。

* 脚本：合并/废弃如上，并为保留脚本补充参数支持与 `--dry-run`。

* 迁移：更新 001、保留 002（最终函数），删除重复迁移。

* 初始化：新增 `scripts/init-supabase.ts` 作为编排入口，通过 `esno` 运行，不直接执行 DDL，仅串联 CLI 与现有脚本。

## 验证方式

* 迁移后 `recipes` 表含 `process_image_url` 与索引；RLS 策略已启用。

* Storage 两个桶存在并文件数匹配；公共 URL 可访问。

* `extract-recipes` 运行成功、`verify-data` 输出正常；`verify-process-images.js` 覆盖率合理。

