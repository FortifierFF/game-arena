/**
 * Login Modal Component
 * 
 * Provides wallet connection options for users to authenticate
 * Supports MetaMask, Phantom, and other Web3 wallets
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { WalletType } from '@/types/auth';
import Icon, { X, AlertCircle } from '@/components/ui/Icon';
import Image from 'next/image';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { connectWallet, walletStatus, isLoading, error } = useAuth();
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Check wallet availability
  const isMetaMaskAvailable = typeof window !== 'undefined' && typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
  const isPhantomAvailable = typeof window !== 'undefined' && typeof window.solana !== 'undefined' && window.solana?.isPhantom;

  // Available wallet options with availability status
  const walletOptions = [
    {
      id: 'metamask' as WalletType,
      name: 'MetaMask',
      description: isMetaMaskAvailable ? 'Connect with your Ethereum wallet' : 'MetaMask not installed',
      image: '/images/metamask.svg',
      color: isMetaMaskAvailable ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-400 cursor-not-allowed',
      available: isMetaMaskAvailable,
      installUrl: 'https://metamask.io/download/',
    },
    {
      id: 'phantom' as WalletType,
      name: 'Phantom',
      description: isPhantomAvailable ? 'Connect with your Solana wallet' : 'Phantom not installed',
      image: '/images/phantom.png',
      color: isPhantomAvailable ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-400 cursor-not-allowed',
      available: isPhantomAvailable,
      installUrl: 'https://phantom.app/',
    },
  ];

  // Handle wallet selection and connection
  const handleWalletConnect = async (walletType: WalletType) => {
    const wallet = walletOptions.find(w => w.id === walletType);
    
    if (!wallet?.available) {
      setWalletError(`${wallet?.name} is not installed. Please install it first.`);
      return;
    }
    
    setSelectedWallet(walletType);
    setWalletError(null); // Clear any previous errors
    
    try {
      await connectWallet(walletType);
      // Close modal on successful connection
      onClose();
    } catch (error) {
      console.error('Wallet connection failed:', error);
      // Show error in modal instead of closing
      setWalletError(error instanceof Error ? error.message : 'Failed to connect wallet');
    }
  };

  // Close modal and reset state
  const handleClose = () => {
    setSelectedWallet(null);
    onClose();
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl transform translate-y-55 animate-fade-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Connect Wallet
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <Icon icon={X} size="lg" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
            Choose your preferred wallet to connect and start playing games
          </p>

          {/* Wallet Options */}
          <div className="space-y-3">
            {walletOptions.map((wallet) => (
              <div key={wallet.id} className="space-y-2">
                <button
                  onClick={() => handleWalletConnect(wallet.id)}
                  disabled={isLoading && selectedWallet === wallet.id || !wallet.available}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedWallet === wallet.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : wallet.available 
                        ? 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        : 'border-gray-300 dark:border-gray-600 opacity-60'
                  } ${(isLoading && selectedWallet === wallet.id) || !wallet.available ? 'cursor-not-allowed' : 'hover:shadow-md'}`}
                >
                                  <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center">
                    <Image
                      src={wallet.image}
                      alt={`${wallet.name} logo`}
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                  </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {wallet.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {wallet.description}
                      </p>
                    </div>
                    {selectedWallet === wallet.id && isLoading && (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent" />
                    )}
                  </div>
                </button>
                
                {/* Install prompt for unavailable wallets */}
                {!wallet.available && (
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {wallet.name} is not installed
                    </span>
                    <a
                      href={wallet.installUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Install {wallet.name}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Wallet-Specific Error Display */}
          {walletError && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon icon={AlertCircle} size="sm" className="text-red-500" />
                <span className="text-sm text-red-700 dark:text-red-400">
                  {walletError}
                </span>
              </div>
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={() => setWalletError(null)}
                  className="text-xs text-red-600 dark:text-red-400 hover:underline"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => setSelectedWallet(null)}
                  className="text-xs text-red-600 dark:text-red-400 hover:underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* General Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon icon={AlertCircle} size="sm" className="text-red-500" />
                <span className="text-sm text-red-700 dark:text-red-400">
                  {error}
                </span>
              </div>
            </div>
          )}

          {/* Status Display */}
          {walletStatus === 'connecting' && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                <span className="text-sm text-blue-700 dark:text-blue-400">
                  Connecting to wallet...
                </span>
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Don&apos;t have a wallet?{' '}
              <a 
                href="https://metamask.io/download/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 underline"
              >
                Get MetaMask
              </a>
              {' '}or{' '}
              <a 
                href="https://phantom.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-500 hover:text-purple-600 underline"
              >
                Get Phantom
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 