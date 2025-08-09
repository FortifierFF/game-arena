/**
 * Game Card Component
 * 
 * Displays individual game information in a card format
 */

'use client';

import { GameCardProps } from '@/types/game';
import { 
  getGameStatusClass, 
  getDifficultyClass, 
  getGameButtonText
} from '@/lib/gameUtils';
import Icon, { Users, Trophy, Star } from '@/components/ui/Icon';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function GameCard({ game, onPlay, className = '' }: GameCardProps) {
  const t = useTranslations('gameData');
  const tStatus = useTranslations('games.status');
  const tDifficulty = useTranslations('games.difficulty');
  
  const handlePlayClick = () => {
    if (game.status === 'available' && onPlay) {
      onPlay(game.id);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden ${className}`}>
      {/* Game Image Placeholder */}
      <div className="h-48 relative bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <Image src={game.image} alt={game.name} fill className="object-cover" />
      </div>
      
      <div className="p-6">
        {/* Game Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {t(`${game.name}.name`)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t(`${game.name}.description`)}
            </p>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGameStatusClass(game.status)}`}>
            {tStatus(getGameButtonText(game.status))}
          </span>
        </div>

        {/* Game Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Icon icon={Users} size="sm" />
              <span>{game.players}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon icon={Trophy} size="sm" />
              <span className={getDifficultyClass(game.difficulty)}>{tDifficulty(game.difficulty.toLowerCase())}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Icon icon={Star} size="sm" />
            <span>{game.rating}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handlePlayClick}
          className={`w-full px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
            game.status === 'available'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={game.status !== 'available'}
        >
          {tStatus(getGameButtonText(game.status))}
        </button>
      </div>
    </div>
  );
} 