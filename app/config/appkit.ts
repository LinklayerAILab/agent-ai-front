import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import {bsc,bscTestnet} from 'viem/chains'
import { cookieStorage, createStorage } from '@wagmi/core'
import type { Config } from 'wagmi'
import { walletConnect } from 'wagmi/connectors'
import { getWagmiConnectorV2 } from '@binance/w3w-wagmi-connector-v2'
import { omniConnect } from '@bitget-wallet/omni-connect-wagmi-adaptor'
import { isDev, isProd, isTest } from '../enum'

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id'



export function getChain() {
  if(isProd){
    return bsc
  }
  if(isTest || isDev){
    return bscTestnet
  }
  return bsc
}

// Get Binance connector function
const binanceConnector = getWagmiConnectorV2()

// 3. Set up Wagmi config with multiple connectors
export const wagmiAdapter = new WagmiAdapter({
  networks: [getChain()],
  projectId,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage
  }),
  connectors: [
    // WalletConnect connector
    walletConnect({ projectId, showQrModal: false }),
    // Injected wallets (MetaMask, etc.)
    // injected({ target: 'metaMask' }),
    // Binance Web3 Wallet
    binanceConnector(),
    // Bitget Wallet
    omniConnect({
      metadata: {
        name: 'LinkLayer AI Agent',
        url: 'https://linklayer.ai',
        iconUrl: `https://linklayer.ai/favicon.ico`
      },
    }),
  ],
})


// 4. Configure the metadata
const fallbackOrigin = 'https://linklayer.ai';
const serverOrigin = process.env.NEXT_PUBLIC__HOST || fallbackOrigin;
const origin = (typeof window !== 'undefined' ? window.location.origin : serverOrigin);

export const metadata = {
  name: 'LinkLayer AI Agent',
  description: 'LinkLayer AI Agent - Connect your wallet',
  url: origin as string, // ensure non-undefined
  icons: [
      `http://agent.linklayer.ai/favicon.ico`
  ],
}


// 6. Export config for wagmi
export const config = wagmiAdapter.wagmiConfig as Config

// 7. Declare module for type safety
declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
