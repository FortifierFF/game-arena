/**
 * Games Grid Component
 * 
 * Displays filtered game categories in a grid layout
 */

import { GameCategory, Game } from '@/types/game';
import CategorySection from './CategorySection';

interface GamesGridProps {
  categories: GameCategory[];
  onGameSelect?: (game: Game) => void;
  className?: string;
}

export default function GamesGrid({ 
  categories, 
  onGameSelect, 
  className = '' 
}: GamesGridProps) {
  return (
    <div className={`space-y-12 ${className}`}>
      {categories.map((category) => (
        <CategorySection 
          key={category.id} 
          category={category}
          onGameSelect={onGameSelect}
        />
      ))}
    </div>
  );
} 