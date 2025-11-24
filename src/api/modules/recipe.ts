import { alovaInstance } from '../core/instance'
import { SUPABASE_REST_CONFIG } from '../../config/supabase'

// 菜谱数据类型定义
export interface Recipe {
  id: string
  title: string
  category: string
  ingredients: string
  steps: string
  cover_image?: string
  image_path?: string
  process_image_url?: string
  created_at: string
  updated_at?: string
}

// 分页参数
export interface PaginationParams {
  page?: number
  limit?: number
}

// 搜索参数
export interface SearchParams extends PaginationParams {
  keyword?: string
  category?: string
}

// API响应类型
export interface ApiResponse<T> {
  data: T
  count?: number
  success: boolean
  message?: string
  error?: string
}

// 分类数据类型
export interface Category {
  category: string
  icon_url?: string
}

export interface CountResult {
  count: number
}

export interface DailyRecommendParams {
  date?: string
}

// API错误类型
export interface ApiError {
  message: string
  details?: string
  hint?: string
  code?: string
}

/**
 * 获取菜谱列表
 * @param params 搜索参数
 */
export function getRecipeList(params: SearchParams = {}) {
  const { page = 1, limit = 20, keyword, category } = params

  const queryParams: Record<string, any> = {
    select: '*',
    limit,
    offset: (page - 1) * limit,
    order: 'created_at.desc',
  }

  // 添加分类筛选
  if (category) {
    queryParams.category = `eq.${category}`
  }

  // 添加关键词搜索
  if (keyword) {
    const sanitized = String(keyword).trim()
    if (sanitized) {
      queryParams.or = `(title.ilike.*${sanitized}*,ingredients.ilike.*${sanitized}*)`
    }
  }

  return alovaInstance.Get<Recipe[]>('/rest/v1/recipes', {
    params: queryParams,
    headers: SUPABASE_REST_CONFIG.headers,
  })
}

/**
 * 获取菜谱详情
 * @param id 菜谱ID
 */
export function getRecipeDetail(id: string) {
  if (!id) {
    throw new Error('菜谱ID不能为空')
  }

  return alovaInstance.Get<Recipe[]>('/rest/v1/recipes', {
    params: {
      select: '*',
      id: `eq.${id}`,
    },
    headers: SUPABASE_REST_CONFIG.headers,
  })
}

/**
 * 获取推荐菜谱
 * @param limit 数量限制
 */
export function getRecommendedRecipes(limit: number = 5) {
  return alovaInstance.Get<Recipe[]>('/rest/v1/recipes', {
    params: {
      select: '*',
      limit: Math.max(1, Math.min(limit, 50)), // 限制范围1-50
      order: 'created_at.desc',
    },
    headers: SUPABASE_REST_CONFIG.headers,
  })
}

export function getDailyRecommendedRecipes(params: DailyRecommendParams = {}) {
  const body: Record<string, any> = {}
  if (params.date) body.seed_date = params.date
  return alovaInstance.Post<Recipe[]>('/rest/v1/rpc/get_daily_recommended_recipes', body, {
    headers: SUPABASE_REST_CONFIG.headers,
  })
}

export function getRandomRecipesByCategory(category: string, excludeId?: string, limit: number = 5) {
  const body: Record<string, any> = { cat: category, n: Math.max(1, Math.min(limit, 10)) }
  if (excludeId) body.exclude_id = excludeId
  return alovaInstance.Post<Recipe[]>('/rest/v1/rpc/get_random_recipes_by_category', body, {
    headers: SUPABASE_REST_CONFIG.headers,
  })
}

/**
 * 获取分类列表
 */
export function getCategoryList() {
  return alovaInstance.Get<Category[]>('/rest/v1/rpc/get_unique_categories', {
    headers: SUPABASE_REST_CONFIG.headers,
  })
}

export function getCategoryRecipeCount(category: string) {
  return alovaInstance.Post<CountResult[]>('/rest/v1/rpc/count_recipes_by_category', {
    cat: category,
  }, {
    headers: SUPABASE_REST_CONFIG.headers,
  })
}
