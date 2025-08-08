/**
 * Game Utilities
 * 
 * Utility functions for game-related operations
 */

import { GameStatus, GameDifficulty } from '@/types/game';

/**
 * Get CSS classes for game status badge
 */
export const getStatusColor = (status: GameStatus): string => {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'coming-soon':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'maintenance':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

/**
 * Get CSS classes for difficulty level
 */
export const getDifficultyColor = (difficulty: GameDifficulty): string => {
  switch (difficulty) {
    case 'Easy':
      return 'text-green-600 dark:text-green-400';
    case 'Medium':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'Hard':
      return 'text-red-600 dark:text-red-400';
    case 'Expert':
      return 'text-purple-600 dark:text-purple-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};

/**
 * Get display text for game status
 */
export const getStatusText = (status: GameStatus): string => {
  switch (status) {
    case 'available':
      return 'Available';
    case 'coming-soon':
      return 'Coming Soon';
    case 'maintenance':
      return 'Maintenance';
    default:
      return 'Unknown';
  }
};

/**
 * Get button classes based on game status
 */
export const getGameButtonClasses = (status: GameStatus): string => {
  const baseClasses = 'w-full py-2 px-4 rounded-md font-medium transition-colors duration-200';
  
  switch (status) {
    case 'available':
      return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600`;
    case 'coming-soon':
    case 'maintenance':
      return `${baseClasses} bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed`;
    default:
      return `${baseClasses} bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed`;
  }
};

/**
 * Get button text based on game status
 */
export const getGameButtonText = (status: GameStatus): string => {
  switch (status) {
    case 'available':
      return 'Play Now';
    case 'coming-soon':
      return 'Coming Soon';
    case 'maintenance':
      return 'Under Maintenance';
    default:
      return 'Unavailable';
  }
};

/**
 * Format player count for display
 */
export const formatPlayerCount = (players: string): string => {
  return `${players} player${players !== '1' ? 's' : ''}`;
};

/**
 * Format rating for display
 */
export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

/**
 * Get estimated play time display
 */
export const getPlayTimeDisplay = (estimatedPlayTime?: string): string => {
  return estimatedPlayTime || 'Variable';
};

/**
 * Get tags display string
 */
export const getTagsDisplay = (tags?: string[]): string => {
  if (!tags || tags.length === 0) return '';
  return tags.join(', ');
}; 