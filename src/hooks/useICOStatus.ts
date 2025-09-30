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
      // Get ICO settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('ico_settings')
        .select('*')
        .single()

      if (settingsError) {
        console.error('❌ [ICO STATUS] Error fetching settings:', settingsError)
        throw settingsError
      }

      // Get active rounds count
      const { data: activeRoundsData, error: roundsError } = await supabase
        .from('ico_rounds')
        .select('id')
        .eq('status', 'active')

      if (roundsError) {
        console.error('❌ [ICO STATUS] Error fetching active rounds:', roundsError)
        throw roundsError
      }

      // Get total tokens sold from all rounds
      const { data: roundsData, error: roundsSumError } = await supabase
        .from('ico_rounds')
        .select('sold_tokens')

      if (roundsSumError) {
        console.error('❌ [ICO STATUS] Error fetching rounds data:', roundsSumError)
        throw roundsSumError
      }

      const totalTokensSold = roundsData?.reduce((sum, round) => sum + (round.sold_tokens || 0), 0) || 0

      // Construct status object
      const status: ICOStatus = {
        ico_finished: settingsData?.ico_finished || false,
        finish_date: settingsData?.finish_date || undefined,
        total_raised_usd: settingsData?.use_manual_total 
          ? (settingsData?.manual_total_raised_usd || 0)
          : (settingsData?.total_raised_usd || 0),
        total_tokens_sold: totalTokensSold,
        active_rounds: activeRoundsData?.length || 0,
        last_updated: new Date().toISOString()
      }

      console.log('✅ [ICO STATUS] Status constructed successfully:', status)
      setStatus(status)
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