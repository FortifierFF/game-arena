/**
 * Game-related type definitions for Game Arena
 */

export interface Game {
  id: string;
  name: string;
  description: string;
  type: GameType;
  minPlayers: number;
  maxPlayers: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum GameType {
  CHESS = 'chess',
  CHECKERS = 'checkers',
  SOLITAIRE = 'solitaire',
  BELOT = 'belot',
}

export interface GameState {
  gameId: string;
  currentPlayer: string;
  board: any; // Will be specific to each game type
  moves: GameMove[];
  status: GameStatus;
  winner?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameMove {
  id: string;
  gameId: string;
  playerId: string;
  move: any; // Will be specific to each game type
  timestamp: Date;
}

export enum GameStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
}

export interface Player {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  rating: number;
  gamesPlayed: number;
  gamesWon: number;
  createdAt: Date;
  updatedAt: Date;
} 