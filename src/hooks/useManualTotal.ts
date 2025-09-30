import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface ManualTotalData {
  total_raised: number
  is_manual: boolean
  calculated_total: number
  manual_amount: number
}

export const useManualTotal = () => {
  const [data, setData] = useState<ManualTotalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCurrentTotal = async () => {
    console.log('💰 [MANUAL TOTAL] Récupération du montant total...')
    setLoading(true)
    setError(null)

    try {
      const { data: result, error: fetchError } = await supabase
        .rpc('get_current_total_raised')

      if (fetchError) {
        console.error('❌ [MANUAL TOTAL] Erreur:', fetchError)
        throw fetchError
      }

      // La fonction retourne un tableau, prendre le premier élément
      const totalData = Array.isArray(result) ? result[0] : result
      console.log('✅ [MANUAL TOTAL] Données récupérées:', totalData)
      setData(totalData)
    } catch (err) {
      console.error('❌ [MANUAL TOTAL] Échec:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const setManualTotal = async (amount: number) => {
    console.log('🔧 [MANUAL TOTAL] Définition du montant manuel:', amount)
    setLoading(true)
    setError(null)

    try {
      const { data: result, error: updateError } = await supabase
        .rpc('set_manual_total_raised', { amount })

      if (updateError) {
        console.error('❌ [MANUAL TOTAL] Erreur mise à jour:', updateError)
        throw updateError
      }

      const updateResult = Array.isArray(result) ? result[0] : result
      console.log('✅ [MANUAL TOTAL] Montant mis à jour:', updateResult)
      
      // Rafraîchir les données
      await fetchCurrentTotal()
      
      return updateResult
    } catch (err) {
      console.error('❌ [MANUAL TOTAL] Échec mise à jour:', err)
      setError(err instanceof Error ? err.message : 'Erreur de mise à jour')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const toggleManualMode = async (enabled: boolean) => {
    console.log('🔄 [MANUAL TOTAL] Basculement mode manuel:', enabled)
    setLoading(true)
    setError(null)

    try {
      const { data: result, error: toggleError } = await supabase
        .rpc('toggle_manual_mode', { enabled })

      if (toggleError) {
        console.error('❌ [MANUAL TOTAL] Erreur basculement:', toggleError)
        throw toggleError
      }

      const toggleResult = Array.isArray(result) ? result[0] : result
      console.log('✅ [MANUAL TOTAL] Mode basculé:', toggleResult)
      
      // Rafraîchir les données
      await fetchCurrentTotal()
      
      return toggleResult
    } catch (err) {
      console.error('❌ [MANUAL TOTAL] Échec basculement:', err)
      setError(err instanceof Error ? err.message : 'Erreur de basculement')
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCurrentTotal()
  }, [])

  return {
    data,
    loading,
    error,
    setManualTotal,
    toggleManualMode,
    refetch: fetchCurrentTotal
  }
}