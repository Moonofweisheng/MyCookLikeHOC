/**
 * Supabase Storage 图片处理工具函数
 * 提供不同尺寸的图片 URL 生成
 */

export interface ImageSizeOptions {
  width?: number
  height?: number
  quality?: number
  resize?: 'fill' | 'contain' | 'cover' | 'scale-down'
  format?: 'webp' | 'jpeg' | 'png'
}

/**
 * 为 Supabase Storage 图片 URL 添加转换参数
 * @param url - 原始图片 URL
 * @param options - 图片处理选项
 * @returns 带转换参数的图片 URL
 */
export function optimizeImageUrl(url: string, options: ImageSizeOptions = {}): string {
  if (!url || !url.includes('supabase.co/storage')) {
    return url
  }

  // 默认配置
  const defaultOptions: ImageSizeOptions = {
    width: 200,
    height: 200,
    quality: 80,
    resize: 'fill',
    format: 'webp',
  }

  // 合并选项
  const finalOptions = { ...defaultOptions, ...options }

  // 构建转换参数（兼容小程序环境，无 URLSearchParams）
  const toQuery = (o: Record<string, string | number | undefined>) => {
    const parts: string[] = []
    for (const k in o) {
      const v = o[k]
      if (v !== undefined && v !== null) {
        parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      }
    }
    return parts.join('&')
  }
  const baseUrl = url.split('?')[0]
  const query = toQuery({
    width: finalOptions.width,
    height: finalOptions.height,
    quality: finalOptions.quality,
    resize: finalOptions.resize,
    format: finalOptions.format,
  })
  return `${baseUrl}?${query}`
}

/**
 * 预设的图片尺寸配置
 */
export const ImagePresets = {
  // 分类图标 - 小尺寸
  CATEGORY_ICON: {
    width: 160,
    height: 160,
    quality: 80,
    resize: 'fill',
    format: 'webp',
  },

  // 菜谱封面 - 中等尺寸
  RECIPE_COVER: {
    width: 400,
    height: 300,
    quality: 85,
    resize: 'cover',
    format: 'webp',
  },

  // 详情页大图 - 高质量
  DETAIL_IMAGE: {
    width: 800,
    height: 600,
    quality: 90,
    resize: 'contain',
    format: 'webp',
  },

  // 缩略图 - 极小尺寸
  THUMBNAIL: {
    width: 100,
    height: 100,
    quality: 70,
    resize: 'fill',
    format: 'webp',
  },
} as const

/**
 * 快速应用预设配置
 */
export function applyImagePreset(url: string, preset: keyof typeof ImagePresets): string {
  return optimizeImageUrl(url, ImagePresets[preset])
}
