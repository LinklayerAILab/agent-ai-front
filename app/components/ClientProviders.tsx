'use client'

import dynamic from "next/dynamic"
import { ReactNode } from "react"

const StoreProvider = dynamic(() => import("./StoreProvider"), { ssr: false })
const WagmiProvider = dynamic(() => import("./WagmiProvider"), { ssr: false })

export default function ClientProviders({ children }: { children?: ReactNode }) {
  return (
    <WagmiProvider>
      <StoreProvider>{children}</StoreProvider>
    </WagmiProvider>
  )
}
