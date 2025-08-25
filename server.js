// =============================================================================
// CHESS MULTIPLAYER SERVER - CLEANED & ORGANIZED VERSION
// =============================================================================
// This file handles real-time multiplayer chess games with matchmaking
// All original functionality preserved, just cleaned up and better organized

require('dotenv').config({ path: '.env.local' });
const { createServer } = require('http');
const { Server } = require('socket.io');
const { Chess } = require('chess.js');
// Import database functions
const { saveChessGame, createActiveChessGame, getActiveChessGames, updateActiveChessGame, updatePlayerStats } = require('./src/lib/chessDatabase');

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

// Reconnection tracking
const reconnectionGracePeriods = new Map(); // Map<gameId, {playerId, timestamp, timeoutId}>
const RECONNECTION_GRACE_PERIOD = 30000; // 30 seconds

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
async function createGame(player1, player2, timeControl) {
  const game = new ChessGame(player1, player2, timeControl);
  
  // Fetch player stats before starting the game
  try {
    const { getPlayerStats } = require('./src/lib/chessDatabase');
    
    // Fetch stats for both players
    const [player1Stats, player2Stats] = await Promise.all([
      getPlayerStats(player1),
      getPlayerStats(player2)
    ]);
    
    // Store stats in the game object for later use
    game.player1Stats = player1Stats || {
      total_games: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      current_rating: 1200,
      highest_rating: 1200,
      win_streak: 0,
      best_win_streak: 0,
      games_as_white: 0,
      games_as_black: 0,
      wins_as_white: 0,
      wins_as_black: 0
    };
    
    game.player2Stats = player2Stats || {
      total_games: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      current_rating: 1200,
      highest_rating: 1200,
      win_streak: 0,
      best_win_streak: 0,
      games_as_white: 0,
      games_as_black: 0,
      wins_as_white: 0,
      wins_as_black: 0
    };
    
  } catch (error) {
    // Set default stats if fetch fails
    game.player1Stats = { total_games: 0, wins: 0, losses: 0, draws: 0, current_rating: 1200, highest_rating: 1200, win_streak: 0, best_win_streak: 0, games_as_white: 0, games_as_black: 0, wins_as_white: 0, wins_as_black: 0 };
    game.player2Stats = { total_games: 0, wins: 0, losses: 0, draws: 0, current_rating: 1200, highest_rating: 1200, win_streak: 0, best_win_streak: 0, games_as_white: 0, games_as_black: 0, wins_as_white: 0, wins_as_black: 0 };
  }
  
  games.set(game.id, game);
  game.start();
  
  // Save the game to database as active
  try {
    await createActiveChessGame({
      gameId: game.id,
      player1Id: player1,
      player2Id: player2,
      player1Color: 'white',
      player2Color: 'black',
      timeControl: timeControl
    });
  } catch (error) {
    console.error(`❌ [DB] Failed to save active game ${game.id}:`, error);
  }
  
  return game;
}

async function endGame(gameId, result, winner, loser) {
  const game = games.get(gameId);
  if (!game) return;
  
  game.endGame(result, winner, loser);
  const gameState = game.getGameState();
  
  // Update the database record from 'in_progress' to final result
  try {
    // First update the existing record
    await updateActiveChessGame(gameId, {
      gameResult: result,
      winnerId: winner,
      loserId: loser,
      totalMoves: game.detailedMoves.length,
      finalFen: game.chess.fen(),
      gameDurationMs: Date.now() - game.startTime
    });
    
    // Now update player statistics
    await updatePlayerStats({
      gameId: gameId,
      winnerId: winner,
      loserId: loser,
      player1Color: game.player1Color,
      player2Color: game.player2Color,
      gameDurationMs: Date.now() - game.startTime,
      winnerStats: game.player1 === winner ? game.player1Stats : game.player2Stats,
      loserStats: game.player1 === loser ? game.player1Stats : game.player2Stats
    });
    
  } catch (error) {
    console.error(`❌ [DB] Error updating game ${gameId} in database:`, error);
    // Don't try to save as new record - the game already exists
    console.error(`❌ [DB] Game ${gameId} update failed - not creating duplicate record`);
  }
  
  // Remove from active games
  games.delete(gameId);
  
  return gameState;
}

