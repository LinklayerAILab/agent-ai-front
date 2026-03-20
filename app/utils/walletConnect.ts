// mobile钱packageconnectiontools

// Define Ethereum pair象type
export interface EthereumProvider extends Record<string, unknown> {
  isMetaMask?: boolean;
  isConnected?: () => boolean;
  request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

/**
 * mobile设备detection
 */
export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false

  // 更全面mobiledetection
  const userAgent = navigator.userAgent.toLowerCase()
  const mobilePatterns = [
    /android/i,
    /webos/i,
    /iphone/i,
    /ipad/i,
    /ipod/i,
    /blackberry/i,
    /iemobile/i,
    /opera mini/i,
    /mobile/i,
    /tablet/i
  ]

  // checkscreendimension
  const hasSmallScreen = window.innerWidth <= 768 || window.innerHeight <= 768

  // check触摸support
  const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  // user代理detection
  const matchesUserAgent = mobilePatterns.some(pattern => pattern.test(userAgent))

  return matchesUserAgent || (hasSmallScreen && hasTouchSupport)
}


/**
 * detectionplatformtype
 */
export const getPlatformType = () => {
  if (typeof window === 'undefined') return 'unknown'
  const userAgent = navigator.userAgent.toLowerCase()

  if (/android/i.test(userAgent)) return 'android'
  if (/iphone|ipad|ipod/i.test(userAgent)) return 'ios'
  if (isMobileDevice()) return 'mobile-web'

  return 'desktop'
}

/**
 * detectionisnoin MetaMask mobile浏览器内
 */
export const isMetaMaskMobile = () => {
  if (typeof window === 'undefined') return false
  const eth = window.ethereum as EthereumProvider | undefined
  return !!(eth && eth.isMetaMask && isMobileDevice())
}

/**
 * fetch MetaMask 深link
 */
export const getMetaMaskDeepLink = (wcUri: string) => {
  const encodedUri = encodeURIComponent(wcUri)
  
  // based ondifferentplatformReturndifferent深linkformat
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    // iOS use metamask:// protocol
    return `metamask://wc?uri=${encodedUri}`
  } else if (/Android/i.test(navigator.userAgent)) {
    // Android use https link
    return `https://metamask.app.link/wc?uri=${encodedUri}`
  }
  
  // defaultuse通用link
  return `https://metamask.app.link/wc?uri=${encodedUri}`
}

/**
 * handlemobile钱packageconnection
 */
export const handleMobileWalletConnect = async (wcUri: string) => {
  if (!isMobileDevice()) {
    return false
  }
  
  // ifalreadyin MetaMask 浏览器内，直接connection
  if (isMetaMaskMobile()) {
    return true
  }
  
  // Generate深link并跳转
  const deepLink = getMetaMaskDeepLink(wcUri)
  
  // use window.location.href 跳转（更可靠）
  window.location.href = deepLink
  
  // 备用方案：ifup面method不工作，尝试 window.open
  setTimeout(() => {
    window.open(deepLink, '_blank')
  }, 100)
  
  return true
}




/**
 * fetch WalletConnect configuration（针pairmobileoptimization）
 */
const HOSTNAME = process.env.NEXT_PUBLIC__HOST
export const getWalletConnectConfig = () => {
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
  const platformType = getPlatformType()

  return {
    projectId,
    metadata: {
      name: 'LinkLayer AI Agent',
      description: 'LinkLayer AI Agent - Connect your wallet',
      url: typeof window !== 'undefined' ? window.location.origin : HOSTNAME,
      icons: [typeof window !== 'undefined' ? `${window.location.origin}/favicon.ico` : `${HOSTNAME}/favicon.ico`]
    },
    // based onplatformoptimization钱packageselect
    featuredWalletIds: [
        'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
        '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
        '18388be9ac2d02726dbac9777c96efaac06d744b2f6d580fccdd4127a6d01fd1', // Binance Web3 Wallet
        '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
      ],
    // mobileoptimizationconfiguration
    qrModalOptions: {
      mobileLinks: platformType === 'desktop' ? [] : [
        'metamask',
        'trust',
        'rainbow',
        'argent',
        'imtoken',
        'binance'
      ],
      desktopLinks: platformType === 'desktop' ? [
        'metamask',
        'trust',
        'rainbow'
      ] : []
    },
    // mobile特定settings
    enableOnlyMobile: platformType !== 'desktop',
    enableWalletConnect: true,
    enableInjected: platformType === 'desktop',
    // Telegram Mini App 特殊configuration
    enableTelegram: true
  }
}