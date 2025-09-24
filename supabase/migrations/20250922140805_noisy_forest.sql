/*
  # Create purchases table for crypto payments

  1. New Tables
    - `purchases`
      - `id` (uuid, primary key)
      - `user_wallet_address` (text, wallet address of buyer)
      - `tx_hash` (text, transaction hash)
      - `amount_sent_eth` (numeric, amount sent in ETH)
      - `amount_sent_eur` (numeric, equivalent amount in EUR)
      - `tokens_purchased` (numeric, DEFLAT INU tokens to receive)
      - `ico_round` (integer, which ICO round)
      - `status` (text, pending/verified/failed)
      - `created_at` (timestamp)
      - `verified_at` (timestamp)

  2. Security
    - Enable RLS on `purchases` table
    - Add policy for users to read their own purchases
    - Add policy for authenticated users to create purchases
*/

CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_wallet_address text NOT NULL,
  tx_hash text UNIQUE NOT NULL,
  amount_sent_eth numeric NOT NULL,
  amount_sent_eur numeric NOT NULL,
  tokens_purchased numeric NOT NULL,
  ico_round integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed')),
  created_at timestamptz DEFAULT now(),
  verified_at timestamptz,
  
  -- Add indexes for better performance
  CONSTRAINT purchases_tx_hash_unique UNIQUE (tx_hash)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS purchases_user_wallet_address_idx ON purchases(user_wallet_address);
CREATE INDEX IF NOT EXISTS purchases_status_idx ON purchases(status);
CREATE INDEX IF NOT EXISTS purchases_created_at_idx ON purchases(created_at);

-- Enable RLS
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read their own purchases"
  ON purchases
  FOR SELECT
  TO authenticated
  USING (user_wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can create purchases"
  ON purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anonymous read for verification"
  ON purchases
  FOR SELECT
  TO anon
  USING (true);