async function handlePlayerDisconnect(userId) {
  console.log(`🔌 [Disconnect] Handling disconnect for user: ${userId}`);
  
  // Remove from matchmaking
  removeFromAllQueues(userId);
  updateQueueSizes();
  
  // Handle active games
  for (const [gameId, game] of games.entries()) {
    if (game.status === 'active' && 
        (game.player1 === userId || game.player2 === userId)) {
      
      const gameDuration = Date.now() - (game.startTime || Date.now());
      const movesCount = game.moves.length;
      
      console.log(`🎮 [Disconnect] Game ${gameId}: moves=${movesCount}, duration=${gameDuration}ms`);
      
      // Only start grace period for very new games (< 2 moves and < 30 seconds)
      // This prevents grace period from triggering during normal gameplay
      if (movesCount < 2 && gameDuration < 30000) {
        console.log(`⏳ [Game] Game ${gameId} waiting for reconnection - moves: ${movesCount}, duration: ${gameDuration}ms`);
        startReconnectionGracePeriod(gameId, userId, game);
        continue;
      }
      
      // For games with moves or longer duration, don't end them immediately
      // Just log the disconnect and let the game continue
      if (movesCount >= 2 || gameDuration >= 30000) {
        console.log(`⚠️ [Game] Game ${gameId} - Player ${userId} disconnected but game continues (moves: ${movesCount}, duration: ${gameDuration}ms)`);
        // Don't end the game - let the other player continue or wait
        // The game will only end if the other player also disconnects
        continue;
      }
    }
  }
}

// =============================================================================
// RECONNECTION FUNCTIONS
// =============================================================================
function startReconnectionGracePeriod(gameId, playerId, game) {
  console.log(`⏰ [Reconnect] Starting grace period for player ${playerId} in game ${gameId}`);
  
  // Clear any existing grace period for this game
  if (reconnectionGracePeriods.has(gameId)) {
    clearTimeout(reconnectionGracePeriods.get(gameId).timeoutId);
  }
  
  const timeoutId = setTimeout(() => {
    handleReconnectionTimeout(gameId, playerId, game);
  }, RECONNECTION_GRACE_PERIOD);
  
  reconnectionGracePeriods.set(gameId, {
    playerId,
    timestamp: Date.now(),
    timeoutId
  });
  
  // Notify the remaining player about the grace period
  const remainingPlayerId = game.player1 === playerId ? game.player2 : game.player1;
  const remainingPlayerSocketId = game.player1 === playerId ? game.player2SocketId : game.player1SocketId;
  
  if (remainingPlayerSocketId) {
    const remainingPlayerSocket = io.sockets.sockets.get(remainingPlayerSocketId);
    if (remainingPlayerSocket) {
      remainingPlayerSocket.emit('opponent_reconnecting', {
        gameId,
        gracePeriod: RECONNECTION_GRACE_PERIOD / 1000
      });
    }
  }
}

async function handleReconnectionTimeout(gameId, playerId, game) {
  console.log(`⏰ [Reconnect] Grace period expired for player ${playerId} in game ${gameId}`);
  
  // Remove from grace period tracking
  reconnectionGracePeriods.delete(gameId);
  
  // Determine winner and loser
  const winner = game.player1 === playerId ? game.player2 : game.player1;
  const loser = playerId;
  
  // End the game with abandonment result
  const gameState = await endGame(gameId, 'abandonment', winner, loser);
  
  // Notify remaining player about the abandonment
  const remainingPlayerSocketId = game.player1 === playerId ? game.player2SocketId : game.player1SocketId;
  
  if (remainingPlayerSocketId) {
    const remainingPlayerSocket = io.sockets.sockets.get(remainingPlayerSocketId);
    if (remainingPlayerSocket) {
      remainingPlayerSocket.emit('game_ended', {
        gameId,
        result: 'abandonment',
        winner,
        loser,
        gameState
      });
    }
  }
  
  console.log(`🏁 [Reconnect] Game ${gameId} ended due to abandonment. Winner: ${winner}, Loser: ${loser}`);
}

async function handlePlayerReconnect(socket, gameId) {
  const userId = socket.userId;
  if (!userId) return;
  
  const game = games.get(gameId);
  if (!game) {
    socket.emit('error', { message: 'Game not found' });
    return;
  }
  
  // Check if player is actually in this game
  if (game.player1 !== userId && game.player2 !== userId) {
    socket.emit('error', { message: 'Not authorized to join this game' });
    return;
  }
  
  // Check if there's an active grace period for this game
  if (reconnectionGracePeriods.has(gameId)) {
    console.log(`✅ [Reconnect] Player ${userId} reconnected to game ${gameId} within grace period`);
    
    // Clear the grace period
    const gracePeriod = reconnectionGracePeriods.get(gameId);
    clearTimeout(gracePeriod.timeoutId);
    reconnectionGracePeriods.delete(gameId);
    
    // Update socket ID for the reconnected player
    if (game.player1 === userId) {
      game.player1SocketId = socket.id;
    } else if (game.player2 === userId) {
      game.player2SocketId = socket.id;
    }
    
    // Join the game room
    socket.join(`game_${gameId}`);
    
    // Send current game state
    const gameState = game.getGameState();
    socket.emit('game_reconnected', { gameId, gameState });
    
    // Notify the other player that opponent has reconnected
    const otherPlayerSocketId = game.player1 === userId ? game.player2SocketId : game.player1SocketId;
    if (otherPlayerSocketId) {
      const otherPlayerSocket = io.sockets.sockets.get(otherPlayerSocketId);
      if (otherPlayerSocket) {
        otherPlayerSocket.emit('opponent_reconnected', { gameId });
      }
    }
    
    return true;
  } else {
    socket.emit('error', { message: 'No active reconnection period for this game' });
    return false;
  }
}

