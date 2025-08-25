// Socket handler for managing WebSocket connections and events
class SocketHandler {
  constructor(io, gameManager, matchmaking) {
    this.io = io;
    this.gameManager = gameManager;
    this.matchmaking = matchmaking;
    this.userSessions = new Map(); // socketId -> {userId, walletAddress}
  }

  // Handle new socket connection
  handleConnection(socket) {
    console.log('🔌 User connected:', socket.id);

    // Set up socket event handlers
    this.setupSocketHandlers(socket);
  }

  // Set up all socket event handlers
  setupSocketHandlers(socket) {
    // User authentication
    socket.on('authenticate', (data) => this.handleAuthentication(socket, data));

    // Matchmaking
    socket.on('join_queue', (data) => this.handleJoinQueue(socket, data));
    socket.on('leave_queue', () => this.handleLeaveQueue(socket));

    // Game actions
    socket.on('make_move', (data) => this.handleMakeMove(socket, data));
    socket.on('join_game', (data) => this.handleJoinGame(socket, data));
    socket.on('resign', (data) => this.handleResign(socket, data));

    // Keep-alive
    socket.on('ping', () => socket.emit('pong'));

    // Disconnect
    socket.on('disconnect', () => this.handleDisconnect(socket));
  }

  // Handle user authentication
  handleAuthentication(socket, data) {
    const { userId, walletAddress } = data;
    
    this.userSessions.set(socket.id, { userId, walletAddress });
    socket.userId = userId;
    socket.walletAddress = walletAddress;
    
    console.log('🔐 User authenticated:', userId);
    
    socket.emit('authenticated', { userId, walletAddress });
    
    // Send current queue sizes to the newly authenticated client
    const queueSizes = this.matchmaking.getAllQueueSizes();
    for (const [timeControl, queueSize] of Object.entries(queueSizes)) {
      socket.emit('queue_update', { timeControl, queueSize });
    }
  }

