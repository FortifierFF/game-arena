'use client';

/**
 * NavBar Actions Component
 * 
 * Actions area for login button and theme toggle
 */

import Icon, { User } from '@/components/ui/Icon';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { useTranslations } from 'next-intl';

interface NavBarActionsProps {
  className?: string;
  onLoginClick?: (() => void) | undefined;
}

export default function NavBarActions({ className, onLoginClick }: NavBarActionsProps) {
  const t = useTranslations('navigation');
  
  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    }
  };

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <LanguageSwitcher />
      <ThemeToggle />
      <button
        onClick={handleLoginClick}
        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
      >
        <Icon icon={User} size="lg" />
        <span>{t('login')}</span>
      </button>
    </div>
  );
} 