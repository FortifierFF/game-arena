// =============================================================================
// CHESS MULTIPLAYER SERVER - CLEANED & ORGANIZED VERSION
// =============================================================================
// This file handles real-time multiplayer chess games with matchmaking
// All original functionality preserved, just cleaned up and better organized

require('dotenv').config({ path: '.env.local' });
const { createServer } = require('http');
const { Server } = require('socket.io');
const { Chess } = require('chess.js');
const { saveChessGame } = require('./src/lib/chessDatabase');

// =============================================================================
// SERVER SETUP
// =============================================================================
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// =============================================================================
// GLOBAL STATE MANAGEMENT
// =============================================================================
const games = new Map();                    // Active games
const userSessions = new Map();             // User authentication sessions
const matchmakingQueue = new Map();         // Matchmaking queues by time control

// =============================================================================
// CHESS GAME CLASS
// =============================================================================
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
    this.lastMoveTime = Date.now();
    this.result = null;
    this.winner = null;
    this.loser = null;
    this.player1SocketId = null;
    this.player2SocketId = null;
    
    // Database tracking
    this.detailedMoves = [];
    this.player1Color = 'white';
    this.player2Color = 'black';
  }

  start() {
    this.status = 'active';
    this.startTime = Date.now();
    this.lastMoveTime = Date.now();
  }

  makeMove(move, playerId) {
    if (this.status !== 'active') return false;
    
    // Validate it's the player's turn
    const expectedPlayer = this.currentPlayer === 'white' ? this.player1 : this.player2;
    if (playerId !== expectedPlayer) return false;

    try {
      const result = this.chess.move(move);
      if (result) {
        // Record move
        this.moves.push({
          move: result.san,
          fen: this.chess.fen(),
          timestamp: Date.now()
        });

        // Track detailed move data for database
        this.detailedMoves.push({
          moveNumber: Math.floor(this.detailedMoves.length / 2) + 1,
          playerId: playerId,
          fromSquare: result.from,
          toSquare: result.to,
          piece: result.piece,
          moveNotation: result.san,
          isCapture: result.captured !== undefined,
          isCheck: this.chess.isCheck(),
          isCheckmate: this.chess.isCheckmate(),
          timestampMs: Date.now() - this.startTime
        });

        // Update time control
        const now = Date.now();
        const timeSpent = now - this.lastMoveTime;
        this.playerTimes[this.currentPlayer] -= timeSpent;
        this.lastMoveTime = now;

        // Switch players
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';

        // Check if game is over
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
      this.result = result;
      this.winner = winner;
      this.loser = loser;
    } else {
      this.result = this.getGameResult();
    }
  }

  prepareGameDataForDatabase() {
    const gameDuration = Date.now() - this.startTime;
    return {
      gameId: this.id,
      player1Id: this.player1,
      player2Id: this.player2,
      player1Color: this.player1Color,
      player2Color: this.player2Color,
      timeControl: this.timeControl,
      result: this.result,
      winnerId: this.winner,
      loserId: this.loser,
      totalMoves: this.detailedMoves.length,
      gameDurationMs: gameDuration,
      finalFen: this.chess.fen(),
      moves: this.detailedMoves
    };
  }

  getGameState() {
    return {
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
  }

  getGameResult() {
    if (this.chess.isCheckmate()) {
      return this.currentPlayer === 'white' ? 'black' : 'white';
    } else if (this.chess.isDraw() || this.chess.isStalemate()) {
      return 'draw';
    }
    return null;
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================
function generateGameId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function parseTimeControl(timeControl) {
  if (timeControl.includes('+')) {
    const [minutes, increment] = timeControl.split('+').map(Number);
    return ((minutes * 60) + (increment || 0)) * 1000;
  } else {
    const minutes = parseInt(timeControl) || 10;
    return (minutes * 60) * 1000;
  }
}

// =============================================================================
// MATCHMAKING FUNCTIONS
// =============================================================================
function findMatch(userId, timeControl, rating) {
  if (!matchmakingQueue.has(timeControl)) return null;
  
  const queue = matchmakingQueue.get(timeControl);
  return queue.find(player => 
    player.userId !== userId && 
    Math.abs(player.rating - rating) <= 200
  );
}

function removeFromAllQueues(userId) {
  for (const [timeControl, queue] of matchmakingQueue.entries()) {
    const index = queue.findIndex(player => player.userId === userId);
    if (index !== -1) {
      queue.splice(index, 1);
      console.log(`🔄 [Queue] Removed ${userId} from ${timeControl} queue`);
    }
  }
}

function updateQueueSizes() {
  for (const [timeControl, queue] of matchmakingQueue.entries()) {
    io.emit('queue_update', { timeControl, queueSize: queue.length });
  }
}

// =============================================================================
// GAME MANAGEMENT FUNCTIONS
// =============================================================================
function createGame(player1, player2, timeControl) {
  const game = new ChessGame(player1, player2, timeControl);
  games.set(game.id, game);
  game.start();
  return game;
}

function endGame(gameId, result, winner, loser) {
  const game = games.get(gameId);
  if (!game) return;
  
  game.endGame(result, winner, loser);
  const gameState = game.getGameState();
  
  // Save to database
  try {
    const gameData = game.prepareGameDataForDatabase();
    saveChessGame(gameData).catch(error => {
      console.error(`❌ [DB] Error saving game ${gameId}:`, error);
    });
  } catch (error) {
    console.error(`❌ [DB] Error preparing game data:`, error);
  }
  
  // Remove from active games
  games.delete(gameId);
  
  return gameState;
}

function handlePlayerDisconnect(userId) {
  // Remove from matchmaking
  removeFromAllQueues(userId);
  updateQueueSizes();
  
  // Handle active games
  for (const [gameId, game] of games.entries()) {
    if (game.status === 'active' && 
        (game.player1 === userId || game.player2 === userId)) {
      
      const gameDuration = Date.now() - (game.startTime || Date.now());
      
      if (gameDuration > 30000 && game.moves.length < 2) {
        console.log(`⚠️ [Game] Game ${gameId} abandoned due to disconnect`);
        game.status = 'abandoned';
      } else if (game.moves.length >= 2) {
        console.log(`🏁 [Game] Game ${gameId} completed due to disconnect`);
        game.status = 'completed';
        game.result = 'abandoned';
        game.winner = game.player1 === userId ? game.player2 : game.player1;
      } else {
        console.log(`⏳ [Game] Game ${gameId} waiting for reconnection`);
        continue;
      }
      
      endGame(gameId, game.result, game.winner, game.loser);
    }
  }
}

// =============================================================================
// SOCKET EVENT HANDLERS
// =============================================================================
function handleAuthentication(socket, data) {
  const { userId, walletAddress } = data;
  userSessions.set(socket.id, { userId, walletAddress });
  socket.userId = userId;
  socket.walletAddress = walletAddress;
  
  console.log('🔐 User authenticated:', userId);
  socket.emit('authenticated', { userId, walletAddress });
  
  // Send current queue sizes
  updateQueueSizes();
}

function handleJoinQueue(socket, data) {
  const { timeControl, rating } = data;
  const userId = socket.userId;
  
  if (!userId) {
    socket.emit('error', { message: 'Not authenticated' });
    return;
  }

  console.log(`🎯 [Queue] User ${userId} joining ${timeControl} queue`);

  // Remove from existing queues
  removeFromAllQueues(userId);

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
  
  socket.emit('queue_joined', { queueId: generateGameId(), timeControl });
  updateQueueSizes();

  // Try to find a match immediately
  const opponent = findMatch(userId, timeControl, rating || 1200);
  if (opponent) {
    createMatch(userId, opponent, timeControl, socket);
  }
}

function handleLeaveQueue(socket) {
  const userId = socket.userId;
  if (!userId) return;

  console.log(`🚪 [Queue] User ${userId} leaving all queues`);
  removeFromAllQueues(userId);
  updateQueueSizes();
  socket.emit('queue_left');
}

function handleMakeMove(socket, data) {
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

    // Check if game is over
    if (game.chess.isGameOver()) {
      let result, winner, loser;
      
      if (game.chess.isCheckmate()) {
        result = 'checkmate';
        winner = userId;
        loser = game.player1 === userId ? game.player2 : game.player1;
      } else if (game.chess.isDraw() || game.chess.isStalemate()) {
        result = game.chess.isDraw() ? 'draw' : 'stalemate';
        winner = null;
        loser = null;
      }
      
      if (result) {
        endGame(gameId, result, winner, loser);
        
        // Notify players
        const gameState = game.getGameState();
        io.to(`game_${gameId}`).emit('game_ended', {
          gameId,
          result,
          winner,
          loser,
          gameState
        });
      }
    }
  } else {
    socket.emit('error', { message: 'Invalid move' });
  }
}

function handleJoinGame(socket, data) {
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
  
  // Update socket IDs for reconnections
  if (game.player1 === userId) {
    game.player1SocketId = socket.id;
  } else if (game.player2 === userId) {
    game.player2SocketId = socket.id;
  }
  
  // Send current game state
  const gameState = game.getGameState();
  socket.emit('game_joined', { gameId, gameState });
}

function handleResign(socket, data) {
  const { gameId } = data;
  const userId = socket.userId;
  
  if (!userId) return;

  const game = games.get(gameId);
  if (!game || game.status !== 'active') return;

  console.log(`🏳️ [Game] Player ${userId} resigning from game ${gameId}`);
  
  const winner = game.player1 === userId ? game.player2 : game.player1;
  const loser = userId;
  
  const gameState = endGame(gameId, 'resignation', winner, loser);
  
  // Notify players
  io.to(`game_${gameId}`).emit('game_ended', {
    gameId,
    result: 'resignation',
    winner,
    loser,
    gameState
  });
}

function createMatch(player1Id, opponent, timeControl, player1Socket) {
  console.log(`🎮 [Match] Creating game between ${player1Id} and ${opponent.userId}`);
  
  // Remove both players from queue
  const queue = matchmakingQueue.get(timeControl);
  const player1Index = queue.findIndex(p => p.userId === player1Id);
  const player2Index = queue.findIndex(p => p.userId === opponent.userId);
  
  if (player1Index !== -1) queue.splice(player1Index, 1);
  if (player2Index !== -1) queue.splice(player2Index, 1);
  
  updateQueueSizes();

  // Create game
  const game = createGame(player1Id, opponent.userId, timeControl);
  game.player1SocketId = player1Socket.id;
  game.player2SocketId = opponent.socketId;

  // Notify both players
  player1Socket.emit('game_found', { 
    gameId: game.id, 
    opponent: opponent.userId,
    color: 'white'
  });

  const opponentSocket = io.sockets.sockets.get(opponent.socketId);
  if (opponentSocket) {
    opponentSocket.emit('game_found', { 
      gameId: game.id, 
      opponent: player1Id,
      color: 'black'
    });
  }

  console.log(`🎮 [Match] Game ${game.id} created and players notified`);
}

// =============================================================================
// SOCKET CONNECTION HANDLING
// =============================================================================
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // Set up event handlers
  socket.on('authenticate', (data) => handleAuthentication(socket, data));
  socket.on('join_queue', (data) => handleJoinQueue(socket, data));
  socket.on('leave_queue', () => handleLeaveQueue(socket));
  socket.on('make_move', (data) => handleMakeMove(socket, data));
  socket.on('join_game', (data) => handleJoinGame(socket, data));
  socket.on('resign', (data) => handleResign(socket, data));
  socket.on('ping', () => socket.emit('pong'));

  socket.on('disconnect', () => {
    const userId = socket.userId;
    if (userId) {
      console.log(`🔌 [Disconnect] User ${userId} disconnecting`);
      handlePlayerDisconnect(userId);
    }
    userSessions.delete(socket.id);
    console.log('🔌 User disconnected:', socket.id);
  });
});

// =============================================================================
// SERVER STARTUP
// =============================================================================
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.io server running on port ${PORT}`);
  console.log(`📊 Matchmaking queues initialized`);
  console.log(`🎮 Game manager ready`);
});

// Periodic cleanup
setInterval(() => {
  // Clean up old queue entries (older than 5 minutes)
  const now = Date.now();
  for (const [timeControl, queue] of matchmakingQueue.entries()) {
    const initialLength = queue.length;
    const filteredQueue = queue.filter(player => (now - player.timestamp) < 5 * 60 * 1000);
    
    if (filteredQueue.length !== initialLength) {
      matchmakingQueue.set(timeControl, filteredQueue);
      console.log(`🧹 [Queue] Cleaned up ${timeControl} queue: ${initialLength} -> ${filteredQueue.length} players`);
    }
  }
}, 5 * 60 * 1000); // Every 5 minutes 