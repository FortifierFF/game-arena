import React from 'react';

interface Move {
  move: string;
  fen: string;
  timestamp: number;
}

interface MoveHistoryProps {
  moves: Move[];
}

export default function MoveHistory({ moves }: MoveHistoryProps) {
  return (
    <div className="bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Move History</h3>
      <div className="max-h-32 overflow-y-auto">
        {moves.length ? (
          <div className="grid grid-cols-2 gap-2 text-sm">
            {moves.map((move: Move, index: number) => (
              <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                {index + 1}. {move.move}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No moves yet</p>
        )}
      </div>
    </div>
  );
} 