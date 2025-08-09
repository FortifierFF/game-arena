/**
 * Chess Game Hook
 * Manages game state and engine communication
 */

'use client';

import { useState, useCallback } from 'react';
import { ChessGameState, ChessDifficulty, ChessEngineResponse } from '@/types/chess';

// Initial FEN for starting position
const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export function useChessGame() {
  const [gameState, setGameState] = useState<ChessGameState>({
    fen: INITIAL_FEN,
    isWhiteTurn: true,
    difficulty: 'medium',
    gameHistory: [],
    isGameOver: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get engine move
  const getEngineMove = useCallback(async (fen: string, difficulty: ChessDifficulty) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chess/engine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fen,
          difficulty,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get engine move');
      }

      const data: ChessEngineResponse = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Engine error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Make a move
  const makeMove = useCallback(async (from: string, to: string) => {
    // TODO: Implement move validation and FEN update
    // For now, just update the turn
    setGameState(prev => ({
      ...prev,
      isWhiteTurn: !prev.isWhiteTurn,
      lastMove: `${from}-${to}`,
    }));

    // If it's now the engine's turn, get engine move
    if (!gameState.isWhiteTurn) {
      const engineResponse = await getEngineMove(gameState.fen, gameState.difficulty);
      if (engineResponse) {
        // TODO: Apply engine move to game state
        setGameState(prev => ({
          ...prev,
          isWhiteTurn: true,
          evaluation: engineResponse.evaluation || '',
        }));
      }
    }
  }, [gameState.fen, gameState.difficulty, gameState.isWhiteTurn, getEngineMove]);

  // Change difficulty
  const changeDifficulty = useCallback((difficulty: ChessDifficulty) => {
    setGameState(prev => ({
      ...prev,
      difficulty,
    }));
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    setGameState({
      fen: INITIAL_FEN,
      isWhiteTurn: true,
      difficulty: gameState.difficulty,
      gameHistory: [],
      isGameOver: false,
    });
    setError(null);
  }, [gameState.difficulty]);

  return {
    gameState,
    isLoading,
    error,
    makeMove,
    changeDifficulty,
    resetGame,
  };
} 