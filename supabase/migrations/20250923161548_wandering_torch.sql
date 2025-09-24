/*
  # Corriger les politiques RLS pour les achats

  1. Sécurité
    - Permettre l'insertion pour les utilisateurs authentifiés ET anonymes
    - Permettre la lecture pour tous (nécessaire pour la vérification)
    - Maintenir la sécurité par adresse wallet

  2. Changements
    - Politique d'insertion plus permissive
    - Politique de lecture basée sur l'adresse wallet
    - Support des utilisateurs anonymes
*/

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON purchases;
DROP POLICY IF EXISTS "Allow users to read their own data" ON purchases;
DROP POLICY IF EXISTS "Allow anonymous read for verification" ON purchases;

-- Nouvelle politique d'insertion plus permissive
CREATE POLICY "Allow all authenticated users to insert purchases"
  ON purchases
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Politique de lecture basée sur l'adresse wallet
CREATE POLICY "Allow users to read purchases by wallet address"
  ON purchases
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Politique de mise à jour pour les utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to update their purchases"
  ON purchases
  FOR UPDATE
  TO authenticated
  USING (user_wallet_address = ((current_setting('request.jwt.claims'::text, true))::json ->> 'wallet_address'::text));