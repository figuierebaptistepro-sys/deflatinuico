/*
  # Fonctions pour contrôle manuel du montant total levé

  1. Nouvelles fonctions
    - `set_manual_total_raised(amount)` - Définir le montant manuel
    - `get_current_total_raised()` - Récupérer le montant actuel (manuel ou calculé)
    - `toggle_manual_mode(enabled)` - Activer/désactiver le mode manuel

  2. Mise à jour
    - Fonction `get_ico_status()` mise à jour pour utiliser le montant manuel
*/

-- Fonction pour définir le montant total levé manuellement
CREATE OR REPLACE FUNCTION set_manual_total_raised(amount NUMERIC)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Mettre à jour ou insérer dans ico_settings
  INSERT INTO ico_settings (
    ico_finished, 
    total_raised_usd, 
    total_tokens_sold, 
    manual_total_raised_usd, 
    use_manual_total,
    created_at,
    updated_at
  )
  VALUES (
    false, 
    0, 
    0, 
    amount, 
    true,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    manual_total_raised_usd = amount,
    use_manual_total = true,
    updated_at = now();

  result := json_build_object(
    'success', true,
    'message', 'Montant total mis à jour avec succès',
    'new_amount', amount,
    'manual_mode', true
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour récupérer le montant total actuel
CREATE OR REPLACE FUNCTION get_current_total_raised()
RETURNS JSON AS $$
DECLARE
  settings_record RECORD;
  calculated_total NUMERIC;
  result JSON;
BEGIN
  -- Récupérer les paramètres
  SELECT * INTO settings_record 
  FROM ico_settings 
  ORDER BY created_at DESC 
  LIMIT 1;

  -- Calculer le total des purchases vérifiées
  SELECT COALESCE(SUM(amount_sent_eur), 0) INTO calculated_total
  FROM purchases 
  WHERE status = 'verified';

  -- Si pas de paramètres, créer avec valeurs par défaut
  IF settings_record IS NULL THEN
    INSERT INTO ico_settings (
      ico_finished, 
      total_raised_usd, 
      total_tokens_sold, 
      manual_total_raised_usd, 
      use_manual_total
    )
    VALUES (false, 0, 0, 817500, true);
    
    result := json_build_object(
      'total_raised', 817500,
      'is_manual', true,
      'calculated_total', calculated_total,
      'manual_amount', 817500
    );
  ELSE
    result := json_build_object(
      'total_raised', 
      CASE 
        WHEN settings_record.use_manual_total = true 
        THEN settings_record.manual_total_raised_usd
        ELSE calculated_total
      END,
      'is_manual', settings_record.use_manual_total,
      'calculated_total', calculated_total,
      'manual_amount', settings_record.manual_total_raised_usd
    );
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour basculer entre mode manuel et automatique
CREATE OR REPLACE FUNCTION toggle_manual_mode(enabled BOOLEAN)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Mettre à jour le mode
  UPDATE ico_settings 
  SET 
    use_manual_total = enabled,
    updated_at = now()
  WHERE id = (SELECT id FROM ico_settings ORDER BY created_at DESC LIMIT 1);

  -- Si aucun enregistrement, en créer un
  IF NOT FOUND THEN
    INSERT INTO ico_settings (
      ico_finished, 
      total_raised_usd, 
      total_tokens_sold, 
      manual_total_raised_usd, 
      use_manual_total
    )
    VALUES (false, 0, 0, 817500, enabled);
  END IF;

  result := json_build_object(
    'success', true,
    'message', 
    CASE 
      WHEN enabled THEN 'Mode manuel activé'
      ELSE 'Mode automatique activé'
    END,
    'manual_mode', enabled
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mettre à jour la fonction get_ico_status pour utiliser le nouveau système
CREATE OR REPLACE FUNCTION get_ico_status()
RETURNS TABLE (
  ico_finished BOOLEAN,
  finish_date TIMESTAMPTZ,
  total_raised_usd NUMERIC,
  total_tokens_sold NUMERIC,
  active_rounds INTEGER,
  last_updated TIMESTAMPTZ
) AS $$
DECLARE
  settings_record RECORD;
  calculated_total NUMERIC;
BEGIN
  -- Récupérer les paramètres
  SELECT * INTO settings_record 
  FROM ico_settings 
  ORDER BY created_at DESC 
  LIMIT 1;

  -- Calculer le total des purchases vérifiées
  SELECT COALESCE(SUM(amount_sent_eur), 0) INTO calculated_total
  FROM purchases 
  WHERE status = 'verified';

  -- Si pas de paramètres, créer avec valeurs par défaut
  IF settings_record IS NULL THEN
    INSERT INTO ico_settings (
      ico_finished, 
      total_raised_usd, 
      total_tokens_sold, 
      manual_total_raised_usd, 
      use_manual_total
    )
    VALUES (false, 0, 0, 817500, true);
    
    -- Récupérer l'enregistrement créé
    SELECT * INTO settings_record 
    FROM ico_settings 
    ORDER BY created_at DESC 
    LIMIT 1;
  END IF;

  RETURN QUERY
  SELECT 
    settings_record.ico_finished,
    settings_record.finish_date,
    CASE 
      WHEN settings_record.use_manual_total = true 
      THEN settings_record.manual_total_raised_usd
      ELSE calculated_total
    END as total_raised_usd,
    settings_record.total_tokens_sold,
    (SELECT COUNT(*) FROM ico_rounds WHERE status = 'active')::INTEGER as active_rounds,
    settings_record.updated_at as last_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ajouter les colonnes si elles n'existent pas
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

-- Initialiser avec les valeurs par défaut si la table est vide
INSERT INTO ico_settings (
  ico_finished, 
  total_raised_usd, 
  total_tokens_sold, 
  manual_total_raised_usd, 
  use_manual_total,
  created_at,
  updated_at
)
SELECT false, 0, 0, 817500, true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM ico_settings);