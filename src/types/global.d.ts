/**
 * Global TypeScript Declarations
 * 
 * Extends Window interface to include Web3 wallet properties
 */

// Extend Window interface for MetaMask
interface Window {
  ethereum?: {
    isMetaMask: boolean;
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    selectedAddress?: string;
    on: (event: string, callback: (...args: unknown[]) => void) => void;
    removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
  };
  
  // Extend Window interface for Phantom
  solana?: {
    isPhantom: boolean;
    isConnected: boolean;
    publicKey?: {
      toString: () => string;
    };
    connect: () => Promise<{ publicKey: { toString: () => string } }>;
    disconnect: () => Promise<void>;
    on: (event: string, callback: (...args: unknown[]) => void) => void;
    removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
  };
} 