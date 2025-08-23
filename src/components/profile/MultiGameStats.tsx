import React, { useState } from 'react';
import { GameStats } from '@/types/auth';
import Icon, { Trophy, Target, Gamepad2 } from '@/components/ui/Icon';
import OverviewStats from './OverviewStats';
import ChessStats from './ChessStats';
import SudokuStats from './SudokuStats';

interface MultiGameStatsProps {
  gameStats: GameStats[];
}

export default function MultiGameStats({ gameStats }: MultiGameStatsProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Get stats for specific games
  const chessStats = gameStats.find(stat => stat.game_type === 'chess') || null;
  const sudokuStats = gameStats.find(stat => stat.game_type === 'sudoku') || null;
  const checkersStats = gameStats.find(stat => stat.game_type === 'checkers') || null;
  const solitaireStats = gameStats.find(stat => stat.game_type === 'solitaire') || null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Trophy, count: gameStats.length },
    { id: 'chess', label: 'Chess', icon: Target, count: chessStats?.total_games || 0 },
    { id: 'checkers', label: 'Checkers', icon: Gamepad2, count: checkersStats?.total_games || 0 },
    { id: 'sudoku', label: 'Sudoku', icon: Gamepad2, count: sudokuStats?.game_metrics?.sudoku?.puzzles_completed || 0 },
    { id: 'solitaire', label: 'Solitaire', icon: Gamepad2, count: solitaireStats?.total_games || 0 },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewStats gameStats={gameStats} />;
      case 'chess':
        return <ChessStats stats={chessStats} />;
      case 'checkers':
        return (
          <div className="backdrop-blur-xl bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-3xl p-6 shadow-2xl">
                      <div className="text-center text-gray-600 dark:text-gray-400">
            <Icon icon={Gamepad2} size="sm" className="mx-auto mb-3 text-gray-500" />
            <p>Checkers stats coming soon!</p>
            <p className="text-sm">This game is not yet implemented</p>
          </div>
          </div>
        );
      case 'sudoku':
        return <SudokuStats stats={sudokuStats} />;
      case 'solitaire':
        return (
          <div className="backdrop-blur-xl bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-3xl p-6 shadow-2xl">
                      <div className="text-center text-gray-600 dark:text-gray-400">
            <Icon icon={Gamepad2} size="sm" className="mx-auto mb-3 text-gray-500" />
            <p>Solitaire stats coming soon!</p>
            <p className="text-sm">This game is not yet implemented</p>
          </div>
          </div>
        );
      default:
        return <OverviewStats gameStats={gameStats} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 items-start">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          const hasData = tab.count > 0;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 h-auto min-h-0 flex-shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-lg'
                  : hasData
                    ? 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'
                    : 'bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
              disabled={!hasData && tab.id !== 'overview'}
              style={{ height: 'auto', minHeight: 'auto' }}
            >
              <IconComponent size="sm" />
              <span>{tab.label}</span>
              {hasData && (
                <span className={`px-2 py-1 rounded-full text-xs ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-200 dark:bg-white/20 text-gray-600 dark:text-gray-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="h-auto">
        {renderTabContent()}
      </div>
    </div>
  );
} 