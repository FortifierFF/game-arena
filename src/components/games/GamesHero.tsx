/**
 * Games Hero Component
 * 
 * Hero section for the Games page with title and description
 */

'use client';

import { useTranslations } from 'next-intl';

interface GamesHeroProps {
  className?: string;
}

export default function GamesHero({ className = '' }: GamesHeroProps) {
  const t = useTranslations('games');
  
  return (
    <div className={`text-center mb-12 ${className}`}>
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl mb-4">
        {t('hero.title')}
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
        {t('hero.description')}
      </p>
    </div>
  );
} 