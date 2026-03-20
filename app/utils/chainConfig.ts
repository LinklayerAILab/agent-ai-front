/**
 * 链configurationandnamemap
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
 * based on chainId fetch链information
 */
export const getChainInfo = (chainId: number | undefined): ChainInfo | null => {
  if (!chainId) return null
  return chainConfigs[chainId] || null
}

/**
 * based on chainId fetch链name
 */
export const getChainName = (chainId: number | undefined): string => {
  const chainInfo = getChainInfo(chainId)
  return chainInfo?.name || `Unknown Chain (${chainId})`
}

/**
 * based on chainId fetch链简称
 */
export const getChainShortName = (chainId: number | undefined): string => {
  const chainInfo = getChainInfo(chainId)
  return chainInfo?.shortName || `Chain ${chainId}`
}

/**
 * checkisnofortest网
 */
export const isTestnet = (chainId: number | undefined): boolean => {
  const chainInfo = getChainInfo(chainId)
  return chainInfo?.isTestnet || false
}

/**
 * fetch区块浏览器link
 */
export const getBlockExplorerUrl = (chainId: number | undefined): string => {
  const chainInfo = getChainInfo(chainId)
  return chainInfo?.blockExplorerUrls[0] || ''
}

/**
 * fetch交易浏览器link
 */
export const getTxUrl = (chainId: number | undefined, txHash: string): string => {
  const explorerUrl = getBlockExplorerUrl(chainId)
  return explorerUrl ? `${explorerUrl}/tx/${txHash}` : ''
}

/**
 * fetchaddress浏览器link  
 */
export const getAddressUrl = (chainId: number | undefined, address: string): string => {
  const explorerUrl = getBlockExplorerUrl(chainId)
  return explorerUrl ? `${explorerUrl}/address/${address}` : ''
}