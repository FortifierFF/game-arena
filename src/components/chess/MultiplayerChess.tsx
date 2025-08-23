'use client';

import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/components/providers/AuthProvider';
import { Chessboard } from 'react-chessboard';
import type { Square } from 'chess.js';
import { Flag } from 'lucide-react';
import GameEndModal from './GameEndModal';

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
    isCheck: boolean;
    checkColor: 'w' | 'b' | null;
    winner: string | null;
    loser: string | null;
  } | null;
}

export default function MultiplayerChess({ gameId, playerColor, onGameEnd, gameState }: MultiplayerChessProps) {
  const { user } = useAuth();
  const { joinGame, makeMove, resign } = useSocket();
  const [chess] = useState(() => new Chess());
  const [gameStatus, setGameStatus] = useState('waiting');
  const [fen, setFen] = useState(chess.fen());
  const [localPlayerTimes, setLocalPlayerTimes] = useState({ white: 0, black: 0 });
  const [showResignModal, setShowResignModal] = useState(false);

  // Real-time countdown timer
  useEffect(() => {
    if (!gameState || gameState.isGameOver) return;

    // Initialize local times from game state (convert milliseconds to seconds)
    if (gameState.playerTimes) {
      setLocalPlayerTimes({
        white: Math.floor(gameState.playerTimes.white / 1000),
        black: Math.floor(gameState.playerTimes.black / 1000)
      });
    }

    // Start countdown timer
    const interval = setInterval(() => {
      setLocalPlayerTimes(prev => {
        const newTimes = { ...prev };
        
        // Only countdown for the current player
        if (gameState.currentPlayer === 'white') {
          newTimes.white = Math.max(0, newTimes.white - 1);
        } else {
          newTimes.black = Math.max(0, newTimes.black - 1);
        }
        
        return newTimes;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState?.currentPlayer, gameState?.isGameOver, gameState?.playerTimes]);

  // Check detection and king highlighting
  useEffect(() => {
    if (!gameState) return;

    // Clear previous check highlights
    document.querySelectorAll('.king-in-check').forEach(el => {
      el.classList.remove('king-in-check');
    });

    // Use the server's check information for perfect synchronization
    if (gameState.isCheck && gameState.checkColor) {
      // Find the king that's in check based on server data
      const kingSquare = findKingSquare(chess, gameState.checkColor);
      
      if (kingSquare) {
        const kingSquareEl = document.querySelector(`[data-square="${kingSquare}"]`);
        if (kingSquareEl) {
          kingSquareEl.classList.add('king-in-check');
        }
      }
    }
  }, [gameState?.isCheck, gameState?.checkColor, chess]);

  // Helper function to find king's square
  const findKingSquare = (chessInstance: Chess, color: 'w' | 'b'): string | null => {
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const square = `${String.fromCharCode(97 + file)}${8 - rank}` as Square;
        const piece = chessInstance.get(square);
        if (piece && piece.type === 'k' && piece.color === color) {
          return square;
        }
      }
    }
    return null;
  };

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
      
      // Update local player times when server sends new times
      if (gameState.playerTimes) {
        setLocalPlayerTimes({
          white: Math.floor(gameState.playerTimes.white / 1000),
          black: Math.floor(gameState.playerTimes.black / 1000)
        });
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
    
    // Clear previous highlights
    document.querySelectorAll('.chess-square-highlight').forEach(el => {
      el.classList.remove('chess-square-highlight');
    });
    
    // Clear check highlights when starting to move
    document.querySelectorAll('.king-in-check').forEach(el => {
      el.classList.remove('king-in-check');
    });
    
    const legalMoves = chess.moves({ square: square as Square, verbose: true });
    
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
    
    // Clear check highlights when move is completed
    document.querySelectorAll('.king-in-check').forEach(el => {
      el.classList.remove('king-in-check');
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
    
    // Try to make the move
    try {
      const move = chess.move({
        from: sourceSquare as Square,
        to: targetSquare as Square,
        promotion: 'q' // Always promote to queen for simplicity
      });

      if (move) {
        setFen(chess.fen());
        makeMove(gameId, { from: sourceSquare, to: targetSquare });
        
        // Server will send updated game state with check information
        // No need for local check highlighting anymore
        
        return true;
      }
    } catch (error) {
      console.error('Invalid move:', error);
    }
    
    return false;
  };

  const handleSquareClick = () => {
    if (!gameState || gameState.isGameOver) return;
    
    // Handle square click logic here if needed
    // For now, just clear any existing highlights
    document.querySelectorAll('.chess-square-highlight').forEach(el => {
      el.classList.remove('chess-square-highlight');
    });
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
              onClick={() => setShowResignModal(true)}
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
              onSquareClick: () => {
                handleSquareClick();
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
                {Math.floor(localPlayerTimes.white / 60)}:
                {(localPlayerTimes.white % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Black:</span>
              <span className="font-mono text-gray-800 dark:text-white">
                {Math.floor(localPlayerTimes.black / 60)}:
                {(localPlayerTimes.black % 60).toString().padStart(2, '0')}
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

      {/* Resign Confirmation Modal */}
      {showResignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md mx-4 border border-gray-200 dark:border-white/20">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                <Flag className="text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Confirm Resignation
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to resign this game? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResignModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    resign(gameId);
                    setShowResignModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                >
                  Resign Game
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game End Modal */}
      <GameEndModal
        isOpen={!!gameState?.isGameOver}
        onClose={() => {}} // Modal will be handled by parent component
        gameResult={gameState?.isGameOver ? {
          result: gameState.result || 'unknown',
          winner: gameState.winner || null,
          loser: gameState.loser || null,
          isWinner: gameState.winner === user?.id || false,
          playerColor: playerColor
        } : null}
      />
    </div>
  );
} 