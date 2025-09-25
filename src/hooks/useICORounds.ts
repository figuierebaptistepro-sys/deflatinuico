import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface ICORound {
  id: string
  round_number: number
  price: number
  total_tokens: number
  sold_tokens: number
  status: 'upcoming' | 'active' | 'completed'
  bonus: string
  end_date: string
  created_at: string
}

export const useICORounds = () => {
  const [rounds, setRounds] = useState<ICORound[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRounds = async () => {
    console.log('🔄 [ICO ROUNDS] Fetching ICO rounds from Supabase...')
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('ico_rounds')
        .select('*')
        .order('round_number', { ascending: true })

      if (fetchError) {
        console.error('❌ [ICO ROUNDS] Error fetching rounds:', fetchError)
        throw fetchError
      }

      console.log('✅ [ICO ROUNDS] Rounds fetched successfully:', {
        count: data?.length || 0,
        rounds: data?.map(r => ({
          round: r.round_number,
          status: r.status,
          price: r.price
        }))
      })

      setRounds(data || [])
    } catch (err) {
      console.error('❌ [ICO ROUNDS] Failed to fetch rounds:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch ICO rounds')
    } finally {
      setLoading(false)
    }
  }

  const updateRoundSoldTokens = async (roundNumber: number, additionalTokens: number) => {
    console.log('🔄 [ICO ROUNDS] Updating sold tokens for round', roundNumber, 'adding', additionalTokens)
    
    try {
      // Get current round data
      const currentRound = rounds.find(r => r.round_number === roundNumber)
      if (!currentRound) {
        throw new Error(`Round ${roundNumber} not found`)
      }

      const newSoldTokens = currentRound.sold_tokens + additionalTokens

      // Update in database
      const { error: updateError } = await supabase
        .from('ico_rounds')
        .update({ sold_tokens: newSoldTokens })
        .eq('round_number', roundNumber)

      if (updateError) {
        console.error('❌ [ICO ROUNDS] Error updating sold tokens:', updateError)
        throw updateError
      }

      console.log('✅ [ICO ROUNDS] Sold tokens updated successfully')
      
      // Refresh rounds data
      await fetchRounds()
    } catch (err) {
      console.error('❌ [ICO ROUNDS] Failed to update sold tokens:', err)
      throw err
    }
  }

  const completeRound = async (roundNumber: number) => {
    console.log('🏁 [ICO ROUNDS] Completing round', roundNumber)
    
    try {
      const { data, error } = await supabase
        .rpc('complete_ico_round', { round_num: roundNumber })

      if (error) {
        console.error('❌ [ICO ROUNDS] Error completing round:', error)
        throw error
      }

      console.log('✅ [ICO ROUNDS] Round completed successfully:', data)
      
      // Refresh rounds data
      await fetchRounds()
      
      return data
    } catch (err) {
      console.error('❌ [ICO ROUNDS] Failed to complete round:', err)
      throw err
    }
  }

  const activateRound = async (roundNumber: number) => {
    console.log('🚀 [ICO ROUNDS] Activating round', roundNumber)
    
    try {
      const { data, error } = await supabase
        .rpc('activate_ico_round', { round_num: roundNumber })

      if (error) {
        console.error('❌ [ICO ROUNDS] Error activating round:', error)
        throw error
      }

      console.log('✅ [ICO ROUNDS] RPC response:', data)

      // Check if the RPC function returned an error
      if (data && !data.success) {
        console.error('❌ [ICO ROUNDS] RPC function error:', data.error)
        throw new Error(data.error)
      }

      console.log('✅ [ICO ROUNDS] Round activated successfully:', data)
      
      // Refresh rounds data
      await fetchRounds()
      
      return data
    } catch (err) {
      console.error('❌ [ICO ROUNDS] Failed to activate round:', err)
      throw err
    }
  }

  const completeRound = async (roundNumber: number) => {
    console.log('🏁 [ICO ROUNDS] Completing round', roundNumber)
    
    try {
      const { data, error } = await supabase
        .rpc('complete_ico_round', { round_num: roundNumber })

      if (error) {
        console.error('❌ [ICO ROUNDS] Error completing round:', error)
        throw error
      }

      console.log('✅ [ICO ROUNDS] Round completed successfully:', data)
      
      // Refresh rounds data
      await fetchRounds()
      
      return data
    } catch (err) {
      console.error('❌ [ICO ROUNDS] Failed to complete round:', err)
      throw err
    }
  }

  const resetRound = async (roundNumber: number) => {
    console.log('🔄 [ICO ROUNDS] Resetting round', roundNumber)
    
    try {
      const { data, error } = await supabase
        .rpc('reset_ico_round', { round_num: roundNumber })

      if (error) {
        console.error('❌ [ICO ROUNDS] Error resetting round:', error)
        throw error
      }

      console.log('✅ [ICO ROUNDS] Round reset successfully:', data)
      
      // Refresh rounds data
      await fetchRounds()
      
      return data
    } catch (err) {
      console.error('❌ [ICO ROUNDS] Failed to reset round:', err)
      throw err
    }
  }
  const getActiveRound = () => {
    return rounds.find(r => r.status === 'active') || null
  }

  const getRoundByNumber = (roundNumber: number) => {
    return rounds.find(r => r.round_number === roundNumber) || null
  }

  useEffect(() => {
    fetchRounds()
  }, [])

  return {
    rounds,
    loading,
    error,
    activeRound: getActiveRound(),
    getRoundByNumber,
    updateRoundSoldTokens,
    completeRound,
    completeRound,
    activateRound,
    resetRound,
    refetch: fetchRounds
  }
}