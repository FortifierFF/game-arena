/**
 * Chess Game Types
 */

export type ChessDifficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert' | 'master';

export interface ChessEngineResponse {
  bestMove: string;
  evaluation?: string;
  difficulty: ChessDifficulty;
  depth: number;
  timeLimit: number;
}

export interface ChessGameState {
  fen: string;
  isWhiteTurn: boolean;
  difficulty: ChessDifficulty;
  gameHistory: string[];
  isGameOver: boolean;
  winner?: 'white' | 'black' | 'draw';
  lastMove?: string;
  evaluation?: string;
}

export interface ChessMove {
  from: string;
  to: string;
  piece: string;
  promotion?: string;
  isCapture: boolean;
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
}

export interface ChessPiece {
  type: 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
  color: 'white' | 'black';
  position: string;
  hasMoved: boolean;
} 