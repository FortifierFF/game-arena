/**
 * Games Data
 * 
 * Centralized data for all games and categories
 */

import { GameCategory, Game } from '@/types/game';
import { Gamepad2, Heart, Target } from '@/components/ui/Icon';

// Individual games data
export const games: Game[] = [
  // Board Games
  {
    id: 'chess',
    name: 'chess',
    description: 'chess',
    icon: '♟️',
    players: '2',
    difficulty: 'Hard',
    rating: 4.8,
    image: '/public/images/chess-preview.jpg',
    status: 'available',
    categoryId: 'board-games',
    tags: ['strategy', 'classic', 'competitive'],
    estimatedPlayTime: '10-60',
  },
  {
    id: 'checkers',
    name: 'checkers',
    description: 'checkers',
    icon: '🔴',
    players: '2',
    difficulty: 'Medium',
    rating: 4.5,
    image: '/images/checkers-preview.jpg',
    status: 'available',
    categoryId: 'board-games',
    tags: ['strategy', 'classic', 'simple'],
    estimatedPlayTime: '5-30',
  },

  // Card Games
  {
    id: 'solitaire',
    name: 'solitaire',
    description: 'solitaire',
    icon: '🃏',
    players: '1',
    difficulty: 'Easy',
    rating: 4.2,
    image: '/images/solitaire-preview.jpg',
    status: 'available',
    categoryId: 'card-games',
    tags: ['relaxing', 'single-player', 'puzzle'],
    estimatedPlayTime: '5-20',
  },
  {
    id: 'belot',
    name: 'belot',
    description: 'belot',
    icon: '🃏',
    players: '4',
    difficulty: 'Hard',
    rating: 4.7,
    image: '/images/belot-preview.jpg',
    status: 'coming-soon',
    categoryId: 'card-games',
    tags: ['team', 'competitive', 'traditional'],
    estimatedPlayTime: '20-45',
  },

  // Puzzle Games
  {
    id: 'sudoku',
    name: 'sudoku',
    description: 'sudoku',
    icon: '🔢',
    players: '1',
    difficulty: 'Medium',
    rating: 4.3,
    image: '/images/sudoku-preview.jpg',
    status: 'coming-soon',
    categoryId: 'puzzle-games',
    tags: ['puzzle', 'logic', 'numbers'],
    estimatedPlayTime: '10-30',
  },
];

// Game categories data
export const gameCategories: GameCategory[] = [
  {
    id: 'board-games',
    name: 'boardGames',
    description: 'boardGames',
    icon: Gamepad2,
    games: games.filter(game => game.categoryId === 'board-games'),
    color: 'blue',
  },
  {
    id: 'card-games',
    name: 'cardGames',
    description: 'cardGames',
    icon: Heart,
    games: games.filter(game => game.categoryId === 'card-games'),
    color: 'green',
  },
  {
    id: 'puzzle-games',
    name: 'puzzleGames',
    description: 'puzzleGames',
    icon: Target,
    games: games.filter(game => game.categoryId === 'puzzle-games'),
    color: 'purple',
  },
];

// Utility functions for game data
export const getGameById = (id: string): Game | undefined => {
  return games.find(game => game.id === id);
};

export const getGamesByCategory = (categoryId: string): Game[] => {
  return games.filter(game => game.categoryId === categoryId);
};

export const getAvailableGames = (): Game[] => {
  return games.filter(game => game.status === 'available');
};

export const getComingSoonGames = (): Game[] => {
  return games.filter(game => game.status === 'coming-soon');
};

export const searchGames = (query: string): Game[] => {
  const lowercaseQuery = query.toLowerCase();
  return games.filter(game => 
    game.name.toLowerCase().includes(lowercaseQuery) ||
    game.description.toLowerCase().includes(lowercaseQuery) ||
    game.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}; 