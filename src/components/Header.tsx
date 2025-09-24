import React from 'react'
import { useState, useEffect } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { Menu, X, Wallet, LogOut, Coins, TrendingUp, ExternalLink, ChevronRight } from 'lucide-react'
import { usePurchases } from '../hooks/usePurchases'

export const Header: React.FC = () => {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useAppKit()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { totalTokens, purchases } = usePurchases()

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const totalInvested = purchases
    .filter(p => p.status === 'verified')
    .reduce((sum, p) => sum + p.amount_sent_eur, 0)

  const handleConnectWallet = () => {
    open()
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const handleNavClick = (href: string) => {
    closeMobileMenu()
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      {/* Main Header */}
      <header className="relative z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-orange-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg lg:text-xl">D</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl lg:text-2xl font-bold text-gray-900">
                  <span className="text-orange-500">DEFLAT</span>
                  <span className="text-blue-600">INU</span>
                </span>
                <span className="text-xs text-gray-500 hidden sm:block">Deflationary Token</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a 
                href="#about" 
                className="text-gray-700 hover:text-orange-500 font-medium transition-colors duration-200 relative group"
              >
                About
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-200 group-hover:w-full"></span>
              </a>
              <a 
                href="#tokenomics" 
                className="text-gray-700 hover:text-orange-500 font-medium transition-colors duration-200 relative group"
              >
                Tokenomics
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-200 group-hover:w-full"></span>
              </a>
              <a 
                href="#ico" 
                className="text-gray-700 hover:text-orange-500 font-medium transition-colors duration-200 relative group"
              >
                ICO
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-200 group-hover:w-full"></span>
              </a>
              <a 
                href="#roadmap" 
                className="text-gray-700 hover:text-orange-500 font-medium transition-colors duration-200 relative group"
              >
                Roadmap
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-200 group-hover:w-full"></span>
              </a>
              <a 
                href="#" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-orange-500 font-medium transition-colors duration-200 relative group flex items-center space-x-1"
              >
                <span>Whitepaper</span>
                <ExternalLink className="w-3 h-3" />
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-200 group-hover:w-full"></span>
              </a>
            </nav>

            {/* Desktop Wallet Section */}
            <div className="hidden lg:flex items-center space-x-4">
              {isConnected && address ? (
                <div className="flex items-center space-x-3">
                  {/* Token Balance */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <Coins className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-semibold text-orange-700">
                        {totalTokens.toLocaleString()} DEFLAT
                      </span>
                    </div>
                  </div>
                  
                  {/* Wallet Address */}
                  <button
                    onClick={() => open({ view: 'Account' })}
                    className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">
                        {formatAddress(address)}
                      </span>
                    </div>
                  </button>
                  
                  {/* Disconnect Button */}
                  <button
                    onClick={() => disconnect()}
                    className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg px-3 py-2 transition-colors duration-200"
                    title="Disconnect"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnectWallet}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              onClick={() => {
                const icoSection = document.querySelector('#ico')
                if (icoSection) {
                  icoSection.scrollIntoView({ behavior: 'smooth' })
                  // Focus on purchase form after scroll
                  setTimeout(() => {
                    const purchaseForm = icoSection.querySelector('input[type="number"]')
                    if (purchaseForm) {
                      purchaseForm.focus()
                    }
                  }, 1000)
                }
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-50 via-white to-orange-50 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-orange-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-40 left-20 w-64 h-64 bg-blue-100 rounded-full opacity-30 blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            {/* ICO Live Badge */}
            <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full mb-8 border border-orange-200">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="font-semibold text-sm">ICO Round 1 is Live!</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-orange-500">DEFLAT</span>
              <span className="text-blue-600">INU</span>
              <div className="text-gray-900 text-3xl sm:text-4xl lg:text-6xl mt-2">
                The Future of Anti-Inflation
              </div>
            </h1>

            {/* Subtitle */}
            <p className="text-lg lg:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Revolutionary deflationary token with progressive tax system and automatic buyback mechanisms. 
              Protect and grow your wealth through innovative tokenomics.
            </p>

            {/* Feature Tags */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="bg-white/80 backdrop-blur-sm border border-blue-200 text-blue-700 px-4 py-2 rounded-full">
                <span className="font-medium">Anti-Inflation</span>
              </div>
              <div className="bg-white/80 backdrop-blur-sm border border-green-200 text-green-700 px-4 py-2 rounded-full">
                <span className="font-medium">Auto-Buyback</span>
              </div>
              <div className="bg-white/80 backdrop-blur-sm border border-orange-200 text-orange-700 px-4 py-2 rounded-full">
                <span className="font-medium">Ethereum</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <button 
                onClick={() => handleNavClick('#ico')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Join the ICO →
              </button>
              <button 
                onClick={handleConnectWallet}
                className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isConnected ? 'Manage Wallet' : 'Connect Wallet'}
              </button>
            </div>

            {/* User Stats (if connected) */}
            {isConnected && address && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-orange-200 shadow-lg">
                  <div className="flex items-center justify-center space-x-3 mb-2">
                    <Coins className="w-6 h-6 text-orange-500" />
                    <span className="text-2xl font-bold text-orange-600">
                      {totalTokens.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-orange-700 font-medium">DEFLAT Tokens</p>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-green-200 shadow-lg">
                  <div className="flex items-center justify-center space-x-3 mb-2">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                    <span className="text-2xl font-bold text-green-600">
                      ${totalInvested.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-green-700 font-medium">Total Invested</p>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-blue-200 shadow-lg">
                  <div className="flex items-center justify-center space-x-3 mb-2">
                    <Wallet className="w-6 h-6 text-blue-500" />
                    <span className="text-2xl font-bold text-blue-600">
                      {purchases.length}
                    </span>
                  </div>
                  <p className="text-blue-700 font-medium">Transactions</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Modal */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[9999] lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          
          {/* Modal */}
          <div className="absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-white shadow-2xl">
            <div className="flex flex-col h-full">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div></div>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Navigation Links */}
              {/* Content */}
              <div className="flex-1 p-6">
                {/* Navigation Links */}
                <nav className="space-y-1 mb-8">
                  <button
                    onClick={() => handleNavClick('#about')}
                    className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors group"
                  >
                    <span className="font-medium">About</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button
                    onClick={() => handleNavClick('#ico')}
                    className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors group"
                  >
                    <span className="font-medium">ICO</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button
                    onClick={() => handleNavClick('#tokenomics')}
                    className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors group"
                  >
                    <span className="font-medium">Tokenomics</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button
                    onClick={() => handleNavClick('#roadmap')}
                    className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors group"
                  >
                    <span className="font-medium">Roadmap</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      closeMobileMenu()
                      // Ouvrir le whitepaper dans un nouvel onglet
                      window.open('#', '_blank')
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors group"
                  >
                    <span className="font-medium">Whitepaper</span>
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </nav>

                {/* Wallet Info (if connected) */}
                {isConnected && address && (
                  <div className="mt-8 space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Your Wallet</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">DEFLAT Tokens</span>
                          <span className="font-semibold text-orange-600">
                            {totalTokens.toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Total Invested</span>
                          <span className="font-semibold text-green-600">
                            ${totalInvested.toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                          <span className="text-sm text-gray-600">Address</span>
                          <button
                            onClick={() => {
                              open({ view: 'Account' })
                              closeMobileMenu()
                            }}
                            className="text-sm font-mono text-blue-600 hover:text-blue-700"
                          >
                            {formatAddress(address)}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Recent Transactions */}
                    {purchases.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Recent Transactions</h4>
                        <div className="space-y-2">
                          {purchases.slice(0, 3).map((purchase) => (
                            <div key={purchase.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  purchase.status === 'verified' ? 'bg-green-500' : 
                                  purchase.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                                }`} />
                                <span className="text-gray-600">
                                  {purchase.tokens_purchased.toLocaleString()} DEFLAT
                                </span>
                              </div>
                              <a
                                href={`https://sepolia.etherscan.io/tx/${purchase.tx_hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200">
                {isConnected && address ? (
                  <button
                    onClick={() => {
                      disconnect()
                      closeMobileMenu()
                    }}
                    className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Disconnect Wallet</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleConnectWallet()
                      closeMobileMenu()
                    }}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Connect Wallet</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}