import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { metaMask, walletConnect } from '@wagmi/connectors'
import { mainnet, sepolia } from 'viem/chains'
import { http } from 'viem'
import { QueryClient } from '@tanstack/react-query'

const networks = [mainnet, sepolia] as const // ✅ OBLIGATOIRE pour AppKit

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
  features: { email: false, socials: false },
  enableWalletExplorer: false,   // ✅ coupe le catalogue 470+
  enableWalletExplorer: false,   // ✅ coupe le catalogue 470+
})

export const config = wagmi.wagmiConfig
export const queryClient = new QueryClient()