import { createPublicClient, http } from 'viem'
import { mainnet, sepolia } from 'viem/chains'

// Configuration RPC avec fallbacks
const getMainnetRpc = () => {
  const alchemyRpc = import.meta.env.VITE_ALCHEMY_MAINNET_RPC_URL
  if (alchemyRpc && alchemyRpc.startsWith('https://') && (alchemyRpc.includes('alchemyapi.io') || alchemyRpc.includes('alchemy.com'))) {
    return alchemyRpc
  }
  // Si l'URL Alchemy est incomplète, la corriger
  if (alchemyRpc && (alchemyRpc.includes('alchemyapi.io') || alchemyRpc.includes('alchemy.com')) && !alchemyRpc.startsWith('https://')) {
    return `https://${alchemyRpc}`
  }
  return 'https://eth.llamarpc.com' // Fallback public
}

const getSepoliaRpc = () => {
  const alchemyRpc = import.meta.env.VITE_ALCHEMY_SEPOLIA_RPC_URL
  if (alchemyRpc && alchemyRpc.startsWith('https://') && (alchemyRpc.includes('alchemyapi.io') || alchemyRpc.includes('alchemy.com'))) {
    return alchemyRpc
  }
  // Si l'URL Alchemy est incomplète, la corriger
  if (alchemyRpc && (alchemyRpc.includes('alchemyapi.io') || alchemyRpc.includes('alchemy.com')) && !alchemyRpc.startsWith('https://')) {
    return `https://${alchemyRpc}`
  }
  return 'https://ethereum-sepolia-rpc.publicnode.com' // Fallback public
}

// Clients publics pour chaque réseau
export const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(getMainnetRpc())
})

export const sepoliaClient = createPublicClient({
  chain: sepolia,
  transport: http(getSepoliaRpc())
})

// Fonction pour obtenir le bon client selon le chainId
export const getPublicClient = (chainId: number) => {
  switch (chainId) {
    case 1:
      return mainnetClient
    case 11155111:
      return sepoliaClient
    default:
      return mainnetClient
  }
}