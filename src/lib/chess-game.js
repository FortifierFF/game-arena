const { Chess } = require('chess.js');

// Chess game class for managing individual game state
class ChessGame {
  constructor(player1, player2, timeControl) {
    this.id = this.generateGameId();
    this.player1 = player1;
    this.player2 = player2;
    this.timeControl = timeControl;
    this.chess = new Chess();
    this.status = 'waiting';
    this.currentPlayer = 'white';
    this.moves = [];
    this.playerTimes = {
      white: this.parseTimeControl(timeControl),
      black: this.parseTimeControl(timeControl)
    };
    this.startTime = Date.now();
    this.result = null;
    this.winner = null;
    this.loser = null;
    this.player1SocketId = null;
    this.player2SocketId = null;
    
    // Track detailed move data for database
    this.detailedMoves = [];
    this.player1Color = 'white';
    this.player2Color = 'black';
  }

  // Generate unique game ID
  generateGameId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Parse time control string to milliseconds
  parseTimeControl(timeControl) {
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

  // Start the game
  start() {
    this.status = 'active';
    this.startTime = Date.now();
    this.lastMoveTime = Date.now();
  }

  // Make a move in the game
  makeMove(move, playerId) {
    if (this.status !== 'active') return false;
    
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

        // Collect detailed move data for database
        const moveData = {
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
        };
        this.detailedMoves.push(moveData);

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

  // End the game with result
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

  // Prepare game data for database storage
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

  // Get current game state
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

  // Get game result based on chess state
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

module.exports = ChessGame; 