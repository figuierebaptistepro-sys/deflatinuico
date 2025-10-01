import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { metaMask, walletConnect } from '@wagmi/connectors'
import { mainnet, sepolia } from 'viem/chains'
import { http } from 'viem'
import { QueryClient } from '@tanstack/react-query'

const networks = [mainnet, sepolia] as const // ✅ OBLIGATOIRE pour AppKit

// IDs officiels Reown
const METAMASK_ID = 'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96'
const WALLETCONNECT_ID = '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'DEV_PLACEHOLDER'
const MAINNET_RPC = import.meta.env.VITE_ALCHEMY_MAINNET_RPC_URL || 'https://eth.llamarpc.com'
const SEPOLIA_RPC = import.meta.env.VITE_ALCHEMY_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com'

// Adapter Wagmi (⚠️ passe bien "networks", pas "chains")
const wagmi = new WagmiAdapter({
  networks,                                 // ✅
  projectId,                                 // optionnel mais recommandé
  transports: {
    [mainnet.id]: http(MAINNET_RPC),
    [sepolia.id]: http(SEPOLIA_RPC),
  },
  connectors: [
    metaMask({ shimDisconnect: true }),                 // ✅ MetaMask uniquement
    walletConnect({ projectId, showQrModal: false }),
  ],
})

// AppKit (⚠️ passe aussi "networks" ici)
createAppKit({
  adapters: [wagmi],
  networks,                                 // ✅ sinon extendCaipNetworks(...).map crash
  projectId,

  // coupe les features annexes
  features: { email: false, socials: false },
  enableWalletExplorer: false,   // ✅ coupe le catalogue 470+

  // 🔒 Whitelist stricte = n'affiche QUE ceux-là
  includeWalletIds: [METAMASK_ID, WALLETCONNECT_ID],
  featuredWalletIds: [METAMASK_ID, WALLETCONNECT_ID],
})

export const config = wagmi.wagmiConfig
export const queryClient = new QueryClient()