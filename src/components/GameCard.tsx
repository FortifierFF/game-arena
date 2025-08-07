/**
 * GameCard Component
 * 
 * Demonstrates path aliases usage for clean imports
 */

import { Game, GameType } from '@/types/game';
import { cn } from '@/lib/utils';

interface GameCardProps {
  game: Game;
  onClick?: () => void;
  className?: string;
}

export default function GameCard({ game, onClick, className }: GameCardProps) {
  const getGameIcon = (type: GameType) => {
    switch (type) {
      case GameType.CHESS:
        return '♟️';
      case GameType.CHECKERS:
        return '🔴';
      case GameType.SOLITAIRE:
        return '🃏';
      case GameType.BELOT:
        return '🃏';
      default:
        return '🎮';
    }
  };

  return (
    <div
      className={cn(
        'p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <div className="text-4xl">{getGameIcon(game.type)}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {game.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {game.description}
          </p>
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{game.minPlayers}-{game.maxPlayers} players</span>
            <span className={game.isActive ? 'text-green-600' : 'text-red-600'}>
              {game.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 