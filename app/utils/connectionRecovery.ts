/**
 * Mini App 环境下的连接恢复机制
 */

import { readContract } from 'wagmi/actions'
import { config } from '../config/appkit'
import { ERC20_CONTRACT, CHAIN_ID } from '../enum'
import erc20Abi from '../abi/erc20.json'

export interface ConnectionStatus {
  isReallyConnected: boolean
  address: string | null
  error?: string
}

/**
 * 验证钱包是否真正连接
 */
export const verifyWalletConnection = async (
  address: string | null,
  isConnected: boolean
): Promise<ConnectionStatus> => {
  console.log('🔍 开始验证钱包连接状态...', { address, isConnected })

  if (!address || !isConnected) {
    return {
      isReallyConnected: false,
      address: null,
      error: '钱包未连接'
    }
  }

  try {
    // 尝试读取余额来验证连接
    const balance = await readContract(config, {
      address: ERC20_CONTRACT as `0x${string}`,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [address],
      chainId: CHAIN_ID,
    })

    console.log('✅ 连接验证成功，余额:', balance)
    return {
      isReallyConnected: true,
      address,
    }
  } catch (error) {
    console.error('❌ 连接验证失败:', error)
    return {
      isReallyConnected: false,
      address: null,
      error: error instanceof Error ? error.message : '连接验证失败'
    }
  }
}

/**
 * 智能重连机制
 */
export const smartReconnect = async (
  openWallet: () => Promise<void>,
  maxRetries: number = 2
): Promise<boolean> => {
  console.log('🔄 开始智能重连...')

  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`🔄 重连尝试 ${i + 1}/${maxRetries}`)
      
      await openWallet()
      
      // 等待连接建立
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log(`✅ 重连尝试 ${i + 1} 完成`)
      return true
      
    } catch (error) {
      console.error(`❌ 重连尝试 ${i + 1} 失败:`, error)
      
      if (i < maxRetries - 1) {
        console.log('⏳ 等待后重试...')
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  }

  console.error('❌ 所有重连尝试都失败了')
  return false
}

/**
 * 错误类型接口
 */
interface WalletError {
  message: string
  code?: string | number
  reason?: string
  shortMessage?: string
}

/**
 * 类型守卫：检查是否为错误对象
 */
const isErrorLike = (error: unknown): error is WalletError => {
  return (
    typeof error === 'object' && 
    error !== null && 
    'message' in error && 
    typeof (error as WalletError).message === 'string'
  )
}

/**
 * 安全获取错误信息
 */
const getErrorMessage = (error: unknown): string => {
  if (isErrorLike(error)) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  if (error && typeof error === 'object' && 'toString' in error) {
    return error.toString()
  }
  
  return '未知错误'
}

/**
 * 检测是否为 Mini App 环境的连接器错误
 */
export const isMiniAppConnectionError = (error: unknown): boolean => {
  if (!error) return false
  
  const errorMessage = getErrorMessage(error)
  
  return (
    errorMessage.includes('Connector not connected') ||
    errorMessage.includes('No connector connected') ||
    errorMessage.includes('User rejected') ||
    errorMessage.includes('Connection lost')
  )
}

/**
 * 获取用户友好的错误信息
 */
export const getFriendlyErrorMessage = (error: unknown): string => {
  if (!error) return '未知错误'
  
  const errorMessage = getErrorMessage(error)
  
  if (errorMessage.includes('Connector not connected')) {
    return '钱包连接已断开，请重新连接'
  }
  
  if (errorMessage.includes('User rejected')) {
    return '用户取消了操作'
  }
  
  if (errorMessage.includes('insufficient funds')) {
    return '余额不足'
  }
  
  if (errorMessage.includes('gas')) {
    return 'Gas 费用不足'
  }
  
  return `交易失败: ${errorMessage}`
}