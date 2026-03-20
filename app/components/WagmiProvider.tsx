'use client'

import { WagmiProvider as WagmiProviderOriginal } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config, getChain, metadata, projectId, wagmiAdapter } from '../config/appkit'
import { ReactNode, useState } from 'react'
import { createAppKit } from '@reown/appkit/react'

interface WagmiProviderProps {
  children: ReactNode
}
// 5. Create modal with both adapters (mobileoptimizationconfiguration)
export const appkit = createAppKit({
  networks: [getChain()],
  metadata,
  projectId,
  adapters: [wagmiAdapter],
  defaultNetwork: getChain(),
  // SIWE configuration - disable自动 SIWE,改用手动signature
  // siweConfig,
  features: {
    analytics: true,
    onramp: false,
    swaps: false,
    history: false,
    email: false, // 启用邮箱登录
    socials: [], // 启用社交登录
    // email: true, // enable邮箱login
    // socials: ['google', 'x', 'discord', 'github', 'apple'], // enable社交login
  },
  allowUnsupportedChain: true,
  enableWalletConnect: true,
 
})

export default function WagmiProvider({ children }: WagmiProviderProps) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProviderOriginal config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProviderOriginal>
  )
}