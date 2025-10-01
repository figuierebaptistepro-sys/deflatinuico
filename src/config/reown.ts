import { createAppKit } from '@reown/appkit/react'
import { mainnet, sepolia } from 'viem/chains'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { QueryClient } from '@tanstack/react-query'
import { walletConnect, injected } from '@wagmi/connectors'
import { http } from 'viem'

// 🔧 VERIF ENV (uniquement en DEV pour éviter les leaks)
if (import.meta.env.DEV) {
  console.log('='.repeat(80))
  console.log('🔍 VERIFICATION COMPLETE ALCHEMY')
  console.log('='.repeat(80))
  console.log('📋 Variables d\'environnement brutes:')
  console.log('- VITE_ALCHEMY_MAINNET_RPC_URL:', import.meta.env.VITE_ALCHEMY_MAINNET_RPC_URL)
  console.log('- VITE_ALCHEMY_SEPOLIA_RPC_URL:', import.meta.env.VITE_ALCHEMY_SEPOLIA_RPC_URL)
  console.log('- VITE_WALLETCONNECT_PROJECT_ID:', import.meta.env.VITE_WALLETCONNECT_PROJECT_ID)
  const mainnetRpcRaw = import.meta.env.VITE_ALCHEMY_MAINNET_RPC_URL
  const sepoliaRpcRaw = import.meta.env.VITE_ALCHEMY_SEPOLIA_RPC_URL
  console.log('🔬 Analyse détaillée:')
  console.log('- Type mainnet RPC:', typeof mainnetRpcRaw)
  console.log('- Longueur mainnet RPC:', mainnetRpcRaw?.length || 0)
  console.log('- Contient "alchemy":', /alchemy(api|\.com)/.test(mainnetRpcRaw || ''))
  console.log('- Type sepolia RPC:', typeof sepoliaRpcRaw)
  console.log('- Longueur sepolia RPC:', sepoliaRpcRaw?.length || 0)
  console.log('- Contient "alchemy":', /alchemy(api|\.com)/.test(sepoliaRpcRaw || ''))
  console.log('🌍 TOUTES les variables d\'environnement VITE_:')
  Object.keys(import.meta.env).forEach(k => k.startsWith('VITE_') && console.log(`- ${k}:`, import.meta.env[k]))
}

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

if (import.meta.env.DEV) {
  console.log('🌐 Configuration RPC finale:')
  console.log('- Mainnet RPC:', mainnetRpc)
  console.log('- Mainnet utilise Alchemy:', /alchemy(api|\.com)/.test(mainnetRpc) ? '✅ OUI' : '❌ NON')
  console.log('- Sepolia RPC:', sepoliaRpc)
  console.log('- Sepolia utilise Alchemy:', /alchemy(api|\.com)/.test(sepoliaRpc) ? '✅ OUI' : '❌ NON')
}

// ✅ WagmiAdapter avec **chains** + 2 connecteurs uniquement
const wagmiAdapter = new WagmiAdapter({
  chains: [mainnet, sepolia],
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
  chains: [mainnet, sepolia],
  projectId,
  metadata,
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

if (import.meta.env.DEV) {
  console.log('✅ Wagmi Adapter créé avec succès - SEULEMENT MetaMask (injected) et WalletConnect')
  console.log('='.repeat(80))
}

export const queryClient = new QueryClient()
export const config = wagmiAdapter.wagmiConfig