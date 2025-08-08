/**
 * Theme Provider Component
 * 
 * Wraps the next-themes provider with proper configuration
 * for dark/light mode switching
 */

'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

interface ThemeProviderProps {
  children: React.ReactNode;
  [key: string]: React.ReactNode | string | boolean | undefined;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
} 