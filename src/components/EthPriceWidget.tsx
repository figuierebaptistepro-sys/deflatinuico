import React from 'react'
import { useEthPrice } from '../hooks/useEthPrice'
import { TrendingUp, TrendingDown, RefreshCw, AlertTriangle } from 'lucide-react'

interface EthPriceWidgetProps {
  className?: string
  showSource?: boolean
  showRefresh?: boolean
}

export const EthPriceWidget: React.FC<EthPriceWidgetProps> = ({ 
  className = '', 
  showSource = true, 
  showRefresh = true 
}) => {
  const { 
    ethPrice, 
    loading, 
    error, 
    source, 
    lastUpdated, 
    refreshPrice, 
    isPriceRecent 
  } = useEthPrice()

  if (loading && !ethPrice) {
    return (
      <div className={`bg-white rounded-xl p-4 border border-gray-200 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
          <span className="text-gray-600">Loading ETH price...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl p-4 border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">Ξ</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                ${ethPrice?.toLocaleString() || '---'}
              </span>
              {error && (
                <AlertTriangle className="w-4 h-4 text-yellow-500" title={error} />
              )}
            </div>
            {showSource && lastUpdated && (
              <div className="text-xs text-gray-500">
                {source} • {new Date(lastUpdated).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isPriceRecent() && (
            <div className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
              Outdated
            </div>
          )}
          {showRefresh && (
            <button
              onClick={refreshPrice}
              disabled={loading}
              className="text-gray-400 hover:text-orange-500 transition-colors disabled:opacity-50"
              title="Refresh price"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-2 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
          ⚠️ Using fallback price - {error}
        </div>
      )}
    </div>
  )
}