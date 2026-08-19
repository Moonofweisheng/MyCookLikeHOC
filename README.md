<p align="center">
    <img alt="logo" src="images/logo.png" width="200">
</p>

<h2 align="center">MyCookLikeHOC · 像老乡鸡那样做饭小程序</h2>

> 受 CookLikeHOC 项目启发的数据与菜谱浏览应用，全流程 AI 开发小程序，支持一键初始化 Supabase 数据库与 Storage，开箱即用。

## 项目简介

- 基于 uni-app + Vue 3 + TypeScript 构建的跨平台应用，使用 [wot-starter](https://starter.wot-ui.cn/) 作为项目模板，UI 采用 wot-ui。
- 全流程由 TRAE SOLO 开发。
- 数据来源：[CookLikeHOC 像老乡鸡🐔那样做饭](https://github.com/Gar-b-age/CookLikeHOC)。
- 后端数据与文件存储由 Supabase 提供：数据库迁移、RPC、Storage 图标与流程图。
- 内置脚本可从 `cook-book/` 目录的 Markdown 解析菜谱，导入到数据库，并上传所需图片到 Storage。

## 小程序在线体验

<p align="center">
    <img alt="logo" src="images/cook.jpg" width="200">
</p>

## 声明与致谢

- 本项目并非任何商家官方仓库，仅用于学习与技术交流。
- 感谢老乡鸡《老乡鸡菜品溯源报告》公布菜品，让我们能够像老乡鸡一样会做饭。
- 数据与灵感参考了社区项目 CookLikeHOC（感谢其整理与贡献）。如有问题或建议，欢迎反馈。

## 功能概览

- 菜谱浏览与分类筛选、关键词搜索。
- 分类 RPC（`get_unique_categories`）与 Supabase REST API 接入。
- 支持上传分类图标与菜谱手绘流程图到 Storage，并在前端展示。

<div style="display: flex; flex-direction: column; align-items: center;">
  <img src="images/home.png" alt="首页截图" width="300" />
  <img src="images/category.png" alt="分类页截图" width="300" />
  <img src="images/detail.png" alt="菜谱详情截图" width="300" />
</div>


## 技术栈

- 前端：uni-app（Vue 3 + TS）、wot-ui、UnoCSS、Pinia、Alova。
- 构建：Vite。
- 后端：Supabase（Postgres、RLS、RPC、Storage）。

## 快速开始

1. 安装依赖

```bash
pnpm install
```

2. 配置环境变量（开发环境 `.env.development`）

```bash
# 前端（浏览器）使用
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>

# 脚本（Node/TS）使用
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_KEY=<your-service-role-key>
```

3. 一键初始化（迁移 + Storage + 数据导入 + 校验）

```bash
pnpm setup:all
```

或分步执行：

```bash
pnpm run setup:data       # 解析并导入菜谱数据
pnpm run setup:storage    # 上传分类图标与流程图到 Storage
pnpm run setup:verify     # 数据质量与样本校验
```

4. 本地开发

```bash
pnpm dev
```

## SDD 与 OpenSpec 开发流程

本项目使用 [OpenSpec](https://github.com/Fission-AI/OpenSpec) 实行 SDD（Spec-Driven Development）。功能、行为、公共接口、数据模型和架构变更必须先形成可评审规格，再进入编码。

首次参与开发时，请先安装并验证 OpenSpec CLI（要求 Node.js 20.19.0 或更高版本）：

```bash
npm install -g @fission-ai/openspec@1.9.0
openspec --version
```

在 Codex 中使用以下流程：

```text
$openspec-explore              # 可选：梳理模糊需求与现有实现
$openspec-propose "变更描述"   # 生成 proposal/specs/design/tasks
$openspec-apply-change         # 按已确认的规格实施并完成任务
$openspec-verify-change        # 独立核对规格、实现、测试和任务
$openspec-archive-change       # Verify 通过后归档并同步系统规格
```

`$openspec-sync-specs` 仅在需要保留 active change、但提前更新主规格时使用，不属于默认主流程。

规格文件位于 `openspec/`：

- `openspec/specs/`：已交付行为的事实来源。
- `openspec/changes/`：进行中的提案、增量规格、技术设计与任务清单。
- `openspec/changes/archive/`：已完成变更的审计记录。
- `openspec/config.yaml`：项目技术栈、边界、产出规则和验证要求。

常用终端检查：

```bash
openspec list
openspec show <change-name>
openspec validate <change-name> --strict
```

升级 OpenSpec 时必须同步刷新项目技能，避免 CLI 与仓库内生成文件版本不一致：

```bash
OPENSPEC_TARGET_VERSION=1.9.0 # 替换为要升级到的版本
npm install -g "@fission-ai/openspec@${OPENSPEC_TARGET_VERSION}"
openspec --version
openspec update
git diff -- .agents/skills
```

审查并提交生成文件后，重新加载 IDE 以启用更新后的技能。

这是存量项目，采用增量规格策略：不一次性反向补写整个系统，只为正在发生的真实变更创建 delta specs，并在归档时逐步沉淀到主规格。

## 数据库与存储

- 迁移文件位于 `supabase/migrations/`：
  - `001_create_recipes_table.sql`：`recipes` 表结构、索引与 RLS。
  - `002_get_unique_categories.sql`：分类 RPC（返回分类名称）。
- Storage 桶：
  - `category-icons`：分类图标（`cook-book/images/cook-category`）。
  - `process-images`：菜谱手绘流程图（`cook-book/images/cook-process`）。

## 脚本说明

- `scripts/upload-category-icons.ts`：上传分类图标到 `category-icons`（支持 `--recreate-bucket`、`--upsert`）。
- `scripts/upload-process-images.ts`：上传流程图到 `process-images` 并更新 `recipes.process_image_url`。
- `scripts/extract-recipes.ts`：解析 Markdown 导入菜谱（`--dry-run` 输出问题汇总）。
- `scripts/verify-data.ts`：总数、分类统计、空字段与样本校验（`--check-empty`、`--samples=N`）。
- `scripts/verify-process-images.ts`：流程图覆盖率与示例校验。

> 所有脚本从 `process.env` 读取环境变量，并自动加载 `.env(.development)`；不要在前端暴露 `service_role_key`。

## 许可

- 本项目基于 MIT 协议，请自由地享受和参与开源。
