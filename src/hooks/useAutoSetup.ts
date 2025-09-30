import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export const useAutoSetup = () => {
  const [setupComplete, setSetupComplete] = useState(false)
  const [setupError, setSetupError] = useState<string | null>(null)

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        console.log('🔧 [AUTO SETUP] Vérification de la configuration...')
        
        // Utiliser la fonction update_manual_total_columns pour configurer la DB
        const { error: setupError } = await supabase.rpc('setup_manual_total_columns')
        
        if (setupError) {
          console.error('❌ [AUTO SETUP] Erreur de configuration:', setupError)
          setSetupError(`Erreur de configuration: ${setupError.message}`)
          return
        }

        // Tester que les fonctions fonctionnent
        const { data: testData, error: testError } = await supabase.rpc('get_current_total_raised')
        
        if (testError) {
          console.error('❌ [AUTO SETUP] Test des fonctions échoué:', testError)
          setSetupError(`Test échoué: ${testError.message}`)
          return
        }

        console.log('✅ [AUTO SETUP] Configuration vérifiée avec succès', testData)
        setSetupComplete(true)
        
      } catch (error) {
        console.error('❌ [AUTO SETUP] Erreur lors du setup:', error)
        setSetupError(error instanceof Error ? error.message : 'Erreur inconnue')
      }
    }

    setupDatabase()
  }, [])

  return { setupComplete, setupError }
}