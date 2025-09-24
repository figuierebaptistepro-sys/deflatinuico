import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { Coins, X } from 'lucide-react'

export const FloatingBuyButton: React.FC = () => {
  const { isConnected } = useAccount()
  const { open } = useAppKit()
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling 500px
      const shouldShow = window.scrollY > 500
      setIsVisible(shouldShow && !isDismissed)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isDismissed])

  const handleBuyClick = () => {
    if (!isConnected) {
      open()
      return
    }
    
    // Scroll to ICO section and focus on purchase form
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
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-40 animate-bounce">
      <div className="bg-gradient-to-r from-orange-500 to-blue-600 rounded-2xl p-4 text-white shadow-2xl border-2 border-white/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm">DEFLAT INU</div>
              <div className="text-xs text-white/80">ICO en cours</div>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <button
          onClick={handleBuyClick}
          className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-sm"
        >
          {isConnected ? 'Acheter maintenant' : 'Connecter wallet'}
        </button>
      </div>
    </div>
  )
}