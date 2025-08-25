import React from 'react';

interface GameHeaderProps {
  gameId: string;
  playerColor: 'white' | 'black';
  gameStatus: string;
  currentPlayer: string;
  movesCount: number;
  onResign: () => void;
}

export default function GameHeader({ 
  gameId, 
  playerColor, 
  gameStatus, 
  currentPlayer, 
  movesCount, 
  onResign 
}: GameHeaderProps) {
  return (
    <div className="bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Game #{gameId.slice(0, 8)}
        </h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            You play as: <span className="font-semibold capitalize">{playerColor}</span>
          </div>
          <button
            onClick={onResign}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
          >
            Resign
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
          <div className="font-semibold text-gray-800 dark:text-white capitalize">
            {gameStatus === 'active' 
              ? (currentPlayer === playerColor ? 'Your Turn' : 'Opponent\'s Turn')
              : gameStatus
            }
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Current Player</div>
          <div className={`font-semibold capitalize ${
            currentPlayer === 'white' 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-gray-800 dark:text-white'
          }`}>
            {currentPlayer === 'white' ? 'White' : 'Black'}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Moves</div>
          <div className="font-semibold text-gray-800 dark:text-white">
            {movesCount}
          </div>
        </div>
      </div>
    </div>
  );
} 