const { createServer } = require('http');
const { Server } = require('socket.io');
const { Chess } = require('chess.js');

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Game state management
const games = new Map();
const userSessions = new Map();
const matchmakingQueue = new Map(); // Map<timeControl, Array<{userId, socketId, rating, timestamp}>>

// Chess game class
class ChessGame {
  constructor(player1, player2, timeControl = '10+0') {
    this.id = generateGameId();
    this.player1 = player1;
    this.player2 = player2;
    this.player1SocketId = null; // Store socket ID for player 1
    this.player2SocketId = null; // Store socket ID for player 2
    this.chess = new Chess();
    this.status = 'waiting';
    this.currentPlayer = 'white';
    this.startTime = null;
    this.moves = [];
    this.timeControl = timeControl;
    this.playerTimes = {
      white: parseTimeControl(timeControl),
      black: parseTimeControl(timeControl)
    };
    this.lastMoveTime = Date.now();
  }

  start() {
    this.status = 'active'; // Changed from 'in_progress' to 'active' to match client expectations
    this.startTime = Date.now();
    this.lastMoveTime = Date.now();
  }

  makeMove(move, playerId) {
    if (this.status !== 'active') return false; // Changed from 'in_progress' to 'active'
    
    // Validate player turn
    const expectedPlayer = this.currentPlayer === 'white' ? this.player1 : this.player2;
    if (playerId !== expectedPlayer) return false;

    try {
      const result = this.chess.move(move);
      if (result) {
        this.moves.push({
          move: result.san,
          fen: this.chess.fen(),
          timestamp: Date.now()
        });

        // Update time
        const now = Date.now();
        const timeSpent = now - this.lastMoveTime;
        this.playerTimes[this.currentPlayer] -= timeSpent;
        this.lastMoveTime = now;

        // Switch players
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';

        // Check game end conditions
        if (this.chess.isGameOver()) {
          this.status = 'completed';
          this.endGame();
        }

        return true;
      }
    } catch (error) {
      console.error('Invalid move:', error);
    }
    return false;
  }

  endGame() {
    this.status = 'completed';
  }

  getGameState() {
    const gameState = {
      id: this.id,
      fen: this.chess.fen(),
      status: this.status,
      currentPlayer: this.currentPlayer,
      moves: this.moves,
      playerTimes: this.playerTimes,
      isGameOver: this.chess.isGameOver(),
      result: this.chess.isGameOver() ? this.getGameResult() : null
    };
    
    return gameState;
  }

  getGameResult() {
    if (this.chess.isCheckmate()) {
      return this.currentPlayer === 'white' ? 'black' : 'white';
    } else if (this.chess.isDraw()) {
      return 'draw';
    } else if (this.chess.isStalemate()) {
      return 'draw';
    }
    return null;
  }
}

// Utility functions
function generateGameId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function parseTimeControl(timeControl) {
  // Handle different time control formats
  if (timeControl.includes('+')) {
    const [minutes, increment] = timeControl.split('+').map(Number);
    const totalSeconds = (minutes * 60) + (increment || 0);
    return totalSeconds * 1000; // Convert to milliseconds
  } else {
    // Just minutes
    const minutes = parseInt(timeControl) || 10; // Default to 10 minutes
    const totalSeconds = minutes * 60;
    return totalSeconds * 1000; // Convert to milliseconds
  }
}

// Matchmaking logic
function findMatch(userId, timeControl, rating) {
  if (!matchmakingQueue.has(timeControl)) {
    return null;
  }

  const queue = matchmakingQueue.get(timeControl);
  
  // Find a compatible opponent (not the same user)
  const opponent = queue.find(player => 
    player.userId !== userId && 
    Math.abs(player.rating - rating) <= 200
  );

  if (opponent) {
    return opponent;
  }

  return null;
}

