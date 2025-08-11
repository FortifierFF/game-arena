/**
 * Chess Game Page
 * Human vs AI chess game using Stockfish engine
 */

import ChessBoard from '@/components/chess/ChessBoardClient';

export default function ChessPage() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <ChessBoard />
    </div>
  );
} 