/**
 * Category Filter Component
 * 
 * Filter buttons for game categories
 */

'use client';

import { GameCategory } from '@/types/game';
import { useTranslations } from 'next-intl';

interface CategoryFilterProps {
  categories: GameCategory[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  className?: string;
}

export default function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onCategoryChange, 
  className = '' 
}: CategoryFilterProps) {
  const t = useTranslations('games');
  
  return (
    <div className={`flex flex-wrap justify-center gap-4 mb-12 ${className}`}>
      <button
        onClick={() => onCategoryChange('all')}
        className={`px-6 py-2 rounded-full font-medium transition-colors duration-200 ${
          selectedCategory === 'all'
            ? 'bg-blue-600 text-white'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        {t('filter.allGames')}
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`px-6 py-2 rounded-full font-medium transition-colors duration-200 ${
            selectedCategory === category.id
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
} 