// Function to get active games for a player (for API endpoint)
async function getActiveGamesForPlayer(userId) {
  console.log(`🔍 [getActiveGamesForPlayer] Checking for user: ${userId}`);
  console.log(`🔍 [getActiveGamesForPlayer] Total games in memory: ${games.size}`);
  console.log(`🔍 [getActiveGamesForPlayer] Reconnection grace periods: ${reconnectionGracePeriods.size}`);
  
  try {
    // First, check in-memory games that are in grace period (these are the most important)
    const activeGames = [];
    
    for (const [gameId, game] of games.entries()) {
      if ((game.player1 === userId || game.player2 === userId)) {
        const hasGracePeriod = reconnectionGracePeriods.has(gameId);
        const gracePeriodData = hasGracePeriod ? reconnectionGracePeriods.get(gameId) : null;
        
        console.log(`🔍 [getActiveGamesForPlayer] Checking game ${gameId}: status=${game.status}, hasGracePeriod=${hasGracePeriod}`);
        
        // Include games that are active OR have a grace period
        if (game.status === 'active' || hasGracePeriod) {
          console.log(`🔍 [getActiveGamesForPlayer] Including game ${gameId} in active games`);
          activeGames.push({
            gameId: game.id,
            player1: game.player1,
            player2: game.player2,
            player1Color: game.player1Color,
            player2Color: game.player2Color,
            timeControl: game.timeControl,
            currentPlayer: game.currentPlayer,
            moves: game.moves,
            status: hasGracePeriod ? 'in_progress' : game.status,
            hasGracePeriod,
            gracePeriodEnds: hasGracePeriod ? gracePeriodData.timestamp + RECONNECTION_GRACE_PERIOD : null,
            playerColor: game.player1 === userId ? 'white' : 'black'
          });
        }
      }
    }
    
    // Then check database for any additional active games
    const dbActiveGames = await getActiveChessGames(userId);
    console.log(`🔍 [getActiveGamesForPlayer] Database active games:`, dbActiveGames);
    
    // Add database games that aren't already in our list
    for (const dbGame of dbActiveGames) {
      if (!activeGames.some(ag => ag.gameId === dbGame.id) && dbGame.game_result === 'in_progress') {
        console.log(`🔍 [getActiveGamesForPlayer] Adding database game ${dbGame.id}`);
        activeGames.push({
          gameId: dbGame.id,
          player1: dbGame.player1_id,
          player2: dbGame.player2_id,
          player1Color: dbGame.player1_color,
          player2Color: dbGame.player2_color,
          timeControl: dbGame.time_control,
          currentPlayer: 'white', // Default, will be updated by server game if exists
          moves: [],
          status: dbGame.game_result,
          hasGracePeriod: false,
          gracePeriodEnds: null,
          playerColor: dbGame.player1_id === userId ? 'white' : 'black'
        });
      }
    }
    
    console.log(`🔍 [getActiveGamesForPlayer] Returning ${activeGames.length} active games for user ${userId}`);
    return activeGames;
    
  } catch (error) {
    console.error(`❌ [getActiveGamesForPlayer] Error getting active games:`, error);
    return [];
  }
}

// =============================================================================
// SOCKET EVENT HANDLERS
// =============================================================================
function handleAuthentication(socket, data) {
  const { userId, walletAddress } = data;
  
  // Only allow one socket per user - but don't aggressively close others
  const existingSockets = Array.from(io.sockets.sockets.values())
    .filter(s => s.userId === userId && s.id !== socket.id);
  
  if (existingSockets.length > 0) {
    console.log(`🔐 [Auth] User ${userId} has ${existingSockets.length} other sockets - this is normal`);
    // Don't close old sockets - let them disconnect naturally
  }
  
  userSessions.set(socket.id, { userId, walletAddress });
  socket.userId = userId;
  socket.walletAddress = walletAddress;
  
  console.log(`🔐 User authenticated: ${userId} (socket: ${socket.id})`);
  socket.emit('authenticated', { userId, walletAddress });
  
  // Send current queue sizes
  updateQueueSizes();
}

