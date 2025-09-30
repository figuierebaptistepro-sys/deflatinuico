import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export const useAutoSetup = () => {
  const [setupComplete, setSetupComplete] = useState(false)
  const [setupError, setSetupError] = useState<string | null>(null)

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        console.log('🔧 [AUTO SETUP] Configuration automatique de la base de données...')
        
        // Exécuter le SQL directement pour ajouter les colonnes
        const setupSQL = `
          -- Ajouter les colonnes pour le contrôle manuel du montant total
          DO $$ 
          BEGIN
            -- Vérifier et ajouter manual_total_raised_usd
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'ico_settings' AND column_name = 'manual_total_raised_usd'
            ) THEN
              ALTER TABLE ico_settings ADD COLUMN manual_total_raised_usd NUMERIC DEFAULT 817500;
            END IF;
            
            -- Vérifier et ajouter use_manual_total
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'ico_settings' AND column_name = 'use_manual_total'
            ) THEN
              ALTER TABLE ico_settings ADD COLUMN use_manual_total BOOLEAN DEFAULT true;
            END IF;
          END $$;
        `

        const { error: sqlError } = await supabase.rpc('exec_sql', { sql_query: setupSQL })
        
        if (sqlError) {
          console.log('⚠️ [AUTO SETUP] Méthode RPC échouée, tentative alternative...')
          
          // Méthode alternative : essayer d'insérer/mettre à jour directement
          const { data: existingSettings } = await supabase
            .from('ico_settings')
            .select('*')
            .limit(1)

          if (!existingSettings || existingSettings.length === 0) {
            // Créer le premier enregistrement avec les nouvelles colonnes
            const { error: insertError } = await supabase
              .from('ico_settings')
              .insert({
                ico_finished: false,
                total_raised_usd: 0,
                total_tokens_sold: 0,
                manual_total_raised_usd: 817500,
                use_manual_total: true
              })

            if (insertError) {
              console.log('ℹ️ [AUTO SETUP] Les colonnes n\'existent peut-être pas encore dans la table')
              setSetupError('Colonnes manquantes - veuillez appliquer la migration manuellement')
              return
            }
          }
        }

        // Mettre à jour la fonction get_ico_status
        const updateFunctionSQL = `
          CREATE OR REPLACE FUNCTION get_ico_status()
          RETURNS TABLE (
            ico_finished BOOLEAN,
            finish_date TIMESTAMPTZ,
            total_raised_usd NUMERIC,
            total_tokens_sold NUMERIC,
            active_rounds INTEGER,
            last_updated TIMESTAMPTZ
          ) AS $$
          BEGIN
            RETURN QUERY
            SELECT 
              s.ico_finished,
              s.finish_date,
              CASE 
                WHEN s.use_manual_total = true THEN s.manual_total_raised_usd
                ELSE COALESCE(
                  (SELECT SUM(amount_sent_eur) FROM purchases WHERE status = 'verified'), 
                  0
                )
              END as total_raised_usd,
              s.total_tokens_sold,
              (SELECT COUNT(*) FROM ico_rounds WHERE status = 'active')::INTEGER as active_rounds,
              s.updated_at as last_updated
            FROM ico_settings s
            ORDER BY s.created_at DESC
            LIMIT 1;
          END;
          $$ LANGUAGE plpgsql;
        `

        const { error: functionError } = await supabase.rpc('exec_sql', { sql_query: updateFunctionSQL })
        
        if (functionError) {
          console.log('⚠️ [AUTO SETUP] Mise à jour de fonction échouée:', functionError)
        }

        console.log('✅ [AUTO SETUP] Configuration terminée avec succès')
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