'use client';

import React, { useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/components/providers/AuthProvider';
import GameEndModal from './GameEndModal';
import GameHeader from './GameHeader';
import ChessBoardWrapper from './ChessBoardWrapper';
import PlayerTimes from './PlayerTimes';
import MoveHistory from './MoveHistory';
import ResignModal from './ResignModal';
import { useChessGameLogic } from '@/hooks/useChessGameLogic';

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
  const { joinGame, makeMove, resign, gameState: socketGameState } = useSocket();
  
  // Use the most up-to-date game state from socket or prop
  const effectiveGameState = socketGameState || gameState;
  
  // Use custom hook for chess game logic
  const {
    gameStatus,
    fen,
    localPlayerTimes,
    showResignModal,
    setShowResignModal,
    onPieceDragBegin,
    onDrop,
    handleSquareClick
  } = useChessGameLogic({ 
    gameState: effectiveGameState, 
    playerColor, 
    onGameEnd,
    onMove: (sourceSquare: string, targetSquare: string) => {
      makeMove(gameId, { from: sourceSquare, to: targetSquare });
    }
  });

  // Join game when component mounts
  useEffect(() => {
    if (gameId) {
      joinGame(gameId);
    }
  }, [gameId, joinGame]);

  // Debug: Log game state changes
  useEffect(() => {
    if (effectiveGameState) {
      console.log('🔄 [Client] Game state updated:', {
        currentPlayer: effectiveGameState.currentPlayer,
        status: effectiveGameState.status,
        movesCount: effectiveGameState.moves?.length || 0
      });
    }
  }, [effectiveGameState]);



  // Handle resignation
  const handleResign = () => {
    resign(gameId);
    setShowResignModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto pt-5">
      {/* Game Header */}
      <GameHeader
        gameId={gameId}
        playerColor={playerColor}
        gameStatus={gameStatus}
        currentPlayer={effectiveGameState?.currentPlayer || 'white'}
        movesCount={effectiveGameState?.moves?.length || 0}
        onResign={() => setShowResignModal(true)}
      />

      {/* Game Board */}
      <ChessBoardWrapper
        fen={fen}
        playerColor={playerColor}
        onPieceDragBegin={onPieceDragBegin}
        onDrop={onDrop}
        onSquareClick={handleSquareClick}
      />
      
      {/* Game Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Player Times */}
        <PlayerTimes
          whiteTime={localPlayerTimes.white}
          blackTime={localPlayerTimes.black}
        />

        {/* Move History */}
        <MoveHistory moves={effectiveGameState?.moves || []} />
      </div>

      {/* Resign Confirmation Modal */}
      <ResignModal
        isOpen={showResignModal}
        onClose={() => setShowResignModal(false)}
        onConfirm={handleResign}
      />

      {/* Game End Modal */}
      <GameEndModal
        isOpen={!!effectiveGameState?.isGameOver}
        onClose={() => {}} // Modal will be handled by parent component
        gameResult={effectiveGameState?.isGameOver ? {
          result: effectiveGameState.result || 'unknown',
          winner: effectiveGameState.winner || null,
          loser: effectiveGameState.loser || null,
          isWinner: effectiveGameState.winner === user?.id || false,
          playerColor: playerColor
        } : null}
      />
    </div>
  );
} 