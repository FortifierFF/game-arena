const ChessGame = require('./chess-game');
const { saveChessGame } = require('./chessDatabase');

// Game manager for handling active games and their lifecycle
class GameManager {
  constructor() {
    this.games = new Map();
  }

  // Create a new game
  createGame(player1, player2, timeControl) {
    const game = new ChessGame(player1, player2, timeControl);
    this.games.set(game.id, game);
    game.start();
    
    console.log(`🎮 [Game] Created new game ${game.id} between ${player1} and ${player2}`);
    return game;
  }

  // Get a game by ID
  getGame(gameId) {
    return this.games.get(gameId);
  }

  // Check if a game exists
  hasGame(gameId) {
    return this.games.has(gameId);
  }

  // Remove a game
  removeGame(gameId) {
    const game = this.games.get(gameId);
    if (game) {
      console.log(`🗑️ [Game] Removing game ${gameId}`);
      this.games.delete(gameId);
      return true;
    }
    return false;
  }

  // Handle game ending
  async endGame(gameId, result, winner, loser) {
    const game = this.games.get(gameId);
    if (!game) return false;

    console.log(`🏁 [Game] Ending game ${gameId} with result: ${result}`);
    
    // End the game
    game.endGame(result, winner, loser);
    
    // Get final game state
    const gameState = game.getGameState();
    
    // Save to database
    try {
      const gameData = game.prepareGameDataForDatabase();
      await saveChessGame(gameData);
      console.log(`💾 [DB] Game ${gameId} saved to database successfully`);
    } catch (error) {
      console.error(`❌ [DB] Error saving game ${gameId} to database:`, error);
    }
    
    // Remove from active games
    this.games.delete(gameId);
    
    return gameState;
  }

  // Handle player resignation
  async handleResignation(gameId, resigningPlayerId) {
    const game = this.games.get(gameId);
    if (!game || game.status !== 'active') return null;

    console.log(`🏳️ [Game] Player ${resigningPlayerId} resigning from game ${gameId}`);
    
    // Determine winner and loser
    const winner = game.player1 === resigningPlayerId ? game.player2 : game.player1;
    const loser = resigningPlayerId;
    
    // End the game
    return await this.endGame(gameId, 'resignation', winner, loser);
  }

  // Handle player disconnect
  handlePlayerDisconnect(userId) {
    const gamesToEnd = [];
    
    for (const [gameId, game] of this.games.entries()) {
      if (game.status === 'active' && 
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
        
        gamesToEnd.push({ gameId, game });
      }
    }
    
    return gamesToEnd;
  }

  // Get all active games
  getActiveGames() {
    const activeGames = [];
    for (const [gameId, game] of this.games.entries()) {
      if (game.status === 'active') {
        activeGames.push({ gameId, game });
      }
    }
    return activeGames;
  }

  // Get game count
  getGameCount() {
    return this.games.size;
  }

  // Clean up completed games
  cleanupCompletedGames() {
    let cleanedCount = 0;
    for (const [gameId, game] of this.games.entries()) {
      if (game.status === 'completed' || game.status === 'abandoned') {
        this.games.delete(gameId);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 [Game] Cleaned up ${cleanedCount} completed games`);
    }
    
    return cleanedCount;
  }
}

module.exports = GameManager; 