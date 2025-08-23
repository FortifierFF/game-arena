/**
 * Supabase Client Configuration
 * 
 * Handles database connection and authentication for the game platform
 */

import { createClient } from '@supabase/supabase-js';

// Supabase project configuration from environment variables
const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

// Create Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table names for easy reference
export const TABLES = {
  USERS: 'users',
  PROFILES: 'profiles',
  GAMES: 'games',
  GAME_MOVES: 'game_moves',
  USER_STATS: 'user_stats',
} as const;

// Export types for database operations
export type { SupabaseClient } from '@supabase/supabase-js'; 