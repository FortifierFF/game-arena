import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// Types
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

interface MatchmakingState {
  isSearching: boolean;
  timeControl: string;
  startTime: number | null;
  queueSize: number;
}

interface GameSocket extends Socket {
  userId?: string;
  walletAddress?: string;
}

export interface GameEndData {
  gameId: string;
  result: string;
  winner: string | null;
  loser: string | null;
  isWinner: boolean; // New field to determine if current player won
  gameState?: GameState;
}

// Socket connection
const SOCKET_URL = process.env['NEXT_PUBLIC_SOCKET_URL'] || 'http://localhost:3001';

// Global callback registry for game events - survives Fast Refresh
let globalGameFoundCallback: ((data: { gameId: string; opponent: string; color: 'white' | 'black' }) => void) | null = null;
let globalGameEndCallback: ((data: GameEndData) => void) | null = null;

export const useSocket = () => {
  const socketRef = useRef<GameSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [matchmakingState, setMatchmakingState] = useState<MatchmakingState>({
    isSearching: false,
    timeControl: '',
    startTime: null,
    queueSize: 0
  });
  const [currentGame, setCurrentGame] = useState<GameState | null>(null);
  
  // Callback system for game events - use global registry
  const gameFoundCallbackRef = useRef<((data: { gameId: string; opponent: string; color: 'white' | 'black' }) => void) | null>(null);
  const gameEndCallbackRef = useRef<((data: GameEndData) => void) | null>(null);

  // Connection persistence
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Function to register game found callback
  const onGameFound = useCallback((callback: (data: { gameId: string; opponent: string; color: 'white' | 'black' }) => void) => {
    gameFoundCallbackRef.current = callback;
    globalGameFoundCallback = callback; // Store in global registry
  }, []);

  // Function to unregister game found callback
  const offGameFound = useCallback(() => {
    gameFoundCallbackRef.current = null;
    globalGameFoundCallback = null; // Clear global registry
  }, []);

  // Persist authentication state across Fast Refresh
  const [authState, setAuthState] = useState<{
    userId: string | null;
    walletAddress: string | null;
  }>(() => {
    // Try to restore from sessionStorage
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('socket_auth');
      return stored ? JSON.parse(stored) : { userId: null, walletAddress: null };
    }
    return { userId: null, walletAddress: null };
  });

  // Initialize socket connection
  useEffect(() => {
    const socket = io(SOCKET_URL) as GameSocket;
    socketRef.current = socket;

    // Socket event listeners
    socket.on('connect', () => {
      setIsConnected(true);
      reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
      
      // Re-authenticate if we have user data
      if (authState.userId && authState.walletAddress) {
        authenticate(authState.userId, authState.walletAddress);
      }
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      
      // Attempt to reconnect unless it's a manual disconnect
      if (reason !== 'io client disconnect' && reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++;
        
        reconnectTimeoutRef.current = setTimeout(() => {
          if (socketRef.current) {
            socketRef.current.connect();
          }
        }, 1000 * reconnectAttemptsRef.current); // Exponential backoff
      }
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    socket.on('authenticated', (data) => {
      socket.userId = data.userId;
      socket.walletAddress = data.walletAddress;
      
      // Save to authState and sessionStorage
      setAuthState({ userId: data.userId, walletAddress: data.walletAddress });
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('socket_auth', JSON.stringify({
          userId: data.userId,
          walletAddress: data.walletAddress
        }));
      }
    });

    socket.on('queue_joined', (data) => {
      setMatchmakingState(prev => ({
        ...prev,
        isSearching: true,
        timeControl: data.timeControl,
        startTime: Date.now(),
        queueSize: 0
      }));
    });

    socket.on('queue_update', (data) => {
      setMatchmakingState(prev => ({
        ...prev,
        queueSize: data.queueSize
      }));
    });

    socket.on('game_found', (data) => {
      setMatchmakingState(prev => ({
        ...prev,
        isSearching: false,
        timeControl: '',
        startTime: null,
        queueSize: 0
      }));
      
      // Don't create local game state - wait for server to send it
      // The server will send the actual game state when players join
      
      // Call the registered callback if it exists
      if (gameFoundCallbackRef.current) {
        gameFoundCallbackRef.current(data);
      } else if (globalGameFoundCallback) {
        globalGameFoundCallback(data);
      }
    });

    socket.on('game_state_update', (gameState: GameState) => {
      setCurrentGame(gameState);
    });

    socket.on('move_made', (data) => {
      if (data.gameState) {
        setCurrentGame(data.gameState);
      }
    });

    socket.on('game_joined', (data) => {
      if (data.gameState) {
        setCurrentGame(data.gameState);
      }
    });

    socket.on('game_ended', (data: GameEndData) => {
      console.log('🏁 [useSocket] Game ended:', data);
      setCurrentGame(null);
      
      // Call the registered callback if it exists
      if (gameEndCallbackRef.current) {
        gameEndCallbackRef.current(data);
      } else if (globalGameEndCallback) {
        globalGameEndCallback(data);
      }
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => {
      // Clear reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      socket.disconnect();
    };
  }, [authState.userId, authState.walletAddress]);

  // Authentication function
  const authenticate = useCallback((userId: string, walletAddress: string) => {
    if (socketRef.current) {
      // Update local state immediately
      setAuthState({ userId, walletAddress });
      
      // Update socket properties
      socketRef.current.userId = userId;
      socketRef.current.walletAddress = walletAddress;
      
      // Send authentication to server
      socketRef.current.emit('authenticate', { userId, walletAddress });
      
      // Store in sessionStorage for persistence
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('socket_auth', JSON.stringify({ userId, walletAddress }));
      }
    } else {
      console.error('❌ [useSocket] Cannot authenticate: socket not ready');
    }
  }, []);

  // Keep-alive ping
  useEffect(() => {
    if (!isConnected || !socketRef.current) return;
    
    const pingInterval = setInterval(() => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('ping');
      }
    }, 30000); // Ping every 30 seconds
    
    return () => clearInterval(pingInterval);
  }, [isConnected]);

  // Join matchmaking queue
  const joinQueue = useCallback((timeControl: string, rating: number = 1200) => {
    if (socketRef.current) {
      // Check if we have authentication
      if (!socketRef.current.userId && !authState.userId) {
        console.error('❌ Cannot join queue: not authenticated');
        return;
      }

      // Restore userId if needed
      if (!socketRef.current.userId && authState.userId) {
        socketRef.current.userId = authState.userId!;
        socketRef.current.walletAddress = authState.walletAddress!;
      }

      socketRef.current.emit('join_queue', { timeControl, rating });
    }
  }, [authState.userId, authState.walletAddress]);

  // Leave matchmaking queue
  const leaveQueue = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('leave_queue');
      
      // Reset local matchmaking state immediately
      setMatchmakingState({
        isSearching: false,
        timeControl: '',
        startTime: null,
        queueSize: 0
      });
    }
  }, []);

  // Join a specific game
  const joinGame = useCallback((gameId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join_game', { gameId });
    }
  }, []);

  // Make a move
  const makeMove = useCallback((gameId: string, move: { from: string; to: string; promotion?: string }) => {
    if (socketRef.current) {
      socketRef.current.emit('make_move', { gameId, move });
    }
  }, []);

  // Resign from a game
  const resign = useCallback((gameId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('resign', { gameId });
    }
  }, []);

  // Return the socket object, ensuring it's always available when it exists
  const socket = socketRef.current;
  
  return {
    socket,
    authenticate,
    joinQueue,
    leaveQueue,
    joinGame,
    makeMove,
    resign,
    isConnected,
    matchmakingState,
    gameState: currentGame,
    onGameFound,
    offGameFound,
    onGameEnd: (callback: (data: GameEndData) => void) => {
      gameEndCallbackRef.current = callback;
      globalGameEndCallback = callback; // Store in global registry
    },
    offGameEnd: () => {
      gameEndCallbackRef.current = null;
      globalGameEndCallback = null; // Clear global registry
    }
  };
}; 