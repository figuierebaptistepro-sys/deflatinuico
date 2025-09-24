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

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

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
            <nav className="flex items-center space-x-4 lg:space-x-8">
              <a 
                href="#about" 
                className="text-gray-700 hover:text-orange-500 font-medium transition-colors duration-200 relative group text-sm lg:text-base"
              >
                About
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-200 group-hover:w-full"></span>
              </a>
              <a 
                href="#tokenomics" 
                className="text-gray-700 hover:text-orange-500 font-medium transition-colors duration-200 relative group text-sm lg:text-base"
              >
                Tokenomics
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-200 group-hover:w-full"></span>
              </a>
              <a 
                href="#ico" 
                className="text-gray-700 hover:text-orange-500 font-medium transition-colors duration-200 relative group text-sm lg:text-base"
              >
                ICO
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-200 group-hover:w-full"></span>
              </a>
              <a 
                href="#roadmap" 
                className="text-gray-700 hover:text-orange-500 font-medium transition-colors duration-200 relative group text-sm lg:text-base"
              >
                Roadmap
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-200 group-hover:w-full"></span>
              </a>
              <a 
                href="#" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-orange-500 font-medium transition-colors duration-200 relative group flex items-center space-x-1 text-sm lg:text-base"
              >
                <span>Whitepaper</span>
                <ExternalLink className="w-3 h-3" />
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-200 group-hover:w-full"></span>
              </a>
            </nav>

            {/* Desktop Wallet Section */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {isConnected && address ? (
                <div className="flex items-center space-x-1 lg:space-x-3">
                  {/* Token Balance */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg px-2 lg:px-4 py-1 lg:py-2">
                    <div className="flex items-center space-x-2">
                      <Coins className="w-4 h-4 text-orange-500" />
                      <span className="text-xs lg:text-sm font-semibold text-orange-700">
                        {totalTokens.toLocaleString()} DEFLAT
                      </span>
                    </div>
                  </div>
                  
                  {/* Wallet Address */}
                  <button
                    onClick={() => open({ view: 'Account' })}
                    className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-2 lg:px-4 py-1 lg:py-2 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs lg:text-sm font-medium text-gray-700">
                        {formatAddress(address)}
                      </span>
                    </div>
                  </button>
                  
                  {/* Disconnect Button */}
                  <button
                    onClick={() => disconnect()}
                    className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg px-2 lg:px-3 py-1 lg:py-2 transition-colors duration-200"
                    title="Disconnect"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnectWallet}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 lg:px-6 py-2 lg:py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 text-sm lg:text-base"
                >
                  <Wallet className="w-4 h-4" />
                  <span className="hidden sm:inline">Connect Wallet</span>
                  <span className="sm:hidden">Connect</span>
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