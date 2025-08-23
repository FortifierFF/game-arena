import React from 'react';
import { GameStats } from '@/types/auth';
import Icon, { Target, Clock, Gamepad2, Trophy } from '@/components/ui/Icon';

interface SudokuStatsProps {
  stats: GameStats | null;
}

export default function SudokuStats({ stats }: SudokuStatsProps) {
  if (!stats || stats.game_type !== 'sudoku') {
    return (
      <div className="backdrop-blur-xl bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-3xl p-6 shadow-2xl">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <Icon icon={Gamepad2} size="sm" className="mx-auto mb-3 text-gray-500" />
          <p>No sudoku puzzles completed yet</p>
          <p className="text-sm">Start solving puzzles to see your statistics!</p>
        </div>
      </div>
    );
  }

  const sudokuMetrics = stats.game_metrics.sudoku;
  const totalPuzzles = sudokuMetrics?.puzzles_completed || 0;
  const avgTime = sudokuMetrics?.average_completion_time || 0;

  return (
    <div className="backdrop-blur-xl bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-3xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
          <Icon icon={Gamepad2} size="sm" className="text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Sudoku</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Your puzzle solving skills</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Total Puzzles */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 dark:from-green-500/20 dark:to-emerald-500/20 rounded-2xl border border-green-400/30 dark:border-green-400/30">
          <div className="flex items-center gap-3">
            <Icon icon={Target} size="sm" className="text-green-500" />
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Puzzles Completed</p>
              <p className="text-gray-800 dark:text-white font-bold text-lg">{totalPuzzles}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-green-500 text-sm">Total</p>
          </div>
        </div>

        {/* Average Time */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 dark:from-blue-500/20 dark:to-cyan-500/20 rounded-2xl border border-blue-400/30 dark:border-blue-400/30">
          <div className="flex items-center gap-3">
            <Icon icon={Clock} size="sm" className="text-blue-500" />
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Average Time</p>
              <p className="text-gray-800 dark:text-white font-bold text-lg">
                {avgTime > 0 ? `${Math.round(avgTime / 60)}m ${avgTime % 60}s` : 'N/A'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-blue-500 text-sm">Per Puzzle</p>
          </div>
        </div>

        {/* Difficulty Breakdown */}
        {sudokuMetrics?.difficulty_levels && (
          <div className="p-4 bg-gray-100 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
            <h4 className="text-gray-800 dark:text-white font-semibold mb-3">Difficulty Breakdown</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <p className="text-gray-800 dark:text-white font-bold text-lg text-green-600">
                  {sudokuMetrics.difficulty_levels.easy || 0}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Easy</p>
              </div>
              <div className="text-center">
                <p className="text-gray-800 dark:text-white font-bold text-lg text-yellow-600">
                  {sudokuMetrics.difficulty_levels.medium || 0}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Medium</p>
              </div>
              <div className="text-center">
                <p className="text-gray-800 dark:text-white font-bold text-lg text-orange-600">
                  {sudokuMetrics.difficulty_levels.hard || 0}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Hard</p>
              </div>
              <div className="text-center">
                <p className="text-gray-800 dark:text-white font-bold text-lg text-red-600">
                  {sudokuMetrics.difficulty_levels.expert || 0}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Expert</p>
              </div>
            </div>
          </div>
        )}

        {/* Best Times */}
        {sudokuMetrics?.best_times && (
          <div className="p-4 bg-gray-100 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
            <h4 className="text-gray-800 dark:text-white font-semibold mb-3">Best Times</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center mb-1">
                  <Icon icon={Trophy} size="xs" className="text-green-500" />
                  <span className="text-gray-600 dark:text-gray-400 text-xs">Easy</span>
                </div>
                <p className="text-gray-800 dark:text-white font-semibold text-sm">
                  {sudokuMetrics.best_times.easy ? `${Math.round(sudokuMetrics.best_times.easy / 60)}m` : 'N/A'}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center mb-1">
                  <Icon icon={Trophy} size="xs" className="text-yellow-500" />
                  <span className="text-gray-600 dark:text-gray-400 text-xs">Medium</span>
                </div>
                <p className="text-gray-800 dark:text-white font-semibold text-sm">
                  {sudokuMetrics.best_times.medium ? `${Math.round(sudokuMetrics.best_times.medium / 60)}m` : 'N/A'}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center mb-1">
                  <Icon icon={Trophy} size="xs" className="text-orange-500" />
                  <span className="text-gray-600 dark:text-gray-400 text-xs">Hard</span>
                </div>
                <p className="text-gray-800 dark:text-white font-semibold text-sm">
                  {sudokuMetrics.best_times.hard ? `${Math.round(sudokuMetrics.best_times.hard / 60)}m` : 'N/A'}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center mb-1">
                  <Icon icon={Trophy} size="xs" className="text-red-500" />
                  <span className="text-gray-600 dark:text-gray-400 text-xs">Expert</span>
                </div>
                <p className="text-gray-800 dark:text-white font-semibold text-sm">
                  {sudokuMetrics.best_times.expert ? `${Math.round(sudokuMetrics.best_times.expert / 60)}m` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="p-3 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Progress</span>
            <span className="text-gray-800 dark:text-white text-sm font-medium">{totalPuzzles} puzzles</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((totalPuzzles / 100) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
            {totalPuzzles < 100 ? `${100 - totalPuzzles} more to reach 100 puzzles!` : 'Amazing! You\'ve completed 100+ puzzles!'}
          </p>
        </div>
      </div>
    </div>
  );
} 