/// <reference types="vite/client" />

interface Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>
    isMetaMask?: boolean
    isConnected?: () => boolean
  }
  magicEden?: {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      isConnected?: () => boolean
    }
  }
}