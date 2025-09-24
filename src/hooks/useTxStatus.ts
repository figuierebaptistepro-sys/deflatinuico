import { useCallback, useState } from 'react'
import { waitForTransactionReceipt, getTransactionConfirmations } from 'viem/actions'
import { getPublicClient } from '../lib/viemClient'

export type TxStatus = 'idle' | 'pending' | 'confirmed' | 'failed' | 'replaced'

export interface TxStatusResult {
  status: TxStatus
  hash: `0x${string}` | null
  confirmations: number
  receipt: any | null
}

export function useTxStatus() {
  const [status, setStatus] = useState<TxStatus>('idle')
  const [hash, setHash] = useState<`0x${string}` | null>(null)
  const [confirmations, setConfirmations] = useState<number>(0)
  const [receipt, setReceipt] = useState<any | null>(null)

  const track = useCallback(async (txHash: `0x${string}`, chainId: number = 1): Promise<any> => {
    console.log('🔍 Début du suivi de transaction:', txHash, 'sur chainId:', chainId)
    
    setHash(txHash)
    setStatus('pending')
    setConfirmations(0)
    setReceipt(null)

    const publicClient = getPublicClient(chainId)

    try {
      // 1) Attendre le receipt directement via RPC
      console.log('⏳ Attente du receipt...')
      const txReceipt = await waitForTransactionReceipt(publicClient, {
        hash: txHash,
        confirmations: 1,
        pollingInterval: 1500, // Poll toutes les 1.5 secondes
        timeout: 300000 // Timeout de 5 minutes
      })

      console.log('📄 Receipt reçu:', txReceipt)
      setReceipt(txReceipt)

      // 2) Déterminer le statut selon receipt.status
      if (txReceipt.status === 'success') {
        setStatus('confirmed')
        console.log('✅ Transaction confirmée avec succès')
      } else {
        setStatus('failed')
        console.log('❌ Transaction échouée')
      }

      // 3) Obtenir le nombre de confirmations
      try {
        const confs = await getTransactionConfirmations(publicClient, { hash: txHash })
        const confirmationCount = Number(confs)
        setConfirmations(confirmationCount)
        console.log('🔢 Confirmations:', confirmationCount)
      } catch (e) {
        console.log('⚠️ Impossible d\'obtenir les confirmations:', e)
      }

      return txReceipt

    } catch (error: any) {
      console.error('❌ Erreur lors du suivi de transaction:', error)
      
      // Cas TX remplacée (speed up / cancel)
      if (error?.name === 'TransactionReceiptNotFoundError') {
        console.log('🔄 Transaction potentiellement remplacée')
        setStatus('replaced')
      } else {
        setStatus('failed')
      }
      
      throw error
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setHash(null)
    setConfirmations(0)
    setReceipt(null)
  }, [])

  return { 
    status, 
    hash, 
    confirmations, 
    receipt,
    track, 
    reset 
  }
}