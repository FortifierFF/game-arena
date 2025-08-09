/**
 * Chess Game Page
 * Human vs AI chess game using Stockfish engine
 */

import ChessBoard from '@/components/chess/ChessBoardClient';

export default function ChessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ♔ Chess vs Stockfish
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Challenge the world&apos;s strongest chess engine with adjustable difficulty levels
          </p>
        </div>
        
        <ChessBoard />
      </div>
    </div>
  );
} 