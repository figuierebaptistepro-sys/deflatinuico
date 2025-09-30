import { createAppKit } from '@reown/appkit/react'
import { mainnet, sepolia } from 'viem/chains'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { QueryClient } from '@tanstack/react-query'
import { walletConnect, injected, coinbaseWallet } from '@wagmi/connectors'
import { http } from 'viem'

// 🔧 VERIFICATION COMPLETE DES VARIABLES D'ENVIRONNEMENT
console.log('='.repeat(80))
console.log('🔍 VERIFICATION COMPLETE ALCHEMY')
console.log('='.repeat(80))

// Vérification brute des variables
console.log('📋 Variables d\'environnement brutes:')
console.log('- VITE_ALCHEMY_MAINNET_RPC_URL:', import.meta.env.VITE_ALCHEMY_MAINNET_RPC_URL)
console.log('- VITE_ALCHEMY_SEPOLIA_RPC_URL:', import.meta.env.VITE_ALCHEMY_SEPOLIA_RPC_URL)
console.log('- VITE_WALLETCONNECT_PROJECT_ID:', import.meta.env.VITE_WALLETCONNECT_PROJECT_ID)

// Vérification du type et de la longueur
const mainnetRpcRaw = import.meta.env.VITE_ALCHEMY_MAINNET_RPC_URL
const sepoliaRpcRaw = import.meta.env.VITE_ALCHEMY_SEPOLIA_RPC_URL

console.log('🔬 Analyse détaillée:')
console.log('- Type mainnet RPC:', typeof mainnetRpcRaw)
console.log('- Longueur mainnet RPC:', mainnetRpcRaw?.length || 0)
console.log('- Contient "alchemyapi":', mainnetRpcRaw?.includes('alchemyapi') || false)
console.log('- Type sepolia RPC:', typeof sepoliaRpcRaw)
console.log('- Longueur sepolia RPC:', sepoliaRpcRaw?.length || 0)
console.log('- Contient "alchemyapi":', sepoliaRpcRaw?.includes('alchemyapi') || false)

// Affichage de toutes les variables d'environnement
console.log('🌍 TOUTES les variables d\'environnement:')
Object.keys(import.meta.env).forEach(key => {
  if (key.startsWith('VITE_')) {
    console.log(`- ${key}:`, import.meta.env[key])
  }
})

// Get Reown Project ID from environment variables
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

// Get base URL with intelligent fallback
const getBaseUrl = (): string => {
  // 1. Try environment variable first (for custom domains)
  const envBaseUrl = import.meta.env.VITE_PUBLIC_BASE_URL
  if (envBaseUrl) {
    console.log('✅ Using custom base URL from environment:', envBaseUrl)
    return envBaseUrl
  }
  
  // 2. Use current domain if available (works for bolt.host and any other domain)
  if (typeof window !== 'undefined') {
    console.log('✅ Using current domain:', window.location.origin)
    return window.location.origin
  }
  
  // 3. Fallback to bolt.host URL (for build time or server-side rendering)
  const fallbackUrl = 'https://deflatinu.com'
  console.log('⚠️ Using fallback URL:', fallbackUrl)
  return fallbackUrl
}

const baseUrl = getBaseUrl()

if (!projectId) {
  console.error('❌ ERREUR: VITE_WALLETCONNECT_PROJECT_ID manquant')
  throw new Error('VITE_WALLETCONNECT_PROJECT_ID is required. Please add it to your .env file.')
}

// Application metadata
const metadata = {
  name: 'DEFLAT INU ICO',
  description: 'Deflationary Token ICO Platform',
  url: baseUrl,
  icons: [`${baseUrl}/vite.svg`]
}

// Supported networks
const networks = [mainnet, sepolia]

// RPC URLs avec fallbacks et vérification
let mainnetRpc: string
let sepoliaRpc: string

if (mainnetRpcRaw && mainnetRpcRaw.startsWith('https://') && (mainnetRpcRaw.includes('alchemyapi.io') || mainnetRpcRaw.includes('alchemy.com'))) {
  mainnetRpc = mainnetRpcRaw
  console.log('✅ ALCHEMY MAINNET DETECTE:', mainnetRpc)
} else if (mainnetRpcRaw && (mainnetRpcRaw.includes('alchemyapi.io') || mainnetRpcRaw.includes('alchemy.com')) && !mainnetRpcRaw.startsWith('https://')) {
  mainnetRpc = `https://${mainnetRpcRaw}`
  console.log('✅ ALCHEMY MAINNET CORRIGE:', mainnetRpc)
} else {
  mainnetRpc = 'https://eth.llamarpc.com'
  console.log('⚠️ FALLBACK MAINNET RPC:', mainnetRpc)
  console.log('   Raison: Variable manquante ou invalide')
}

if (sepoliaRpcRaw && sepoliaRpcRaw.startsWith('https://') && (sepoliaRpcRaw.includes('alchemyapi.io') || sepoliaRpcRaw.includes('alchemy.com'))) {
  sepoliaRpc = sepoliaRpcRaw
  console.log('✅ ALCHEMY SEPOLIA DETECTE:', sepoliaRpc)
} else if (sepoliaRpcRaw && (sepoliaRpcRaw.includes('alchemyapi.io') || sepoliaRpcRaw.includes('alchemy.com')) && !sepoliaRpcRaw.startsWith('https://')) {
  sepoliaRpc = `https://${sepoliaRpcRaw}`
  console.log('✅ ALCHEMY SEPOLIA CORRIGE:', sepoliaRpc)
} else {
  sepoliaRpc = 'https://ethereum-sepolia-rpc.publicnode.com'
  console.log('⚠️ FALLBACK SEPOLIA RPC:', sepoliaRpc)
  console.log('   Raison: Variable manquante ou invalide')
}

console.log('🌐 Configuration RPC finale:')
console.log('- Mainnet RPC:', mainnetRpc)
console.log('- Mainnet utilise Alchemy:', (mainnetRpc.includes('alchemyapi.io') || mainnetRpc.includes('alchemy.com')) ? '✅ OUI' : '❌ NON')
console.log('- Sepolia RPC:', sepoliaRpc)
console.log('- Sepolia utilise Alchemy:', (sepoliaRpc.includes('alchemyapi.io') || sepoliaRpc.includes('alchemy.com')) ? '✅ OUI' : '❌ NON')

// Create Wagmi Adapter with explicit connectors
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false,
  transports: {
    [mainnet.id]: http(mainnetRpc),
    [sepolia.id]: http(sepoliaRpc),
  },
  batch: {
    multicall: false,
  },
  connectors: [
    walletConnect({ projectId, metadata, showQrModal: false }),
    injected({ shimDisconnect: true }),
    coinbaseWallet({
      appName: metadata.name,
      appLogoUrl: metadata.icons[0]
    })
  ]
})

console.log('✅ Wagmi Adapter créé avec succès')
console.log('='.repeat(80))

// Create AppKit modal with better configuration
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#f97316',
    '--w3m-border-radius-master': '12px',
    '--w3m-font-family': 'Inter, sans-serif'
  },
  enableAnalytics: false,
  enableOnramp: false,
  enableSwaps: false,
  enableEmail: false,
  enableSocials: false,
  allowUnsafeOrigin: true,
  enableWalletFeatures: false,
  includeWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96'  // MetaMask only
  ],
  featuredWalletIds: []
})

export const queryClient = new QueryClient()
export const config = wagmiAdapter.wagmiConfig