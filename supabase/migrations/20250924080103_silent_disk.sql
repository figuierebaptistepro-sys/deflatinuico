/*
  # Update ICO rounds status options

  1. Changes
    - Update status constraint to allow 'completed' status
    - Add function to automatically complete rounds when sold out
    - Update existing rounds if needed

  2. Status Options
    - 'upcoming': Round not yet started
    - 'active': Round currently live
    - 'completed': Round finished (sold out or ended)
*/

-- Update the status constraint to include 'completed'
ALTER TABLE ico_rounds DROP CONSTRAINT IF EXISTS ico_rounds_status_check;
ALTER TABLE ico_rounds ADD CONSTRAINT ico_rounds_status_check 
  CHECK (status IN ('upcoming', 'active', 'completed'));

-- Function to automatically complete rounds when sold out
CREATE OR REPLACE FUNCTION check_round_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- If sold_tokens >= total_tokens, mark as completed
  IF NEW.sold_tokens >= NEW.total_tokens AND NEW.status = 'active' THEN
    NEW.status = 'completed';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-complete rounds when sold out
DROP TRIGGER IF EXISTS auto_complete_round ON ico_rounds;
CREATE TRIGGER auto_complete_round
  BEFORE UPDATE ON ico_rounds
  FOR EACH ROW
  EXECUTE FUNCTION check_round_completion();

-- Function to manually complete a round
CREATE OR REPLACE FUNCTION complete_ico_round(round_num INTEGER)
RETURNS TABLE(
  id uuid,
  round_number integer,
  status text,
  sold_tokens numeric,
  total_tokens numeric
) AS $$
BEGIN
  UPDATE ico_rounds 
  SET status = 'completed'
  WHERE round_number = round_num AND status != 'completed';
  
  RETURN QUERY
  SELECT ico_rounds.id, ico_rounds.round_number, ico_rounds.status, 
         ico_rounds.sold_tokens, ico_rounds.total_tokens
  FROM ico_rounds 
  WHERE ico_rounds.round_number = round_num;
END;
$$ LANGUAGE plpgsql;

-- Function to get round statistics
CREATE OR REPLACE FUNCTION get_round_stats()
RETURNS TABLE(
  total_rounds integer,
  active_rounds integer,
  completed_rounds integer,
  upcoming_rounds integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::integer as total_rounds,
    COUNT(CASE WHEN status = 'active' THEN 1 END)::integer as active_rounds,
    COUNT(CASE WHEN status = 'completed' THEN 1 END)::integer as completed_rounds,
    COUNT(CASE WHEN status = 'upcoming' THEN 1 END)::integer as upcoming_rounds
  FROM ico_rounds;
END;
$$ LANGUAGE plpgsql;