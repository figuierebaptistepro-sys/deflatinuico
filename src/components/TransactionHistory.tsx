import React from 'react'
import { useState } from 'react'
import { usePurchases } from '../hooks/usePurchases'
import { CheckCircle, Clock, XCircle, ExternalLink, Coins, Calendar, ChevronDown, ChevronUp } from 'lucide-react'

export const TransactionHistory: React.FC = () => {
  const { purchases, loading } = usePurchases()
  const [displayCount, setDisplayCount] = useState(5)

  const showMore = () => {
    setDisplayCount(prev => Math.min(prev + 5, purchases.length))
  }

  const showLess = () => {
    setDisplayCount(5)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'failed':
        return 'bg-red-50 border-red-200 text-red-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTxHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-200 shadow-lg">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Calendar className="w-6 h-6 text-orange-500 mr-3" />
          Historique des Transactions
        </h3>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-600">Chargement...</span>
        </div>
      </div>
    )
  }

  if (purchases.length === 0) {
    return (
      <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-200 shadow-lg">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Calendar className="w-6 h-6 text-orange-500 mr-3" />
          Historique des Transactions
        </h3>
        <div className="text-center py-12">
          <Coins className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Aucune transaction pour le moment</p>
          <p className="text-gray-400 text-sm mt-2">Vos achats de tokens apparaîtront ici</p>
        </div>
      </div>
    )
  }

  const totalInvested = purchases
    .filter(p => p.status === 'verified')
    .reduce((sum, p) => sum + p.amount_sent_eur, 0)

  const totalTokens = purchases
    .filter(p => p.status === 'verified')
    .reduce((sum, p) => sum + p.tokens_purchased, 0)

  const displayedPurchases = purchases.slice(0, displayCount)
  const hasMore = purchases.length > displayCount
  const canShowLess = displayCount > 5 && purchases.length > 5
  return (
    <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-200 shadow-lg">
      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <Calendar className="w-6 h-6 text-orange-500 mr-3" />
        Historique des Transactions
      </h3>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <div className="text-2xl font-bold text-orange-600">{purchases.length}</div>
          <div className="text-orange-700 text-sm">Transactions</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="text-2xl font-bold text-green-600">${totalInvested.toFixed(2)}</div>
          <div className="text-green-700 text-sm">Total Investi</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{totalTokens.toLocaleString()}</div>
          <div className="text-blue-700 text-sm">Tokens DEFLAT</div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        {displayedPurchases.map((purchase) => (
          <div key={purchase.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start space-x-4 mb-3 sm:mb-0">
                {getStatusIcon(purchase.status)}
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-gray-900">
                      {purchase.tokens_purchased.toLocaleString()} DEFLAT
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(purchase.status)}`}>
                      {purchase.status === 'verified' ? 'Vérifié' : 
                       purchase.status === 'pending' ? 'En attente' : 'Échoué'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {purchase.amount_sent_eth.toFixed(6)} ETH • ${purchase.amount_sent_eur.toFixed(2)} USD
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Round {purchase.ico_round} • {formatDate(purchase.created_at)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <a
                  href={`https://sepolia.etherscan.io/tx/${purchase.tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                >
                  <span>{formatTxHash(purchase.tx_hash)}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View More/Less Buttons */}
      {(hasMore || canShowLess) && (
        <div className="mt-6 flex justify-center space-x-4">
          {hasMore && (
            <button
              onClick={showMore}
              className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span>Voir plus ({purchases.length - displayCount} restantes)</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
          {canShowLess && (
            <button
              onClick={showLess}
              className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span>Voir moins</span>
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}