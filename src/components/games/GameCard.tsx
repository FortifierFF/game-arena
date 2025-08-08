/**
 * Game Card Component
 * 
 * Displays individual game information in a card format
 */

import { GameCardProps } from '@/types/game';
import { 
  getStatusColor, 
  getDifficultyColor, 
  getStatusText, 
  getGameButtonClasses, 
  getGameButtonText,
  formatPlayerCount,
  formatRating
} from '@/lib/gameUtils';
import Icon, { Users, Trophy, Star } from '@/components/ui/Icon';

export default function GameCard({ game, onPlay, className = '' }: GameCardProps) {
  const handlePlayClick = () => {
    if (game.status === 'available' && onPlay) {
      onPlay(game.id);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden ${className}`}>
      {/* Game Image Placeholder */}
      <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <span className="text-6xl">{game.icon}</span>
      </div>
      
      <div className="p-6">
        {/* Game Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {game.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {game.description}
            </p>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(game.status)}`}>
            {getStatusText(game.status)}
          </span>
        </div>

        {/* Game Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Icon icon={Users} size="sm" />
              <span>{formatPlayerCount(game.players)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon icon={Trophy} size="sm" />
              <span className={getDifficultyColor(game.difficulty)}>{game.difficulty}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Icon icon={Star} size="sm" />
            <span>{formatRating(game.rating)}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handlePlayClick}
          className={getGameButtonClasses(game.status)}
          disabled={game.status !== 'available'}
        >
          {getGameButtonText(game.status)}
        </button>
      </div>
    </div>
  );
} 