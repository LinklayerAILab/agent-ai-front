/**
 * WalletConnect debugging tool
 * For diagnosing connection issues
 */

// Define Ethereum object types
interface EthereumProvider extends Record<string, unknown> {
  isMetaMask?: boolean;
  isConnected?: () => boolean;
  request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
}

export const debugWalletConnect = () => {
  if (typeof window === 'undefined') return

  const info = {
    // Environment information
    environment: {
      userAgent: navigator.userAgent,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      platform: navigator.platform,
      origin: window.location.origin,
      protocol: window.location.protocol,
      host: window.location.host,
    },

    // WalletConnect configuration
    walletConnect: {
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
      walletOrigin: process.env.NEXT_PUBLIC_WALLET_ORIGIN,
      hasProjectId: !!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
      projectIdLength: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.length,
    },

    // MetaMask detection
    metamask: {
      hasEthereum: typeof window.ethereum !== 'undefined',
      isMetaMask: (window.ethereum as EthereumProvider | undefined)?.isMetaMask || false,
      isConnected: (window.ethereum as EthereumProvider | undefined)?.isConnected?.() || false,
    },

    // Local storage check
    storage: {
      hasWalletConnectData: Object.keys(localStorage).some(key => key.includes('walletconnect')),
      walletConnectKeys: Object.keys(localStorage).filter(key => key.includes('walletconnect')),
    }
  }
  
  console.group('🔍 WalletConnect Debug Info')
  console.table(info.environment)
  console.table(info.walletConnect)
  console.table(info.metamask)
  console.table(info.storage)
  console.groupEnd()
  
  return info
}

/**
 * Clear WalletConnect cache
 * Sometimes old session data can cause connection issues
 */
export const clearWalletConnectCache = () => {
  const keysToRemove = Object.keys(localStorage).filter(key => 
    key.includes('walletconnect') || 
    key.includes('wc@2') || 
    key.includes('reown')
  )
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key)
  })
  
  return keysToRemove.length
}


/**
 * Diagnose all possible issues
 */
export const runFullDiagnostics = async () => {
  console.group('🏥 Running Full WalletConnect Diagnostics')

  // 1. Display debug information
  debugWalletConnect()


  // 3. Check for common issues
  const issues: string[] = []
  
  if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
    issues.push('Missing WalletConnect Project ID')
  }
  
  if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    issues.push('Not using HTTPS (required for WalletConnect)')
  }
  

  const eth = window.ethereum as EthereumProvider | undefined
  if (eth && !eth.isMetaMask) {
    issues.push('Ethereum provider detected but not MetaMask')
  }
  
  if (issues.length > 0) {
    // issues.forEach(issue => console.warn(`  - ${issue}`))
  } else {
  }
  
  console.groupEnd()
  
  return {
    hasIssues: issues.length > 0,
    issues
  }
}