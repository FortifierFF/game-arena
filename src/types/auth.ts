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

// User statistics
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
  stats: UserStats | null;                 // User game statistics
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