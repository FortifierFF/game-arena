/**
 * MoveLog Component
 * Displays chess game move history in human-readable format
 */

'use client';

import { ChessMove } from '@/hooks/useChessGame';

interface MoveLogProps {
  moveLog: ChessMove[];
  getMoveLog: () => Array<{
    moveNumber: number;
    whiteMove: ChessMove | null;
    blackMove: ChessMove | null;
  }>;
}

export function MoveLog({ moveLog, getMoveLog }: MoveLogProps) {
  
  const formattedMoves = getMoveLog();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md max-h-[278px] overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Move History
      </h3>
      
      {moveLog.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No moves yet. Make your first move!
        </p>
      ) : (
        <div className="space-y-2">
          {formattedMoves.map((moveGroup, index) => (
            <div key={index} className="flex items-center space-x-4 text-sm">
              {/* Move number */}
              <span className="text-gray-500 dark:text-gray-400 font-mono w-8">
                {moveGroup.moveNumber}.
              </span>
              
              {/* White move */}
              <div className="flex-1">
                {moveGroup.whiteMove && (
                  <span className="text-gray-900 dark:text-white">
                    {moveGroup.whiteMove.notation}
                    <span className="text-xs text-gray-500 ml-1">
                      ({moveGroup.whiteMove.piece})
                    </span>
                  </span>
                )}
              </div>
              
              {/* Black move */}
              <div className="flex-1">
                {moveGroup.blackMove && (
                  <span className="text-gray-900 dark:text-white">
                    {moveGroup.blackMove.notation}
                    <span className="text-xs text-gray-500 ml-1">
                      ({moveGroup.blackMove.piece})
                    </span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Move count summary */}
      {moveLog.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Total moves: {moveLog.length} | 
            Last move: {moveLog[moveLog.length - 1]?.timestamp.toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
} 