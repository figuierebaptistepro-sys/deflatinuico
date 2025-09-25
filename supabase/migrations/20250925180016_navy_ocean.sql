/*
  # ICO Administration Functions
  
  1. Functions
    - `activate_ico_round(round_num)` - Activate any round (even completed ones)
    - `complete_ico_round(round_num)` - Mark a round as completed
    - `reset_ico_round(round_num)` - Reset a round to upcoming
    - `get_ico_status()` - Get complete ICO status
    - `finish_ico()` - Finish the entire ICO
  
  2. Security
    - All functions require authentication
    - Uses SECURITY DEFINER for controlled access
*/

-- Function to activate an ICO round (can reactivate completed rounds)
CREATE OR REPLACE FUNCTION activate_ico_round(round_num INTEGER)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  round_exists BOOLEAN;
  result JSON;
BEGIN
  -- Check if round exists
  SELECT EXISTS(
    SELECT 1 FROM ico_rounds WHERE round_number = round_num
  ) INTO round_exists;
  
  IF NOT round_exists THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Round ' || round_num || ' does not exist'
    );
  END IF;
  
  -- Deactivate all currently active rounds
  UPDATE ico_rounds 
  SET status = 'completed' 
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
  current_status TEXT;
BEGIN
  -- Check if round exists and get current status
  SELECT EXISTS(
    SELECT 1 FROM ico_rounds WHERE round_number = round_num
  ), (
    SELECT status FROM ico_rounds WHERE round_number = round_num
  ) INTO round_exists, current_status;
  
  IF NOT round_exists THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Round ' || round_num || ' does not exist'
    );
  END IF;
  
  IF current_status != 'active' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Round ' || round_num || ' is not active (current status: ' || current_status || ')'
    );
  END IF;
  
  -- Complete the round
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
BEGIN
  -- Check if round exists
  SELECT EXISTS(
    SELECT 1 FROM ico_rounds WHERE round_number = round_num
  ) INTO round_exists;
  
  IF NOT round_exists THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Round ' || round_num || ' does not exist'
    );
  END IF;
  
  -- Reset the round to upcoming
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
  total_tokens_sold NUMERIC;
BEGIN
  -- Get ICO settings
  SELECT * INTO ico_settings_row FROM ico_settings LIMIT 1;
  
  -- Count active rounds
  SELECT COUNT(*) INTO active_rounds_count 
  FROM ico_rounds 
  WHERE status = 'active';
  
  -- Calculate totals from purchases
  SELECT 
    COALESCE(SUM(amount_sent_eur), 0),
    COALESCE(SUM(tokens_purchased), 0)
  INTO total_raised, total_tokens_sold
  FROM purchases 
  WHERE status = 'verified';
  
  RETURN json_build_object(
    'ico_finished', COALESCE(ico_settings_row.ico_finished, false),
    'finish_date', ico_settings_row.finish_date,
    'total_raised_usd', total_raised,
    'total_tokens_sold', total_tokens_sold,
    'active_rounds', active_rounds_count,
    'last_updated', NOW()
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
  total_raised NUMERIC;
  total_tokens_sold NUMERIC;
BEGIN
  -- Calculate final totals
  SELECT 
    COALESCE(SUM(amount_sent_eur), 0),
    COALESCE(SUM(tokens_purchased), 0)
  INTO total_raised, total_tokens_sold
  FROM purchases 
  WHERE status = 'verified';
  
  -- Complete all active rounds
  UPDATE ico_rounds 
  SET status = 'completed' 
  WHERE status = 'active';
  
  -- Update ICO settings
  INSERT INTO ico_settings (ico_finished, finish_date, total_raised_usd, total_tokens_sold)
  VALUES (true, NOW(), total_raised, total_tokens_sold)
  ON CONFLICT (id) DO UPDATE SET
    ico_finished = true,
    finish_date = NOW(),
    total_raised_usd = total_raised,
    total_tokens_sold = total_tokens_sold,
    updated_at = NOW();
  
  RETURN json_build_object(
    'success', true,
    'message', 'ICO finished successfully',
    'total_raised_usd', total_raised,
    'total_tokens_sold', total_tokens_sold,
    'finish_date', NOW()
  );
END;
$$;

-- Grant execute permissions to authenticated users only
GRANT EXECUTE ON FUNCTION activate_ico_round(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_ico_round(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION reset_ico_round(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_ico_status() TO authenticated;
GRANT EXECUTE ON FUNCTION finish_ico() TO authenticated;

-- Revoke from public (security)
REVOKE EXECUTE ON FUNCTION activate_ico_round(INTEGER) FROM public;
REVOKE EXECUTE ON FUNCTION complete_ico_round(INTEGER) FROM public;
REVOKE EXECUTE ON FUNCTION reset_ico_round(INTEGER) FROM public;
REVOKE EXECUTE ON FUNCTION get_ico_status() FROM public;
REVOKE EXECUTE ON FUNCTION finish_ico() FROM public;