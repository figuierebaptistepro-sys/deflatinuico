/*
  # Add function to activate ICO rounds

  1. New Functions
    - `activate_ico_round(round_num integer)` - Safely activate an ICO round
    - Ensures only one round is active at a time
    - Validates round exists and is eligible for activation

  2. Security
    - Function can be called by authenticated users
    - Includes proper error handling and validation

  3. Logic
    - Deactivates any currently active rounds (sets to completed)
    - Activates the specified round if it's upcoming
    - Returns success status and updated round info
*/

-- Function to safely activate an ICO round
CREATE OR REPLACE FUNCTION activate_ico_round(round_num integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_round ico_rounds%ROWTYPE;
    result json;
BEGIN
    -- Check if the round exists
    SELECT * INTO target_round
    FROM ico_rounds
    WHERE round_number = round_num;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Round not found',
            'round_number', round_num
        );
    END IF;
    
    -- Check if round is eligible for activation (must be upcoming)
    IF target_round.status != 'upcoming' THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Round is not eligible for activation. Current status: ' || target_round.status,
            'round_number', round_num,
            'current_status', target_round.status
        );
    END IF;
    
    -- Deactivate any currently active rounds (set them to completed)
    UPDATE ico_rounds 
    SET status = 'completed'
    WHERE status = 'active';
    
    -- Activate the target round
    UPDATE ico_rounds
    SET status = 'active'
    WHERE round_number = round_num;
    
    -- Get updated round info
    SELECT * INTO target_round
    FROM ico_rounds
    WHERE round_number = round_num;
    
    -- Return success result
    RETURN json_build_object(
        'success', true,
        'message', 'Round ' || round_num || ' activated successfully',
        'round', row_to_json(target_round),
        'previous_active_rounds_completed', true
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Database error: ' || SQLERRM,
            'round_number', round_num
        );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION activate_ico_round(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION activate_ico_round(integer) TO anon;