// Socket connection handling
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // User authentication
  socket.on('authenticate', (data) => {
    const { userId, walletAddress } = data;
    userSessions.set(socket.id, { userId, walletAddress });
    socket.userId = userId;
    socket.walletAddress = walletAddress;
    console.log('🔐 User authenticated:', userId);
    
    socket.emit('authenticated', { userId, walletAddress });
  });

  // Join matchmaking queue
  socket.on('join_queue', (data) => {
    const { timeControl, rating } = data;
    const userId = socket.userId;
    
    if (!userId) {
      console.error('❌ [Queue] User not authenticated');
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    console.log(`🎯 [Queue] User ${userId} joining ${timeControl} queue with rating ${rating}`);

    // Remove from any existing queue
    for (const [tc, queue] of matchmakingQueue.entries()) {
      const index = queue.findIndex(player => player.userId === userId);
      if (index !== -1) {
        queue.splice(index, 1);
        console.log(`🔄 [Queue] Removed ${userId} from ${tc} queue`);
      }
    }

    // Add to new queue
    if (!matchmakingQueue.has(timeControl)) {
      matchmakingQueue.set(timeControl, []);
    }

    const playerData = {
      userId,
      socketId: socket.id,
      rating: rating || 1200,
      timestamp: Date.now()
    };

    matchmakingQueue.get(timeControl).push(playerData);
    
    console.log(`✅ [Queue] User ${userId} added to ${timeControl} queue`);
    console.log(`📊 [Queue] ${timeControl} queue now has ${matchmakingQueue.get(timeControl).length} players`);

    socket.emit('queue_joined', { queueId: generateGameId(), timeControl });

    // Try to find a match immediately
    const opponent = findMatch(userId, timeControl, rating || 1200);
    
    if (opponent) {
      console.log(`🎮 [Match] Creating game between ${userId} and ${opponent.userId}`);
      
      // Remove both players from queue
      const queue = matchmakingQueue.get(timeControl);
      const player1Index = queue.findIndex(p => p.userId === userId);
      const player2Index = queue.findIndex(p => p.userId === opponent.userId);
      
      if (player1Index !== -1) queue.splice(player1Index, 1);
      if (player2Index !== -1) queue.splice(player2Index, 1);
      
      console.log(`🔄 [Queue] Removed matched players from ${timeControl} queue. Queue now has ${queue.length} players`);

      // Create game
      const game = new ChessGame(userId, opponent.userId, timeControl);
      games.set(game.id, game);
      game.start();
      
      // Store socket IDs for both players in the game
      game.player1SocketId = socket.id;
      game.player2SocketId = opponent.socketId;

      // Notify both players
      socket.emit('game_found', { 
        gameId: game.id, 
        opponent: opponent.userId,
        color: 'white'
      });

      const opponentSocket = io.sockets.sockets.get(opponent.socketId);
      if (opponentSocket) {
        opponentSocket.emit('game_found', { 
          gameId: game.id, 
          opponent: userId,
          color: 'black'
        });
      }

      console.log(`🎮 [Match] Game ${game.id} created and players notified`);
    }
  });

  // Leave matchmaking queue
  socket.on('leave_queue', () => {
    const userId = socket.userId;
    if (!userId) return;

    console.log(`🚪 [Queue] User ${userId} leaving all queues`);

    for (const [timeControl, queue] of matchmakingQueue.entries()) {
      const index = queue.findIndex(player => player.userId === userId);
      if (index !== -1) {
        queue.splice(index, 1);
        console.log(`🔄 [Queue] Removed ${userId} from ${timeControl} queue`);
      }
    }

    socket.emit('queue_left');
  });

  // Make a move
  socket.on('make_move', (data) => {
    const { gameId, move } = data;
    const userId = socket.userId;
    
    if (!userId) return;

    const game = games.get(gameId);
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    if (game.makeMove(move, userId)) {
      io.to(`game_${gameId}`).emit('move_made', {
        gameId,
        move,
        gameState: game.getGameState()
      });

      if (game.status === 'completed') {
        handleGameEnd(game);
      }
    } else {
      socket.emit('error', { message: 'Invalid move' });
    }
  });

  // Join a game room
  socket.on('join_game', (data) => {
    const { gameId } = data;
    const userId = socket.userId;
    
    if (!userId) return;

    const game = games.get(gameId);
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    if (game.player1 !== userId && game.player2 !== userId) {
      socket.emit('error', { message: 'Not authorized to join this game' });
      return;
    }

    socket.join(`game_${gameId}`);
    
    // Send game state immediately
    const gameState = game.getGameState();
    socket.emit('game_joined', { gameId, gameState });
  });

  // Keep-alive ping
  socket.on('ping', () => {
    socket.emit('pong');
  });

  // Resign from a game
  socket.on('resign', (data) => {
    const { gameId } = data;
    const userId = socket.userId;
    
    if (!userId) return;

    const game = games.get(gameId);
    if (!game || game.status !== 'active') return; // Changed from 'in_progress' to 'active'

    if (game.player1 === userId || game.player2 === userId) {
      game.status = 'completed';
      game.result = 'resignation';
      game.winner = game.player1 === userId ? game.player2 : game.player1;
      
      // Emit updated game state to all players
      io.to(`game_${gameId}`).emit('move_made', {
        gameId,
        move: null,
        gameState: game.getGameState()
      });
      
      handleGameEnd(game);
    }
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    const userId = socket.userId;
    if (userId) {
      console.log(`🔌 [Disconnect] User ${userId} disconnecting`);
      
      for (const [timeControl, queue] of matchmakingQueue.entries()) {
        const index = queue.findIndex(player => player.userId === userId);
        if (index !== -1) {
          queue.splice(index, 1);
          console.log(`🔄 [Queue] Removed ${userId} from ${timeControl} queue due to disconnect`);
        }
      }

      for (const [gameId, game] of games.entries()) {
        if (game.status === 'active' && // Changed from 'in_progress' to 'active'
            (game.player1 === userId || game.player2 === userId)) {
          // Only mark as abandoned if game has been active for more than 30 seconds
          // This prevents premature abandonment during brief disconnections
          const gameDuration = Date.now() - (game.startTime || Date.now());
          if (gameDuration > 30000 && game.moves.length < 2) {
            console.log(`⚠️ [Game] Game ${gameId} abandoned due to player disconnect after ${Math.round(gameDuration/1000)}s`);
            game.status = 'abandoned';
          } else if (game.moves.length >= 2) {
            console.log(`🏁 [Game] Game ${gameId} completed due to player disconnect`);
            game.status = 'completed';
            game.result = 'abandoned';
            game.winner = game.player1 === userId ? game.player2 : game.player1;
          } else {
            console.log(`⏳ [Game] Game ${gameId} still active, waiting for reconnection`);
            continue; // Don't end the game yet
          }
          handleGameEnd(game);
        }
      }
    }

    userSessions.delete(socket.id);
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Game end handling
function handleGameEnd(game) {
  const gameState = game.getGameState();
  
  io.to(`game_${game.id}`).emit('game_ended', {
    gameId: game.id,
    result: gameState.result,
    gameState
  });

  console.log(`🏁 [Game] Game ${game.id} ended:`, gameState.result);
}

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.io server running on port ${PORT}`);
  console.log(`📊 Matchmaking queues initialized`);
});