/*
  # Ajouter contrôle manuel du montant total dans ico_settings

  1. Modifications
    - Ajouter colonne `manual_total_raised_usd` dans `ico_settings`
    - Ajouter colonne `use_manual_total` pour activer/désactiver
    - Modifier la fonction `get_ico_status()` pour utiliser le montant manuel si activé

  2. Utilisation
    - Éditez directement dans Supabase Table Editor
    - Mettez `use_manual_total` à `true` pour utiliser `manual_total_raised_usd`
    - Mettez `use_manual_total` à `false` pour utiliser le calcul automatique
*/

-- Ajouter les colonnes pour le contrôle manuel
ALTER TABLE ico_settings 
ADD COLUMN IF NOT EXISTS manual_total_raised_usd NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS use_manual_total BOOLEAN DEFAULT false;

-- Mettre à jour la fonction get_ico_status pour utiliser le montant manuel si activé
CREATE OR REPLACE FUNCTION get_ico_status()
RETURNS TABLE (
  ico_finished BOOLEAN,
  finish_date TIMESTAMPTZ,
  total_raised_usd NUMERIC,
  total_tokens_sold NUMERIC,
  active_rounds INTEGER,
  last_updated TIMESTAMPTZ
) 
LANGUAGE plpgsql
AS $$
DECLARE
  settings_record RECORD;
  calculated_total NUMERIC;
  calculated_tokens NUMERIC;
  active_count INTEGER;
BEGIN
  -- Récupérer les paramètres ICO
  SELECT * INTO settings_record 
  FROM ico_settings 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Si pas de paramètres, créer un enregistrement par défaut
  IF settings_record IS NULL THEN
    INSERT INTO ico_settings (ico_finished, total_raised_usd, total_tokens_sold)
    VALUES (false, 0, 0)
    RETURNING * INTO settings_record;
  END IF;
  
  -- Calculer les totaux depuis les purchases
  SELECT 
    COALESCE(SUM(amount_sent_eur), 0),
    COALESCE(SUM(tokens_purchased), 0)
  INTO calculated_total, calculated_tokens
  FROM purchases 
  WHERE status = 'verified';
  
  -- Compter les rounds actifs
  SELECT COUNT(*) INTO active_count
  FROM ico_rounds 
  WHERE status = 'active';
  
  -- Retourner les résultats
  RETURN QUERY SELECT 
    settings_record.ico_finished,
    settings_record.finish_date,
    -- Utiliser le montant manuel si activé, sinon le calculé
    CASE 
      WHEN settings_record.use_manual_total = true 
      THEN settings_record.manual_total_raised_usd
      ELSE calculated_total
    END as total_raised_usd,
    calculated_tokens as total_tokens_sold,
    active_count as active_rounds,
    NOW() as last_updated;
END;
$$;

-- Insérer un enregistrement par défaut si la table est vide
INSERT INTO ico_settings (ico_finished, total_raised_usd, total_tokens_sold, manual_total_raised_usd, use_manual_total)
SELECT false, 0, 0, 817500, false
WHERE NOT EXISTS (SELECT 1 FROM ico_settings);