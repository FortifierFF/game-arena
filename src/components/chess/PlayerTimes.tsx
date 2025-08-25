import React from 'react';

interface PlayerTimesProps {
  whiteTime: number;
  blackTime: number;
}

export default function PlayerTimes({ whiteTime, blackTime }: PlayerTimesProps) {
  // Format time from seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Player Times</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">White:</span>
          <span className="font-mono text-gray-800 dark:text-white">
            {formatTime(whiteTime)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Black:</span>
          <span className="font-mono text-gray-800 dark:text-white">
            {formatTime(blackTime)}
          </span>
        </div>
      </div>
    </div>
  );
} 