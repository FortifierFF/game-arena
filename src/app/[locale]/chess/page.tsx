/**
 * Chess Game Page
 * Human vs AI chess game using Stockfish engine
 */

import ChessBoard from '@/components/chess/ChessBoardClient';
import Link from 'next/link';
import Icon, { Users, Gamepad2 } from '@/components/ui/Icon';

export default function ChessPage() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Game Mode Selection */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-2">
            Chess Arena
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Choose your game mode
          </p>
        </div>

        <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI Game */}
          <Link href="/chess" className="group">
            <div className="p-8 bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-xl hover:border-cyan-400 dark:hover:border-cyan-400 transition-all duration-200 hover:shadow-lg">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                  <Icon icon={Gamepad2} size="xl" className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  Play vs AI
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Challenge our Stockfish engine with adjustable difficulty
                </p>
              </div>
            </div>
          </Link>

          {/* Multiplayer Game */}
          <Link href="/chess/multiplayer" className="group">
            <div className="p-8 bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-xl hover:border-cyan-400 dark:hover:border-cyan-400 transition-all duration-200 hover:shadow-lg">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                  <Icon icon={Users} size="xl" className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  Multiplayer
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Challenge real players from around the world
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* AI Game Board (hidden by default, can be toggled) */}
      <div className="hidden">
        <ChessBoard />
      </div>
    </div>
  );
} 