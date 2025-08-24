-- Fix RLS Policies to Allow Server to Read Existing Stats
-- This allows the server to read and update existing player statistics

-- Drop existing policies for chess_player_stats
DROP POLICY IF EXISTS "Users can view their own stats" ON chess_player_stats;
DROP POLICY IF EXISTS "Allow stats insertion" ON chess_player_stats;
DROP POLICY IF EXISTS "Users can update their own stats" ON chess_player_stats;

-- Create new policies that allow server access
-- Allow anyone to read stats (for server operations)
CREATE POLICY "Allow stats reading" ON chess_player_stats
    FOR SELECT USING (true);

-- Allow server to insert new stats
CREATE POLICY "Allow stats insertion" ON chess_player_stats
    FOR INSERT WITH CHECK (true);

-- Allow server to update existing stats
CREATE POLICY "Allow stats updating" ON chess_player_stats
    FOR UPDATE USING (true);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON chess_player_stats TO anon;
GRANT SELECT, INSERT, UPDATE ON chess_player_stats TO authenticated;

-- Verify the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'chess_player_stats'
ORDER BY policyname; 