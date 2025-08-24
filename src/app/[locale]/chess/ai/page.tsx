/**
 * AI Chess Game Page
 * Human vs AI chess game using Stockfish engine
 */

'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Dynamically import ChessBoard to prevent SSR hydration issues
const ChessBoard = dynamic(() => import('@/components/chess/ChessBoard'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading Chess Board...</p>
      </div>
    </div>
  )
});

export default function AIChessPage() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link 
            href="/chess" 
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors duration-200 mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Game Modes
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Chess vs AI
          </h1>
        </div>
      </div>

      {/* Chess Board */}
      <div className="container mx-auto px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          <ChessBoard />
        </div>
      </div>
    </div>
  );
} 