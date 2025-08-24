/**
 * Chess Database Service - JavaScript Version for Node.js Server
 * 
 * Handles all database operations for chess games, moves, and player statistics
 */

const { createClient } = require('@supabase/supabase-js');

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Save a completed chess game to the database
 */
async function saveChessGame(gameData) {
  try {
    // 1. Insert the main game record
    const { error: gameError } = await supabase
      .from('chess_games')
      .insert({
        id: gameData.gameId,
        player1_id: gameData.player1Id,
        player2_id: gameData.player2Id,
        player1_color: gameData.player1Color,
        player2_color: gameData.player2Color,
        time_control: gameData.timeControl,
        game_result: gameData.result,
        winner_id: gameData.winnerId,
        loser_id: gameData.loserId,
        total_moves: gameData.totalMoves,
        game_duration_ms: gameData.gameDurationMs,
        final_fen: gameData.finalFen,
        created_at: new Date().toISOString(),
        ended_at: new Date().toISOString()
      });

    if (gameError) {
      console.error('❌ [DB] Error saving game:', gameError);
      return false;
    }

    // 2. Insert all moves (if any exist)
    if (gameData.moves && gameData.moves.length > 0) {
      const movesToInsert = gameData.moves.map((move, index) => ({
        id: `${gameData.gameId}_move_${index + 1}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        game_id: gameData.gameId,
        move_number: move.moveNumber,
        player_id: move.playerId,
        from_square: move.fromSquare,
        to_square: move.toSquare,
        piece: move.piece,
        move_notation: move.moveNotation,
        is_capture: move.isCapture,
        is_check: move.isCheck,
        is_checkmate: move.isCheckmate,
        timestamp_ms: move.timestampMs
      }));

      const { error: movesError } = await supabase
        .from('chess_moves')
        .insert(movesToInsert);

      if (movesError) {
        console.error('❌ [DB] Error saving moves:', movesError);
        // Continue anyway - the game was saved
      }
    }

    // 3. Update player statistics
    try {
      await updatePlayerStats(gameData);
    } catch (statsError) {
      console.error('❌ [DB] Error updating player stats:', statsError);
      // Continue anyway - the game was saved
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ [DB] Error saving chess game:', error);
    return false;
  }
}

/**
 * Update player statistics after a game
 */
async function updatePlayerStats(gameData) {
  try {
    const players = [
      { id: gameData.player1Id, color: gameData.player1Color },
      { id: gameData.player2Id, color: gameData.player2Color }
    ];

    for (const player of players) {
      const isWinner = gameData.winnerId === player.id;
      const isLoser = gameData.loserId === player.id;
      const isDraw = !gameData.winnerId && !gameData.loserId;
      
      // Get current stats or create new ones
      let currentStats = await getPlayerStats(player.id);
      
      if (!currentStats) {
        // Create new stats record
        currentStats = {
          id: `${player.id}_chess_stats`,
          user_id: player.id,
          total_games: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          current_rating: 1200, // Starting rating
          highest_rating: 1200,
          average_game_duration: 0,
          win_streak: 0,
          best_win_streak: 0,
          games_as_white: 0,
          games_as_black: 0,
          wins_as_white: 0,
          wins_as_black: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      // Update stats
      currentStats.total_games += 1;
      currentStats.average_game_duration = Math.round(
        (currentStats.average_game_duration * (currentStats.total_games - 1) + 
         gameData.gameDurationMs / 60000) / currentStats.total_games
      );

      if (isWinner) {
        currentStats.wins += 1;
        currentStats.win_streak += 1;
        if (currentStats.win_streak > currentStats.best_win_streak) {
          currentStats.best_win_streak = currentStats.win_streak;
        }
        
        // Update color-specific stats
        if (player.color === 'white') {
          currentStats.games_as_white += 1;
          currentStats.wins_as_white += 1;
        } else {
          currentStats.games_as_black += 1;
          currentStats.wins_as_black += 1;
        }
      } else if (isLoser) {
        currentStats.losses += 1;
        currentStats.win_streak = 0;
        
        // Update color-specific stats
        if (player.color === 'white') {
          currentStats.games_as_white += 1;
        } else {
          currentStats.games_as_black += 1;
        }
      } else if (isDraw) {
        currentStats.draws += 1;
        currentStats.win_streak = 0;
        
        // Update color-specific stats
        if (player.color === 'white') {
          currentStats.games_as_white += 1;
        } else {
          currentStats.games_as_black += 1;
        }
      }

      // Calculate new rating (simple ELO system)
      let opponentRating = 1200; // Default rating
      if (gameData.winnerId && gameData.loserId) {
        if (gameData.winnerId === player.id) {
          opponentRating = await getPlayerRating(gameData.loserId);
        } else {
          opponentRating = await getPlayerRating(gameData.winnerId);
        }
      }
      
      const ratingUpdate = calculateRatingChange(
        currentStats.current_rating,
        isWinner ? 'win' : isLoser ? 'loss' : 'draw',
        opponentRating
      );

      currentStats.current_rating = ratingUpdate.newRating;
      if (currentStats.current_rating > currentStats.highest_rating) {
        currentStats.highest_rating = currentStats.current_rating;
      }

      currentStats.updated_at = new Date().toISOString();

      // Save updated stats
      await savePlayerStats(currentStats);
    }
    
  } catch (error) {
    console.error('❌ [DB] Error updating player stats:', error);
  }
}

/**
 * Get player statistics
 */
async function getPlayerStats(userId) {
  try {
    const { data, error } = await supabase
      .from('chess_player_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // PGRST116 = no rows returned
        return null;
      } else {
        console.error('❌ [DB] Error getting player stats:', error);
        return null;
      }
    }

    return data;
  } catch (error) {
    console.error('❌ [DB] Error getting player stats:', error);
    return null;
  }
}

/**
 * Save player statistics
 */
async function savePlayerStats(stats) {
  try {
    // First try to insert, if it fails due to existing record, then update
    const { error: insertError } = await supabase
      .from('chess_player_stats')
      .insert(stats);

    if (insertError && insertError.code === '23505') { // Unique violation
      // Record exists, update it instead
      const { error: updateError } = await supabase
        .from('chess_player_stats')
        .update({
          total_games: stats.total_games,
          wins: stats.wins,
          losses: stats.losses,
          draws: stats.draws,
          current_rating: stats.current_rating,
          highest_rating: stats.highest_rating,
          average_game_duration: stats.average_game_duration,
          win_streak: stats.win_streak,
          best_win_streak: stats.best_win_streak,
          games_as_white: stats.games_as_white,
          games_as_black: stats.games_as_black,
          wins_as_white: stats.wins_as_white,
          wins_as_black: stats.wins_as_black,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', stats.user_id);

      if (updateError) {
        console.error('❌ [DB] Error updating player stats:', updateError);
        return false;
      }
    } else if (insertError) {
      console.error('❌ [DB] Error inserting player stats:', insertError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ [DB] Error saving player stats:', error);
    return false;
  }
}

/**
 * Get player rating
 */
async function getPlayerRating(userId) {
  try {
    const stats = await getPlayerStats(userId);
    return stats?.current_rating || 1200;
  } catch (error) {
    console.error('❌ [DB] Error getting player rating:', error);
    return 1200;
  }
}

/**
 * Calculate rating change using simplified ELO system
 */
function calculateRatingChange(
  playerRating, 
  result, 
  opponentRating
) {
  const K = 32; // K-factor for rating changes
  const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  
  let actualScore;
  switch (result) {
    case 'win':
      actualScore = 1;
      break;
    case 'loss':
      actualScore = 0;
      break;
    case 'draw':
      actualScore = 0.5;
      break;
  }

  const ratingChange = Math.round(K * (actualScore - expectedScore));
  const newRating = Math.max(100, playerRating + ratingChange); // Minimum rating is 100

  return {
    playerId: '', // Will be set by caller
    oldRating: playerRating,
    newRating,
    ratingChange,
    gameResult: result,
    opponentRating
  };
}

// Export the function for the server to use
module.exports = {
  saveChessGame
}; 