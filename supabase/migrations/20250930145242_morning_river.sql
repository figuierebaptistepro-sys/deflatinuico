/*
  # Add manual control for total raised amount

  1. New Functions
    - `update_manual_total_raised(amount)` - Manually set the total raised amount
    - `get_manual_total_raised()` - Get the current manual total
    - `reset_total_to_calculated()` - Reset to calculated amount from purchases

  2. New Table
    - `manual_settings` - Store manual overrides for ICO statistics

  3. Security
    - Functions can be called by authenticated users
    - Table has RLS enabled with appropriate policies
*/

-- Create manual settings table
CREATE TABLE IF NOT EXISTS manual_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value numeric NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE manual_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read manual settings"
  ON manual_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can update manual settings"
  ON manual_settings
  FOR ALL
  TO authenticated
  USING (true);

-- Function to manually set total raised amount
CREATE OR REPLACE FUNCTION update_manual_total_raised(amount NUMERIC)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update the manual total raised setting
  INSERT INTO manual_settings (setting_key, setting_value, is_active)
  VALUES ('total_raised_usd', amount, true)
  ON CONFLICT (setting_key) 
  DO UPDATE SET 
    setting_value = amount,
    is_active = true,
    updated_at = now();

  -- Also update ico_settings table for compatibility
  UPDATE ico_settings 
  SET 
    total_raised_usd = amount,
    updated_at = now();

  -- If no ico_settings record exists, create one
  INSERT INTO ico_settings (total_raised_usd, total_tokens_sold, ico_finished)
  SELECT amount, 0, false
  WHERE NOT EXISTS (SELECT 1 FROM ico_settings);

  RETURN json_build_object(
    'success', true,
    'message', 'Total raised amount updated successfully',
    'new_amount', amount,
    'updated_at', now()
  );
END;
$$;

-- Function to get manual total raised amount
CREATE OR REPLACE FUNCTION get_manual_total_raised()
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  manual_amount NUMERIC;
BEGIN
  -- Get manual setting if active
  SELECT setting_value INTO manual_amount
  FROM manual_settings 
  WHERE setting_key = 'total_raised_usd' AND is_active = true;

  -- If no manual setting, calculate from purchases
  IF manual_amount IS NULL THEN
    SELECT COALESCE(SUM(amount_sent_eur), 0) INTO manual_amount
    FROM purchases 
    WHERE status = 'verified';
  END IF;

  RETURN COALESCE(manual_amount, 0);
END;
$$;

-- Function to reset to calculated amount
CREATE OR REPLACE FUNCTION reset_total_to_calculated()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  calculated_amount NUMERIC;
BEGIN
  -- Calculate actual amount from purchases
  SELECT COALESCE(SUM(amount_sent_eur), 0) INTO calculated_amount
  FROM purchases 
  WHERE status = 'verified';

  -- Deactivate manual setting
  UPDATE manual_settings 
  SET is_active = false, updated_at = now()
  WHERE setting_key = 'total_raised_usd';

  -- Update ico_settings with calculated amount
  UPDATE ico_settings 
  SET 
    total_raised_usd = calculated_amount,
    updated_at = now();

  RETURN json_build_object(
    'success', true,
    'message', 'Total raised reset to calculated amount',
    'calculated_amount', calculated_amount,
    'updated_at', now()
  );
END;
$$;

-- Update the get_ico_status function to use manual amount
CREATE OR REPLACE FUNCTION get_ico_status()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  ico_settings_row RECORD;
  active_rounds_count INTEGER;
  total_raised NUMERIC;
  total_sold NUMERIC;
BEGIN
  -- Get ICO settings
  SELECT * INTO ico_settings_row FROM ico_settings LIMIT 1;
  
  -- Count active rounds
  SELECT COUNT(*) INTO active_rounds_count 
  FROM ico_rounds 
  WHERE status = 'active';
  
  -- Get manual total raised amount (or calculated if no manual override)
  SELECT get_manual_total_raised() INTO total_raised;
  
  -- Calculate total tokens sold from purchases
  SELECT COALESCE(SUM(tokens_purchased), 0) INTO total_sold
  FROM purchases 
  WHERE status = 'verified';
  
  RETURN json_build_object(
    'ico_finished', COALESCE(ico_settings_row.ico_finished, false),
    'finish_date', ico_settings_row.finish_date,
    'total_raised_usd', total_raised,
    'total_tokens_sold', total_sold,
    'active_rounds', active_rounds_count,
    'last_updated', NOW()
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_manual_total_raised(NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION get_manual_total_raised() TO authenticated;
GRANT EXECUTE ON FUNCTION reset_total_to_calculated() TO authenticated;

-- Insert initial manual setting with current amount
INSERT INTO manual_settings (setting_key, setting_value, is_active)
VALUES ('total_raised_usd', 817500, true)
ON CONFLICT (setting_key) DO NOTHING;