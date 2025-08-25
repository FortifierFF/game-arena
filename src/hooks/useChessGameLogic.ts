import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import type { Square } from 'chess.js';

interface GameState {
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
}

interface UseChessGameLogicProps {
  gameState: GameState | null;
  playerColor: 'white' | 'black';
  onGameEnd: (result: string) => void;
  onMove?: (sourceSquare: string, targetSquare: string) => void;
}

export function useChessGameLogic({ gameState, playerColor, onGameEnd, onMove }: UseChessGameLogicProps) {
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

  // Update game state when server sends updates
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

  // Drag and drop handlers
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
        
        // Call the onMove callback to notify the server
        if (onMove) {
          onMove(sourceSquare, targetSquare);
        }
        
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

  return {
    chess,
    gameStatus,
    fen,
    localPlayerTimes,
    showResignModal,
    setShowResignModal,
    onPieceDragBegin,
    onDrop,
    handleSquareClick
  };
} 