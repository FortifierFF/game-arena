/**
 * Chess Database Service
 * 
 * Handles all database operations for chess games, moves, and player statistics
 */

import { supabase } from './supabase';
import { 
  ChessGameRecord, 
  ChessPlayerStats, 
  GameResultData,
  RatingUpdate 
} from '../types/database';

/**
 * Save a completed chess game to the database
 */
export async function saveChessGame(gameData: GameResultData): Promise<boolean> {
  try {
    console.log('💾 [DB] Saving chess game:', gameData.gameId);
    
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

    // 2. Insert all moves
    if (gameData.moves.length > 0) {
      const movesToInsert = gameData.moves.map(move => ({
        id: `${gameData.gameId}_move_${move.moveNumber}`,
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
    await updatePlayerStats(gameData);
    
    console.log('✅ [DB] Chess game saved successfully');
    return true;
    
  } catch (error) {
    console.error('❌ [DB] Error saving chess game:', error);
    return false;
  }
}

/**
 * Update player statistics after a game
 */
async function updatePlayerStats(gameData: GameResultData): Promise<void> {
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
      const ratingUpdate = calculateRatingChange(
        currentStats.current_rating,
        isWinner ? 'win' : isLoser ? 'loss' : 'draw',
        gameData.winnerId ? 
          (gameData.winnerId === player.id ? 
            (isWinner ? currentStats.current_rating : 
             await getPlayerRating(gameData.winnerId === player.id ? gameData.loserId! : gameData.winnerId!)) : 
            currentStats.current_rating) : 
          currentStats.current_rating
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
async function getPlayerStats(userId: string): Promise<ChessPlayerStats | null> {
  try {
    const { data, error } = await supabase
      .from('chess_player_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ [DB] Error getting player stats:', error);
      return null;
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
async function savePlayerStats(stats: ChessPlayerStats): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chess_player_stats')
      .upsert(stats, { onConflict: 'user_id' });

    if (error) {
      console.error('❌ [DB] Error saving player stats:', error);
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
async function getPlayerRating(userId: string): Promise<number> {
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
  playerRating: number, 
  result: 'win' | 'loss' | 'draw', 
  opponentRating: number
): RatingUpdate {
  const K = 32; // K-factor for rating changes
  const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  
  let actualScore: number;
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

/**
 * Get player's game history
 */
export async function getPlayerGameHistory(userId: string, limit: number = 20): Promise<ChessGameRecord[]> {
  try {
    const { data, error } = await supabase
      .from('chess_games')
      .select('*')
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
      .order('ended_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ [DB] Error getting game history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ [DB] Error getting game history:', error);
    return [];
  }
}

/**
 * Get player's current statistics
 */
export async function getPlayerCurrentStats(userId: string): Promise<ChessPlayerStats | null> {
  return await getPlayerStats(userId);
} 