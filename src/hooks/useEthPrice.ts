import { useState, useEffect, useCallback } from 'react'

export interface EthPriceData {
  usd: number
  lastUpdated: number
  source: string
}

export const useEthPrice = () => {
  const [ethPrice, setEthPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const [source, setSource] = useState<string>('')

  const fetchEthPrice = useCallback(async () => {
    console.log('💰 [ETH PRICE] Fetching real-time ETH price...')
    setLoading(true)
    setError(null)

    // Liste des APIs à essayer dans l'ordre de préférence
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
      },
      {
        name: 'CoinCap',
        url: 'https://api.coincap.io/v2/assets/ethereum',
        parser: (data: any) => parseFloat(data.data.priceUsd)
      }
    ]

    for (const api of priceApis) {
      try {
        console.log(`🔄 [ETH PRICE] Trying ${api.name}...`)
        
        const response = await fetch(api.url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()
        const price = api.parser(data)

        if (typeof price === 'number' && price > 0 && price < 10000) {
          console.log(`✅ [ETH PRICE] Success with ${api.name}: $${price}`)
          setEthPrice(price)
          setLastUpdated(Date.now())
          setSource(api.name)
          setLoading(false)
          return price
        } else {
          throw new Error(`Invalid price: ${price}`)
        }
      } catch (err) {
        console.log(`❌ [ETH PRICE] ${api.name} failed:`, err)
        continue
      }
    }

    // Si toutes les APIs échouent, utiliser un prix de fallback
    console.log('⚠️ [ETH PRICE] All APIs failed, using fallback price')
    const fallbackPrice = 3500
    setEthPrice(fallbackPrice)
    setLastUpdated(Date.now())
    setSource('Fallback')
    setError('Unable to fetch real-time price, using fallback')
    setLoading(false)
    return fallbackPrice
  }, [])

  const refreshPrice = useCallback(async () => {
    return await fetchEthPrice()
  }, [fetchEthPrice])

  // Calculer le montant ETH exact pour un montant USD donné
  const calculateEthAmount = useCallback((usdAmount: number): string => {
    if (!ethPrice || ethPrice <= 0) {
      return '0'
    }
    const ethAmount = usdAmount / ethPrice
    return ethAmount.toFixed(8) // 8 décimales pour la précision
  }, [ethPrice])

  // Calculer le montant USD pour un montant ETH donné
  const calculateUsdAmount = useCallback((ethAmount: number): number => {
    if (!ethPrice || ethPrice <= 0) {
      return 0
    }
    return ethAmount * ethPrice
  }, [ethPrice])

  // Vérifier si le prix est récent (moins de 2 minutes)
  const isPriceRecent = useCallback((): boolean => {
    if (!lastUpdated) return false
    return (Date.now() - lastUpdated) < 120000 // 2 minutes
  }, [lastUpdated])

  useEffect(() => {
    fetchEthPrice()
    
    // Mettre à jour le prix toutes les 30 secondes
    const interval = setInterval(() => {
      fetchEthPrice()
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchEthPrice])

  return {
    ethPrice,
    loading,
    error,
    lastUpdated,
    source,
    refreshPrice,
    calculateEthAmount,
    calculateUsdAmount,
    isPriceRecent
  }
}