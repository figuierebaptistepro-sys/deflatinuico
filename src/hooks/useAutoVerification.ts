import { useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import { usePurchases } from './usePurchases'

interface PendingTransaction {
  txHash: string
  expectedAmountUsd: number
  icoRound: number
  ethPriceAtTransaction?: number
  timestamp: number
}

export const useAutoVerification = () => {
  const { address } = useAccount()
  const { processTransaction, refetch } = usePurchases()
  const intervalRef = useRef<number | null>(null)
  const pendingTransactions = useRef<PendingTransaction[]>([])

  console.log('🔍 [BALANCE DEBUG] useAutoVerification initialisé pour:', address)

  // Add a transaction to the auto-verification queue
  const addToVerificationQueue = (
    txHash: string, 
    expectedAmountUsd: number, 
    icoRound: number, 
    ethPriceAtTransaction?: number
  ) => {
    console.log('🔄 [BALANCE DEBUG] Ajout à la file de vérification:', {
      txHash,
      expectedAmountUsd,
      icoRound,
      ethPriceAtTransaction
    })

    const transaction: PendingTransaction = {
      txHash,
      expectedAmountUsd,
      icoRound,
      ethPriceAtTransaction,
      timestamp: Date.now()
    }
    
    pendingTransactions.current.push(transaction)
    console.log('✅ [BALANCE DEBUG] Transaction ajoutée à la file de traitement:', transaction)
    
    // Démarrer le traitement immédiatement pour cette transaction
    processTransactionImmediately(transaction)
    
    // Start verification process if not already running (pour les autres)
    if (!intervalRef.current) {
      startAutoVerification()
    }
  }

  const processTransactionImmediately = async (transaction: PendingTransaction) => {
    try {
      console.log('⚡ [BALANCE DEBUG] Traitement immédiat de la transaction:', {
        txHash: transaction.txHash,
        expectedAmountUsd: transaction.expectedAmountUsd,
        icoRound: transaction.icoRound
      })
      
      await processTransaction(
        transaction.txHash as `0x${string}`,
        transaction.expectedAmountUsd,
        transaction.icoRound,
        transaction.ethPriceAtTransaction
      )
      
      console.log('✅ [BALANCE DEBUG] Transaction traitée avec succès:', transaction.txHash)
      
      // Retirer de la file d'attente
      const index = pendingTransactions.current.findIndex(t => t.txHash === transaction.txHash)
      if (index > -1) {
        pendingTransactions.current.splice(index, 1)
        console.log('🗑️ [BALANCE DEBUG] Transaction retirée de la file d\'attente')
      }
      
      // Le rafraîchissement est déjà fait dans processTransaction
      console.log('✅ [BALANCE DEBUG] Traitement immédiat terminé avec succès')
      
    } catch (error) {
      console.log('❌ [BALANCE DEBUG] Échec du traitement immédiat pour', transaction.txHash, ':', error)
      // La transaction reste dans la file pour retry plus tard
    }
  }

  const startAutoVerification = () => {
    console.log('🔄 [BALANCE DEBUG] Démarrage de la vérification automatique (retry)')
    
    intervalRef.current = setInterval(async () => {
      if (pendingTransactions.current.length === 0) {
        return
      }

      console.log(`🔄 [BALANCE DEBUG] Retry de ${pendingTransactions.current.length} transaction(s) en attente`)

      // Process each pending transaction
      for (let i = pendingTransactions.current.length - 1; i >= 0; i--) {
        const transaction = pendingTransactions.current[i]
        
        // Skip transactions that are too recent (wait at least 10 seconds)
        if (Date.now() - transaction.timestamp < 10000) {
          continue
        }

        // Skip transactions older than 30 minutes to avoid infinite loops
        if (Date.now() - transaction.timestamp > 1800000) {
          console.log('⏰ [BALANCE DEBUG] Transaction expirée, suppression de la file:', transaction.txHash)
          pendingTransactions.current.splice(i, 1)
          continue
        }

        try {
          console.log('🔄 [BALANCE DEBUG] Retry de traitement pour:', transaction.txHash)
          
          await processTransaction(
            transaction.txHash as `0x${string}`,
            transaction.expectedAmountUsd,
            transaction.icoRound,
            transaction.ethPriceAtTransaction
          )
          
          console.log('✅ [BALANCE DEBUG] Transaction traitée avec succès (retry):', transaction.txHash)
          
          // Remove from pending list
          pendingTransactions.current.splice(i, 1)
          
          // Le rafraîchissement est déjà fait dans processTransaction
          console.log('✅ [BALANCE DEBUG] Retry terminé avec succès')
          
        } catch (error) {
          console.log('❌ [BALANCE DEBUG] Échec du retry pour', transaction.txHash, ':', error)
          
          // If it's a permanent error (like wrong amount), remove from queue
          if (error instanceof Error) {
            if (error.message.includes('Insufficient payment') || 
                error.message.includes('wrong address') ||
                error.message.includes('already processed') ||
                error.message.includes('déjà enregistrée')) {
              console.log('❌ [BALANCE DEBUG] Erreur permanente, suppression de la file:', transaction.txHash)
              pendingTransactions.current.splice(i, 1)
            }
          }
        }
      }

      // Stop the interval if no more pending transactions
      if (pendingTransactions.current.length === 0) {
        console.log('✅ [BALANCE DEBUG] Aucune transaction en attente, arrêt du retry automatique')
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    }, 10000) // Check every 10 seconds
  }

  // Cleanup on unmount or address change
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      pendingTransactions.current = []
    }
  }, [address])

  return {
    addToVerificationQueue,
    pendingCount: pendingTransactions.current.length
  }
}