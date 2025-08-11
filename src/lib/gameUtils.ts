import { GameStatus } from '@/types/game';

export const getGameButtonText = (status: GameStatus): string => {
  switch (status) {
    case 'available':
      return 'playNow';
    case 'coming-soon':
      return 'comingSoon';
    case 'maintenance':
      return 'underMaintenance';
    default:
      return 'unavailable';
  }
};

export const getGameStatusClass = (status: GameStatus): string => {
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

export const getDifficultyClass = (difficulty: string): string => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2';
    case 'hard':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2';
    case 'expert':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 px-2';
  }
};

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

export const formatPlayerCount = (players: string): string => {
  return `${players} player${players !== '1' ? 's' : ''}`;
};

export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

export const getPlayTimeDisplay = (estimatedPlayTime?: string): string => {
  return estimatedPlayTime || 'Variable';
};

export const getTagsDisplay = (tags?: string[]): string => {
  if (!tags || tags.length === 0) return '';
  return tags.join(', ');
}; 

export function isSquareDark(square: string): boolean {
  if (!square || square.length !== 2) return false;
  
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0); 
  const rankChar = square[1];
  if (!rankChar) return false;
  
  const rank = parseInt(rankChar) - 1; 

  return (file + rank) % 2 === 0;
}

export function getSquareColor(square: string): 'w' | 'b' {
  return isSquareDark(square) ? 'b' : 'w';
} 