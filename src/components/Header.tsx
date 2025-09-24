import React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { Menu, X, Wallet, LogOut, Coins, TrendingUp, ExternalLink, ChevronRight } from 'lucide-react'
import { usePurchases } from '../hooks/usePurchases'

export const Header: React.FC = () => {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useAppKit()
  const { totalTokens, purchases } = usePurchases()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const totalInvested = purchases
    .filter(p => p.status === 'verified')
    .reduce((sum, p) => sum + p.amount_sent_eur, 0)

  const handleConnectWallet = () => {
    open()
  }

  const handleNavClick = useCallback((href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMobileMenuOpen(false)
  }, [])

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev)
  }, [])

  // Fermer le menu mobile quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (isMobileMenuOpen && !target.closest('.mobile-menu') && !target.closest('.hamburger-button')) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isMobileMenuOpen])

  // Empêcher le scroll quand le menu mobile est ouvert
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
              <button 
                onClick={() => handleNavClick('#about')}
                className="text-gray-700 hover:text-orange-500 font-medium transition-colors duration-200 relative group"
              >
                About
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-200 group-hover:w-full"></span>
              </button>
              <button 
                onClick={() => handleNavClick('#tokenomics')}
                className="text-gray-700 hover:text-orange-500 font-medium transition-colors duration-200 relative group"
              >
                Tokenomics
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-200 group-hover:w-full"></span>
              </button>
              <button 
                onClick={() => handleNavClick('#ico')}
                className="text-gray-700 hover:text-orange-500 font-medium transition-colors duration-200 relative group"
              >
                ICO
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-200 group-hover:w-full"></span>
              </button>
              <button 
                onClick={() => handleNavClick('#roadmap')}
                className="text-gray-700 hover:text-orange-500 font-medium transition-colors duration-200 relative group"
              >
                Roadmap
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-200 group-hover:w-full"></span>
              </button>
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

            {/* Mobile Menu Button & Wallet */}
            <div className="flex lg:hidden items-center space-x-3">
              {/* Mobile Wallet Info */}
              {isConnected && address && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg px-2 py-1">
                  <div className="flex items-center space-x-1">
                    <Coins className="w-3 h-3 text-orange-500" />
                    <span className="text-xs font-semibold text-orange-700">
                      {totalTokens.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Hamburger Button */}
              <button
                onClick={toggleMobileMenu}
                className="hamburger-button p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'opacity-100 visible transform translate-y-0' 
            : 'opacity-0 invisible transform -translate-y-2'
        }`}>
          <div className="px-4 py-6 space-y-4">
            {/* Navigation Links */}
            <div className="space-y-3">
              <button 
                onClick={() => handleNavClick('#about')}
                className="block w-full text-left px-4 py-3 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all duration-200 font-medium"
              >
                About
              </button>
              <button 
                onClick={() => handleNavClick('#tokenomics')}
                className="block w-full text-left px-4 py-3 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all duration-200 font-medium"
              >
                Tokenomics
              </button>
              <button 
                onClick={() => handleNavClick('#ico')}
                className="block w-full text-left px-4 py-3 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all duration-200 font-medium"
              >
                ICO
              </button>
              <button 
                onClick={() => handleNavClick('#roadmap')}
                className="block w-full text-left px-4 py-3 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all duration-200 font-medium"
              >
                Roadmap
              </button>
              <a 
                href="#" 
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-left px-4 py-3 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all duration-200 font-medium flex items-center justify-between"
              >
                <span>Whitepaper</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Mobile Wallet Section */}
            <div className="border-t border-gray-200 pt-4 mt-6">
              {isConnected && address ? (
                <div className="space-y-3">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <Coins className="w-4 h-4 text-orange-500" />
                        <span className="text-lg font-bold text-orange-600">
                          {totalTokens.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-orange-700">DEFLAT Tokens</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-lg font-bold text-green-600">
                          ${totalInvested.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-green-700">Invested</p>
                    </div>
                  </div>

                  {/* Wallet Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        open({ view: 'Account' })
                        toggleMobileMenu()
                      }}
                      className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 transition-colors duration-200 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">
                          {formatAddress(address)}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                    
                    <button
                      onClick={() => {
                        disconnect()
                        toggleMobileMenu()
                      }}
                      className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg px-4 py-3 transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-medium">Disconnect</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    handleConnectWallet()
                    toggleMobileMenu()
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet</span>
                </button>
              )}
            </div>
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
    </>
  )
}