  // Handle joining matchmaking queue
  handleJoinQueue(socket, data) {
    const { timeControl, rating } = data;
    const userId = socket.userId;
    
    if (!userId) {
      console.error('❌ [Queue] User not authenticated');
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    console.log(`🎯 [Queue] User ${userId} joining ${timeControl} queue with rating ${rating}`);

    // Add to queue
    const playerData = this.matchmaking.addToQueue(userId, socket.id, timeControl, rating);
    
    socket.emit('queue_joined', { queueId: this.generateGameId(), timeControl });

    // Notify all clients about the updated queue size
    const queueSize = this.matchmaking.getQueueSize(timeControl);
    this.io.emit('queue_update', { timeControl, queueSize });

    // Try to find a match immediately
    const opponent = this.matchmaking.findMatch(userId, timeControl, rating || 1200);
    
    if (opponent) {
      this.createMatch(userId, opponent, timeControl, socket);
    }
  }

  // Handle leaving matchmaking queue
  handleLeaveQueue(socket) {
    const userId = socket.userId;
    if (!userId) return;

    console.log(`🚪 [Queue] User ${userId} leaving all queues`);

    this.matchmaking.removeFromAllQueues(userId);

    // Notify all clients about updated queue sizes
    const queueSizes = this.matchmaking.getAllQueueSizes();
    for (const [timeControl, queueSize] of Object.entries(queueSizes)) {
      this.io.emit('queue_update', { timeControl, queueSize });
    }

    socket.emit('queue_left');
  }

  // Handle making a move
  handleMakeMove(socket, data) {
    const { gameId, move } = data;
    const userId = socket.userId;
    
    if (!userId) return;

    console.log(`🎯 [Move] Player ${userId} attempting move in game ${gameId}:`, move);

    const game = this.gameManager.getGame(gameId);
    if (!game) {
      console.error(`❌ [Move] Game ${gameId} not found`);
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    console.log(`🎯 [Move] Current player: ${game.currentPlayer}, Player making move: ${userId}`);

    if (game.makeMove(move, userId)) {
      console.log(`✅ [Move] Move successful in game ${gameId}. New current player: ${game.currentPlayer}`);
      
      const updatedGameState = game.getGameState();
      console.log(`🔄 [Move] Broadcasting updated game state:`, updatedGameState);
      
      this.io.to(`game_${gameId}`).emit('move_made', {
        gameId,
        move,
        gameState: updatedGameState
      });

      // Check if the game is over after this move
      if (game.chess.isGameOver()) {
        this.handleGameOver(game, userId);
      }
    } else {
      console.error(`❌ [Move] Invalid move in game ${gameId} by player ${userId}`);
      socket.emit('error', { message: 'Invalid move' });
    }
  }

  // Handle joining a game
  handleJoinGame(socket, data) {
    const { gameId } = data;
    const userId = socket.userId;
    
    if (!userId) return;

    const game = this.gameManager.getGame(gameId);
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
  }

  // Handle player resignation
  handleResign(socket, data) {
    const { gameId } = data;
    const userId = socket.userId;
    
    if (!userId) return;

    const game = this.gameManager.getGame(gameId);
    if (!game || game.status !== 'active') return;

    console.log(`🏳️ [Game] Player ${userId} resigning from game ${gameId}`);
    
    // Handle resignation through game manager
    this.gameManager.handleResignation(gameId, userId).then(gameState => {
      if (gameState) {
        this.notifyGameEnded(game, 'resignation', gameState);
      }
    });
  }

  // Handle socket disconnect
  handleDisconnect(socket) {
    const userId = socket.userId;
    if (userId) {
      console.log(`🔌 [Disconnect] User ${userId} disconnecting`);
      
      // Remove from matchmaking queues
      this.matchmaking.removeFromAllQueues(userId);
      
      // Notify all clients about updated queue sizes
      const queueSizes = this.matchmaking.getAllQueueSizes();
      for (const [timeControl, queueSize] of Object.entries(queueSizes)) {
        this.io.emit('queue_update', { timeControl, queueSize });
      }

      // Handle games that need to end due to disconnect
      const gamesToEnd = this.gameManager.handlePlayerDisconnect(userId);
      for (const { gameId, game } of gamesToEnd) {
        this.notifyGameEnded(game, 'abandoned', game.getGameState());
      }
    }

    this.userSessions.delete(socket.id);
    console.log('🔌 User disconnected:', socket.id);
  }

  // Create a match between two players
  createMatch(player1Id, opponent, timeControl, player1Socket) {
    console.log(`🎮 [Match] Creating game between ${player1Id} and ${opponent.userId}`);
    
    // Remove both players from queue
    this.matchmaking.removeMatchedPlayers(player1Id, opponent.userId, timeControl);
    
    // Notify all clients about the updated queue size
    const queueSize = this.matchmaking.getQueueSize(timeControl);
    this.io.emit('queue_update', { timeControl, queueSize });

    // Create game
    const game = this.gameManager.createGame(player1Id, opponent.userId, timeControl);
    
    // Store socket IDs for both players in the game
    game.player1SocketId = player1Socket.id;
    game.player2SocketId = opponent.socketId;

    // Notify both players
    player1Socket.emit('game_found', { 
      gameId: game.id, 
      opponent: opponent.userId,
      color: 'white'
    });

    const opponentSocket = this.io.sockets.sockets.get(opponent.socketId);
    if (opponentSocket) {
      opponentSocket.emit('game_found', { 
        gameId: game.id, 
        opponent: player1Id,
        color: 'black'
      });
    }

    console.log(`🎮 [Match] Game ${game.id} created and players notified`);
  }

  // Handle game over
  handleGameOver(game, lastMovePlayerId) {
    let result, winner, loser;
    
    if (game.chess.isCheckmate()) {
      // The player who just moved won (checkmated opponent)
      result = 'checkmate';
      winner = lastMovePlayerId;
      loser = game.player1 === lastMovePlayerId ? game.player2 : game.player1;
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
      
      // Notify players about game end
      this.notifyGameEnded(game, result, gameState);
      
      // Remove game from active games
      this.gameManager.removeGame(game.id);
      
      // Save game to database
      try {
        const gameData = game.prepareGameDataForDatabase();
        this.gameManager.saveGameToDatabase(gameData).catch(error => {
          console.error(`❌ [DB] Error saving game ${game.id} to database:`, error);
        });
      } catch (error) {
        console.error(`❌ [DB] Error preparing game data for database:`, error);
      }
      
      console.log(`🏁 [Game] Game ${game.id} ended by ${result}. Winner: ${winner}, Loser: ${loser}`);
    }
  }

  // Notify players about game end
  notifyGameEnded(game, result, gameState) {
    // Send different data to each player
    const player1Socket = this.io.sockets.sockets.get(game.player1SocketId);
    const player2Socket = this.io.sockets.sockets.get(game.player2SocketId);
    
    if (player1Socket) {
      const isWinner = game.player1 === game.winner;
      player1Socket.emit('game_ended', {
        gameId: game.id,
        result,
        winner: game.player1,
        loser: game.player2,
        isWinner,
        gameState
      });
    }
    
    if (player2Socket) {
      const isWinner = game.player2 === game.winner;
      player2Socket.emit('game_ended', {
        gameId: game.id,
        result,
        winner: game.player2,
        loser: game.player1,
        isWinner,
        gameState
      });
    }
    
    // Fallback: Also emit to the game room in case individual socket emissions failed
    console.log(`🏁 [Game] Emitting fallback game_ended to game room ${game.id}`);
    this.io.to(`game_${game.id}`).emit('game_ended', {
      gameId: game.id,
      result: result,
      winner: game.winner,
      loser: game.loser,
      gameState
    });
  }

  // Generate unique game ID
  generateGameId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

module.exports = SocketHandler; 