import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface ICOStatus {
  ico_finished: boolean
  finish_date?: string
  total_raised_usd: number
  total_tokens_sold: number
  active_rounds: number
  last_updated: string
}

export const useICOStatus = () => {
  const [status, setStatus] = useState<ICOStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchICOStatus = async () => {
    console.log('🔄 [ICO STATUS] Fetching ICO status from Supabase...')
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .rpc('get_ico_status')

      if (fetchError) {
        console.error('❌ [ICO STATUS] Error fetching status:', fetchError)
        throw fetchError
      }

      console.log('✅ [ICO STATUS] Status fetched successfully:', data)
      setStatus(data)
    } catch (err) {
      console.error('❌ [ICO STATUS] Failed to fetch status:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch ICO status')
    } finally {
      setLoading(false)
    }
  }

  const finishICO = async () => {
    console.log('🏁 [ICO STATUS] Finishing ICO...')
    setLoading(true)
    setError(null)

    try {
      const { data, error: finishError } = await supabase
        .rpc('finish_ico')

      if (finishError) {
        console.error('❌ [ICO STATUS] Error finishing ICO:', finishError)
        throw finishError
      }

      console.log('✅ [ICO STATUS] ICO finished successfully:', data)
      
      // Refresh status after finishing
      await fetchICOStatus()
      
      return data
    } catch (err) {
      console.error('❌ [ICO STATUS] Failed to finish ICO:', err)
      setError(err instanceof Error ? err.message : 'Failed to finish ICO')
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchICOStatus()
  }, [])

  return {
    status,
    loading,
    error,
    finishICO,
    refetch: fetchICOStatus
  }
}