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
  constructor(player1, player2, timeControl) {
    this.id = generateGameId();
    this.player1 = player1;
    this.player2 = player2;
    this.timeControl = timeControl;
    this.chess = new Chess();
    this.status = 'waiting';
    this.currentPlayer = 'white';
    this.moves = [];
    this.playerTimes = {
      white: parseTimeControl(timeControl),
      black: parseTimeControl(timeControl)
    };
    this.startTime = Date.now();
    this.result = null;
    this.winner = null;
    this.loser = null;
    this.player1SocketId = null;
    this.player2SocketId = null;
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

  endGame(result, winner, loser) {
    this.status = 'completed';
    if (result && winner && loser) {
      // New game ending logic
      this.result = result;
      this.winner = winner;
      this.loser = loser;
    } else {
      // Legacy game ending logic (for backward compatibility)
      this.result = this.getGameResult();
    }
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
      result: this.result,
      isCheck: this.chess.isCheck(),
      checkColor: this.chess.isCheck() ? this.chess.turn() : null
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
    
    // Send current queue sizes to the newly authenticated client
    for (const [timeControl, queue] of matchmakingQueue.entries()) {
      socket.emit('queue_update', { timeControl, queueSize: queue.length });
    }
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

    // Notify all clients about the updated queue size
    const queueSize = matchmakingQueue.get(timeControl).length;
    io.emit('queue_update', { timeControl, queueSize });

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

      // Notify all clients about the updated queue size
      const queueSize = queue.length;
      io.emit('queue_update', { timeControl, queueSize });

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
        
        // Notify all clients about the updated queue size
        const queueSize = queue.length;
        io.emit('queue_update', { timeControl, queueSize });
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

      // Check if the game is over after this move
      if (game.chess.isGameOver()) {
        let result, winner, loser;
        
        if (game.chess.isCheckmate()) {
          // The player who just moved won (checkmated opponent)
          result = 'checkmate';
          winner = userId;
          loser = game.player1 === userId ? game.player2 : game.player1;
        } else if (game.chess.isDraw()) {
          result = 'draw';
          winner = null;
          loser = null;
        } else if (game.chess.isStalemate()) {
          result = 'stalemate';
          winner = null;
          loser = null;
        }
        
        if (result) {
          // End the game
          game.endGame(result, winner, loser);
          
          // Get final game state
          const gameState = game.getGameState();
          
          // Send different data to each player
          const player1Socket = io.sockets.sockets.get(game.player1SocketId);
          const player2Socket = io.sockets.sockets.get(game.player2SocketId);
          
          if (player1Socket) {
            const isWinner = game.player1 === winner;
            player1Socket.emit('game_ended', {
              gameId,
              result,
              winner: game.player1,
              loser: game.player2,
              isWinner,
              gameState
            });
          }
          
          if (player2Socket) {
            const isWinner = game.player2 === winner;
            player2Socket.emit('game_ended', {
              gameId,
              result,
              winner: game.player2,
              loser: game.player1,
              isWinner,
              gameState
            });
          }
          
          // Remove game from active games
          games.delete(gameId);
          
          // Fallback: Also emit to the game room in case individual socket emissions failed
          console.log(`🏁 [Game] Emitting fallback game_ended to game room ${gameId}`);
          io.to(`game_${gameId}`).emit('game_ended', {
            gameId,
            result: result,
            winner: winner,
            loser: loser,
            gameState
          });
          
          console.log(`🏁 [Game] Game ${gameId} ended by ${result}. Winner: ${winner}, Loser: ${loser}`);
        }
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
    
    // Update socket IDs when players rejoin (handles reconnections)
    if (game.player1 === userId) {
      game.player1SocketId = socket.id;
      console.log(`🔄 [Game] Updated player1 socket ID for ${userId}: ${socket.id}`);
    } else if (game.player2 === userId) {
      game.player2SocketId = socket.id;
      console.log(`🔄 [Game] Updated player2 socket ID for ${userId}: ${socket.id}`);
    }
    
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
    if (!game || game.status !== 'active') return;

    console.log(`🏳️ [Game] Player ${userId} resigning from game ${gameId}`);
    
    // Determine winner and loser
    const winner = game.player1 === userId ? game.player2 : game.player1;
    const loser = userId;
    
    // End the game with resignation result
    game.endGame('resignation', winner, loser);
    
    // Get final game state
    const gameState = game.getGameState();
    
    console.log(`🏁 [Game] About to emit game_ended event for resignation`);
    console.log(`🏁 [Game] Player1 socket ID: ${game.player1SocketId}`);
    console.log(`🏁 [Game] Player2 socket ID: ${game.player2SocketId}`);
    
    // Send different data to each player
    const player1Socket = io.sockets.sockets.get(game.player1SocketId);
    const player2Socket = io.sockets.sockets.get(game.player2SocketId);
    
    if (player1Socket) {
      const isWinner = game.player1 === winner;
      const eventData = {
        gameId,
        result: 'resignation',
        winner: game.player1,
        loser: game.player2,
        isWinner,
        gameState
      };
      console.log(`🏁 [Game] Emitting to player1 (${game.player1}):`, eventData);
      player1Socket.emit('game_ended', eventData);
    } else {
      console.log(`⚠️ [Game] Player1 socket not found for ID: ${game.player1SocketId}`);
    }
    
    if (player2Socket) {
      const isWinner = game.player2 === winner;
      const eventData = {
        gameId,
        result: 'resignation',
        winner: game.player2,
        loser: game.player1,
        isWinner,
        gameState
      };
      console.log(`🏁 [Game] Emitting to player2 (${game.player2}):`, eventData);
      player2Socket.emit('game_ended', eventData);
    } else {
      console.log(`⚠️ [Game] Player2 socket not found for ID: ${game.player2SocketId}`);
    }
    
    // Remove game from active games
    games.delete(gameId);
    
    // Fallback: Also emit to the game room in case individual socket emissions failed
    console.log(`🏁 [Game] Emitting fallback game_ended to game room ${gameId}`);
    io.to(`game_${gameId}`).emit('game_ended', {
      gameId,
      result: 'resignation',
      winner: winner,
      loser: loser,
      gameState
    });
    
    console.log(`🏁 [Game] Game ${gameId} ended by resignation. Winner: ${winner}, Loser: ${loser}`);
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
          
          // Notify all clients about the updated queue size
          const queueSize = queue.length;
          io.emit('queue_update', { timeControl, queueSize });
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