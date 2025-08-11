/**
 * Chess Game Hook
 * Manages game state and engine communication
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
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
  
  // Move history for navigation (FEN positions after each move)
  const [fenHistory, setFenHistory] = useState<string[]>([INITIAL_FEN]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0); // Index in fenHistory

  // Worker reference for Stockfish engine
  const workerRef = useRef<Worker | null>(null);

  // Hint state for showing best move
  const [hint, setHint] = useState<{ from: string; to: string; score: number } | null>(null);

  // Initialize FEN history with current game state
  const initializeFenHistory = useCallback(() => {
    setFenHistory([gameState.fen]);
    setCurrentMoveIndex(0);
  }, [gameState.fen]);

  // Initialize FEN history when game state changes
  useEffect(() => {
    if (fenHistory.length === 1 && fenHistory[0] === INITIAL_FEN && gameState.fen !== INITIAL_FEN) {
      initializeFenHistory();
    }
  }, [gameState.fen, fenHistory, initializeFenHistory]);

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
    
    // Get piece type from the provided FEN
    const piece = getPieceAtSquare(fen, from);
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
    setMoveLog(prev => {
      const newLog = [...prev, newMove];
      return newLog;
    });
    
    // Update the last move in game state
    setGameState(prev => ({
      ...prev,
      lastMove: moveNotation,
    }));
  }, [getPieceAtSquare, getPieceType]);

  // Move logging function that takes piece type directly
  const logMoveWithPiece = useCallback((from: string, to: string, pieceType: string, newFen?: string) => {
    
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
    setMoveLog(prev => {
      const newLog = [...prev, newMove];
      return newLog;
    });
    
    // Track FEN history for navigation
    if (newFen) {
      setFenHistory(prev => {
        // Always add the new FEN to the end of history
        const newHistory = [...prev, newFen];
        return newHistory;
      });
      setCurrentMoveIndex(prev => {
        const newIndex = prev + 1;
        return newIndex;
      });
    }
    
    // Update the last move in game state
    setGameState(prev => ({
      ...prev,
      lastMove: moveNotation,
    }));
  }, []);

  // Navigate to previous move
  const goBack = useCallback(() => {
    if (currentMoveIndex > 0) {
      const newIndex = currentMoveIndex - 1;
      setCurrentMoveIndex(newIndex);
      const previousFen = fenHistory[newIndex];
      if (previousFen) {
        setGameState(prev => ({
          ...prev,
          fen: previousFen,
          isWhiteTurn: newIndex % 2 === 0, // Even index = white's turn
        }));
        return previousFen;
      }
    }
    return null;
  }, [currentMoveIndex, fenHistory]);

  // Navigate to next move
  const goForward = useCallback(() => {
    if (currentMoveIndex < fenHistory.length - 1) {
      const newIndex = currentMoveIndex + 1;
      setCurrentMoveIndex(newIndex);
      const nextFen = fenHistory[newIndex];
      if (nextFen) {
        setGameState(prev => ({
          ...prev,
          fen: nextFen,
          isWhiteTurn: newIndex % 2 === 0, // Even index = white's turn
        }));
        return nextFen;
      }
    }
    return null;
  }, [currentMoveIndex, fenHistory]);

  // Check if navigation is possible
  const canGoBack = currentMoveIndex > 0;
  const canGoForward = currentMoveIndex < fenHistory.length - 1;

  // Get current FEN for external use
  const getCurrentFen = useCallback(() => {
    return fenHistory[currentMoveIndex] || INITIAL_FEN;
  }, [currentMoveIndex, fenHistory]);

  // Debug functions to expose internal state
  const getFenHistory = useCallback(() => fenHistory, [fenHistory]);
  const getCurrentMoveIndex = useCallback(() => currentMoveIndex, [currentMoveIndex]);

  // Function to manually add current FEN to history
  const addCurrentFenToHistory = useCallback(() => {
    const currentFen = gameState.fen;
    
    setFenHistory(prev => {
      // Only add if it's not already the last entry
      if (prev.length === 0 || prev[prev.length - 1] !== currentFen) {
        const newHistory = [...prev, currentFen];
        return newHistory;
      }
      return prev;
    });
    
    setCurrentMoveIndex(prev => {
      const newIndex = prev + 1;
      return newIndex;
    });
  }, [gameState.fen]);

  // Get hint (best move) from Stockfish
  const getHint = useCallback(async (): Promise<{ from: string; to: string; score: number } | null> => {
    
    if (!workerRef.current) {
      try {
        workerRef.current = new Worker(new URL('../workers/stockfish.worker.ts', import.meta.url));
      } catch (error) {
        console.error('Failed to create worker:', error);
        return null;
      }
    } else {
      console.log('Using existing worker:', workerRef.current);
    }

    return new Promise((resolve) => {
      const worker = workerRef.current!;
      
      // Set up message handler for this hint request
      const handleMessage = (event: MessageEvent) => {
        const { type, data } = event.data;
        
        if (type === 'bestmove') {
          worker.removeEventListener('message', handleMessage);
          setHint(data); // Store the hint
          resolve(data);
        } else if (type === 'error') {
          worker.removeEventListener('message', handleMessage);
          setHint(null); // Clear hint on error
          resolve(null);
        }
      };

      worker.addEventListener('message', handleMessage);
      
      // Send position to Stockfish
      const message = {
        type: 'analyze',
        fen: gameState.fen,
        depth: 15, // Analyze to depth 15 for good move quality
        time: 1000 // Spend up to 1 second analyzing
      };
      
      console.log('Sending message to worker:', message);
      worker.postMessage(message);
      
      // Set a timeout in case the worker doesn't respond
      setTimeout(() => {
        console.log('Worker timeout - removing message handler');
        worker.removeEventListener('message', handleMessage);
        resolve(null);
      }, 5000); // 5 second timeout
    });
  }, [gameState.fen]);

  // Clear hint when game state changes
  useEffect(() => {
    setHint(null);
  }, [gameState.fen]);

  // Sync board to current position
  const syncBoard = useCallback(() => {
    const currentFen = getCurrentFen();
    setGameState(prev => ({
      ...prev,
      fen: currentFen,
      isWhiteTurn: currentMoveIndex % 2 === 0,
    }));
    return currentFen;
  }, [getCurrentFen, currentMoveIndex]);

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
    setFenHistory([INITIAL_FEN]); // Reset FEN history
    setCurrentMoveIndex(0); // Reset to start
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
    goBack,
    goForward,
    canGoBack,
    canGoForward,
    getCurrentFen,
    syncBoard,
    getFenHistory,
    getCurrentMoveIndex,
    addCurrentFenToHistory,
    hint,
    getHint,
  };
} 