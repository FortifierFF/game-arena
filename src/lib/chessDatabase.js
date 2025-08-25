/**
 * Chess Database Service - JavaScript Version for Node.js Server
 * 
 * Handles all database operations for chess games, moves, and player statistics
 */

const { createClient } = require('@supabase/supabase-js');

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Create a new active chess game in the database
 */
async function createActiveChessGame(gameData) {
  try {
    console.log('💾 [DB] Creating active chess game:', gameData.gameId);
    
    const { error } = await supabase
      .from('chess_games')
      .insert({
        id: gameData.gameId,
        player1_id: gameData.player1Id,
        player2_id: gameData.player2Id,
        player1_color: gameData.player1Color,
        player2_color: gameData.player2Color,
        time_control: gameData.timeControl,
        game_result: 'in_progress', // Mark as in progress
        winner_id: null, // Will be set when game ends
        loser_id: null, // Will be set when game ends
        total_moves: 0, // Will be updated as game progresses
        game_duration_ms: 0, // Will be set when game ends
        final_fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Starting position
        created_at: new Date().toISOString(),
        ended_at: null // Will be set when game ends
      });

    if (error) {
      console.error('❌ [DB] Error creating active game:', error);
      return false;
    }

    console.log('✅ [DB] Active chess game created successfully');
    return true;
    
  } catch (error) {
    console.error('❌ [DB] Error creating active chess game:', error);
    return false;
  }
}

/**
 * Get active chess games for a player
 */
async function getActiveChessGames(userId) {
  try {
    console.log('🔍 [DB] Getting active games for user:', userId);
    
    const { data, error } = await supabase
      .from('chess_games')
      .select('*')
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
      .eq('game_result', 'in_progress');

    if (error) {
      console.error('❌ [DB] Error getting active games:', error);
      return [];
    }

    console.log('✅ [DB] Found active games:', data);
    return data || [];
    
  } catch (error) {
    console.error('❌ [DB] Error getting active chess games:', error);
    return [];
  }
}

/**
 * Update an active game (add moves, update status)
 */
async function updateActiveChessGame(gameId, updates) {
  try {
    console.log('💾 [DB] Updating active game:', gameId, updates);
    
    const updateData = {
      total_moves: updates.totalMoves,
      final_fen: updates.finalFen,
      game_duration_ms: updates.gameDurationMs
    };
    
    // Add game result update if provided
    if (updates.gameResult) {
      updateData.game_result = updates.gameResult;
    }
    
    // Add winner/loser if provided
    if (updates.winnerId) {
      updateData.winner_id = updates.winnerId;
    }
    
    if (updates.loserId) {
      updateData.loser_id = updates.loserId;
    }
    
    // Add ended_at timestamp if game is completed
    if (updates.gameResult && updates.gameResult !== 'in_progress') {
      updateData.ended_at = new Date().toISOString();
    }
    
    const { error } = await supabase
      .from('chess_games')
      .update(updateData)
      .eq('id', gameId);

    if (error) {
      console.error('❌ [DB] Error updating active game:', error);
      return false;
    }

    console.log('✅ [DB] Active game updated successfully');
    return true;
    
  } catch (error) {
    console.error('❌ [DB] Error updating active game:', error);
    return false;
  }
}

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
    // Get the stored stats from the game object
    const winnerStats = gameData.winnerStats || { total_games: 0, wins: 0, losses: 0, draws: 0, current_rating: 1200, highest_rating: 1200, win_streak: 0, best_win_streak: 0 };
    const loserStats = gameData.loserStats || { total_games: 0, wins: 0, losses: 0, draws: 0, current_rating: 1200, highest_rating: 1200, win_streak: 0, best_win_streak: 0 };
    
    // Calculate new winner stats (increment from stored values)
    const newWinnerStats = {
      id: gameData.winnerId,
      user_id: gameData.winnerId,
      total_games: winnerStats.total_games + 1,
      wins: winnerStats.wins + 1,
      losses: winnerStats.losses,
      draws: winnerStats.draws,
      current_rating: winnerStats.current_rating + 35, // Simple rating increase
      highest_rating: Math.max(winnerStats.highest_rating, winnerStats.current_rating + 35),
      average_game_duration: gameData.gameDurationMs,
      win_streak: winnerStats.win_streak + 1,
      best_win_streak: Math.max(winnerStats.best_win_streak, winnerStats.win_streak + 1),
      games_as_white: gameData.player1Color === 'white' ? winnerStats.games_as_white + 1 : winnerStats.games_as_white,
      games_as_black: gameData.player1Color === 'black' ? winnerStats.games_as_black + 1 : winnerStats.games_as_black,
      wins_as_white: gameData.player1Color === 'white' ? winnerStats.wins_as_white + 1 : winnerStats.wins_as_white,
      wins_as_black: gameData.player1Color === 'black' ? winnerStats.wins_as_black + 1 : winnerStats.wins_as_black,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Calculate new loser stats (increment from stored values)
    const newLoserStats = {
      id: gameData.loserId,
      user_id: gameData.loserId,
      total_games: loserStats.total_games + 1,
      wins: loserStats.wins,
      losses: loserStats.losses + 1,
      draws: loserStats.draws,
      current_rating: Math.max(100, loserStats.current_rating - 35), // Simple rating decrease
      highest_rating: loserStats.highest_rating, // Keep highest rating
      average_game_duration: gameData.gameDurationMs,
      win_streak: 0, // Reset win streak on loss
      best_win_streak: loserStats.best_win_streak, // Keep best win streak
      games_as_white: gameData.player2Color === 'white' ? loserStats.games_as_white + 1 : loserStats.games_as_white,
      games_as_black: gameData.player2Color === 'black' ? loserStats.games_as_black + 1 : loserStats.games_as_black,
      wins_as_white: loserStats.wins_as_white,
      wins_as_black: loserStats.wins_as_black,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Update winner stats using upsert
    const { data: winnerData, error: winnerError } = await supabase
      .from('chess_player_stats')
      .upsert(newWinnerStats, {
        onConflict: 'user_id'
      });

    if (winnerError) {
      console.error('❌ [DB] Error updating winner stats:', winnerError);
    }

    // Update loser stats using upsert
    const { data: loserData, error: loserError } = await supabase
      .from('chess_player_stats')
      .upsert(newLoserStats, {
        onConflict: 'user_id'
      });

    if (loserError) {
      console.error('❌ [DB] Error updating loser stats:', loserError);
    }
    
  } catch (error) {
    console.error('❌ [DB] Error updating player statistics:', error);
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
  saveChessGame,
  createActiveChessGame,
  getActiveChessGames,
  updateActiveChessGame,
  updatePlayerStats,
  getPlayerStats
}; 