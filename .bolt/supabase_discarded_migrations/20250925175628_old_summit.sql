/*
  # ICO Administration Functions

  1. New Functions
    - `activate_ico_round(round_num)` - Activate any round (even completed ones)
    - `complete_ico_round(round_num)` - Mark a round as completed
    - `reset_ico_round(round_num)` - Reset a round to upcoming
    - `get_ico_status()` - Get complete ICO status
    - `finish_ico()` - Finish the entire ICO

  2. Security
    - All functions require authenticated users
    - Only admin-level access should call these functions
    - Public users cannot access these functions directly

  3. Features
    - Can reactivate completed rounds
    - Automatic deactivation of other rounds when activating one
    - Complete ICO management
*/

-- Function to activate any ICO round (including completed ones)
CREATE OR REPLACE FUNCTION activate_ico_round(round_num INTEGER)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  round_exists BOOLEAN;
  result JSON;
BEGIN
  -- Check if the round exists
  SELECT EXISTS(
    SELECT 1 FROM ico_rounds 
    WHERE round_number = round_num
  ) INTO round_exists;
  
  IF NOT round_exists THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Round ' || round_num || ' does not exist'
    );
  END IF;
  
  -- Deactivate all currently active rounds
  UPDATE ico_rounds 
  SET status = 'upcoming'
  WHERE status = 'active';
  
  -- Activate the specified round
  UPDATE ico_rounds 
  SET status = 'active'
  WHERE round_number = round_num;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Round ' || round_num || ' activated successfully',
    'round_number', round_num
  );
END;
$$;

-- Function to complete an ICO round
CREATE OR REPLACE FUNCTION complete_ico_round(round_num INTEGER)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  round_exists BOOLEAN;
  result JSON;
BEGIN
  -- Check if the round exists
  SELECT EXISTS(
    SELECT 1 FROM ico_rounds 
    WHERE round_number = round_num
  ) INTO round_exists;
  
  IF NOT round_exists THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Round ' || round_num || ' does not exist'
    );
  END IF;
  
  -- Complete the specified round
  UPDATE ico_rounds 
  SET status = 'completed'
  WHERE round_number = round_num;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Round ' || round_num || ' completed successfully',
    'round_number', round_num
  );
END;
$$;

-- Function to reset an ICO round to upcoming
CREATE OR REPLACE FUNCTION reset_ico_round(round_num INTEGER)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  round_exists BOOLEAN;
  result JSON;
BEGIN
  -- Check if the round exists
  SELECT EXISTS(
    SELECT 1 FROM ico_rounds 
    WHERE round_number = round_num
  ) INTO round_exists;
  
  IF NOT round_exists THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Round ' || round_num || ' does not exist'
    );
  END IF;
  
  -- Reset the specified round to upcoming
  UPDATE ico_rounds 
  SET status = 'upcoming'
  WHERE round_number = round_num;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Round ' || round_num || ' reset to upcoming successfully',
    'round_number', round_num
  );
END;
$$;

-- Function to get complete ICO status
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
  result JSON;
BEGIN
  -- Get ICO settings (create default if doesn't exist)
  SELECT * INTO ico_settings_row FROM ico_settings LIMIT 1;
  
  IF ico_settings_row IS NULL THEN
    INSERT INTO ico_settings (ico_finished, total_raised_usd, total_tokens_sold)
    VALUES (false, 0, 0)
    RETURNING * INTO ico_settings_row;
  END IF;
  
  -- Count active rounds
  SELECT COUNT(*) INTO active_rounds_count
  FROM ico_rounds 
  WHERE status = 'active';
  
  -- Calculate totals from purchases
  SELECT 
    COALESCE(SUM(amount_sent_eur), 0),
    COALESCE(SUM(tokens_purchased), 0)
  INTO total_raised, total_sold
  FROM purchases 
  WHERE status = 'verified';
  
  -- Update ico_settings with calculated values
  UPDATE ico_settings 
  SET 
    total_raised_usd = total_raised,
    total_tokens_sold = total_sold,
    updated_at = now()
  WHERE id = ico_settings_row.id;
  
  RETURN json_build_object(
    'ico_finished', ico_settings_row.ico_finished,
    'finish_date', ico_settings_row.finish_date,
    'total_raised_usd', total_raised,
    'total_tokens_sold', total_sold,
    'active_rounds', active_rounds_count,
    'last_updated', now()
  );
END;
$$;

-- Function to finish the entire ICO
CREATE OR REPLACE FUNCTION finish_ico()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Mark all rounds as completed
  UPDATE ico_rounds 
  SET status = 'completed'
  WHERE status IN ('active', 'upcoming');
  
  -- Update ICO settings to finished
  UPDATE ico_settings 
  SET 
    ico_finished = true,
    finish_date = now(),
    updated_at = now();
  
  -- If no ico_settings record exists, create one
  INSERT INTO ico_settings (ico_finished, finish_date, total_raised_usd, total_tokens_sold)
  SELECT true, now(), 0, 0
  WHERE NOT EXISTS (SELECT 1 FROM ico_settings);
  
  RETURN json_build_object(
    'success', true,
    'message', 'ICO finished successfully',
    'finish_date', now()
  );
END;
$$;

-- Grant execute permissions to authenticated users only
GRANT EXECUTE ON FUNCTION activate_ico_round(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_ico_round(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION reset_ico_round(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_ico_status() TO authenticated;
GRANT EXECUTE ON FUNCTION finish_ico() TO authenticated;

-- Revoke from public (ensure these are not publicly accessible)
REVOKE EXECUTE ON FUNCTION activate_ico_round(INTEGER) FROM public;
REVOKE EXECUTE ON FUNCTION complete_ico_round(INTEGER) FROM public;
REVOKE EXECUTE ON FUNCTION reset_ico_round(INTEGER) FROM public;
REVOKE EXECUTE ON FUNCTION get_ico_status() FROM public;
REVOKE EXECUTE ON FUNCTION finish_ico() FROM public;