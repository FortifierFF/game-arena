/**
 * Games Hero Component
 * 
 * Hero section for the Games page with title and description
 */

interface GamesHeroProps {
  className?: string;
}

export default function GamesHero({ className = '' }: GamesHeroProps) {
  return (
    <div className={`text-center mb-12 ${className}`}>
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl mb-4">
        🎮 Game Library
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
        Discover our collection of classic and modern games. From strategic board games 
        to relaxing card games, there&apos;s something for every player.
      </p>
    </div>
  );
} 