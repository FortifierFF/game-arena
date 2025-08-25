import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useSocket } from '@/hooks/useSocket';
import { Clock, RefreshCw } from 'lucide-react';

interface ActiveGame {
  gameId: string;
  player1: string;
  player2: string;
  player1Color: string;
  player2Color: string;
  timeControl: string;
  currentPlayer: string;
  moves: any[];
  status: string;
  hasGracePeriod: boolean;
  gracePeriodEnds: number | null;
  playerColor: 'white' | 'black';
}

interface ReconnectButtonProps {
  onReconnect: (gameId: string) => void;
}

export default function ReconnectButton({ onReconnect }: ReconnectButtonProps) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [activeGame, setActiveGame] = useState<ActiveGame | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Check for active games when component mounts
  useEffect(() => {
    if (!user?.id) return;

    const checkActiveGames = async () => {
      try {
        console.log('🔍 [ReconnectButton] Checking for active games for user:', user.id);
        
        // Call the server directly on port 3001
        const response = await fetch(`http://localhost:3001/api/chess/active-games?userId=${user.id}`);
        const data = await response.json();
        
        console.log('🔍 [ReconnectButton] Server response:', data);
        
        if (data.success && data.games.length > 0) {
          console.log('✅ [ReconnectButton] Found active game:', data.games[0]);
          setActiveGame(data.games[0]); // Take the first active game
        } else {
          console.log('ℹ️ [ReconnectButton] No active games found');
        }
      } catch (error) {
        console.error('❌ [ReconnectButton] Error checking active games:', error);
      }
    };

    checkActiveGames();
  }, [user?.id]);

  // Countdown timer for grace period
  useEffect(() => {
    if (!activeGame?.hasGracePeriod || !activeGame.gracePeriodEnds) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((activeGame.gracePeriodEnds - now) / 1000));
      
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        // Grace period expired, remove the game
        setActiveGame(null);
        setTimeRemaining(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeGame?.hasGracePeriod, activeGame?.gracePeriodEnds]);

  const handleReconnect = () => {
    if (!activeGame || !socket) return;

    setIsLoading(true);
    
    // Emit reconnection event to server
    socket.emit('reconnect_game', { gameId: activeGame.gameId });
    
    // Call the parent's onReconnect function
    onReconnect(activeGame.gameId);
    
    setIsLoading(false);
  };

  if (!activeGame) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-800 rounded-lg">
            <RefreshCw className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
              Active Game Found
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm">
              You have an ongoing game that you can reconnect to
            </p>
          </div>
        </div>
        
        <div className="text-right">
          {activeGame.hasGracePeriod && timeRemaining !== null && (
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-mono text-yellow-700 dark:text-yellow-300">
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
          
          <button
            onClick={handleReconnect}
            disabled={isLoading}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Reconnecting...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Reconnect to Game
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-yellow-700 dark:text-yellow-300">Game ID:</span>
          <span className="ml-2 font-mono text-yellow-800 dark:text-yellow-200">
            {activeGame.gameId.slice(0, 8)}
          </span>
        </div>
        <div>
          <span className="text-yellow-700 dark:text-yellow-300">Your Color:</span>
          <span className="ml-2 capitalize font-semibold text-yellow-800 dark:text-yellow-200">
            {activeGame.playerColor}
          </span>
        </div>
        <div>
          <span className="text-yellow-700 dark:text-yellow-300">Time Control:</span>
          <span className="ml-2 text-yellow-800 dark:text-yellow-200">
            {activeGame.timeControl}
          </span>
        </div>
        <div>
          <span className="text-yellow-700 dark:text-yellow-300">Moves Made:</span>
          <span className="ml-2 text-yellow-800 dark:text-yellow-200">
            {activeGame.moves.length}
          </span>
        </div>
      </div>
      
      {activeGame.hasGracePeriod && (
        <div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-800/30 rounded-lg">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            ⏰ <strong>Reconnection Grace Period:</strong> You have limited time to reconnect to this game. 
            If you don't reconnect in time, the game will be forfeited.
          </p>
        </div>
      )}
    </div>
  );
} 