'use client';

/**
 * NavBar Component
 * 
 * Main navigation bar with modular architecture
 */

import NavBarLogo from './NavBarLogo';
import NavBarLinks from './NavBarLinks';
import NavBarActions from './NavBarActions';

interface NavBarProps {
  className?: string;
}

export default function NavBar({ className }: NavBarProps) {
  return (
    <header className={`sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0 ">
            <NavBarLogo />
          </div>

          <div className="hidden md:flex md:items-center md:space-x-8">
            <NavBarLinks />
          </div>

          <div className="hidden md:flex md:items-center">
            <NavBarActions />
          </div>

          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="md:hidden" id="mobile-menu">
          <div className="space-y-1 px-2 pb-3 pt-2">
            <NavBarLinks className="flex-col space-y-4" />
            <NavBarActions className="flex-col space-y-2" />
          </div>
        </div>
      </div>
    </header>
  );
} 