import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface ManualSettings {
  totalRaisedUsd: number
  isManualOverride: boolean
  lastUpdated: string
}

export const useManualSettings = () => {
  const [settings, setSettings] = useState<ManualSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    console.log('🔄 [MANUAL SETTINGS] Fetching manual settings...')
    setLoading(true)
    setError(null)

    try {
      // Get manual total raised amount
      const { data: manualAmount, error: manualError } = await supabase
        .rpc('get_manual_total_raised')

      if (manualError) {
        console.error('❌ [MANUAL SETTINGS] Error fetching manual amount:', manualError)
        throw manualError
      }

      // Check if there's an active manual override
      const { data: manualSetting, error: settingError } = await supabase
        .from('manual_settings')
        .select('*')
        .eq('setting_key', 'total_raised_usd')
        .eq('is_active', true)
        .maybeSingle()

      if (settingError) {
        console.error('❌ [MANUAL SETTINGS] Error fetching setting:', settingError)
        throw settingError
      }

      const settings: ManualSettings = {
        totalRaisedUsd: manualAmount || 0,
        isManualOverride: !!manualSetting,
        lastUpdated: manualSetting?.updated_at || new Date().toISOString()
      }

      console.log('✅ [MANUAL SETTINGS] Settings fetched:', settings)
      setSettings(settings)
    } catch (err) {
      console.error('❌ [MANUAL SETTINGS] Failed to fetch settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch manual settings')
    } finally {
      setLoading(false)
    }
  }

  const updateTotalRaised = async (amount: number) => {
    console.log('🔄 [MANUAL SETTINGS] Updating total raised to:', amount)
    setLoading(true)
    setError(null)

    try {
      const { data, error: updateError } = await supabase
        .rpc('update_manual_total_raised', { amount })

      if (updateError) {
        console.error('❌ [MANUAL SETTINGS] Error updating total:', updateError)
        throw updateError
      }

      console.log('✅ [MANUAL SETTINGS] Total raised updated:', data)
      
      // Refresh settings
      await fetchSettings()
      
      return data
    } catch (err) {
      console.error('❌ [MANUAL SETTINGS] Failed to update total raised:', err)
      setError(err instanceof Error ? err.message : 'Failed to update total raised')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const resetToCalculated = async () => {
    console.log('🔄 [MANUAL SETTINGS] Resetting to calculated amount...')
    setLoading(true)
    setError(null)

    try {
      const { data, error: resetError } = await supabase
        .rpc('reset_total_to_calculated')

      if (resetError) {
        console.error('❌ [MANUAL SETTINGS] Error resetting total:', resetError)
        throw resetError
      }

      console.log('✅ [MANUAL SETTINGS] Total reset to calculated:', data)
      
      // Refresh settings
      await fetchSettings()
      
      return data
    } catch (err) {
      console.error('❌ [MANUAL SETTINGS] Failed to reset total:', err)
      setError(err instanceof Error ? err.message : 'Failed to reset total')
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return {
    settings,
    loading,
    error,
    updateTotalRaised,
    resetToCalculated,
    refetch: fetchSettings
  }
}