/*
  # Add Manual Total Control System

  1. New Tables
    - `manual_settings`
      - `id` (uuid, primary key)
      - `setting_key` (text, unique)
      - `setting_value` (numeric)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Functions
    - `update_manual_total_raised(amount)` - Set manual total raised amount
    - `get_manual_total_raised()` - Get current total (manual or calculated)
    - `reset_total_to_calculated()` - Reset to automatic calculation

  3. Security
    - Enable RLS on `manual_settings` table
    - Add policies for authenticated users
*/

-- Create manual_settings table
CREATE TABLE IF NOT EXISTS manual_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value numeric NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE manual_settings ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Anyone can read manual settings"
  ON manual_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can update manual settings"
  ON manual_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_manual_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_manual_settings_updated_at
  BEFORE UPDATE ON manual_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_manual_settings_updated_at();

-- Function to update manual total raised
CREATE OR REPLACE FUNCTION update_manual_total_raised(amount numeric)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  -- Deactivate any existing manual total
  UPDATE manual_settings 
  SET is_active = false 
  WHERE setting_key = 'total_raised_usd';
  
  -- Insert or update the manual total
  INSERT INTO manual_settings (setting_key, setting_value, is_active)
  VALUES ('total_raised_usd', amount, true)
  ON CONFLICT (setting_key) 
  DO UPDATE SET 
    setting_value = amount,
    is_active = true,
    updated_at = now();
  
  result := json_build_object(
    'success', true,
    'manual_amount', amount,
    'message', 'Manual total raised amount updated successfully'
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get manual total raised (or calculated if no manual override)
CREATE OR REPLACE FUNCTION get_manual_total_raised()
RETURNS numeric AS $$
DECLARE
  manual_amount numeric;
  calculated_amount numeric;
BEGIN
  -- Check if there's an active manual override
  SELECT setting_value INTO manual_amount
  FROM manual_settings 
  WHERE setting_key = 'total_raised_usd' 
    AND is_active = true;
  
  -- If manual override exists, return it
  IF manual_amount IS NOT NULL THEN
    RETURN manual_amount;
  END IF;
  
  -- Otherwise, calculate from purchases
  SELECT COALESCE(SUM(amount_sent_eur), 0) INTO calculated_amount
  FROM purchases 
  WHERE status = 'verified';
  
  RETURN calculated_amount;
END;
$$ LANGUAGE plpgsql;

-- Function to reset to calculated amount
CREATE OR REPLACE FUNCTION reset_total_to_calculated()
RETURNS json AS $$
DECLARE
  calculated_amount numeric;
  result json;
BEGIN
  -- Calculate current total from purchases
  SELECT COALESCE(SUM(amount_sent_eur), 0) INTO calculated_amount
  FROM purchases 
  WHERE status = 'verified';
  
  -- Deactivate manual override
  UPDATE manual_settings 
  SET is_active = false 
  WHERE setting_key = 'total_raised_usd';
  
  result := json_build_object(
    'success', true,
    'calculated_amount', calculated_amount,
    'message', 'Reset to calculated amount successfully'
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Update the get_ico_status function to use manual total if available
CREATE OR REPLACE FUNCTION get_ico_status()
RETURNS json AS $$
DECLARE
  ico_settings_row ico_settings%ROWTYPE;
  active_rounds_count integer;
  total_raised numeric;
  total_tokens_sold numeric;
  result json;
BEGIN
  -- Get ICO settings
  SELECT * INTO ico_settings_row FROM ico_settings LIMIT 1;
  
  -- If no settings exist, create default
  IF ico_settings_row IS NULL THEN
    INSERT INTO ico_settings (ico_finished, total_raised_usd, total_tokens_sold)
    VALUES (false, 0, 0)
    RETURNING * INTO ico_settings_row;
  END IF;
  
  -- Count active rounds
  SELECT COUNT(*) INTO active_rounds_count
  FROM ico_rounds 
  WHERE status = 'active';
  
  -- Get manual total raised or calculate from purchases
  SELECT get_manual_total_raised() INTO total_raised;
  
  -- Calculate total tokens sold from purchases
  SELECT COALESCE(SUM(tokens_purchased), 0) INTO total_tokens_sold
  FROM purchases 
  WHERE status = 'verified';
  
  -- Build result
  result := json_build_object(
    'ico_finished', ico_settings_row.ico_finished,
    'finish_date', ico_settings_row.finish_date,
    'total_raised_usd', total_raised,
    'total_tokens_sold', total_tokens_sold,
    'active_rounds', active_rounds_count,
    'last_updated', now()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;