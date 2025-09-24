/*
  # Add ICO finish functionality

  1. New Tables
    - `ico_settings`
      - `id` (uuid, primary key)
      - `ico_finished` (boolean, default false)
      - `finish_date` (timestamp)
      - `total_raised_usd` (numeric)
      - `total_tokens_sold` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `ico_settings` table
    - Add policy for public read access
    - Add policy for authenticated users to update settings

  3. Functions
    - Function to finish ICO and update all rounds to completed
    - Function to get ICO status
    - Function to calculate total raised and tokens sold

  4. Initial Data
    - Insert default ICO settings (not finished)
*/

-- Create ICO settings table
CREATE TABLE IF NOT EXISTS ico_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ico_finished boolean DEFAULT false,
  finish_date timestamptz,
  total_raised_usd numeric DEFAULT 0,
  total_tokens_sold numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE ico_settings ENABLE ROW LEVEL SECURITY;

-- Policies for ico_settings
CREATE POLICY "Anyone can read ICO settings"
  ON ico_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can update ICO settings"
  ON ico_settings
  FOR UPDATE
  TO authenticated
  USING (true);

-- Function to finish ICO
CREATE OR REPLACE FUNCTION finish_ico()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_raised numeric := 0;
  total_sold numeric := 0;
  result json;
BEGIN
  -- Calculate totals from purchases
  SELECT 
    COALESCE(SUM(amount_sent_eur), 0),
    COALESCE(SUM(tokens_purchased), 0)
  INTO total_raised, total_sold
  FROM purchases 
  WHERE status = 'verified';

  -- Update all rounds to completed
  UPDATE ico_rounds 
  SET status = 'completed' 
  WHERE status IN ('active', 'upcoming');

  -- Update ICO settings
  UPDATE ico_settings 
  SET 
    ico_finished = true,
    finish_date = now(),
    total_raised_usd = total_raised,
    total_tokens_sold = total_sold,
    updated_at = now();

  -- If no settings exist, create them
  IF NOT FOUND THEN
    INSERT INTO ico_settings (ico_finished, finish_date, total_raised_usd, total_tokens_sold)
    VALUES (true, now(), total_raised, total_sold);
  END IF;

  -- Return result
  SELECT json_build_object(
    'success', true,
    'message', 'ICO finished successfully',
    'total_raised_usd', total_raised,
    'total_tokens_sold', total_sold,
    'finish_date', now()
  ) INTO result;

  RETURN result;
END;
$$;

-- Function to get ICO status
CREATE OR REPLACE FUNCTION get_ico_status()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  settings_record ico_settings%ROWTYPE;
  total_raised numeric := 0;
  total_sold numeric := 0;
  active_rounds integer := 0;
  result json;
BEGIN
  -- Get current settings
  SELECT * INTO settings_record FROM ico_settings LIMIT 1;

  -- Calculate current totals
  SELECT 
    COALESCE(SUM(amount_sent_eur), 0),
    COALESCE(SUM(tokens_purchased), 0)
  INTO total_raised, total_sold
  FROM purchases 
  WHERE status = 'verified';

  -- Count active rounds
  SELECT COUNT(*) INTO active_rounds
  FROM ico_rounds 
  WHERE status = 'active';

  -- Build result
  SELECT json_build_object(
    'ico_finished', COALESCE(settings_record.ico_finished, false),
    'finish_date', settings_record.finish_date,
    'total_raised_usd', total_raised,
    'total_tokens_sold', total_sold,
    'active_rounds', active_rounds,
    'last_updated', COALESCE(settings_record.updated_at, now())
  ) INTO result;

  RETURN result;
END;
$$;

-- Insert default ICO settings if none exist
INSERT INTO ico_settings (ico_finished, total_raised_usd, total_tokens_sold)
SELECT false, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM ico_settings);

-- Add updated_at trigger for ico_settings
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ico_settings_updated_at 
  BEFORE UPDATE ON ico_settings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();