'use client';

/**
 * NavBar Actions Component
 * 
 * Actions area for login button, user menu, and theme toggle
 */

import Icon, { User, LogOut, Settings } from '@/components/ui/Icon';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/providers/AuthProvider';
import { useState, useEffect, useRef } from 'react';
import LoginModal from '@/components/auth/LoginModal';


interface NavBarActionsProps {
  className?: string;
}

export default function NavBarActions({ className }: NavBarActionsProps) {
  const t = useTranslations('navigation');
  const { user, status, signOut } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);
  
  // Prevent body scroll from being disabled by Radix UI
  useEffect(() => {
    const preventScrollLock = () => {
      if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = 'auto';
      }
    };

    // Check periodically for scroll lock
    const interval = setInterval(preventScrollLock, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <>
      <div className={`flex items-center space-x-4 ${className}`}>
        <LanguageSwitcher />
        <ThemeToggle />
        
        {/* User Authentication */}
        {status === 'authenticated' && user ? (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              <Icon icon={User} size="lg" />
              <span>{user.username || user.wallet_address.slice(0, 6) + '...'}</span>
            </button>
            
            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700 animate-fade-in">
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                >
                  <Icon icon={Settings} size="sm" />
                  <span>Profile</span>
                </button>
                
                <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                >
                  <Icon icon={LogOut} size="sm" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleLoginClick}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
          >
            <Icon icon={User} size="lg" />
            <span>{t('login')}</span>
          </button>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  );
} 