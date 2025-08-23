'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useSocket } from '@/hooks/useSocket';
import { Matchmaking, MultiplayerChess } from '@/components/chess';
import GameEndModal from '@/components/chess/GameEndModal';
import Icon, { Users } from '@/components/ui/Icon';

export default function MultiplayerChessPage() {
  const { user } = useAuth();
  const {
    authenticate,
    leaveQueue,
    joinGame,
    gameState: socketGameState,
    onGameFound,
    onGameEnd
  } = useSocket();
  const [gameState, setGameState] = useState<'matchmaking' | 'playing' | 'gameEnd'>('matchmaking');
  const [gameData, setGameData] = useState<{
    gameId: string;
    opponent: string;
    color: 'white' | 'black';
  } | null>(null);
  const [gameEndData, setGameEndData] = useState<{
    result: string;
    winner: string | null;
    loser: string | null;
    isWinner: boolean;
  } | null>(null);

  // Use ref to store the callback function - this survives Fast Refresh
  const gameFoundCallbackRef = useRef<((data: { gameId: string; opponent: string; color: 'white' | 'black' }) => void) | null>(null);
  const gameEndCallbackRef = useRef<((data: { gameId: string; result: string; winner: string | null; loser: string | null; isWinner?: boolean; gameState?: unknown }) => void) | null>(null);

  // Leave matchmaking queue and reset game state
  const handleLeaveQueue = useCallback(() => {
    leaveQueue();
    // Clear any previous game data
    setGameData(null);
    setGameEndData(null);
  }, [leaveQueue]);

  // Handle finding new opponent
  const handleFindNewOpponent = useCallback(() => {
    console.log('🔄 [Multiplayer Page] Find New Opponent clicked!');
    // Reset game state and go back to matchmaking
    setGameEndData(null);
    setGameData(null);
    setGameState('matchmaking');
    console.log('🔄 [Multiplayer Page] Game state reset to matchmaking');
  }, []);

  // Handle going home
  const handleGoHome = useCallback(() => {
    console.log('🏠 [Multiplayer Page] Go Home clicked!');
    // Reset game state and navigate home
    setGameEndData(null);
    setGameData(null);
    setGameState('matchmaking');
    // Navigate to home page
    window.location.href = '/';
    console.log('🏠 [Multiplayer Page] Navigating to home page');
  }, []);

  // Game found handler - defined once and stored in ref
  const handleGameFound = useCallback((data: { gameId: string; opponent: string; color: 'white' | 'black' }) => {
    // Clear any previous game end data
    setGameEndData(null);
    
    // Join the game room on the server to receive game state updates
    joinGame(data.gameId); // This is needed to receive game state updates
    
    setGameData({
      gameId: data.gameId,
      opponent: data.opponent,
      color: data.color
    });
    setGameState('playing');
  }, [joinGame]); // Restored joinGame dependency

  // Game end handler - defined once and stored in ref
  const handleGameEnd = useCallback((data: { gameId: string; result: string; winner: string | null; loser: string | null; isWinner?: boolean; gameState?: unknown }) => {
    console.log('🏁 [Multiplayer Page] Game ended:', data);
    console.log('🏁 [Multiplayer Page] Result:', data.result);
    console.log('🏁 [Multiplayer Page] isWinner:', data.isWinner);
    console.log('🏁 [Multiplayer Page] Winner:', data.winner);
    console.log('🏁 [Multiplayer Page] Loser:', data.loser);
    console.log('🏁 [Multiplayer Page] Full data object:', JSON.stringify(data, null, 2));
    
    // Determine if current player won (handle fallback events from server)
    let isWinner = data.isWinner;
    if (isWinner === undefined && data.winner && user) {
      // Fallback: determine winner based on current user ID
      isWinner = data.winner === user.id;
      console.log('🏁 [Multiplayer Page] Determined isWinner from fallback:', isWinner);
    }
    
    setGameEndData({
      result: data.result,
      winner: data.winner,
      loser: data.loser,
      isWinner: isWinner || false
    });
    
    console.log('🏁 [Multiplayer Page] Set gameEndData:', {
      result: data.result,
      winner: data.winner,
      loser: data.loser,
      isWinner: isWinner || false
    });
    
    // Don't change gameState to 'gameEnd' - keep it as 'playing' so chessboard stays visible
    // setGameState('gameEnd');
  }, [user]);

  // Store the callback in ref so it survives Fast Refresh
  useEffect(() => {
    gameFoundCallbackRef.current = handleGameFound;
  }, [handleGameFound]);

  // Store the callback in ref so it survives Fast Refresh
  useEffect(() => {
    gameEndCallbackRef.current = handleGameEnd;
  }, [handleGameEnd]);

  // SYNCHRONOUS CALLBACK REGISTRATION - happens on every render
  if (onGameFound && gameFoundCallbackRef.current) {
    // Register callback immediately - this bypasses useEffect timing issues
    onGameFound(gameFoundCallbackRef.current);
  }

  // SYNCHRONOUS GAME END CALLBACK REGISTRATION
  if (onGameEnd && gameEndCallbackRef.current) {
    // Register callback immediately - this bypasses useEffect timing issues
    onGameEnd(gameEndCallbackRef.current);
  }

  // Authenticate user with socket when component mounts
  useEffect(() => {
    if (user && user.wallet_address) {
      authenticate(user.id, user.wallet_address);
    }
  }, [user, authenticate]);

  // Monitor gameState changes for debugging
  useEffect(() => {
    console.log('🔄 [Multiplayer Page] gameState changed to:', gameState);
  }, [gameState]);

  // OLD APPROACH: Remove the socket event listener setup entirely
  // We're not using it anymore since we're reacting to currentGame state

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Icon icon={Users} size="2xl" className="text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Authentication Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please connect your wallet to play multiplayer chess
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Header - Only show during matchmaking */}
      {gameState === 'matchmaking' && (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-2">
              Multiplayer Chess
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Challenge players from around the world
            </p>
          </div>
        </div>
      )}

      {/* Game State Management */}
      {gameState === 'matchmaking' && (
        <div className="max-w-2xl mx-auto">
          <Matchmaking />
          <div className="mt-4 text-center">
            <button
              onClick={handleLeaveQueue}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Leave Queue
            </button>
          </div>
        </div>
      )}

      {gameState === 'playing' && gameData && (
        <div>
          <MultiplayerChess
            gameId={gameData.gameId}
            playerColor={gameData.color}
            onGameEnd={(result: string) => {
              // This will be called when the game ends locally
              console.log('Local game end:', result);
            }}
            gameState={socketGameState} // Pass socket game state, not page game state
          />
          
          {/* Show Game End Modal as overlay when game ends */}
          {gameEndData && (
            <GameEndModal
              isOpen={true}
              onClose={() => {
                // Reset game state and go back to matchmaking
                setGameEndData(null);
                setGameData(null);
                setGameState('matchmaking');
              }}
              onFindNewOpponent={handleFindNewOpponent}
              onGoHome={handleGoHome}
              gameResult={{
                result: gameEndData.result,
                winner: gameEndData.winner,
                loser: gameEndData.loser,
                isWinner: gameEndData.isWinner,
                playerColor: gameData.color
              }}
            />
          )}
        </div>
      )}

      {/* Remove the old gameEnd state rendering since we're using the modal overlay */}
    </div>
  );
} 