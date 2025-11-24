/*
 * @Author: weisheng
 * @Date: 2025-04-17 15:58:11
 * @LastEditTime: 2025-11-18 12:51:25
 * @LastEditors: weisheng
 * @Description: Alova response and error handlers
 * @FilePath: /cook-cook/src/api/core/handlers.ts
 */
import type { Method } from 'alova'
import { getFriendlyErrorMessage, isNetworkError } from '../../utils/network'

// Custom error class for API errors
export class ApiError extends Error {
  code: number
  data?: any

  constructor(message: string, code: number, data?: any) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.data = data
  }
}

// Define a type for the expected API response structure
interface _ApiResponse {
  code?: number
  msg?: string
  message?: string
  data?: any
  success?: boolean
  total?: number
  more?: boolean
  error?: string
  details?: string
  hint?: string
}

// Supabase specific error interface
interface SupabaseError {
  message: string
  details?: string
  hint?: string
  code?: string
}

// Handle successful responses
export async function handleAlovaResponse(
  response: UniApp.RequestSuccessCallbackResult | UniApp.UploadFileSuccessCallbackResult | UniApp.DownloadSuccessData,
) {
  const _globalToast = useGlobalToast()
  // Extract status code and data from UniApp response
  const { statusCode, data } = response as UniNamespace.RequestSuccessCallbackResult

  // Log response in development
  if (import.meta.env.MODE === 'development') {
    console.log('[Alova Response]', { statusCode, data })
  }

  // Handle HTTP error status codes
  if (statusCode >= 400) {
    let errorMessage = `请求失败 (${statusCode})`

    // Handle Supabase specific errors
    if (data && typeof data === 'object') {
      const supabaseError = data as SupabaseError
      if (supabaseError.message) {
        errorMessage = supabaseError.message
        if (supabaseError.hint) {
          errorMessage += ` (${supabaseError.hint})`
        }
      }
    }

    // Handle authentication errors
    if (statusCode === 401 || statusCode === 403) {
      errorMessage = '认证失败，请检查API密钥配置'
    }

    if (import.meta.env.MODE === 'development') {
      console.error('[Alova Error Response]', { statusCode, data, errorMessage })
    }

    throw new ApiError(errorMessage, statusCode, data)
  }

  // For Supabase, the data is usually an array or object directly
  // Return the data as-is for successful responses
  return data
}

// Handle request errors
export function handleAlovaError(error: any, method: Method) {
  const globalToast = useGlobalToast()

  // Log error in development
  if (import.meta.env.MODE === 'development') {
    console.error('[Alova Error]', {
      error,
      method: {
        type: method.type,
        url: method.url,
        config: method.config,
      },
    })
  }

  // 使用友好的错误信息
  const errorMessage = getFriendlyErrorMessage(error)

  // 检查是否为网络错误
  if (isNetworkError(error)) {
    console.log('[Network Error Detected]', errorMessage)

    // 对于网络错误，显示更友好的提示
    globalToast.error(errorMessage)
  }
  else {
    // 其他类型的错误
    if (import.meta.env.MODE === 'development' || !(error instanceof ApiError && (error.code === 401 || error.code === 403))) {
      globalToast.error(errorMessage)
    }
  }

  throw error
}
