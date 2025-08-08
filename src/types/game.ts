/**
 * Game Types
 * 
 * TypeScript interfaces and types for the game system
 */

import { LucideIcon } from 'lucide-react';

// Game status types
export type GameStatus = 'available' | 'coming-soon' | 'maintenance';

// Game difficulty levels
export type GameDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';

// Game categories
export type GameCategoryId = 'board-games' | 'card-games' | 'puzzle-games' | 'strategy-games';

// Individual game interface
export interface Game {
  id: string;
  name: string;
  description: string;
  icon: string;
  players: string;
  difficulty: GameDifficulty;
  rating: number;
  image: string;
  status: GameStatus;
  categoryId: GameCategoryId;
  tags?: string[];
  estimatedPlayTime?: string;
  releaseDate?: string;
}

// Game category interface
export interface GameCategory {
  id: GameCategoryId;
  name: string;
  description: string;
  icon: LucideIcon;
  games: Game[];
  color?: string;
}

// Game card props interface
export interface GameCardProps {
  game: Game;
  onPlay?: ((gameId: string) => void) | undefined;
  className?: string;
}

// Category section props interface
export interface CategorySectionProps {
  category: GameCategory;
  onGameSelect?: ((game: Game) => void) | undefined;
  className?: string;
}

// Games page props interface
export interface GamesPageProps {
  initialCategory?: GameCategoryId;
  onCategoryChange?: ((categoryId: GameCategoryId | 'all') => void) | undefined;
}

// Game filter options
export interface GameFilters {
  category?: GameCategoryId;
  status?: GameStatus;
  difficulty?: GameDifficulty;
  players?: string;
  search?: string;
}

// Game search and filter interface
export interface GameSearchFilters {
  query: string;
  category: GameCategoryId | 'all';
  status: GameStatus | 'all';
  difficulty: GameDifficulty | 'all';
  players: string | 'all';
} 