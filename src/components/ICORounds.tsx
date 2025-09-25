import React, { useState, useEffect } from 'react'
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { useAppKit } from '@reown/appkit/react'
import { 
  Shield, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Wallet,
  DollarSign,
  Coins,
  ArrowRight,
  Info,
  Zap
} from 'lucide-react'
import { usePurchases } from '../hooks/usePurchases'
import { useAutoVerification } from '../hooks/useAutoVerification'
import { useTxStatus } from '../hooks/useTxStatus'
import { useChainId } from 'wagmi'
import { useICORounds } from '../hooks/useICORounds'
import { useICOStatus } from '../hooks/useICOStatus'
import { useEthPrice } from '../hooks/useEthPrice'
import { ICOStatus } from './ICOStatus'

export const ICORounds: React.FC = () => {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { open } = useAppKit()
  const { processTransaction } = usePurchases()
  const { addToVerificationQueue } = useAutoVerification()
  const { status: txStatus, track: trackTransaction } = useTxStatus()
  const { rounds, loading: roundsLoading, error: roundsError, activeRound, getRoundByNumber, activateRound, completeRound, resetRound } = useICORounds()
  const { status: icoStatus } = useICOStatus()
  const { 
    ethPrice, 
    loading: ethPriceLoading, 
    error: ethPriceError,
    source: ethPriceSource,
    lastUpdated,
    refreshPrice,
    calculateEthAmount,
    isPriceRecent
  } = useEthPrice()
  
  const [selectedRoundNumber, setSelectedRoundNumber] = useState(1)
  const [purchaseAmount, setPurchaseAmount] = useState('')
  const [ethAmount, setEthAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Transaction hooks
  const { 
    sendTransaction, 
    data: hash, 
    isPending: isSending,
    error: sendError,
    reset: resetSend
  } = useSendTransaction()

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    error: confirmError
  } = useWaitForTransactionReceipt({
    hash,
  })

  // Set initial selected round to active round when rounds are loaded
  useEffect(() => {
    if (activeRound && selectedRoundNumber !== activeRound.round_number) {
      setSelectedRoundNumber(activeRound.round_number)
    }
  }, [activeRound, selectedRoundNumber])

  // Calculate tokens and ETH amount
  useEffect(() => {
    if (purchaseAmount && ethPrice) {
      const usdAmount = parseFloat(purchaseAmount)
      const ethRequired = calculateEthAmount(usdAmount)
      setEthAmount(ethRequired)
    } else {
      setEthAmount('')
    }
  }, [purchaseAmount, ethPrice, calculateEthAmount])

  const selectedRound = getRoundByNumber(selectedRoundNumber)
  const tokensToReceive = purchaseAmount && selectedRound ? Math.floor(parseFloat(purchaseAmount) / selectedRound.price) : 0

  const handlePurchase = async () => {
    if (!isConnected || !address) {
      open()
      return
    }

    // Check if ICO is finished
    if (icoStatus?.ico_finished) {
      alert('L\'ICO est terminé. Aucun achat n\'est plus possible.')
      return
    }

    // Vérifier que le prix ETH est récent
    if (!isPriceRecent()) {
      console.log('⚠️ [ETH PRICE] Price is outdated, refreshing...')
      await refreshPrice()
    }

    if (!purchaseAmount || !ethAmount || !ethPrice) {
      alert('Veuillez entrer un montant valide')
      return
    }

    const usdAmount = parseFloat(purchaseAmount)
    if (usdAmount < 10) {
      alert('Montant minimum: $10')
      return
    }

    console.log('💰 Données avant transaction:', {
      purchaseAmount,
      usdAmount,
      selectedRoundNumber,
      ethPrice,
      ethAmount
    })
    setIsProcessing(true)
    resetSend()

    try {
      const ethValue = parseEther(ethAmount)
      
      // Adresse différente selon le réseau
      const recipientAddress = chainId === 11155111 // Sepolia
        ? '0x194c1D795E1D4D26b5ac5C9EF0d83f319FD6805c' // Même adresse pour test
        : '0x194c1D795E1D4D26b5ac5C9EF0d83f319FD6805c'  // Mainnet
      
      await sendTransaction({
        to: recipientAddress,
        value: ethValue,
      })
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error)
      setIsProcessing(false)
    }
  }

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && hash && ethPrice && purchaseAmount) {
      const usdAmount = parseFloat(purchaseAmount)
      
      // Vérifier que le montant est valide
      if (isNaN(usdAmount) || usdAmount <= 0) {
        console.error('❌ [BALANCE DEBUG] Montant USD invalide lors de la confirmation:', usdAmount)
        setIsProcessing(false)
        return
      }
      
      console.log('✅ [BALANCE DEBUG] Transaction confirmée par wagmi:', hash)
      console.log('💰 [BALANCE DEBUG] Données pour vérification:', {
        hash,
        usdAmount,
        selectedRoundNumber,
        ethPrice
      })
      
      // Traitement immédiat de la transaction avec les bonnes valeurs
      console.log('🚀 [BALANCE DEBUG] Ajout à la file de vérification...')
      addToVerificationQueue(
        hash,
        usdAmount,
        selectedRoundNumber,
        ethPrice
      )
      console.log('✅ [BALANCE DEBUG] Ajouté à la file de vérification')
      
      // Reset form après un délai pour éviter les problèmes de timing
      setTimeout(() => {
        console.log('🔄 [BALANCE DEBUG] Reset du formulaire...')
        setPurchaseAmount('')
        setEthAmount('')
        setIsProcessing(false)
        console.log('✅ [BALANCE DEBUG] Formulaire reseté')
        alert('Transaction confirmée! Vérification en cours...')
      }, 100)
    }
  }, [isConfirmed, hash, selectedRoundNumber, ethPrice, addToVerificationQueue, purchaseAmount])

  // Handle errors
  useEffect(() => {
    if (sendError || confirmError) {
      console.error('Erreur de transaction:', sendError || confirmError)
      setIsProcessing(false)
    }
  }, [sendError, confirmError])

  const getProgressPercentage = (round: ICORound) => {
    return (round.sold_tokens / round.total_tokens) * 100
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500'
      case 'completed': return 'text-blue-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Zap className="w-5 h-5 text-green-500 animate-pulse" />
      case 'completed': return <CheckCircle className="w-5 h-5 text-blue-500" />
      case 'upcoming': return <Clock className="w-5 h-5 text-gray-500" />
      default: return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  if (roundsLoading) {
    return (
      <section id="ico" className="py-12 md:py-20 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
              <span className="text-orange-500">ICO</span> Rounds
            </h2>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <span className="ml-3 text-gray-600">Loading ICO rounds...</span>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (roundsError) {
    return (
      <section id="ico" className="py-12 md:py-20 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
              <span className="text-orange-500">ICO</span> Rounds
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-red-600 max-w-3xl mx-auto px-4">
              Error loading ICO rounds: {roundsError}
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="ico" className="py-12 md:py-20 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
            <span className="text-orange-500">ICO</span> Rounds
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Join our progressive ICO with decreasing bonuses and increasing prices
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
          {/* ICO Status Component */}
          <div className="lg:col-span-2 mb-8">
            <ICOStatus />
          </div>

          {/* ICO Rounds List */}
          <div className="space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">Available Rounds</h3>
            
            {rounds.map((round) => (
              <div 
                key={round.id}
                className={`bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl ${
                  selectedRoundNumber === round.round_number 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-200 hover:border-orange-300'
                }`}
                onClick={() => setSelectedRoundNumber(round.round_number)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    {getStatusIcon(round.status)}
                    <div>
                      <h4 className="text-xl md:text-2xl font-bold text-gray-900">Round {round.round_number}</h4>
                      <p className={`text-sm md:text-base font-medium ${getStatusColor(round.status)}`}>
                        {round.status === 'active' ? 'Active' : 
                         round.status === 'completed' ? 'Completed' : 
                         round.status === 'upcoming' ? 'Upcoming' : round.status}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl md:text-3xl font-bold text-orange-500">${round.price}</div>
                    <div className="text-gray-600 text-sm md:text-base">per token</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 md:gap-6 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4 md:p-6">
                    <div className="text-lg md:text-xl font-bold text-gray-900">
                      {round.total_tokens.toLocaleString()}
                    </div>
                    <div className="text-gray-600 text-sm md:text-base">Total Tokens</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 md:p-6">
                    <div className="text-lg md:text-xl font-bold text-orange-500">{round.bonus}</div>
                    <div className="text-gray-600 text-sm md:text-base">Bonus Tokens</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm md:text-base text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{getProgressPercentage(round).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-blue-500 h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${getProgressPercentage(round)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm text-gray-500 mt-2">
                    <span>{round.sold_tokens.toLocaleString()} sold</span>
                    <span>{(round.total_tokens - round.sold_tokens).toLocaleString()} remaining</span>
                  </div>
                </div>

                <div className="text-sm md:text-base text-gray-600">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Ends: {new Date(round.end_date).toLocaleDateString('fr-FR')}
                </div>
              </div>
            ))}
          </div>

          {/* Purchase Form */}
          <div className="bg-gradient-to-br from-orange-50 to-blue-50 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-orange-200 shadow-xl">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 flex items-center">
              <Shield className="w-8 h-8 text-orange-500 mr-4" />
              Purchase Tokens
            </h3>

            {selectedRound && (
              <div className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 mb-6 md:mb-8 border border-gray-200 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg md:text-xl font-semibold text-gray-900">Round {selectedRound.round_number}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedRound.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedRound.status === 'active' ? 'Active' : 'Upcoming'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl md:text-3xl font-bold text-orange-500">${selectedRound.price}</div>
                    <div className="text-gray-600 text-sm md:text-base">Price per token</div>
                  </div>
                  <div>
                    <div className="text-2xl md:text-3xl font-bold text-blue-500">{selectedRound.bonus}</div>
                    <div className="text-gray-600 text-sm md:text-base">Bonus tokens</div>
                  </div>
                </div>
              </div>
            )}

            {/* ETH Price Display */}
            <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700 font-medium">ETH Price:</span>
                  {ethPriceError && (
                    <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                      Fallback
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {ethPriceLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                  ) : (
                    <div className="text-right">
                      <span className="text-lg font-bold text-orange-500">
                        ${ethPrice?.toLocaleString() || 'Loading...'}
                      </span>
                      {lastUpdated && (
                        <div className="text-xs text-gray-500">
                          {ethPriceSource} • {new Date(lastUpdated).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  )}
                  <button
                    onClick={refreshPrice}
                    className="text-gray-400 hover:text-orange-500 transition-colors"
                    title="Refresh price"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>
              {!isPriceRecent() && (
                <div className="mt-2 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                  ⚠️ Price may be outdated. Click refresh for latest price.
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Purchase Amount Input */}
              <div>
                <label className="block text-gray-700 font-medium mb-3 text-sm md:text-base">
                  Purchase Amount (USD)
                </label>
               
               {/* Quick Buy Buttons */}
               <div className="mb-4">
                 <div className="flex flex-wrap gap-2 mb-3">
                   {[10, 25, 50, 100, 250, 500].map((amount) => (
                     <button
                       key={amount}
                       type="button"
                       onClick={() => setPurchaseAmount(amount.toString())}
                       className="px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg text-sm font-medium transition-colors border border-orange-200 hover:border-orange-300"
                     >
                       ${amount}
                     </button>
                   ))}
                 </div>
                 <p className="text-gray-500 text-xs">Quick select amounts</p>
               </div>

                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                    placeholder="Minimum $10"
                    min="10"
                    className="w-full pl-12 pr-4 py-4 md:py-5 border border-gray-300 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg md:text-xl font-semibold"
                  />
                </div>
                <p className="text-gray-500 text-xs md:text-sm mt-2">Minimum purchase: $10</p>
              </div>

              {/* ETH Amount Display */}
              {ethAmount && (
                <div className="bg-gray-50 rounded-xl p-4 md:p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700 font-medium text-sm md:text-base">ETH Required:</span>
                    <span className="text-lg md:text-xl font-bold text-blue-500">{ethAmount} ETH</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium text-sm md:text-base">Tokens to receive:</span>
                    <span className="text-lg md:text-xl font-bold text-orange-500">
                      {tokensToReceive.toLocaleString()} DEFLAT
                    </span>
                  </div>
                </div>
              )}

              {/* Purchase Button */}
              <button
                onClick={handlePurchase}
                disabled={!selectedRound || selectedRound.status !== 'active' || isProcessing || isSending || isConfirming || !purchaseAmount || icoStatus?.ico_finished}
                className={`w-full py-4 md:py-5 rounded-xl md:rounded-2xl font-semibold text-lg md:text-xl transition-all duration-200 flex items-center justify-center space-x-3 ${
                  !selectedRound || selectedRound.status !== 'active' || isProcessing || isSending || isConfirming || !purchaseAmount || icoStatus?.ico_finished
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              >
                {icoStatus?.ico_finished ? (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    <span>ICO Terminé</span>
                  </>
                ) : !isConnected ? (
                  <>
                    <Wallet className="w-6 h-6" />
                    <span>Connect Wallet</span>
                  </>
                ) : isProcessing || isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Sending Transaction...</span>
                  </>
                ) : isConfirming ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    <Coins className="w-6 h-6" />
                    <span>Purchase Tokens</span>
                    <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </button>

              {/* Transaction Status Display */}
              {txStatus !== 'idle' && (
                <div className="mt-4 p-4 rounded-xl border">
                  {txStatus === 'pending' && (
                    <div className="flex items-center space-x-3 text-blue-600">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <span>Transaction en cours de confirmation...</span>
                    </div>
                  )}
                  {txStatus === 'confirmed' && (
                    <div className="flex items-center space-x-3 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span>Transaction confirmée! Traitement en cours...</span>
                    </div>
                  )}
                  {txStatus === 'failed' && (
                    <div className="flex items-center space-x-3 text-red-600">
                      <AlertCircle className="w-5 h-5" />
                      <span>Transaction échouée</span>
                    </div>
                  )}
                </div>
              )}
              {/* Transaction Status */}
              {(sendError || confirmError) && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 md:p-6">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                    <div>
                      <h4 className="text-red-800 font-semibold">Transaction Error</h4>
                      <p className="text-red-600 text-sm mt-1">
                        {(sendError || confirmError)?.message || 'An error occurred'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {hash && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 md:p-6">
                  <div className="flex items-center space-x-3">
                    <Info className="w-6 h-6 text-blue-500" />
                    <div>
                      <h4 className="text-blue-800 font-semibold">Transaction Sent</h4>
                      <p className="text-blue-600 text-sm mt-1">
                        Hash: {hash.slice(0, 10)}...{hash.slice(-8)}
                      </p>
                      <a 
                        href={`https://sepolia.etherscan.io/tx/${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 text-sm underline"
                      >
                        View on Sepolia Etherscan
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4 md:p-6">
              <div className="flex items-start space-x-3">
                <Shield className="w-6 h-6 text-yellow-500 mt-1" />
                <div>
                  <h4 className="text-yellow-800 font-semibold text-sm md:text-base">Security Notice</h4>
                  <p className="text-yellow-700 text-xs md:text-sm mt-1">
                    Only send ETH to the official contract address. Verify all transactions before confirming.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}