/*
  # Update ICO Settings Total Raised Amount

  1. Changes
    - Update the total_raised_usd amount in ico_settings table
    - This will be reflected in the ICO Status component

  2. Notes
    - You can change this value to any amount you want
    - The value is displayed in the green box "Total Levé"
*/

-- Update the total raised amount to your desired value
UPDATE ico_settings 
SET 
  total_raised_usd = 169,  -- Change this to any amount you want
  updated_at = now()
WHERE id IS NOT NULL;

-- If no record exists, insert one
INSERT INTO ico_settings (total_raised_usd, total_tokens_sold, ico_finished)
SELECT 169, 0, false
WHERE NOT EXISTS (SELECT 1 FROM ico_settings);