import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { Coins, ArrowRight, Zap, Shield } from 'lucide-react'

interface QuickBuyWidgetProps {
  className?: string
  onBuyClick?: () => void
}

export const QuickBuyWidget: React.FC<QuickBuyWidgetProps> = ({ 
  className = '',
  onBuyClick 
}) => {
  const { isConnected } = useAccount()
  const { open } = useAppKit()

  const handleBuyClick = () => {
    if (!isConnected) {
      open()
      return
    }
    
    if (onBuyClick) {
      onBuyClick()
    } else {
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
  }

  return (
    <div className={`bg-gradient-to-r from-orange-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Acheter DEFLAT INU</h3>
            <p className="text-white/80 text-sm">Rejoignez l'ICO maintenant</p>
          </div>
        </div>
        
        <button
          onClick={handleBuyClick}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <span>{isConnected ? 'Acheter' : 'Connecter'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="mt-4 flex items-center space-x-6 text-sm text-white/80">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4" />
          <span>ICO Live</span>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4" />
          <span>Sécurisé</span>
        </div>
      </div>
    </div>
  )
}