'use client';

import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { useSocket } from '@/hooks/useSocket';
import { Chessboard } from 'react-chessboard';
import type { Square } from 'chess.js';

interface MultiplayerChessProps {
  gameId: string;
  playerColor: 'white' | 'black';
  onGameEnd: (result: string) => void;
  gameState: {
    id: string;
    fen: string;
    status: string;
    currentPlayer: string;
    moves: Array<{ move: string; fen: string; timestamp: number }>;
    playerTimes: { white: number; black: number };
    isGameOver: boolean;
    result: string | null;
  } | null;
}

export default function MultiplayerChess({ gameId, playerColor, onGameEnd, gameState }: MultiplayerChessProps) {
  const { joinGame, makeMove, resign } = useSocket();
  const [chess] = useState(() => new Chess());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState('waiting');
  const [fen, setFen] = useState(chess.fen());

  useEffect(() => {
    if (gameId) {
      joinGame(gameId);
    }
  }, [gameId, joinGame]);

  useEffect(() => {
    if (gameState) {
      // Update local chess state
      if (gameState.fen && gameState.fen !== chess.fen()) {
        chess.load(gameState.fen);
        setFen(gameState.fen);
      }
      
      // Update game status
      if (gameState.status) {
        setGameStatus(gameState.status);
      }
      
      // Check if game is over
      if (gameState.isGameOver) {
        onGameEnd(gameState.result || 'unknown');
      }
    }
  }, [gameState, chess, onGameEnd]);

  // Drag and drop handlers (similar to single player)
  const onPieceDragBegin = ({ square }: { piece: unknown; square: string | null; isSparePiece: boolean }) => {
    if (!square || !gameState || gameState.isGameOver) return;
    
    const pieceObj = chess.get(square as Square);
    if (!pieceObj) return;
    
    // Only allow dragging pieces of the current player's color
    if (pieceObj.color !== (playerColor === 'white' ? 'w' : 'b')) return;
    
    // Only allow dragging on your turn
    if (gameState.currentPlayer !== playerColor) return;
    
    const legalMoves = chess.moves({ square: square as Square, verbose: true });
    
    // Clear previous highlights
    document.querySelectorAll('.chess-square-highlight').forEach(el => {
      el.classList.remove('chess-square-highlight');
    });
    
    // Highlight the source square (piece being dragged)
    const sourceSquareEl = document.querySelector(`[data-square="${square}"]`);
    if (sourceSquareEl) {
      sourceSquareEl.classList.add('chess-square-highlight');
    }
    
    // Highlight legal move squares
    legalMoves.forEach(move => {
      const targetSquareEl = document.querySelector(`[data-square="${move.to}"]`);
      if (targetSquareEl) {
        targetSquareEl.classList.add('chess-square-highlight');
      }
    });
  };

  const onDrop = ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null; }) => {
    if (!targetSquare || !gameState || gameState.isGameOver) return false;
    
    // Clear all highlights
    document.querySelectorAll('.chess-square-highlight').forEach(el => {
      el.classList.remove('chess-square-highlight');
    });
    
    // Handle same position drop (just clear highlights)
    if (sourceSquare === targetSquare) {
      return false;
    }
    
    // Only allow moving on your turn
    if (gameState.currentPlayer !== playerColor) {
      return false;
    }
    
    // Only allow moving pieces of your color
    const piece = chess.get(sourceSquare as Square);
    if (!piece || piece.color !== (playerColor === 'white' ? 'w' : 'b')) {
      return false;
    }
    
    // Check if the move is legal
    const legalMoves = chess.moves({ square: sourceSquare as Square, verbose: true });
    const isLegalMove = legalMoves.some(move => move.to === targetSquare);
    
    if (!isLegalMove) {
      // Show brief visual feedback for illegal move
      const targetSquareEl = document.querySelector(`[data-square="${targetSquare}"]`);
      if (targetSquareEl) {
        targetSquareEl.classList.add('illegal-move-highlight');
        setTimeout(() => {
          targetSquareEl.classList.remove('illegal-move-highlight');
        }, 500);
      }
      return false;
    }
    
    // Make the move locally first
    const result = chess.move({ from: sourceSquare, to: targetSquare });
    if (result) {
      // Send move to server
      makeMove(gameId, { from: sourceSquare, to: targetSquare });
      
      // Update local FEN (will be overridden by server confirmation)
      setFen(chess.fen());
      
      return true;
    }
    
    return false;
  };

  const handleSquareClick = (square: string) => {
    
    // Check if game is active and it's our turn
    if (gameStatus !== 'active' || !gameState) {
      return;
    }

    // Check if it's our turn
    const isOurTurn = gameState.currentPlayer === playerColor;
    if (!isOurTurn) {
      return;
    }

    if (selectedSquare) {
      
      // Try to make a move
      const move = {
        from: selectedSquare as string,
        to: square as string,
        promotion: 'q' // Always promote to queen for simplicity
      };

      try {
        // Validate move locally first
        const result = chess.move(move);
        if (result) {
          makeMove(gameId, move);
          setSelectedSquare(null);
          // Don't update FEN here - wait for server confirmation
        } else {
          setSelectedSquare(null);
        }
      } catch {
        setSelectedSquare(null);
      }
    } else {
      
      // Select square
      const piece = chess.get(square as Square);
      
      if (piece && piece.color === (playerColor === 'white' ? 'w' : 'b')) {
        setSelectedSquare(square);
      }
    }
    
  };

  const handleResign = () => {
    resign(gameId);
  };

  return (
    <div className="max-w-4xl mx-auto pt-5">
      {/* Game Header */}
      <div className="bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Game #{gameId.slice(0, 8)}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              You play as: <span className="font-semibold capitalize">{playerColor}</span>
            </div>
            <button
              onClick={handleResign}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
            >
              Resign
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
            <div className="font-semibold text-gray-800 dark:text-white capitalize">
              {gameStatus === 'active' 
                ? (gameState?.currentPlayer === playerColor ? 'Your Turn' : 'Opponent\'s Turn')
                : gameStatus
              }
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Current Player</div>
            <div className={`font-semibold capitalize ${
              gameState?.currentPlayer === 'white' 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-800 dark:text-white'
            }`}>
              {gameState?.currentPlayer === 'white' ? 'White' : 'Black'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Moves</div>
            <div className="font-semibold text-gray-800 dark:text-white">
              {gameState?.moves?.length || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className="flex justify-center mb-6">
        <div className="w-150 h-150"> {/* Fixed size container */}
          <Chessboard 
            options={{
              position: fen,
              boardOrientation: playerColor === 'white' ? 'white' : 'black',
              onSquareClick: ({ square }) => {
                handleSquareClick(square);
              },
              onPieceDrag: onPieceDragBegin,
              onPieceDrop: ({ sourceSquare, targetSquare }) => onDrop({ sourceSquare, targetSquare }),
              boardStyle: { borderRadius: 8 }
            }}
          />
        </div>
      </div>
      
      {/* Game Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Player Times */}
        <div className="bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Player Times</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">White:</span>
              <span className="font-mono text-gray-800 dark:text-white">
                {Math.floor((gameState?.playerTimes?.white || 0) / 1000 / 60)}:
                {Math.floor(((gameState?.playerTimes?.white || 0) / 1000) % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Black:</span>
              <span className="font-mono text-gray-800 dark:text-white">
                {Math.floor((gameState?.playerTimes?.black || 0) / 1000 / 60)}:
                {Math.floor(((gameState?.playerTimes?.black || 0) / 1000) % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Move History */}
        <div className="bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Move History</h3>
          <div className="max-h-32 overflow-y-auto">
            {gameState?.moves?.length ? (
              <div className="grid grid-cols-2 gap-2 text-sm">
                {gameState.moves.map((move: { move: string; fen: string; timestamp: number }, index: number) => (
                  <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                    {index + 1}. {move.move}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No moves yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 