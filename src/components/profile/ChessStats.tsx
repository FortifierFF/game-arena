import React from 'react';
import { GameStats } from '@/types/auth';
import Icon, { Target, TrendingUp, Clock, Crown, Zap } from '@/components/ui/Icon';

interface ChessStatsProps {
  stats: GameStats | null;
}

export default function ChessStats({ stats }: ChessStatsProps) {
  if (!stats || stats.game_type !== 'chess') {
    return (
      <div className="backdrop-blur-xl bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-3xl p-6 shadow-2xl">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <Icon icon={Target} size="sm" className="mx-auto mb-3 text-gray-500" />
          <p>No chess games played yet</p>
          <p className="text-sm">Start playing chess to see your statistics!</p>
        </div>
      </div>
    );
  }

  const chessMetrics = stats.game_metrics.chess;
  const winRate = stats.total_games > 0 ? Math.round((stats.wins / stats.total_games) * 100) : 0;

  return (
    <div className="backdrop-blur-xl bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-3xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
          <Icon icon={Target} size="sm" className="text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Chess</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Your chess performance</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Current Rating */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 dark:from-purple-500/20 dark:to-pink-500/20 rounded-2xl border border-purple-400/30 dark:border-purple-400/30">
          <div className="flex items-center gap-3">
            <Icon icon={Target} size="sm" className="text-purple-500" />
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Current Rating</p>
              <p className="text-gray-800 dark:text-white font-bold text-lg">
                {chessMetrics?.current_rating || 1200}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-purple-500 text-sm">ELO</p>
          </div>
        </div>

        {/* Win Rate */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 dark:from-green-500/20 dark:to-emerald-500/20 rounded-2xl border border-green-400/30 dark:border-green-400/30">
          <div className="flex items-center gap-3">
            <Icon icon={TrendingUp} size="sm" className="text-green-500" />
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Win Rate</p>
              <p className="text-gray-800 dark:text-white font-bold text-lg">{winRate}%</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-green-500 text-sm">{stats.wins}/{stats.total_games}</p>
          </div>
        </div>

        {/* Game Counts */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
            <p className="text-gray-800 dark:text-white font-bold text-lg">{stats.total_games}</p>
            <p className="text-gray-600 dark:text-gray-400 text-xs">Total Games</p>
          </div>
          <div className="text-center p-3 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
            <p className="text-gray-800 dark:text-white font-bold text-lg">{stats.wins}</p>
            <p className="text-gray-600 dark:text-gray-400 text-xs">Wins</p>
          </div>
          <div className="text-center p-3 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
            <p className="text-gray-800 dark:text-white font-bold text-lg">{stats.losses}</p>
            <p className="text-gray-600 dark:text-gray-400 text-xs">Losses</p>
          </div>
        </div>

        {/* Chess-specific metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Icon icon={Crown} size="xs" className="text-yellow-500" />
              <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">Highest Rating</span>
            </div>
            <p className="text-gray-800 dark:text-white font-semibold">
              {chessMetrics?.highest_rating || 1200}
            </p>
          </div>
          
          <div className="p-3 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Icon icon={Clock} size="xs" className="text-blue-500" />
              <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">Avg Game Time</span>
            </div>
            <p className="text-gray-800 dark:text-white font-semibold">
              {chessMetrics?.average_game_duration ? `${Math.round(chessMetrics.average_game_duration / 60)}m` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Win Streak */}
        {chessMetrics?.win_streak !== undefined && (
          <div className="p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 dark:from-yellow-500/20 dark:to-orange-500/20 rounded-xl border border-yellow-400/30 dark:border-yellow-400/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon icon={Zap} size="sm" className="text-yellow-500" />
                <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">Current Win Streak</span>
              </div>
              <span className="text-gray-800 dark:text-white font-bold text-lg">
                {chessMetrics.win_streak}
              </span>
            </div>
            {chessMetrics.best_win_streak > chessMetrics.win_streak && (
              <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                Best: {chessMetrics.best_win_streak} games
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 