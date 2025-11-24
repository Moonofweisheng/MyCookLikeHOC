/*
 * @Description: 网络状态检测和重试机制
 */

// 网络状态检测
export function checkNetworkStatus(): Promise<boolean> {
  return new Promise((resolve) => {
    // #ifdef H5
    resolve(navigator.onLine)
    // #endif

    // #ifdef MP-WEIXIN || APP-PLUS
    uni.getNetworkType({
      success: (res) => {
        resolve(res.networkType !== 'none')
      },
      fail: () => {
        resolve(false)
      },
    })
    // #endif
  })
}

// 重试机制配置
interface RetryOptions {
  maxRetries?: number
  delay?: number
  backoff?: boolean
}

// 带重试的请求函数
export async function requestWithRetry<T>(
  requestFn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const { maxRetries = 3, delay = 1000, backoff = true } = options

  let lastError: any

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // 检查网络状态
      const isOnline = await checkNetworkStatus()
      if (!isOnline && attempt > 0) {
        throw new Error('网络连接不可用')
      }

      return await requestFn()
    }
    catch (error) {
      lastError = error

      // 如果是最后一次尝试，直接抛出错误
      if (attempt === maxRetries) {
        break
      }

      // 计算延迟时间（指数退避）
      const currentDelay = backoff ? delay * 2 ** attempt : delay

      console.log(`请求失败，${currentDelay}ms后进行第${attempt + 2}次重试...`)

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, currentDelay))
    }
  }

  throw lastError
}

// 网络状态监听
export function onNetworkStatusChange(callback: (isOnline: boolean) => void) {
  // #ifdef H5
  const handleOnline = () => callback(true)
  const handleOffline = () => callback(false)

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
  // #endif

  // #ifdef MP-WEIXIN || APP-PLUS
  uni.onNetworkStatusChange((res) => {
    callback(res.isConnected)
  })

  return () => {
    // uni-app 没有提供取消监听的方法
  }
  // #endif
}

// 错误类型判断
export function isNetworkError(error: any): boolean {
  if (!error)
    return false

  const errorMessage = error.message || error.errMsg || ''
  const networkErrorKeywords = [
    'network',
    'timeout',
    'connection',
    'request:fail',
    'ERR_FAILED',
    'ERR_NETWORK',
    'ERR_INTERNET_DISCONNECTED',
  ]

  return networkErrorKeywords.some(keyword =>
    errorMessage.toLowerCase().includes(keyword.toLowerCase()),
  )
}

// 获取友好的错误信息
export function getFriendlyErrorMessage(error: any): string {
  if (!error)
    return '未知错误'

  const errorMessage = error.message || error.errMsg || ''

  // 网络相关错误
  if (isNetworkError(error)) {
    return '网络连接失败，请检查网络设置后重试'
  }

  // 超时错误
  if (errorMessage.includes('timeout')) {
    return '请求超时，请稍后重试'
  }

  // 服务器错误
  if (error.code >= 500) {
    return '服务器暂时不可用，请稍后重试'
  }

  // 认证错误
  if (error.code === 401 || error.code === 403) {
    return 'API认证失败，请检查配置'
  }

  // 404错误
  if (error.code === 404) {
    return '请求的资源不存在'
  }

  // 其他错误
  return errorMessage || '请求失败，请稍后重试'
}
