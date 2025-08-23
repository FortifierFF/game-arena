/**
 * Authentication and User Management Types
 * 
 * Defines the structure for users, profiles, and authentication data
 */

// User authentication status
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

// Wallet connection status
export type WalletStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// Supported wallet types
export type WalletType = 'metamask' | 'phantom' | 'walletconnect' | 'other';

// User profile information
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

// Note: User preferences and settings will be added later when needed

// Game-specific metrics interface
export interface GameMetrics {
  chess?: {
    current_rating: number;
    highest_rating: number;
    games_played: number;
    average_game_duration: number;
    favorite_openings: string[];
    win_streak: number;
    best_win_streak: number;
  };
  checkers?: {
    current_rating: number;
    games_played: number;
    average_game_duration: number;
    win_streak: number;
    best_win_streak: number;
  };
  sudoku?: {
    puzzles_completed: number;
    average_completion_time: number;
    difficulty_levels: {
      easy: number;
      medium: number;
      hard: number;
      expert: number;
    };
    best_times: {
      easy: number;
      medium: number;
      hard: number;
      expert: number;
    };
  };
  solitaire?: {
    games_won: number;
    games_played: number;
    best_time: number;
    average_time: number;
    win_streak: number;
    best_win_streak: number;
  };
}

// Game statistics for a specific game
export interface GameStats {
  id: string;                              // Stats record ID
  user_id: string;                         // Reference to user
  game_type: string;                       // Game type (chess, checkers, sudoku, solitaire)
  total_games: number;                     // Total games played
  wins: number;                            // Games won
  losses: number;                          // Games lost
  draws: number;                           // Games drawn (for games that support it)
  game_metrics: GameMetrics;               // Game-specific metrics
  first_played: string;                    // First game timestamp
  last_played: string;                     // Last game timestamp
  created_at: string;                      // Stats creation timestamp
  updated_at: string;                      // Last stats update timestamp
}

// Legacy UserStats interface for backward compatibility
export interface UserStats {
  id: string;                              // Stats record ID
  user_id: string;                         // Reference to user
  total_games: number;                     // Total games played
  wins: number;                            // Games won
  losses: number;                          // Games lost
  draws: number;                           // Games drawn
  current_rating: number;                  // Current ELO rating
  created_at: string;                      // Stats creation timestamp
  updated_at: string;                      // Last stats update timestamp
}

// Authentication context state
export interface AuthContextState {
  user: UserProfile | null;                // Current authenticated user
  profile: UserProfile | null;             // User profile data
  stats: UserStats | null;                 // Legacy user statistics (for backward compatibility)
  gameStats: GameStats[];                  // Game-specific statistics
  status: AuthStatus;                      // Authentication status
  walletStatus: WalletStatus;              // Wallet connection status
  walletType: WalletType | null;           // Connected wallet type
  isLoading: boolean;                      // Loading state
  error: string | null;                    // Error message
}

// Authentication actions
export interface AuthActions {
  connectWallet: (walletType: WalletType) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshUserData: () => Promise<void>;
  signOut: () => Promise<void>;
}

// Complete auth context
export interface AuthContext extends AuthContextState, AuthActions {}

// Wallet connection result
export interface WalletConnectionResult {
  success: boolean;
  walletAddress?: string;
  error?: string;
  walletType?: WalletType;
}

// Profile update result
export interface ProfileUpdateResult {
  success: boolean;
  updatedProfile?: UserProfile;
  error?: string;
} 