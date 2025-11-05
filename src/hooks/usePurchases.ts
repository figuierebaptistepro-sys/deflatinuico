import { useState, useEffect, useCallback } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { supabase } from '../lib/supabase'
import { createPublicClient, http, formatEther } from 'viem'
import { mainnet, sepolia } from 'viem/chains'

export interface Purchase {
  id: string
  user_wallet_address: string
  tx_hash: string
  amount_sent_eth: number
  amount_sent_eur: number // DB column name kept (stores USD)
  tokens_purchased: number
  ico_round: number
  status: 'pending' | 'verified' | 'failed'
  created_at: string
  verified_at?: string
}

/** Vérif de transaction via RPC (plus fiable que l'API Etherscan) */
async function verifyWithRPC(
  txHash: `0x${string}`,
  chainId?: number,
  expectedAddress?: string
) {
  const client = createPublicClient({
    chain: chainId === 1 ? mainnet : sepolia,
    transport: http(), // tu peux passer une URL Alchemy/Infura si dispo
  })

  // 1) Transaction
  const tx = await client.getTransaction({ hash: txHash })
  if (!tx) throw new Error('Transaction introuvable via RPC')

  // 2) Receipt (retry court si pending)
  let receipt: Awaited<ReturnType<typeof client.getTransactionReceipt>> | undefined
  for (let i = 0; i < 6; i++) {
    try {
      receipt = await client.getTransactionReceipt({ hash: txHash })
      break
    } catch {
      await new Promise((r) => setTimeout(r, 3000))
    }
  }
  if (!receipt) throw new Error('Receipt introuvable (encore pending)')
  if (receipt.status !== 'success') throw new Error('Transaction non-success')

  // 3) Adresse de destination attendue
  if (expectedAddress && (tx.to ?? '').toLowerCase() !== expectedAddress.toLowerCase()) {
    throw new Error('Mauvaise adresse de destination')
  }

  // 4) Montant en ETH
  const amountSentEth = Number(formatEther(tx.value))
  return { amountSentEth }
}