async function handleJoinQueue(socket, data) {
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
    await createMatch(userId, opponent, timeControl, socket);
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

async function handleMakeMove(socket, data) {
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
        await endGame(gameId, result, winner, loser);
    
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

async function handleResign(socket, data) {
  const { gameId } = data;
  const userId = socket.userId;
  
  if (!userId) return;

  const game = games.get(gameId);
  if (!game || game.status !== 'active') return;

  console.log(`🏳️ [Game] Player ${userId} resigning from game ${gameId}`);
  
  const winner = game.player1 === userId ? game.player2 : game.player1;
  const loser = userId;
  
  const gameState = await endGame(gameId, 'resignation', winner, loser);
  
  // Notify players
  io.to(`game_${gameId}`).emit('game_ended', {
    gameId,
    result: 'resignation',
    winner,
    loser,
    gameState
  });
}

async function createMatch(player1Id, opponent, timeControl, player1Socket) {
  console.log(`🎮 [Match] Creating game between ${player1Id} and ${opponent.userId}`);
  
  // Remove both players from queue
  const queue = matchmakingQueue.get(timeControl);
  const player1Index = queue.findIndex(p => p.userId === player1Id);
  const player2Index = queue.findIndex(p => p.userId === opponent.userId);
  
  if (player1Index !== -1) queue.splice(player1Index, 1);
  if (player2Index !== -1) queue.splice(player2Index, 1);
  
  updateQueueSizes();

  // Create game
  const game = await createGame(player1Id, opponent.userId, timeControl);
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
  socket.on('join_queue', async (data) => await handleJoinQueue(socket, data));
  socket.on('leave_queue', () => handleLeaveQueue(socket));
  socket.on('make_move', async (data) => await handleMakeMove(socket, data));
  socket.on('join_game', async (data) => await handleJoinGame(socket, data));
  socket.on('resign', async (data) => await handleResign(socket, data));
  socket.on('reconnect_game', async (data) => await handlePlayerReconnect(socket, data.gameId));
  socket.on('ping', () => socket.emit('pong'));

  socket.on('disconnect', async () => {
    const userId = socket.userId;
    if (userId) {
      console.log(`🔌 [Disconnect] User ${userId} disconnecting from socket ${socket.id}`);
      
      // Simple approach: only handle disconnect if user has no other sockets
      const remainingSockets = Array.from(io.sockets.sockets.values())
        .filter(s => s.userId === userId);
      
      if (remainingSockets.length === 0) {
        console.log(`🔌 [Disconnect] No more sockets for user ${userId}, handling disconnect`);
        // Add delay to prevent false disconnections
        setTimeout(async () => {
          await handlePlayerDisconnect(userId);
        }, 3000); // 3 seconds delay
      } else {
        console.log(`🔌 [Disconnect] User ${userId} still has ${remainingSockets.length} active sockets`);
      }
    }
    userSessions.delete(socket.id);
    console.log('🔌 User disconnected:', socket.id);
  });
});

// =============================================================================
// HTTP ENDPOINTS FOR API ACCESS
// =============================================================================
// Add HTTP endpoint to check active games for a player
httpServer.on('request', async (req, res) => {
  // Only handle our specific endpoint, let Socket.IO handle everything else
  if (req.method === 'GET' && req.url.startsWith('/api/chess/active-games')) {
    console.log('🌐 [HTTP] Active games request received:', req.url);
    
    // Enable CORS only for our endpoint
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const userId = url.searchParams.get('userId');
    
    console.log('🌐 [HTTP] User ID from request:', userId);
    
    if (!userId) {
      console.log('❌ [HTTP] No userId provided');
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: false, 
        error: 'userId parameter is required' 
      }));
      return;
    }
    
    try {
      console.log('🔍 [HTTP] Getting active games for user:', userId);
      const activeGames = await getActiveGamesForPlayer(userId);
      
      console.log('✅ [HTTP] Found active games:', activeGames);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        games: activeGames,
        count: activeGames.length,
        userId: userId
      }));
    } catch (error) {
      console.error('❌ [HTTP] Error getting active games:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: false, 
        error: 'Failed to get active games' 
      }));
    }
    return;
  }
  
  // For all other requests, don't handle them - let Socket.IO handle them
  // This prevents the ERR_HTTP_HEADERS_SENT error
});

// =============================================================================
// SERVER STARTUP
// =============================================================================
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.io server running on port ${PORT}`);
  console.log(`📊 Matchmaking queues initialized`);
  console.log(`🎮 Game manager ready`);
  console.log(`🌐 [Server] HTTP API available at http://localhost:${PORT}/api/chess/active-games`);
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