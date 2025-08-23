import React from 'react';
import { GameStats } from '@/types/auth';
import Icon, { Trophy, Target, TrendingUp, Gamepad2, Star } from '@/components/ui/Icon';

interface OverviewStatsProps {
  gameStats: GameStats[];
}

export default function OverviewStats({ gameStats }: OverviewStatsProps) {
  if (!gameStats || gameStats.length === 0) {
    return (
      <div className="backdrop-blur-xl bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-3xl p-6 shadow-2xl">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <Icon icon={Gamepad2} size="sm" className="mx-auto mb-3 text-gray-500" />
          <p>No games played yet</p>
          <p className="text-sm">Start playing to see your statistics!</p>
        </div>
      </div>
    );
  }

  // Calculate aggregate statistics
  const totalGames = gameStats.reduce((sum, stat) => sum + stat.total_games, 0);
  const totalWins = gameStats.reduce((sum, stat) => sum + stat.wins, 0);
  const totalLosses = gameStats.reduce((sum, stat) => sum + stat.losses, 0);
  const totalDraws = gameStats.reduce((sum, stat) => sum + stat.draws, 0);
  const overallWinRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
  
  // Get most played game
  const mostPlayedGame = gameStats.reduce((max, stat) => 
    stat.total_games > max.total_games ? stat : max
  );
  
  // Get best performing game (highest win rate)
  const bestPerformingGame = gameStats.reduce((best, stat) => {
    const winRate = stat.total_games > 0 ? stat.wins / stat.total_games : 0;
    const bestWinRate = best.total_games > 0 ? best.wins / best.total_games : 0;
    return winRate > bestWinRate ? stat : best;
  });

  return (
    <div className="backdrop-blur-xl bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-3xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
          <Icon icon={Trophy} size="sm" className="text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Overview</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Your overall gaming performance</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Overall Win Rate */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 dark:from-blue-500/20 dark:to-cyan-500/20 rounded-2xl border border-blue-400/30 dark:border-blue-400/30">
          <div className="flex items-center gap-3">
            <Icon icon={TrendingUp} size="sm" className="text-blue-500" />
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Overall Win Rate</p>
              <p className="text-gray-800 dark:text-white font-bold text-lg">{overallWinRate}%</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-blue-500 text-sm">{totalWins}/{totalGames}</p>
          </div>
        </div>

        {/* Total Games */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 dark:from-purple-500/20 dark:to-pink-500/20 rounded-2xl border border-purple-400/30 dark:border-purple-400/30">
          <div className="flex items-center gap-3">
            <Icon icon={Gamepad2} size="sm" className="text-purple-500" />
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Total Games</p>
              <p className="text-gray-800 dark:text-white font-bold text-lg">{totalGames}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-purple-500 text-sm">All Games</p>
          </div>
        </div>

        {/* Game Counts */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
            <p className="text-gray-800 dark:text-white font-bold text-lg">{totalWins}</p>
            <p className="text-gray-600 dark:text-gray-400 text-xs">Total Wins</p>
          </div>
          <div className="text-center p-3 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
            <p className="text-gray-800 dark:text-white font-bold text-lg">{totalLosses}</p>
            <p className="text-gray-600 dark:text-gray-400 text-xs">Total Losses</p>
          </div>
          <div className="text-center p-3 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
            <p className="text-gray-800 dark:text-white font-bold text-lg">{totalDraws}</p>
            <p className="text-gray-600 dark:text-gray-400 text-xs">Total Draws</p>
          </div>
        </div>

        {/* Game Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Icon icon={Star} size="xs" className="text-yellow-500" />
              <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">Most Played</span>
            </div>
            <p className="text-gray-800 dark:text-white font-semibold capitalize">{mostPlayedGame.game_type}</p>
            <p className="text-gray-600 dark:text-gray-400 text-xs">{mostPlayedGame.total_games} games</p>
          </div>
          
          <div className="p-3 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Icon icon={Target} size="xs" className="text-green-500" />
              <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">Best Performance</span>
            </div>
            <p className="text-gray-800 dark:text-white font-semibold capitalize">{bestPerformingGame.game_type}</p>
            <p className="text-gray-600 dark:text-gray-400 text-xs">
              {bestPerformingGame.total_games > 0 ? Math.round((bestPerformingGame.wins / bestPerformingGame.total_games) * 100) : 0}% win rate
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 