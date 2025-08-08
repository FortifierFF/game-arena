'use client';

/**
 * NavBar Actions Component
 * 
 * Actions area for login button and future items
 */

import Icon, { User } from '@/components/ui/Icon';

interface NavBarActionsProps {
  className?: string;
  onLoginClick?: (() => void) | undefined;
}

export default function NavBarActions({ className, onLoginClick }: NavBarActionsProps) {
  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    }
  };

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <button
        onClick={handleLoginClick}
        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
      >
        <Icon icon={User} size="lg" />
        <span>Login</span>
      </button>
    </div>
  );
} 