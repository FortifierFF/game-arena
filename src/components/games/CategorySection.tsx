/**
 * Category Section Component
 * 
 * Displays a category with its associated games
 */

import { CategorySectionProps } from '@/types/game';
import Icon from '@/components/ui/Icon';
import GameCard from './GameCard';

export default function CategorySection({ category, onGameSelect, className = '' }: CategorySectionProps) {
  return (
    <section className={`mb-12 ${className}`}>
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Icon icon={category.icon} size="lg" className="text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {category.name}
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          {category.description}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {category.games.map((game) => (
          <GameCard 
            key={game.id} 
            game={game} 
            onPlay={onGameSelect ? () => onGameSelect(game) : undefined}
          />
        ))}
      </div>
    </section>
  );
} 