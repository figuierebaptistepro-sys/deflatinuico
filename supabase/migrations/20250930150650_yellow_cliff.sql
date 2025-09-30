/*
  # Créer les fonctions manquantes pour le contrôle manuel du montant total

  1. Fonctions créées
    - `get_current_total_raised()` - Récupère le montant total actuel
    - `set_manual_total_raised(amount)` - Définit un montant manuel
    - `toggle_manual_mode(enabled)` - Active/désactive le mode manuel
    - `update_manual_total_columns()` - Met à jour les colonnes nécessaires

  2. Sécurité
    - Permissions accordées aux utilisateurs authentifiés
    - Fonctions sécurisées avec SECURITY DEFINER quand nécessaire

  3. Gestion d'erreurs
    - Vérifications d'existence des tables et colonnes
    - Création automatique des enregistrements manquants
*/

-- Fonction pour mettre à jour les colonnes de ico_settings
CREATE OR REPLACE FUNCTION update_manual_total_columns()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Ajouter les colonnes si elles n'existent pas
  BEGIN
    ALTER TABLE ico_settings ADD COLUMN IF NOT EXISTS manual_total_raised_usd NUMERIC DEFAULT 817500;
    ALTER TABLE ico_settings ADD COLUMN IF NOT EXISTS use_manual_total BOOLEAN DEFAULT true;
  EXCEPTION
    WHEN others THEN
      -- Ignorer les erreurs si les colonnes existent déjà
      NULL;
  END;

  -- S'assurer qu'il y a au moins un enregistrement
  INSERT INTO ico_settings (
    ico_finished, 
    total_raised_usd, 
    total_tokens_sold, 
    manual_total_raised_usd, 
    use_manual_total
  )
  SELECT false, 0, 0, 817500, true
  WHERE NOT EXISTS (SELECT 1 FROM ico_settings);

  -- Mettre à jour la fonction get_ico_status
  CREATE OR REPLACE FUNCTION get_ico_status()
  RETURNS TABLE (
    ico_finished BOOLEAN,
    finish_date TIMESTAMPTZ,
    total_raised_usd NUMERIC,
    total_tokens_sold NUMERIC,
    active_rounds INTEGER,
    last_updated TIMESTAMPTZ
  ) AS $func$
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
  $func$ LANGUAGE plpgsql;
END;
$$;

-- Fonction pour récupérer le montant total actuel
CREATE OR REPLACE FUNCTION get_current_total_raised()
RETURNS TABLE (
  total_raised NUMERIC,
  is_manual BOOLEAN,
  calculated_total NUMERIC,
  manual_amount NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_ico_settings RECORD;
  v_calculated_total NUMERIC;
BEGIN
  -- S'assurer que les colonnes existent
  PERFORM update_manual_total_columns();

  -- Récupérer les paramètres ICO
  SELECT * INTO v_ico_settings FROM ico_settings ORDER BY created_at DESC LIMIT 1;

  -- Calculer le total automatique
  SELECT COALESCE(SUM(amount_sent_eur), 0) INTO v_calculated_total
  FROM purchases
  WHERE status = 'verified';

  -- Si pas de paramètres, utiliser des valeurs par défaut
  IF v_ico_settings IS NULL THEN
    total_raised := 817500;
    is_manual := true;
    calculated_total := v_calculated_total;
    manual_amount := 817500;
    RETURN NEXT;
    RETURN;
  END IF;

  calculated_total := v_calculated_total;
  manual_amount := COALESCE(v_ico_settings.manual_total_raised_usd, 817500);

  IF COALESCE(v_ico_settings.use_manual_total, true) THEN
    total_raised := manual_amount;
    is_manual := true;
  ELSE
    total_raised := v_calculated_total;
    is_manual := false;
  END IF;

  RETURN NEXT;
END;
$$;

-- Fonction pour définir un montant manuel
CREATE OR REPLACE FUNCTION set_manual_total_raised(amount NUMERIC)
RETURNS TABLE (
  success BOOLEAN,
  new_total NUMERIC,
  message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_updated_rows INTEGER;
BEGIN
  -- S'assurer que les colonnes existent
  PERFORM update_manual_total_columns();

  -- Mettre à jour le montant manuel
  UPDATE ico_settings
  SET 
    manual_total_raised_usd = amount,
    use_manual_total = true,
    updated_at = NOW()
  WHERE id = (SELECT id FROM ico_settings ORDER BY created_at DESC LIMIT 1);

  GET DIAGNOSTICS v_updated_rows = ROW_COUNT;

  IF v_updated_rows > 0 THEN
    success := true;
    new_total := amount;
    message := 'Montant manuel mis à jour avec succès';
  ELSE
    success := false;
    new_total := amount;
    message := 'Aucun enregistrement trouvé à mettre à jour';
  END IF;

  RETURN NEXT;
END;
$$;

-- Fonction pour basculer le mode manuel
CREATE OR REPLACE FUNCTION toggle_manual_mode(enabled BOOLEAN)
RETURNS TABLE (
  success BOOLEAN,
  is_manual BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_updated_rows INTEGER;
BEGIN
  -- S'assurer que les colonnes existent
  PERFORM update_manual_total_columns();

  -- Basculer le mode
  UPDATE ico_settings
  SET 
    use_manual_total = enabled,
    updated_at = NOW()
  WHERE id = (SELECT id FROM ico_settings ORDER BY created_at DESC LIMIT 1);

  GET DIAGNOSTICS v_updated_rows = ROW_COUNT;

  IF v_updated_rows > 0 THEN
    success := true;
    is_manual := enabled;
    message := CASE 
      WHEN enabled THEN 'Mode manuel activé'
      ELSE 'Mode automatique activé'
    END;
  ELSE
    success := false;
    is_manual := enabled;
    message := 'Aucun enregistrement trouvé à mettre à jour';
  END IF;

  RETURN NEXT;
END;
$$;

-- Accorder les permissions nécessaires
GRANT EXECUTE ON FUNCTION update_manual_total_columns() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_current_total_raised() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION set_manual_total_raised(NUMERIC) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION toggle_manual_mode(BOOLEAN) TO authenticated, anon;

-- Permissions sur les tables
GRANT SELECT, UPDATE ON TABLE ico_settings TO authenticated, anon;
GRANT SELECT ON TABLE purchases TO authenticated, anon;
GRANT SELECT ON TABLE ico_rounds TO authenticated, anon;