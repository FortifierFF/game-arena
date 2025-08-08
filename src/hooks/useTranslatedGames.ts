/**
 * Custom Hook for Translated Games Data
 * 
 * Provides game data with translations applied
 */

'use client';

import { useTranslations } from 'next-intl';
import { GameCategory, Game } from '@/types/game';
import { Gamepad2, Heart, Target } from '@/components/ui/Icon';

export function useTranslatedGames() {
  const t = useTranslations('gameData');
  const tCategories = useTranslations('categories');

  // Individual games data with translation keys
  const games: Game[] = [
    // Board Games
    {
      id: 'chess',
      name: 'chess',
      description: 'chess',
      icon: '♟️',
      players: '2',
      difficulty: 'Hard',
      rating: 4.8,
      image: '/images/chess-preview.jpg',
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

  // Game categories with translated names and descriptions
  const gameCategories: GameCategory[] = [
    {
      id: 'board-games',
      name: tCategories('boardGames.name'),
      description: tCategories('boardGames.description'),
      icon: Gamepad2,
      games: games.filter(game => game.categoryId === 'board-games'),
      color: 'blue',
    },
    {
      id: 'card-games',
      name: tCategories('cardGames.name'),
      description: tCategories('cardGames.description'),
      icon: Heart,
      games: games.filter(game => game.categoryId === 'card-games'),
      color: 'green',
    },
    {
      id: 'puzzle-games',
      name: tCategories('puzzleGames.name'),
      description: tCategories('puzzleGames.description'),
      icon: Target,
      games: games.filter(game => game.categoryId === 'puzzle-games'),
      color: 'purple',
    },
  ];

  // Utility functions for game data
  const getGameById = (id: string): Game | undefined => {
    return games.find(game => game.id === id);
  };

  const getGamesByCategory = (categoryId: string): Game[] => {
    return games.filter(game => game.categoryId === categoryId);
  };

  const getAvailableGames = (): Game[] => {
    return games.filter(game => game.status === 'available');
  };

  const getComingSoonGames = (): Game[] => {
    return games.filter(game => game.status === 'coming-soon');
  };

  const searchGames = (query: string): Game[] => {
    const lowercaseQuery = query.toLowerCase();
    return games.filter(game => 
      t(`${game.name}.name`).toLowerCase().includes(lowercaseQuery) ||
      t(`${game.name}.description`).toLowerCase().includes(lowercaseQuery) ||
      game.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  return {
    games,
    gameCategories,
    getGameById,
    getGamesByCategory,
    getAvailableGames,
    getComingSoonGames,
    searchGames,
  };
} 