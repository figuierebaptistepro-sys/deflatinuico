import React from 'react'
import { WalletProvider } from './components/WalletProvider'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { ICORounds } from './components/ICORounds'
import { TransactionHistory } from './components/TransactionHistory'
import { Tokenomics } from './components/Tokenomics'
import { Roadmap } from './components/Roadmap'
import { FAQ } from './components/FAQ'
import { Footer } from './components/Footer'
import { FloatingBuyButton } from './components/FloatingBuyButton'
import { AdminPanel } from './components/AdminPanel'
import { useAccount } from 'wagmi'
import { useAutoVerification } from './hooks/useAutoVerification'

function AppContent() {
  const { isConnected } = useAccount()
  
  // Initialize auto-verification
  useAutoVerification()

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <Hero />
      <ICORounds />
      {isConnected && (
        <section className="py-12 md:py-20 px-4 md:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <TransactionHistory />
          </div>
        </section>
      )}
      <Tokenomics />
      <Roadmap />
      <FAQ />
      <Footer />
      <FloatingBuyButton />
      <AdminPanel />
    </div>
  )
}

function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  )
}

export default App