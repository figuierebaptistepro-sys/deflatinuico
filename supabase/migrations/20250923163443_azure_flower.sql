/*
  # Create ICO Rounds Management Table

  1. New Tables
    - `ico_rounds`
      - `id` (uuid, primary key)
      - `round_number` (integer, unique)
      - `price` (numeric, price per token in USD)
      - `total_tokens` (numeric, total tokens available for this round)
      - `sold_tokens` (numeric, tokens already sold, default 0)
      - `status` (text, 'upcoming'|'active'|'completed')
      - `bonus` (text, bonus description)
      - `end_date` (timestamptz, when the round ends)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `ico_rounds` table
    - Add policy for public read access (anyone can view rounds)
    - Add policy for authenticated admin updates (future admin panel)

  3. Initial Data
    - Insert the 4 ICO rounds with Round 1 active
*/

-- Create the ico_rounds table
CREATE TABLE IF NOT EXISTS ico_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_number integer UNIQUE NOT NULL,
  price numeric NOT NULL CHECK (price > 0),
  total_tokens numeric NOT NULL CHECK (total_tokens > 0),
  sold_tokens numeric DEFAULT 0 CHECK (sold_tokens >= 0),
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  bonus text NOT NULL DEFAULT '',
  end_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE ico_rounds ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read ICO rounds (public information)
CREATE POLICY "Anyone can read ICO rounds"
  ON ico_rounds
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to update ICO rounds (for future admin panel)
CREATE POLICY "Authenticated users can update ICO rounds"
  ON ico_rounds
  FOR UPDATE
  TO authenticated
  USING (true);

-- Insert initial ICO rounds data
INSERT INTO ico_rounds (round_number, price, total_tokens, sold_tokens, status, bonus, end_date) VALUES
  (1, 0.0022, 25000000, 18750000, 'active', '25% Bonus', '2025-02-15 23:59:59+00'),
  (2, 0.0055, 25000000, 0, 'upcoming', '15% Bonus', '2025-03-15 23:59:59+00'),
  (3, 0.0077, 25000000, 0, 'upcoming', '10% Bonus', '2025-04-15 23:59:59+00'),
  (4, 0.011, 25000000, 0, 'upcoming', '5% Bonus', '2025-05-15 23:59:59+00');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS ico_rounds_status_idx ON ico_rounds (status);
CREATE INDEX IF NOT EXISTS ico_rounds_round_number_idx ON ico_rounds (round_number);