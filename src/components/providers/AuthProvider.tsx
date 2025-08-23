/**
 * Authentication Provider
 * 
 * Manages user authentication, wallet connections, and user data
 * Provides authentication context to the entire application
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, TABLES } from '@/lib/supabase';
import { 
  type AuthContext as AuthContextType, 
  UserProfile, 
  UserStats, 
  WalletType,
  WalletStatus,
  AuthStatus 
} from '@/types/auth';

// Create authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Note: User preferences will be added later when needed

// Authentication provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Authentication state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [walletStatus, setWalletStatus] = useState<WalletStatus>('disconnected');
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if MetaMask is available
  const isMetaMaskAvailable = useCallback(() => {
    if (typeof window !== 'undefined') {
      return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
    }
    return false;
  }, []);

  // Check if Phantom is available
  const isPhantomAvailable = useCallback(() => {
    if (typeof window !== 'undefined') {
      return typeof window.solana !== 'undefined' && window.solana?.isPhantom;
    }
    return false;
  }, []);

  // Get wallet address from MetaMask
  const getMetaMaskAddress = useCallback(async (): Promise<string | null> => {
    if (!isMetaMaskAvailable()) {
      throw new Error('MetaMask is not available');
    }

    try {
      const ethereum = window.ethereum;
      if (!ethereum) {
        throw new Error('MetaMask not found');
      }

      // Request account access
      const accounts = await ethereum.request({ 
        method: 'eth_requestAccounts' 
      }) as string[];
      
              if (accounts && accounts.length > 0) {
          return accounts[0] || null;
        }
        
        return null;
    } catch (error) {
      console.error('MetaMask connection error:', error);
      throw new Error('Failed to connect to MetaMask');
    }
  }, [isMetaMaskAvailable]);

  // Get wallet address from Phantom
  const getPhantomAddress = useCallback(async (): Promise<string | null> => {
    if (!isPhantomAvailable()) {
      throw new Error('Phantom is not available');
    }

    try {
      const solana = window.solana;
      if (!solana) {
        throw new Error('Phantom not found');
      }

      // Connect to Phantom
      const response = await solana.connect();
      return response.publicKey.toString();
    } catch (error) {
      console.error('Phantom connection error:', error);
      throw new Error('Failed to connect to Phantom');
    }
  }, [isPhantomAvailable]);

  // Connect wallet based on type
  const connectWallet = useCallback(async (walletType: WalletType): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setWalletStatus('connecting');

    try {
      let walletAddress: string | null = null;

      switch (walletType) {
        case 'metamask':
          walletAddress = await getMetaMaskAddress();
          break;
        case 'phantom':
          walletAddress = await getPhantomAddress();
          break;
        default:
          throw new Error(`Unsupported wallet type: ${walletType}`);
      }

      if (!walletAddress) {
        throw new Error('Failed to get wallet address');
      }

      // Set wallet connection state
      setWalletType(walletType);
      setWalletStatus('connected');

      // Check if user exists in database
      await checkAndCreateUser(walletAddress, walletType);

    } catch (error) {
      console.error('Wallet connection error:', error);
      setError(error instanceof Error ? error.message : 'Wallet connection failed');
      setWalletStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, [getMetaMaskAddress, getPhantomAddress]);

  // Check if user exists and create if needed
  const checkAndCreateUser = useCallback(async (walletAddress: string, walletType: WalletType) => {
    try {
      // Check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is expected for new users
        throw fetchError;
      }

      if (existingUser) {
        // User exists, load their data
        await loadUserData(existingUser.id);
      } else {
        // Create new user
        await createNewUser(walletAddress, walletType);
      }
    } catch (error) {
      console.error('Error checking/creating user:', error);
      throw error;
    }
  }, []);

  // Create new user in database
  const createNewUser = useCallback(async (walletAddress: string, walletType: WalletType) => {
    try {
      // Create user record
      const { data: newUser, error: userError } = await supabase
        .from(TABLES.USERS)
        .insert({
          wallet_address: walletAddress,
          wallet_type: walletType,
        })
        .select()
        .single();

      if (userError) throw userError;

      // Create user stats record (don't fail if this doesn't work)
      const { error: statsError } = await supabase
        .from(TABLES.USER_STATS)
        .insert({
          user_id: newUser.id,
          total_games: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          current_rating: 1200, // Starting rating
        });

      if (statsError) {
        console.warn('Failed to create user stats:', statsError);
        // Don't throw error - user creation succeeded, stats can be created later
      }

      // Load the newly created user data
      await loadUserData(newUser.id);

    } catch (error) {
      console.error('Error creating new user:', error);
      throw error;
    }
  }, []);

  // Load user data from database
  const loadUserData = useCallback(async (userId: string) => {
    try {
      // Load user profile
      const { data: userData, error: userError } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Load user stats (handle case where stats might not exist yet)
      const { data: statsData, error: statsError } = await supabase
        .from(TABLES.USER_STATS)
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle no results

      // If no stats exist, create default stats
      let finalStats = statsData;
      if (!statsData && !statsError) {
        const { data: newStats, error: createStatsError } = await supabase
          .from(TABLES.USER_STATS)
          .insert({
            user_id: userId,
            total_games: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            current_rating: 1200,
          })
          .select()
          .single();

        if (createStatsError) {
          console.warn('Failed to create user stats:', createStatsError);
          // Don't throw error, just continue without stats
        } else {
          finalStats = newStats;
        }
      } else if (statsError) {
        console.warn('Error loading user stats:', statsError);
        // Don't throw error, just continue without stats
      }

      // Update state
      setUser(userData);
      setProfile(userData);
      setStats(finalStats);
      setStatus('authenticated');

    } catch (error) {
      console.error('Error loading user data:', error);
      throw error;
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback(async (): Promise<void> => {
    setWalletStatus('disconnected');
    setWalletType(null);
    setUser(null);
    setProfile(null);
    setStats(null);
    setStatus('unauthenticated');
    setError(null);
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<void> => {
    if (!user) throw new Error('No user authenticated');

    setIsLoading(true);
    setError(null);

    try {
      const { data: updatedUser, error } = await supabase
        .from(TABLES.USERS)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setUser(updatedUser);
      setProfile(updatedUser);

    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Refresh user data
  const refreshUserData = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      await loadUserData(user.id);
    } catch (error) {
      console.error('Error refreshing user data:', error);
      setError(error instanceof Error ? error.message : 'Failed to refresh data');
    }
  }, [user, loadUserData]);

  // Sign out user
  const signOut = useCallback(async (): Promise<void> => {
    await disconnectWallet();
  }, [disconnectWallet]);

  // Check for existing wallet connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      try {
        // Check MetaMask
        if (isMetaMaskAvailable()) {
          const ethereum = window.ethereum;
          if (ethereum?.selectedAddress) {
            const address = ethereum.selectedAddress;
            setWalletType('metamask');
            setWalletStatus('connected');
            await checkAndCreateUser(address, 'metamask');
            return;
          }
        }

        // Check Phantom
        if (isPhantomAvailable()) {
          const solana = window.solana;
          if (solana?.isConnected && solana.publicKey) {
            const address = solana.publicKey.toString();
            setWalletType('phantom');
            setWalletStatus('connected');
            await checkAndCreateUser(address, 'phantom');
            return;
          }
        }

        // No existing connection
        setStatus('unauthenticated');
        setWalletStatus('disconnected');

      } catch (error) {
        console.error('Error checking existing connection:', error);
        setStatus('unauthenticated');
        setWalletStatus('disconnected');
      }
    };

    checkExistingConnection();
  }, [isMetaMaskAvailable, isPhantomAvailable, checkAndCreateUser]);

  // Context value
  const contextValue: AuthContextType = {
    user,
    profile,
    stats,
    status,
    walletStatus,
    walletType,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    updateProfile,
    refreshUserData,
    signOut,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use authentication context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export the context for direct usage if needed
export { AuthContext }; 