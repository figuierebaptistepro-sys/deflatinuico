import { createAppKit } from '@reown/appkit/react'
import { mainnet, sepolia } from 'viem/chains'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { QueryClient } from '@tanstack/react-query'
import { walletConnect, injected } from '@wagmi/connectors'
import { http } from 'viem'

// IDs / URLs
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID
if (!projectId) throw new Error('VITE_WALLETCONNECT_PROJECT_ID manquant (.env)')

const mainnetRpcRaw = import.meta.env.VITE_ALCHEMY_MAINNET_RPC_URL
const sepoliaRpcRaw = import.meta.env.VITE_ALCHEMY_SEPOLIA_RPC_URL

const getBaseUrl = (): string => {
  const envBaseUrl = import.meta.env.VITE_PUBLIC_BASE_URL
  if (envBaseUrl) return envBaseUrl
  if (typeof window !== 'undefined') return window.location.origin
  return 'https://deflatinu.com'
}
const baseUrl = getBaseUrl()

const metadata = {
  name: 'DEFLAT INU ICO',
  description: 'Deflationary Token ICO Platform',
  url: baseUrl,
  icons: [`${baseUrl}/vite.svg`],
}

// Fallbacks RPC si besoin
const mainnetRpc =
  mainnetRpcRaw?.startsWith('http') ? mainnetRpcRaw : 'https://eth.llamarpc.com'
const sepoliaRpc =
  sepoliaRpcRaw?.startsWith('http') ? sepoliaRpcRaw : 'https://ethereum-sepolia-rpc.publicnode.com'

// Define validChains array
const validChains = [mainnet, sepolia]

// Configuration WagmiAdapter simple
const wagmiAdapter = new WagmiAdapter({
  chains: validChains,
  projectId,
  ssr: false,
  transports: {
    [mainnet.id]: http(mainnetRpc),
    [sepolia.id]: http(sepoliaRpc),
  },
  connectors: [
    injected({ shimDisconnect: true }), // MetaMask et autres wallets injectés
    walletConnect({ projectId, metadata, showQrModal: false }), // WalletConnect
  ],
})

// ✅ AppKit minimal — pas d'explorer/reco
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  chains: validChains,
  projectId,
  // Si ta version le supporte et que des "recommended wallets" apparaissent quand même :
  // enableWalletExplorer: false,
  features: { email: false, socials: false },
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#f97316',
    '--w3m-border-radius-master': '12px',
    '--w3m-font-family': 'Inter, sans-serif',
  },
})

export const queryClient = new QueryClient()
export const config = wagmiAdapter.wagmiConfig