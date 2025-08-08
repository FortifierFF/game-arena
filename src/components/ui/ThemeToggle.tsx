/**
 * Theme Toggle Component
 * 
 * A button that toggles between light and dark themes
 * using Sun and Moon icons from lucide-react
 */

'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Icon, { Sun, Moon } from '@/components/ui/Icon';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
        aria-label="Toggle theme"
      >
        <Icon icon={Sun} size="sm" />
      </button>
    );
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      <Icon icon={theme === 'dark' ? Sun : Moon} size="sm" />
    </button>
  );
} 