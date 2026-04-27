'use client'

import { WagmiProvider as WagmiProviderOriginal } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config, getChain, metadata, projectId, wagmiAdapter } from '../config/appkit'
import { ReactNode, useState } from 'react'
import { createAppKit } from '@reown/appkit/react'
import { createSIWEConfig } from '@reown/appkit-siwe'
import { siweConfig } from '../config/siwe'

interface WagmiProviderProps {
  children: ReactNode
}
// Create modal with both adapters (mobile optimization configuration)
export const appkit = createAppKit({
  networks: [getChain()],
  metadata,
  projectId,
  adapters: [wagmiAdapter],
  defaultNetwork: getChain(),
  siweConfig: createSIWEConfig(siweConfig),
  features: {
    analytics: true,
    onramp: false,
    swaps: false,
    history: false,
    email: true,
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
