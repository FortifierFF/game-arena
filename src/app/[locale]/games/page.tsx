/**
 * Games Page
 * 
 * Displays all available games organized by categories
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Game } from '@/types/game';
import { useTranslatedGames } from '@/hooks/useTranslatedGames';
import { GamesHero, CategoryFilter, GamesGrid } from '@/components/games';

export default function GamesPage() {
  const { gameCategories } = useTranslatedGames();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const router = useRouter();

  const filteredCategories = selectedCategory === 'all' 
    ? gameCategories 
    : gameCategories.filter(cat => cat.id === selectedCategory);

  const handleGameSelect = (game: Game) => {
    console.log('Selected game:', game);
    
    // Navigate to the appropriate game page based on game ID
    switch (game.id) {
      case 'chess':
        router.push('/chess');
        break;
      case 'checkers':
        router.push('/checkers');
        break;
      case 'solitaire':
        router.push('/solitaire');
        break;
      case 'belot':
        router.push('/belot');
        break;
      case 'sudoku':
        router.push('/sudoku');
        break;
      default:
        console.log('Game not implemented yet:', game.id);
        // You could show a toast notification here
        break;
    }
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