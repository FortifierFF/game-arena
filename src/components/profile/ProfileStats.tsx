import React from 'react';
import { UserStats } from '@/types/auth';
import Icon, { Trophy, Target, TrendingUp, Gamepad2 } from '@/components/ui/Icon';

interface ProfileStatsProps {
  stats: UserStats | null;
}

export default function ProfileStats({ stats }: ProfileStatsProps) {
  if (!stats) {
    return (
      <div className="backdrop-blur-xl bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-3xl p-6 shadow-2xl">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <Icon icon={Gamepad2} size="sm" className="mx-auto mb-3 text-gray-500" />
          <p>No stats available yet</p>
          <p className="text-sm">Play some games to see your statistics!</p>
        </div>
      </div>
    );
  }

  const winRate = stats.total_games > 0 ? Math.round((stats.wins / stats.total_games) * 100) : 0;

  return (
    <div className="backdrop-blur-xl bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-3xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
          <Icon icon={Trophy} size="sm" className="text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Game Statistics</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Your gaming performance</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Rating */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 dark:from-purple-500/20 dark:to-pink-500/20 rounded-2xl border border-purple-400/30 dark:border-purple-400/30">
          <div className="flex items-center gap-3">
            <Icon icon={Target} size="sm" className="text-purple-400" />
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Current Rating</p>
              <p className="text-gray-800 dark:text-white font-bold text-lg">{stats.current_rating}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-purple-400 text-sm">ELO</p>
          </div>
        </div>

        {/* Win Rate */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 dark:from-green-500/20 dark:to-emerald-500/20 rounded-2xl border border-green-400/30 dark:border-green-400/30">
          <div className="flex items-center gap-3">
            <Icon icon={TrendingUp} size="sm" className="text-green-400" />
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Win Rate</p>
              <p className="text-gray-800 dark:text-white font-bold text-lg">{winRate}%</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-green-400 text-sm">{stats.wins}/{stats.total_games}</p>
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

        {/* Draws */}
        {stats.draws > 0 && (
          <div className="text-center p-3 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
            <p className="text-gray-800 dark:text-white font-bold text-lg">{stats.draws}</p>
            <p className="text-gray-600 dark:text-gray-400 text-xs">Draws</p>
          </div>
        )}
      </div>
    </div>
  );
} 