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
    name: 'Chess',
    description: 'The ultimate game of strategy. Challenge players worldwide in classic chess matches.',
    icon: '♟️',
    players: '2',
    difficulty: 'Hard',
    rating: 4.8,
    image: '/images/chess-preview.jpg',
    status: 'available',
    categoryId: 'board-games',
    tags: ['strategy', 'classic', 'competitive'],
    estimatedPlayTime: '10-60 min',
  },
  {
    id: 'checkers',
    name: 'Checkers',
    description: 'Classic checkers with modern twists. Jump, capture, and crown your way to victory.',
    icon: '🔴',
    players: '2',
    difficulty: 'Medium',
    rating: 4.5,
    image: '/images/checkers-preview.jpg',
    status: 'available',
    categoryId: 'board-games',
    tags: ['strategy', 'classic', 'simple'],
    estimatedPlayTime: '5-30 min',
  },

  // Card Games
  {
    id: 'solitaire',
    name: 'Solitaire',
    description: 'Relax and unwind with classic solitaire. Multiple variants available.',
    icon: '🃏',
    players: '1',
    difficulty: 'Easy',
    rating: 4.2,
    image: '/images/solitaire-preview.jpg',
    status: 'available',
    categoryId: 'card-games',
    tags: ['relaxing', 'single-player', 'puzzle'],
    estimatedPlayTime: '5-20 min',
  },
  {
    id: 'belot',
    name: 'Belot',
    description: 'The classic Bulgarian card game. Team up and compete for the highest score.',
    icon: '🃏',
    players: '4',
    difficulty: 'Hard',
    rating: 4.7,
    image: '/images/belot-preview.jpg',
    status: 'coming-soon',
    categoryId: 'card-games',
    tags: ['team', 'competitive', 'traditional'],
    estimatedPlayTime: '20-45 min',
  },

  // Puzzle Games
  {
    id: 'sudoku',
    name: 'Sudoku',
    description: 'Classic number puzzle game. Fill the grid with numbers following the rules.',
    icon: '🔢',
    players: '1',
    difficulty: 'Medium',
    rating: 4.3,
    image: '/images/sudoku-preview.jpg',
    status: 'coming-soon',
    categoryId: 'puzzle-games',
    tags: ['puzzle', 'logic', 'numbers'],
    estimatedPlayTime: '10-30 min',
  },
];

// Game categories data
export const gameCategories: GameCategory[] = [
  {
    id: 'board-games',
    name: 'Board Games',
    description: 'Classic strategy and tactical games',
    icon: Gamepad2,
    games: games.filter(game => game.categoryId === 'board-games'),
    color: 'blue',
  },
  {
    id: 'card-games',
    name: 'Card Games',
    description: 'Traditional and modern card games',
    icon: Heart,
    games: games.filter(game => game.categoryId === 'card-games'),
    color: 'green',
  },
  {
    id: 'puzzle-games',
    name: 'Puzzle Games',
    description: 'Brain teasers and logic puzzles',
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