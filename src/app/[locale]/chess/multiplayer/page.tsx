'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useSocket } from '@/hooks/useSocket';
import { Matchmaking, MultiplayerChess } from '@/components/chess';
import Icon, { Users, Trophy } from '@/components/ui/Icon';

export default function MultiplayerChessPage() {
  const { user } = useAuth();
  const { authenticate, onGameFound, joinGame, gameState: socketGameState } = useSocket();
  const [gameState, setGameState] = useState<'matchmaking' | 'playing' | 'gameEnd'>('matchmaking');
  const [gameData, setGameData] = useState<{
    gameId: string;
    opponent: string;
    color: 'white' | 'black';
  } | null>(null);

  // Use ref to store the callback function - this survives Fast Refresh
  const gameFoundCallbackRef = useRef<((data: { gameId: string; opponent: string; color: 'white' | 'black' }) => void) | null>(null);

  // Game found handler - defined once and stored in ref
  const handleGameFound = useCallback((data: { gameId: string; opponent: string; color: 'white' | 'black' }) => {
    // Join the game room on the server to receive game state updates
    joinGame(data.gameId);
    
    setGameData({
      gameId: data.gameId,
      opponent: data.opponent,
      color: data.color
    });
    setGameState('playing');
  }, [joinGame]);

  // Store the callback in ref so it survives Fast Refresh
  useEffect(() => {
    gameFoundCallbackRef.current = handleGameFound;
  }, [handleGameFound]);

  // SYNCHRONOUS CALLBACK REGISTRATION - happens on every render
  if (onGameFound && gameFoundCallbackRef.current) {
    // Register callback immediately - this bypasses useEffect timing issues
    onGameFound(gameFoundCallbackRef.current);
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

  // Test function to manually trigger the callback
  const testCallback = useCallback(() => {
    if (gameFoundCallbackRef.current) {
      console.log('🧪 [Multiplayer Page] Manually testing callback');
      gameFoundCallbackRef.current({
        gameId: 'test-game-123',
        opponent: 'test-opponent',
        color: 'white'
      });
    } else {
      console.log('❌ [Multiplayer Page] No callback available for testing');
    }
  }, []);

  // OLD APPROACH: Remove the socket event listener setup entirely
  // We're not using it anymore since we're reacting to currentGame state

  const handleGameEnd = (result: string) => {
    setGameState('gameEnd');
    // Here you would save game results to database
    console.log('Game ended with result:', result);
  };

  const handleBackToMatchmaking = () => {
    setGameState('matchmaking');
    setGameData(null);
  };

  const handlePlayAgain = () => {
    setGameState('matchmaking');
    setGameData(null);
  };

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
          <div className="mb-4 text-center">
            <button
              onClick={testCallback}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              🧪 Test Callback
            </button>
          </div>
          <Matchmaking />
        </div>
      )}

      {gameState === 'playing' && gameData && (
        <div>
          <MultiplayerChess
            gameId={gameData.gameId}
            playerColor={gameData.color}
            onGameEnd={handleGameEnd}
            gameState={socketGameState} // Pass socket game state, not page game state
          />
        </div>
      )}

      {gameState === 'gameEnd' && (
        <div className="max-w-2xl mx-auto text-center">
          <Icon icon={Trophy} size="2xl" className="text-yellow-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Game Ended
          </h2>
          <div className="space-y-4">
            <button
              onClick={handlePlayAgain}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors duration-200"
            >
              Play Again
            </button>
            <button
              onClick={handleBackToMatchmaking}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors duration-200 ml-4"
            >
              Back to Matchmaking
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 