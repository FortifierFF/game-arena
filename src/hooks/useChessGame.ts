/**
 * Chess Game Hook
 * Manages game state and engine communication
 */

'use client';

import { useState, useCallback } from 'react';
import { ChessGameState, ChessDifficulty, ChessEngineResponse } from '@/types/chess';

// Initial FEN for starting position
// FEN = Forsyth-Edwards Notation - describes chess board state
// rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
// Board pieces: r=rook, n=knight, b=bishop, q=queen, k=king, p=pawn
// Uppercase = white pieces, lowercase = black pieces
// / separates rows, 8 = 8 empty squares
// w = white's turn, KQkq = castling rights, - = no en passant, 0 1 = move counters
const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// Interface for move logging
export interface ChessMove {
  from: string;      // Starting square (e.g., "e2")
  to: string;        // Ending square (e.g., "e4")
  piece: string;     // Piece type (e.g., "pawn", "knight")
  notation: string;  // Human-readable notation (e.g., "e2-e4")
  timestamp: Date;   // When the move was made
}

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
  const [moveLog, setMoveLog] = useState<ChessMove[]>([]); // Track all moves

  // Get piece type from FEN character
  const getPieceType = useCallback((fenChar: string): string => {
    const pieceMap: Record<string, string> = {
      'p': 'pawn', 'P': 'pawn',
      'r': 'rook', 'R': 'rook',
      'n': 'knight', 'N': 'knight',
      'b': 'bishop', 'B': 'bishop',
      'q': 'queen', 'Q': 'queen',
      'k': 'king', 'K': 'king'
    };
    return pieceMap[fenChar] || 'unknown';
  }, []);

  // Parse FEN to get piece at specific square
  const getPieceAtSquare = useCallback((fen: string, square: string): string => {
    const parts = fen.split(' ');
    if (!parts[0]) return '';
    
    const boardPart = parts[0];
    const rows = boardPart.split('/');
    const file = square.charCodeAt(0) - 97; // 'a' = 0, 'b' = 1, etc.
    const rankChar = square[1];
    if (!rankChar) return '';
    
    const rank = 8 - parseInt(rankChar);   // '1' = 7, '2' = 6, etc.
    
    if (rank < 0 || rank >= 8 || file < 0 || file >= 8) return '';
    
    const row = rows[rank];
    if (!row) return '';
    
    let col = 0;
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (!char) continue;
      
      if (char >= '1' && char <= '8') {
        col += parseInt(char);
      } else {
        if (col === file) return char;
        col++;
      }
    }
    return '';
  }, []);

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
    // Get piece type from current position
    const piece = getPieceAtSquare(gameState.fen, from);
    const pieceType = getPieceType(piece);
    
    // Create human-readable move notation
    const moveNotation = `${from}-${to}`;
    
    // Create move record
    const newMove: ChessMove = {
      from,
      to,
      piece: pieceType,
      notation: moveNotation,
      timestamp: new Date()
    };

    // Add move to log
    setMoveLog(prev => [...prev, newMove]);

    // TODO: Implement move validation and FEN update
    // For now, just update the turn
    setGameState(prev => ({
      ...prev,
      isWhiteTurn: !prev.isWhiteTurn,
      lastMove: moveNotation,
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
  }, [gameState.fen, gameState.difficulty, gameState.isWhiteTurn, getEngineMove, getPieceAtSquare, getPieceType]);

  // Simple move logging function for external use
  const logMove = useCallback((from: string, to: string, fen: string) => {
    console.log('logMove called:', { from, to, fen });
    
    // Get piece type from the provided FEN
    const piece = getPieceAtSquare(fen, from);
    const pieceType = getPieceType(piece);
    
    console.log('Piece found:', { piece, pieceType });
    
    // Create human-readable move notation
    const moveNotation = `${from}-${to}`;
    
    // Create move record
    const newMove: ChessMove = {
      from,
      to,
      piece: pieceType,
      notation: moveNotation,
      timestamp: new Date()
    };

    console.log('New move created:', newMove);

    // Add move to log
    setMoveLog(prev => {
      const newLog = [...prev, newMove];
      console.log('Updated move log:', newLog);
      return newLog;
    });
    
    // Update the last move in game state
    setGameState(prev => ({
      ...prev,
      lastMove: moveNotation,
    }));
  }, [getPieceAtSquare, getPieceType]);

  // Move logging function that takes piece type directly
  const logMoveWithPiece = useCallback((from: string, to: string, pieceType: string) => {
    console.log('logMoveWithPiece called:', { from, to, pieceType });
    
    // Create human-readable move notation
    const moveNotation = `${from}-${to}`;
    
    // Create move record
    const newMove: ChessMove = {
      from,
      to,
      piece: pieceType,
      notation: moveNotation,
      timestamp: new Date()
    };

    console.log('New move created:', newMove);

    // Add move to log
    setMoveLog(prev => {
      const newLog = [...prev, newMove];
      console.log('Updated move log:', newLog);
      return newLog;
    });
    
    // Update the last move in game state
    setGameState(prev => ({
      ...prev,
      lastMove: moveNotation,
    }));
  }, []);

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
    setMoveLog([]); // Clear move log
    setError(null);
  }, [gameState.difficulty]);

  // Get move log in human-readable format
  const getMoveLog = useCallback(() => {
    return moveLog.map((move, index) => ({
      moveNumber: Math.floor(index / 2) + 1,
      whiteMove: index % 2 === 0 ? move : null,
      blackMove: index % 2 === 1 ? move : null,
    }));
  }, [moveLog]);

  return {
    gameState,
    isLoading,
    error,
    moveLog,
    getMoveLog,
    makeMove,
    logMove,
    logMoveWithPiece,
    changeDifficulty,
    resetGame,
  };
} 