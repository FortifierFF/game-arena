-- FINAL COMPLETE CHESS DATABASE SETUP - FIXED VERSION
-- This script creates everything in the correct order and handles existing conflicts safely

-- STEP 1: Clean up any existing policies (only if tables exist)
DO $$
BEGIN
    -- Drop policies from chess_player_stats if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'chess_player_stats') THEN
        DROP POLICY IF EXISTS "Users can view their own stats" ON chess_player_stats;
        DROP POLICY IF EXISTS "Users can insert their own stats" ON chess_player_stats;
        DROP POLICY IF EXISTS "Users can update their own stats" ON chess_player_stats;
    END IF;
    
    -- Drop policies from chess_games if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'chess_games') THEN
        DROP POLICY IF EXISTS "Users can view games they participated in" ON chess_games;
        DROP POLICY IF EXISTS "Users can insert games they participated in" ON chess_games;
    END IF;
    
    -- Drop policies from chess_moves if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'chess_moves') THEN
        DROP POLICY IF EXISTS "Users can view moves from games they participated in" ON chess_moves;
        DROP POLICY IF EXISTS "Users can insert moves for games they participated in" ON chess_moves;
    END IF;
END $$;

-- STEP 2: Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS chess_moves CASCADE;
DROP TABLE IF EXISTS chess_games CASCADE;
DROP TABLE IF EXISTS chess_player_stats CASCADE;

-- STEP 3: Create chess_player_stats table (depends on users table)
CREATE TABLE chess_player_stats (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_games INTEGER NOT NULL DEFAULT 0,
    wins INTEGER NOT NULL DEFAULT 0,
    losses INTEGER NOT NULL DEFAULT 0,
    draws INTEGER NOT NULL DEFAULT 0,
    current_rating INTEGER NOT NULL DEFAULT 1200,
    highest_rating INTEGER NOT NULL DEFAULT 1200,
    average_game_duration INTEGER NOT NULL DEFAULT 0,
    win_streak INTEGER NOT NULL DEFAULT 0,
    best_win_streak INTEGER NOT NULL DEFAULT 0,
    games_as_white INTEGER NOT NULL DEFAULT 0,
    games_as_black INTEGER NOT NULL DEFAULT 0,
    wins_as_white INTEGER NOT NULL DEFAULT 0,
    wins_as_black INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 4: Create chess_games table (depends on users table)
CREATE TABLE chess_games (
    id TEXT PRIMARY KEY,
    player1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    player2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    player1_color TEXT NOT NULL CHECK (player1_color IN ('white', 'black')),
    player2_color TEXT NOT NULL CHECK (player2_color IN ('white', 'black')),
    time_control TEXT NOT NULL,
    game_result TEXT NOT NULL CHECK (game_result IN ('checkmate', 'resignation', 'draw', 'stalemate', 'timeout')),
    winner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    loser_id UUID REFERENCES users(id) ON DELETE SET NULL,
    total_moves INTEGER NOT NULL DEFAULT 0,
    game_duration_ms BIGINT NOT NULL,
    final_fen TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 5: Create chess_moves table (depends on chess_games and users tables)
CREATE TABLE chess_moves (
    id TEXT PRIMARY KEY,
    game_id TEXT NOT NULL REFERENCES chess_games(id) ON DELETE CASCADE,
    move_number INTEGER NOT NULL,
    player_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    from_square TEXT NOT NULL,
    to_square TEXT NOT NULL,
    piece TEXT NOT NULL,
    move_notation TEXT NOT NULL,
    is_capture BOOLEAN NOT NULL DEFAULT FALSE,
    is_check BOOLEAN NOT NULL DEFAULT FALSE,
    is_checkmate BOOLEAN NOT NULL DEFAULT FALSE,
    timestamp_ms BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 6: Create indexes for better performance
CREATE INDEX idx_chess_games_player1 ON chess_games(player1_id);
CREATE INDEX idx_chess_games_player2 ON chess_games(player2_id);
CREATE INDEX idx_chess_games_ended_at ON chess_games(ended_at);
CREATE INDEX idx_chess_moves_game_id ON chess_moves(game_id);
CREATE INDEX idx_chess_moves_player_id ON chess_moves(player_id);
CREATE INDEX idx_chess_player_stats_user_id ON chess_player_stats(user_id);
CREATE INDEX idx_chess_player_stats_rating ON chess_player_stats(current_rating);

-- STEP 7: Enable Row Level Security on all tables
ALTER TABLE chess_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE chess_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE chess_player_stats ENABLE ROW LEVEL SECURITY;

-- STEP 8: Create RLS policies for chess_games
CREATE POLICY "Users can view games they participated in" ON chess_games
    FOR SELECT USING (player1_id = auth.uid() OR player2_id = auth.uid());

CREATE POLICY "Users can insert games they participated in" ON chess_games
    FOR INSERT WITH CHECK (player1_id = auth.uid() OR player2_id = auth.uid());

-- STEP 9: Create RLS policies for chess_moves
CREATE POLICY "Users can view moves from games they participated in" ON chess_moves
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chess_games 
            WHERE id = chess_moves.game_id 
            AND (player1_id = auth.uid() OR player2_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert moves for games they participated in" ON chess_moves
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM chess_games 
            WHERE id = chess_moves.game_id 
            AND (player1_id = auth.uid() OR player2_id = auth.uid())
        )
    );

-- STEP 10: Create RLS policies for chess_player_stats
CREATE POLICY "Users can view their own stats" ON chess_player_stats
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own stats" ON chess_player_stats
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own stats" ON chess_player_stats
    FOR UPDATE USING (user_id = auth.uid());

-- STEP 11: Create function for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- STEP 12: Create trigger for chess_player_stats
CREATE TRIGGER update_chess_player_stats_updated_at 
    BEFORE UPDATE ON chess_player_stats 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- STEP 13: Grant necessary permissions to authenticated users
GRANT ALL ON chess_games TO authenticated;
GRANT ALL ON chess_moves TO authenticated;
GRANT ALL ON chess_player_stats TO authenticated;

-- STEP 14: Verify everything was created successfully
SELECT 'Database setup completed successfully!' as status;

-- STEP 15: Show the final table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('chess_games', 'chess_moves', 'chess_player_stats')
ORDER BY table_name, ordinal_position;

-- STEP 16: Show the created policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('chess_games', 'chess_moves', 'chess_player_stats')
ORDER BY tablename, policyname; 