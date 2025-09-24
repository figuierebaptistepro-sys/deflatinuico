import { useState, useEffect } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { supabase } from '../lib/supabase'
import { formatEther } from 'viem'

export interface Purchase {
  id: string
  user_wallet_address: string
  tx_hash: string
  amount_sent_eth: number
  amount_sent_eur: number // Keeping the database column name but it now contains USD
  tokens_purchased: number
  ico_round: number
  status: 'pending' | 'verified' | 'failed'
  created_at: string
  verified_at?: string
}

export const usePurchases = () => {
  const { address } = useAccount()
  const chainId = useChainId()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [totalTokens, setTotalTokens] = useState(0)
  const [loading, setLoading] = useState(false)

  console.log('🔍 [BALANCE DEBUG] Hook usePurchases initialisé pour:', address)

  const fetchPurchases = async () => {
    console.log('🔄 [BALANCE DEBUG] fetchPurchases appelé pour:', address)
    if (!address) {
      console.log('❌ [BALANCE DEBUG] Pas d\'adresse, arrêt de fetchPurchases')
      return
    }

    setLoading(true)
    try {
      console.log('📡 [BALANCE DEBUG] Requête Supabase en cours...')
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_wallet_address', address)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [BALANCE DEBUG] Erreur Supabase:', error)
        throw error
      }

      console.log('📊 [BALANCE DEBUG] Données reçues de Supabase:', {
        count: data?.length || 0,
        data: data?.map(p => ({
          id: p.id,
          status: p.status,
          tokens: p.tokens_purchased,
          txHash: p.tx_hash.slice(0, 10) + '...'
        }))
      })

      setPurchases(data || [])
      
      // Calculate total verified tokens
      const total = (data || [])
        .filter(p => p.status === 'verified')
        .reduce((sum, p) => sum + p.tokens_purchased, 0)
      
      console.log('💰 [BALANCE DEBUG] Calcul du solde:', {
        totalPurchases: data?.length || 0,
        verifiedPurchases: (data || []).filter(p => p.status === 'verified').length,
        calculatedTotal: total,
        previousTotal: totalTokens
      })

      setTotalTokens(total)
      console.log('✅ [BALANCE DEBUG] Nouveau solde défini:', total)
    } catch (error) {
      console.error('❌ [BALANCE DEBUG] Erreur lors de fetchPurchases:', error)
    } finally {
      setLoading(false)
      console.log('🏁 [BALANCE DEBUG] fetchPurchases terminé')
    }
  }

  const verifyTransactionWithEtherscan = async (
    txHash: `0x${string}`, 
    expectedAmountUsd: number, 
    icoRound: number, 
    ethPriceAtTransaction?: number
  ) => {
    console.log('🚀 [BALANCE DEBUG] Début vérification transaction:', {
      txHash,
      expectedAmountUsd,
      icoRound,
      ethPriceAtTransaction,
      address
    })

    if (!address) {
      console.error('❌ [BALANCE DEBUG] Pas d\'adresse wallet')
      throw new Error('Wallet not connected')
    }

    if (!expectedAmountUsd || isNaN(expectedAmountUsd)) {
      console.error('❌ [BALANCE DEBUG] Montant USD invalide:', expectedAmountUsd)
      throw new Error(`Montant USD invalide: ${expectedAmountUsd}`)
    }

    const networkId = chainId || 11155111 // Default to Sepolia
    console.log('🌐 [BALANCE DEBUG] Réseau utilisé:', networkId === 1 ? 'Mainnet' : 'Sepolia')

    // Vérifier si la transaction existe déjà
    console.log('🔍 [BALANCE DEBUG] Vérification des doublons...')
    const { data: existingPurchase, error: checkError } = await supabase
      .from('purchases')
      .select('*')
      .eq('tx_hash', txHash)
      .maybeSingle()

    if (checkError) {
      console.error('❌ [BALANCE DEBUG] Erreur lors de la vérification des doublons:', checkError)
      throw new Error('Erreur lors de la vérification des doublons')
    }

    if (existingPurchase) {
      console.log('⚠️ [BALANCE DEBUG] Transaction déjà enregistrée:', existingPurchase)
      throw new Error('Transaction déjà enregistrée')
    }

    try {
      // 1) Utiliser l'API Etherscan pour vérifier la transaction
      const isMainnet = networkId === 1
      const etherscanBaseUrl = isMainnet 
        ? 'https://api.etherscan.io/api'
        : 'https://api-sepolia.etherscan.io/api'
      
      const etherscanApiKey = 'IUB3BACMSKABM93VX2VYEE8CVPCZF22KUX'
      
      console.log('🔍 [BALANCE DEBUG] Appel Etherscan API...')
      // Récupérer les détails de la transaction
      const txUrl = `${etherscanBaseUrl}?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${etherscanApiKey}`
      const txResponse = await fetch(txUrl)
      const txData = await txResponse.json()

      if (!txData.result) {
        console.error('❌ [BALANCE DEBUG] Transaction non trouvée sur Etherscan')
        throw new Error('Transaction non trouvée sur Etherscan')
      }

      const transaction = txData.result
      console.log('📄 [BALANCE DEBUG] Transaction Etherscan:', transaction)
      
      // Vérifier le receipt pour s'assurer que la transaction a réussi
      const receiptUrl = `${etherscanBaseUrl}?module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}&apikey=${etherscanApiKey}`
      const receiptResponse = await fetch(receiptUrl)
      const receiptData = await receiptResponse.json()

      if (!receiptData.result) {
        console.error('❌ [BALANCE DEBUG] Receipt non trouvé')
        throw new Error('Receipt non trouvé - transaction en attente')
      }
      
      if (receiptData.result.status !== '0x1') {
        console.error('❌ [BALANCE DEBUG] Transaction échouée sur la blockchain')
        throw new Error('Transaction échouée sur la blockchain')
      }

      // Vérifier l'adresse de destination
      const expectedAddress = '0x194c1D795E1D4D26b5ac5C9EF0d83f319FD6805c'
      if (transaction.to.toLowerCase() !== expectedAddress.toLowerCase()) {
        console.error('❌ [BALANCE DEBUG] Mauvaise adresse de destination')
        throw new Error('Transaction envoyée à la mauvaise adresse')
      }
      
      // 2) Calculer le montant ETH envoyé
      const amountSentEth = parseFloat(formatEther(BigInt(transaction.value)))
      console.log('💰 [BALANCE DEBUG] Montant ETH envoyé:', amountSentEth)
      
      // 3) Obtenir le prix ETH
      let ethPriceUsd: number
      if (ethPriceAtTransaction && ethPriceAtTransaction > 0) {
        ethPriceUsd = ethPriceAtTransaction
        console.log('💰 [BALANCE DEBUG] Prix ETH fixé:', ethPriceUsd)
      } else {
        ethPriceUsd = 3500 // Prix fixe pour éviter les problèmes CORS
        console.log('💰 [BALANCE DEBUG] Prix ETH par défaut:', ethPriceUsd)
      }

      const amountSentUsd = amountSentEth * ethPriceUsd
      
      // 4) Vérifier le montant avec tolérance
      const tolerance = 0.15 // 15% de tolérance
      const minExpectedAmount = expectedAmountUsd * (1 - tolerance)
      
      if (amountSentUsd < minExpectedAmount) {
        console.warn(`⚠️ [BALANCE DEBUG] Montant faible: reçu $${amountSentUsd.toFixed(2)}, attendu $${expectedAmountUsd.toFixed(2)}`)
      }

      // 5) Calculer les tokens
      console.log('💰 [BALANCE DEBUG] Récupération du prix du round depuis la DB...')
      const { data: roundData, error: roundError } = await supabase
        .from('ico_rounds')
        .select('price')
        .eq('round_number', icoRound)
        .single()

      let tokenPrice: number
      if (roundError || !roundData) {
        console.error('❌ [BALANCE DEBUG] Erreur récupération prix round:', roundError)
        // Fallback to hardcoded prices if DB fails
        const roundPrices = [0.0022, 0.0055, 0.0077, 0.011]
        tokenPrice = roundPrices[icoRound - 1] || roundPrices[0]
        console.log('⚠️ [BALANCE DEBUG] Utilisation prix fallback:', tokenPrice)
      } else {
        tokenPrice = roundData.price
        console.log('✅ [BALANCE DEBUG] Prix récupéré de la DB:', tokenPrice)
      }

      const tokensPurchased = expectedAmountUsd / tokenPrice

      console.log('📊 [BALANCE DEBUG] Détails de la transaction:', {
        txHash,
        amountSentEth: amountSentEth.toFixed(6),
        amountSentUsd: amountSentUsd.toFixed(2),
        expectedAmountUsd,
        tokenPrice,
        tokensPurchased: tokensPurchased.toFixed(0),
        icoRound
      })

      // 6) Enregistrer en base de données SANS authentification
      console.log('💾 [BALANCE DEBUG] Tentative d\'enregistrement en base...')
      
      const { data: purchase, error } = await supabase
        .from('purchases')
        .insert({
          user_wallet_address: address,
          tx_hash: txHash,
          amount_sent_eth: amountSentEth,
          amount_sent_eur: expectedAmountUsd,
          tokens_purchased: tokensPurchased,
          ico_round: icoRound,
          status: 'verified',
          verified_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('❌ [BALANCE DEBUG] Erreur DB lors de l\'insertion:', error)
        throw new Error(`Échec de l'enregistrement: ${error.message}`)
      }

      console.log('✅ [BALANCE DEBUG] Achat enregistré avec succès:', {
        id: purchase.id,
        tokens: purchase.tokens_purchased,
        status: purchase.status,
        txHash: purchase.tx_hash.slice(0, 10) + '...'
      })
      
      // 7) Update sold tokens in ico_rounds table
      console.log('🔄 [BALANCE DEBUG] Mise à jour des tokens vendus dans ico_rounds...')
      try {
        const { error: updateError } = await supabase
          .from('ico_rounds')
          .update({ 
            sold_tokens: supabase.raw('sold_tokens + ?', [tokensPurchased])
          })
          .eq('round_number', icoRound)

        if (updateError) {
          console.error('⚠️ [BALANCE DEBUG] Erreur mise à jour sold_tokens:', updateError)
          // Don't throw error, just log it as it's not critical
        } else {
          console.log('✅ [BALANCE DEBUG] Sold tokens mis à jour avec succès')
        }
      } catch (updateErr) {
        console.error('⚠️ [BALANCE DEBUG] Erreur lors de la mise à jour sold_tokens:', updateErr)
      }

      // 7) Rafraîchir la liste des achats IMMÉDIATEMENT
      console.log('🔄 [BALANCE DEBUG] Rafraîchissement immédiat de la liste des achats...')
      await fetchPurchases()
      console.log('✅ [BALANCE DEBUG] Liste des achats rafraîchie')
      
      return purchase
      
    } catch (error) {
      console.error('❌ [BALANCE DEBUG] Erreur vérification Etherscan:', error)
      throw error
    }
  }

  // Fonction pour récupérer le prix ETH en temps réel
  const fetchRealTimeEthPrice = async (): Promise<number> => {
    const priceApis = [
      {
        name: 'CoinGecko',
        url: 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&precision=2',
        parser: (data: any) => data.ethereum.usd
      },
      {
        name: 'CryptoCompare',
        url: 'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD',
        parser: (data: any) => data.USD
      },
      {
        name: 'Binance',
        url: 'https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT',
        parser: (data: any) => parseFloat(data.price)
      }
    ]

    for (const api of priceApis) {
      try {
        console.log(`🔄 [ETH PRICE] Trying ${api.name}...`)
        const response = await fetch(api.url)
        if (!response.ok) continue
        
        const data = await response.json()
        const price = api.parser(data)
        
        if (typeof price === 'number' && price > 0 && price < 10000) {
          console.log(`✅ [ETH PRICE] Success with ${api.name}: $${price}`)
          return price
        }
      } catch (err) {
        console.log(`❌ [ETH PRICE] ${api.name} failed:`, err)
        continue
      }
    }

    // Fallback price si toutes les APIs échouent
    console.log('⚠️ [ETH PRICE] All APIs failed, using fallback price')
    return 3500
  }

  // Alias pour compatibilité
  const processTransaction = async (
    txHash: `0x${string}`, 
    expectedAmountUsd: number, 
    icoRound: number, 
    ethPriceAtTransaction?: number
  ) => {
    console.log('🔄 [BALANCE DEBUG] processTransaction appelé avec:', {
      txHash,
      expectedAmountUsd,
      icoRound,
      ethPriceAtTransaction
    })
    return verifyTransactionWithEtherscan(
      txHash, 
      expectedAmountUsd, 
      icoRound, 
      ethPriceAtTransaction
    )
  }

  const verifyPayment = async (
    txHash: string, 
    expectedAmountUsd: number, 
    icoRound: number, 
    ethPriceAtTransaction?: number | null
  ) => {
    return verifyTransactionWithEtherscan(
      txHash as `0x${string}`, 
      expectedAmountUsd, 
      icoRound, 
      ethPriceAtTransaction || undefined
    )
  }

  useEffect(() => {
    console.log('🚀 [BALANCE DEBUG] useEffect fetchPurchases déclenché pour address:', address)
    fetchPurchases()
  }, [address])

  // Log des changements d'état
  useEffect(() => {
    console.log('🔍 [BALANCE DEBUG] État actuel:', {
      address,
      purchasesCount: purchases.length,
      totalTokens,
      loading,
      purchases: purchases.map(p => ({
        id: p.id,
        status: p.status,
        tokens: p.tokens_purchased,
        txHash: p.tx_hash.slice(0, 10) + '...'
      }))
    })
  }, [address, purchases, totalTokens, loading])

  return {
    purchases,
    totalTokens,
    loading,
    processTransaction,
    verifyPayment,
    refetch: fetchPurchases
  }
}