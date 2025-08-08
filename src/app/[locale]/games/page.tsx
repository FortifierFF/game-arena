/**
 * Games Page
 * 
 * Displays all available games organized by categories
 */

'use client';

import { useState } from 'react';
import { Game } from '@/types/game';
import { useTranslatedGames } from '@/hooks/useTranslatedGames';
import { GamesHero, CategoryFilter, GamesGrid } from '@/components/games';

export default function GamesPage() {
  const { gameCategories } = useTranslatedGames();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredCategories = selectedCategory === 'all' 
    ? gameCategories 
    : gameCategories.filter(cat => cat.id === selectedCategory);

  const handleGameSelect = (game: Game) => {
    console.log('Selected game:', game);
    // TODO: Implement game selection logic
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      <section className="px-6 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <GamesHero />
          
          <CategoryFilter 
            categories={gameCategories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
          
          <GamesGrid 
            categories={filteredCategories}
            onGameSelect={handleGameSelect}
          />
        </div>
      </section>
    </main>
  );
} 