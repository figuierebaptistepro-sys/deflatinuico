import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface VerifyPaymentRequest {
  txHash: string
  userWalletAddress: string
  expectedAmountUsd: number
  icoRound: number
  ethPriceAtTransaction?: number
  chainId?: number
}

interface EtherscanResponse {
  status: string
  message: string
  result: {
    to: string
    value: string
    blockNumber: string
    blockHash: string
    from: string
    gas: string
    gasPrice: string
    gasUsed?: string
    status?: string
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const etherscanApiKey = 'IUB3BACMSKABM93VX2VYEE8CVPCZF22KUX'
    
    // Your wallet address where payments should be sent
    const PAYMENT_WALLET_ADDRESS = '0x194c1D795E1D4D26b5ac5C9EF0d83f319FD6805c'
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { txHash, userWalletAddress, expectedAmountUsd, icoRound, ethPriceAtTransaction, chainId }: VerifyPaymentRequest = await req.json()

    if (!txHash || !userWalletAddress || !expectedAmountUsd) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if transaction already exists
    const { data: existingPurchase } = await supabase
      .from('purchases')
      .select('*')
      .eq('tx_hash', txHash)
      .single()

    if (existingPurchase) {
      return new Response(
        JSON.stringify({ 
          error: 'Transaction already processed',
          purchase: existingPurchase 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Choisir l'API Etherscan selon le réseau
    const isMainnet = !chainId || chainId === 1
    const etherscanBaseUrl = isMainnet 
      ? 'https://api.etherscan.io/api'
      : 'https://api-sepolia.etherscan.io/api'
    
    const etherscanUrl = `${etherscanBaseUrl}?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${etherscanApiKey}`
    
    const etherscanResponse = await fetch(etherscanUrl)
    const etherscanData: EtherscanResponse = await etherscanResponse.json()

    if (etherscanData.status === '0' || !etherscanData.result) {
      return new Response(
        JSON.stringify({ error: 'Transaction not found on blockchain' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const transaction = etherscanData.result

    // Verify transaction details
    if (transaction.to.toLowerCase() !== PAYMENT_WALLET_ADDRESS.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: 'Payment sent to wrong address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Convert Wei to ETH
    const amountSentEth = parseInt(transaction.value) / Math.pow(10, 18)
    
    // Utiliser le prix ETH de la transaction si fourni, sinon récupérer le prix actuel
    let ethPriceUsd: number
    
    if (ethPriceAtTransaction && ethPriceAtTransaction > 0) {
      ethPriceUsd = ethPriceAtTransaction
      console.log(`Utilisation du prix ETH de la transaction: $${ethPriceUsd}`)
    } else {
      // Get current ETH price in USD with precision
      const ethPriceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&precision=2')
      const ethPriceData = await ethPriceResponse.json()
      ethPriceUsd = ethPriceData.ethereum.usd
      console.log(`Utilisation du prix ETH actuel: $${ethPriceUsd}`)
    }

    const amountSentUsd = amountSentEth * ethPriceUsd

    console.log('Verification details:', {
      txHash,
      chainId: chainId || 1,
      network: isMainnet ? 'mainnet' : 'sepolia',
      amountSentEth: amountSentEth.toFixed(8),
      ethPriceUsd,
      ethPriceSource: ethPriceAtTransaction ? 'transaction' : 'current',
      amountSentUsd: amountSentUsd.toFixed(2),
      expectedAmountUsd,
      userWalletAddress
    })

    // Vérification plus flexible du montant
    // Si on utilise le prix de la transaction, tolérance réduite (5%)
    // Si on utilise le prix actuel, tolérance plus élevée (15%)
    const tolerance = ethPriceAtTransaction ? 0.05 : 0.15
    const minExpectedAmount = expectedAmountUsd * (1 - tolerance)
    const maxExpectedAmount = expectedAmountUsd * (1 + tolerance)
    
    if (amountSentUsd < minExpectedAmount) {
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient payment amount',
          expected: `$${expectedAmountUsd.toFixed(2)}`,
          received: `$${amountSentUsd.toFixed(2)}`,
          minRequired: `$${minExpectedAmount.toFixed(2)}`,
          ethPrice: `$${ethPriceUsd}`,
          ethAmount: `${amountSentEth.toFixed(8)} ETH`,
          tolerance: `${tolerance * 100}%`,
          priceSource: ethPriceAtTransaction ? 'locked' : 'current'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Vérifier aussi qu'on n'a pas reçu trop (protection contre les erreurs)
    if (amountSentUsd > maxExpectedAmount) {
      return new Response(
        JSON.stringify({ 
          error: 'Amount too high - possible calculation error',
          expected: `$${expectedAmountUsd.toFixed(2)}`,
          received: `$${amountSentUsd.toFixed(2)}`,
          maxAllowed: `$${maxExpectedAmount.toFixed(2)}`,
          ethPrice: `$${ethPriceUsd}`,
          ethAmount: `${amountSentEth.toFixed(8)} ETH`,
          tolerance: `${tolerance * 100}%`,
          priceSource: ethPriceAtTransaction ? 'locked' : 'current'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get current block number to check confirmations  
    const currentBlockResponse = await fetch(`${etherscanBaseUrl}?module=proxy&action=eth_blockNumber&apikey=${etherscanApiKey}`)
    const currentBlockData = await currentBlockResponse.json()
    const currentBlock = parseInt(currentBlockData.result, 16)
    const txBlock = parseInt(transaction.blockNumber, 16)
    const confirmations = currentBlock - txBlock

    // Moins de confirmations requises sur Sepolia pour les tests
    const requiredConfirmations = isMainnet ? 3 : 1
    if (confirmations < requiredConfirmations) {
      return new Response(
        JSON.stringify({ 
          error: 'Transaction needs more confirmations',
          current: confirmations,
          required: requiredConfirmations
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate tokens based on ICO round price
    const roundPrices = [0.0022, 0.0055, 0.0077, 0.011] // USD per token
    const tokenPrice = roundPrices[icoRound - 1] || roundPrices[0]
    const tokensPurchased = expectedAmountUsd / tokenPrice // Use expected amount for consistent token calculation

    // Create purchase record
    const { data: purchase, error } = await supabase
      .from('purchases')
      .insert({
        user_wallet_address: userWalletAddress,
        tx_hash: txHash,
        amount_sent_eth: amountSentEth,
        amount_sent_eur: expectedAmountUsd, // Store expected amount for consistency
        tokens_purchased: tokensPurchased,
        ico_round: icoRound,
        status: 'verified',
        verified_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to save purchase' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        purchase,
        message: 'Payment verified successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})