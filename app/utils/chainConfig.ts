/**
 * Chain configuration and name mapping
 */

export interface ChainInfo {
  id: number
  name: string
  shortName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: string[]
  blockExplorerUrls: string[]
  isTestnet?: boolean
}

export const chainConfigs: Record<number, ChainInfo> = {
  // BSC Mainnet
  56: {
    id: 56,
    name: 'BNB Smart Chain',
    shortName: 'BSC',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    },
    rpcUrls: [
      'https://bsc-dataseed1.binance.org',
      'https://bsc-dataseed2.binance.org'
    ],
    blockExplorerUrls: ['https://bscscan.com'],
    isTestnet: false
  },
  
  // BSC Testnet
  97: {
    id: 97,
    name: 'BNB Smart Chain Testnet',
    shortName: 'BSC Testnet',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    },
    rpcUrls: [
      'https://data-seed-prebsc-1-s1.binance.org:8545',
      'https://data-seed-prebsc-2-s1.binance.org:8545'
    ],
    blockExplorerUrls: ['https://testnet.bscscan.com'],
    isTestnet: true
  },
  
  // Ethereum Mainnet
  1: {
    id: 1,
    name: 'Ethereum',
    shortName: 'ETH',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: [
      'https://mainnet.infura.io/v3/your-project-id',
      'https://eth-mainnet.alchemyapi.io/v2/your-api-key'
    ],
    blockExplorerUrls: ['https://etherscan.io'],
    isTestnet: false
  }
}

/**
 * Get chain info by chainId
 */
export const getChainInfo = (chainId: number | undefined): ChainInfo | null => {
  if (!chainId) return null
  return chainConfigs[chainId] || null
}

/**
 * Get chain name by chainId
 */
export const getChainName = (chainId: number | undefined): string => {
  const chainInfo = getChainInfo(chainId)
  return chainInfo?.name || `Unknown Chain (${chainId})`
}

/**
 * Get chain short name by chainId
 */
export const getChainShortName = (chainId: number | undefined): string => {
  const chainInfo = getChainInfo(chainId)
  return chainInfo?.shortName || `Chain ${chainId}`
}

/**
 * Check if it's a testnet
 */
export const isTestnet = (chainId: number | undefined): boolean => {
  const chainInfo = getChainInfo(chainId)
  return chainInfo?.isTestnet || false
}

/**
 * Get block explorer URL
 */
export const getBlockExplorerUrl = (chainId: number | undefined): string => {
  const chainInfo = getChainInfo(chainId)
  return chainInfo?.blockExplorerUrls[0] || ''
}

/**
 * Get transaction explorer URL
 */
export const getTxUrl = (chainId: number | undefined, txHash: string): string => {
  const explorerUrl = getBlockExplorerUrl(chainId)
  return explorerUrl ? `${explorerUrl}/tx/${txHash}` : ''
}

/**
 * Get address explorer URL
 */
export const getAddressUrl = (chainId: number | undefined, address: string): string => {
  const explorerUrl = getBlockExplorerUrl(chainId)
  return explorerUrl ? `${explorerUrl}/address/${address}` : ''
}