/**
 * WalletConnect 会话错误处理工具
 * 处理 "No matching key. session topic doesn't exist" 错误
 */

import { clearWalletConnectCache } from './walletDebug'

export interface SessionError {
  message: string
  code?: string
  context?: string
}

/**
 * 检测是否为会话过期错误
 */
export const isSessionExpiredError = (error: Error | SessionError): boolean => {
  const errorMessage = error.message.toLowerCase()
  return (
    errorMessage.includes('session topic doesn\'t exist') ||
    errorMessage.includes('no matching key') ||
    errorMessage.includes('session expired') ||
    errorMessage.includes('invalid session')
  )
}

/**
 * 处理会话过期错误
 */
export const handleSessionError = async (error: Error | SessionError): Promise<void> => {
  console.warn('检测到会话错误:', error.message)
  
  if (isSessionExpiredError(error)) {
    console.log('执行会话清理和重连...')
    
    // 1. 清理本地 WalletConnect 缓存
    clearWalletConnectCache()
    
    // 2. 清理其他相关存储
    try {
      if (typeof window !== 'undefined') {
        // 清理 AppKit 相关存储
        const keysToRemove = Object.keys(localStorage).filter(key => 
          key.includes('appkit') || 
          key.includes('reown') ||
          key.includes('wagmi')
        )
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key)
          console.log(`已清理存储: ${key}`)
        })
      }
    } catch (cleanupError) {
      console.warn('清理存储时出错:', cleanupError)
    }
    
    // 3. 建议用户刷新页面或重新连接
    console.log('建议用户重新连接钱包')
  }
}

/**
 * 包装异步操作，自动处理会话错误
 */
export const withSessionErrorHandling = async <T>(
  operation: () => Promise<T>,
  onSessionError?: () => void
): Promise<T> => {
  try {
    return await operation()
  } catch (error) {
    if (error instanceof Error && isSessionExpiredError(error)) {
      await handleSessionError(error)
      if (onSessionError) {
        onSessionError()
      }
      throw new Error('钱包会话已过期，请重新连接')
    }
    throw error
  }
}

/**
 * 预防性会话检查
 */
export const validateSession = (): boolean => {
  try {
    if (typeof window === 'undefined') return true
    
    // 检查是否有过期的 WalletConnect 数据
    const wcKeys = Object.keys(localStorage).filter(key => 
      key.includes('walletconnect') || key.includes('wc@2')
    )
    
    for (const key of wcKeys) {
      try {
        const data = localStorage.getItem(key)
        if (data) {
          const parsed = JSON.parse(data)
          // 检查是否包含过期信息
          if (parsed.expiry && Date.now() > parsed.expiry * 1000) {
            console.warn(`发现过期会话: ${key}`)
            localStorage.removeItem(key)
            return false
          }
        }
      } catch {
        // 忽略解析错误，删除无效数据
        localStorage.removeItem(key)
      }
    }
    
    return true
  } catch (error) {
    console.warn('会话验证失败:', error)
    return false
  }
}