export const usePurchases = () => {
  const { address } = useAccount()
  const chainId = useChainId()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [totalTokens, setTotalTokens] = useState(0)
  const [loading, setLoading] = useState(false)

  const normalizedAddress = address?.toLowerCase() ?? null

  console.log('🔍 [BALANCE DEBUG] Hook usePurchases initialisé pour:', address)

  const fetchPurchases = useCallback(async () => {
    console.log('🔄 [BALANCE DEBUG] fetchPurchases appelé pour:', address)
    if (!normalizedAddress) {
      console.log("❌ [BALANCE DEBUG] Pas d'adresse, arrêt de fetchPurchases")
      return
    }

    setLoading(true)
    try {
      console.log('📡 [BALANCE DEBUG] Requête Supabase en cours...')
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        // ⬇️ CHANGEMENT ICI : ilike pour ignorer la casse et retrouver l'historique
        .ilike('user_wallet_address', address as string)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [BALANCE DEBUG] Erreur Supabase:', error)
        throw error
      }

      console.log('📊 [BALANCE DEBUG] Données reçues de Supabase:', {
        count: data?.length || 0,
        data: data?.map((p) => ({
          id: p.id,
          status: p.status,
          tokens: p.tokens_purchased,
          txHash: p.tx_hash.slice(0, 10) + '...',
        })),
      })

      const safeData = data || []
      setPurchases(safeData)

      // ✅ somme des achats "verified" en tolérant la casse éventuelle
      const total = safeData
        .filter((p) => (p.status ?? '').toLowerCase() === 'verified')
        .reduce((sum, p) => sum + (Number(p.tokens_purchased) || 0), 0)

      console.log('💰 [BALANCE DEBUG] Calcul du solde:', {
        totalPurchases: safeData.length,
        verifiedPurchases: safeData.filter((p) => (p.status ?? '').toLowerCase() === 'verified').length,
        calculatedTotal: total,
        previousTotal: totalTokens,
      })

      setTotalTokens(total)
      console.log('✅ [BALANCE DEBUG] Nouveau solde défini:', total)
    } catch (error) {
      console.error('❌ [BALANCE DEBUG] Erreur lors de fetchPurchases:', error)
    } finally {
      setLoading(false)
      console.log('🏁 [BALANCE DEBUG] fetchPurchases terminé')
    }
  }, [normalizedAddress, address, totalTokens])

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
      address,
      chainId,
    })

    if (!normalizedAddress) {
      console.error("❌ [BALANCE DEBUG] Pas d'adresse wallet")
      throw new Error('Wallet not connected')
    }

    if (!expectedAmountUsd || isNaN(expectedAmountUsd)) {
      console.error('❌ [BALANCE DEBUG] Montant USD invalide:', expectedAmountUsd)
      throw new Error(`Montant USD invalide: ${expectedAmountUsd}`)
    }

    const networkId = chainId || 11155111 // Default Sepolia
    console.log('🌐 [BALANCE DEBUG] Réseau utilisé:', networkId === 1 ? 'Mainnet' : 'Sepolia')

    // Anti-doublon
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
      // ✅ Vérification via RPC (plus fiable qu’Etherscan)
      const expectedAddress = '0xEd6080e5652B522174FA5b0cC6C5EA44FacAFF02'
      const { amountSentEth } = await verifyWithRPC(txHash, networkId, expectedAddress)
      console.log('💰 [BALANCE DEBUG] Montant ETH envoyé (RPC):', amountSentEth)

      // Prix ETH (fixe si non fourni)
      let ethPriceUsd: number
      if (ethPriceAtTransaction && ethPriceAtTransaction > 0) {
        ethPriceUsd = ethPriceAtTransaction
        console.log('💰 [BALANCE DEBUG] Prix ETH fixé:', ethPriceUsd)
      } else {
        ethPriceUsd = 3500 // fallback simple
        console.log('💰 [BALANCE DEBUG] Prix ETH par défaut:', ethPriceUsd)
      }

      const amountSentUsd = amountSentEth * ethPriceUsd

      // Tolérance sur le montant (15%)
      const tolerance = 0.15
      const minExpectedAmount = expectedAmountUsd * (1 - tolerance)
      if (amountSentUsd < minExpectedAmount) {
        console.warn(
          `⚠️ [BALANCE DEBUG] Montant faible: reçu $${amountSentUsd.toFixed(
            2
          )}, attendu $${expectedAmountUsd.toFixed(2)}`
        )
      }

      // Prix du round
      console.log('💰 [BALANCE DEBUG] Récupération du prix du round depuis la DB...')
      const { data: roundData, error: roundError } = await supabase
        .from('ico_rounds')
        .select('price')
        .eq('round_number', icoRound)
        .single()

      let tokenPrice: number
      if (roundError || !roundData) {
        console.error('❌ [BALANCE DEBUG] Erreur récupération prix round:', roundError)
        // Fallback si la table n’a pas de prix
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
        icoRound,
      })

      // ✅ Insert en DB (adresse en lowercase)
      console.log("💾 [BALANCE DEBUG] Tentative d'enregistrement en base...")
      const { data: purchase, error } = await supabase
        .from('purchases')
        .insert({
          user_wallet_address: normalizedAddress, // ✅ lowercase
          tx_hash: txHash,
          amount_sent_eth: amountSentEth,
          amount_sent_eur: expectedAmountUsd, // (USD stocké dans cette colonne)
          tokens_purchased: tokensPurchased,
          ico_round: icoRound,
          status: 'verified',
          verified_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error("❌ [BALANCE DEBUG] Erreur DB lors de l'insertion:", error)
        throw new Error(`Échec de l'enregistrement: ${error.message}`)
      }

      console.log('✅ [BALANCE DEBUG] Achat enregistré avec succès:', {
        id: purchase.id,
        tokens: purchase.tokens_purchased,
        status: purchase.status,
        txHash: purchase.tx_hash.slice(0, 10) + '...',
      })

      // Mise à jour des sold_tokens (laisse comme avant pour ne rien casser)
      console.log('🔄 [BALANCE DEBUG] Mise à jour des tokens vendus dans ico_rounds...')
      try {
        const { error: updateError } = await supabase
          .from('ico_rounds')
          // @ts-expect-error: selon ta version du client, supabase.raw peut ne pas exister
          .update({ sold_tokens: supabase.raw('sold_tokens + ?', [tokensPurchased]) })
          .eq('round_number', icoRound)

        if (updateError) {
          console.error('⚠️ [BALANCE DEBUG] Erreur mise à jour sold_tokens:', updateError)
          // non bloquant
        } else {
          console.log('✅ [BALANCE DEBUG] Sold tokens mis à jour avec succès')
        }
      } catch (updateErr) {
        console.error('⚠️ [BALANCE DEBUG] Erreur lors de la mise à jour sold_tokens:', updateErr)
      }

      // Rafraîchir immédiatement
      console.log('🔄 [BALANCE DEBUG] Rafraîchissement immédiat de la liste des achats...')
      await fetchPurchases()
      console.log('✅ [BALANCE DEBUG] Liste des achats rafraîchie')

      return purchase
    } catch (error) {
      console.error('❌ [BALANCE DEBUG] Erreur vérification (RPC):', error)
      throw error
    }
  }

  // Prix ETH en temps réel (inchangé)
  const fetchRealTimeEthPrice = async (): Promise<number> => {
    const priceApis = [
      {
        name: 'CoinGecko',
        url: 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&precision=2',
        parser: (data: any) => data.ethereum.usd,
      },
      {
        name: 'CryptoCompare',
        url: 'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD',
        parser: (data: any) => data.USD,
      },
      {
        name: 'Binance',
        url: 'https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT',
        parser: (data: any) => parseFloat(data.price),
      },
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

    console.log('⚠️ [ETH PRICE] All APIs failed, using fallback price')
    return 3500
  }

  // Alias compat
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
      ethPriceAtTransaction,
    })
    return verifyTransactionWithEtherscan(txHash, expectedAmountUsd, icoRound, ethPriceAtTransaction)
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
  }, [address, fetchPurchases])

  // Log state
  useEffect(() => {
    console.log('🔍 [BALANCE DEBUG] État actuel:', {
      address,
      purchasesCount: purchases.length,
      totalTokens,
      loading,
      purchases: purchases.map((p) => ({
        id: p.id,
        status: p.status,
        tokens: p.tokens_purchased,
        txHash: p.tx_hash.slice(0, 10) + '...',
      })),
    })
  }, [address, purchases, totalTokens, loading])

  return {
    purchases,
    totalTokens,
    loading,
    processTransaction,
    verifyPayment,
    refetch: fetchPurchases,
  }
}
