/*
 * @Description: 带重试机制的API请求工具
 */
import { isNetworkError, requestWithRetry } from '../../utils/network'
import alovaInstance from './instance'

// 创建带重试的请求方法
export function createRetryRequest() {
  return {
    // GET请求
    get: async (url: string, config?: any) => {
      return requestWithRetry(
        () => alovaInstance.Get(url, config),
        {
          maxRetries: 2,
          delay: 1000,
          backoff: true,
        },
      )
    },

    // POST请求
    post: async (url: string, data?: any, config?: any) => {
      return requestWithRetry(
        () => alovaInstance.Post(url, data, config),
        {
          maxRetries: 1, // POST请求重试次数较少
          delay: 1000,
          backoff: true,
        },
      )
    },

    // PUT请求
    put: async (url: string, data?: any, config?: any) => {
      return requestWithRetry(
        () => alovaInstance.Put(url, data, config),
        {
          maxRetries: 1,
          delay: 1000,
          backoff: true,
        },
      )
    },

    // DELETE请求
    delete: async (url: string, config?: any) => {
      return requestWithRetry(
        () => alovaInstance.Delete(url, config),
        {
          maxRetries: 1,
          delay: 1000,
          backoff: true,
        },
      )
    },
  }
}

// 导出实例
export const retryRequest = createRetryRequest()

// 智能请求函数 - 自动降级到Mock数据
export async function smartRequest<T>(requestFn: () => Promise<T>, fallbackData?: T): Promise<T> {
  try {
    return await requestFn()
  }
  catch (error) {
    // 如果是网络错误且在开发环境，尝试使用Mock数据
    if (isNetworkError(error) && import.meta.env.MODE === 'development') {
      console.log('[Smart Request] 网络请求失败，尝试使用Mock数据')

      // 如果有fallback数据，返回fallback
      if (fallbackData !== undefined) {
        return fallbackData
      }

      // 否则重新抛出错误，让Mock适配器处理
      throw error
    }

    throw error
  }
}
