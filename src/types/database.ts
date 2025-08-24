/**
 * Database Types for Chess Games and Player Statistics
 * 
 * Defines the structure for storing game results, moves, and player performance data
 * Compatible with existing users table structure
 */

// Chess game record in database
export interface ChessGameRecord {
  id: string;                    // Unique game ID
  player1_id: string;           // Player 1 user ID (references users.id)
  player2_id: string;           // Player 2 user ID (references users.id)
  player1_color: 'white' | 'black'; // Color assigned to player 1
  player2_color: 'white' | 'black'; // Color assigned to player 2
  time_control: string;         // Time control (e.g., "10", "5+3")
  game_result: 'checkmate' | 'resignation' | 'draw' | 'stalemate' | 'timeout';
  winner_id: string | null;     // Winner user ID (null for draws)
  loser_id: string | null;      // Loser user ID (null for draws)
  total_moves: number;          // Total moves made in the game
  game_duration_ms: number;     // Total game duration in milliseconds
  final_fen: string;            // Final board position in FEN notation
  created_at: string;           // Game start timestamp
  ended_at: string;             // Game end timestamp
}

// Individual move record
export interface ChessMoveRecord {
  id: string;                   // Unique move ID
  game_id: string;              // Reference to chess game
  move_number: number;          // Move number in the game
  player_id: string;            // Player who made the move (references users.id)
  from_square: string;          // Starting square (e.g., "e2")
  to_square: string;            // Ending square (e.g., "e4")
  piece: string;                // Piece type (e.g., "P" for pawn)
  move_notation: string;        // Algebraic notation (e.g., "e4")
  is_capture: boolean;          // Whether this move captured a piece
  is_check: boolean;            // Whether this move puts opponent in check
  is_checkmate: boolean;        // Whether this move is checkmate
  timestamp_ms: number;         // When the move was made (relative to game start)
}

// Player statistics for chess (extends existing user_stats structure)
export interface ChessPlayerStats {
  id: string;                   // Stats record ID
  user_id: string;              // Reference to user (references users.id)
  total_games: number;          // Total games played
  wins: number;                 // Games won
  losses: number;               // Games lost
  draws: number;                // Games drawn
  current_rating: number;       // Current ELO rating
  highest_rating: number;       // Highest rating achieved
  average_game_duration: number; // Average game duration in minutes
  win_streak: number;           // Current win streak
  best_win_streak: number;      // Best win streak achieved
  games_as_white: number;       // Games played as white
  games_as_black: number;       // Games played as black
  wins_as_white: number;        // Wins as white
  wins_as_black: number;        // Wins as black
  created_at: string;           // Stats creation timestamp
  updated_at: string;           // Last update timestamp
}

// Game result data for database insertion
export interface GameResultData {
  gameId: string;
  player1Id: string;
  player2Id: string;
  player1Color: 'white' | 'black';
  player2Color: 'white' | 'black';
  timeControl: string;
  result: 'checkmate' | 'resignation' | 'draw' | 'stalemate' | 'timeout';
  winnerId: string | null;
  loserId: string | null;
  totalMoves: number;
  gameDurationMs: number;
  finalFen: string;
  moves: Array<{
    moveNumber: number;
    playerId: string;
    fromSquare: string;
    toSquare: string;
    piece: string;
    moveNotation: string;
    isCapture: boolean;
    isCheck: boolean;
    isCheckmate: boolean;
    timestampMs: number;
  }>;
}

// Rating calculation result
export interface RatingUpdate {
  playerId: string;
  oldRating: number;
  newRating: number;
  ratingChange: number;
  gameResult: 'win' | 'loss' | 'draw';
  opponentRating: number;
}

// User profile interface (matches existing users table)
export interface UserProfile {
  id: string;                    // Unique user ID
  wallet_address: string;        // Wallet address (primary identifier)
  wallet_type: string;           // Type of wallet (metamask, phantom, etc.)
  username?: string;             // Display name (optional)
  email?: string;                // Email address (optional)
  phone?: string;                // Phone number (optional)
  bio?: string;                  // User biography (optional)
  country?: string;              // Country (optional)
  timezone?: string;             // Timezone (optional)
  created_at: string;            // Account creation timestamp
  updated_at: string;            // Last profile update timestamp
} 