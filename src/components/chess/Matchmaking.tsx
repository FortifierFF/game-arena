'use client';

import React, { useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/components/providers/AuthProvider';
import Icon, { Search, Users } from '@/components/ui/Icon';

const timeControls = [
  { label: '5 min Blitz', value: '5+0' },
  { label: '10 min Rapid', value: '10+0' },
  { label: '15+10 Classical', value: '15+10' },
  { label: '30 min Classical', value: '30+0' }
];

export default function Matchmaking() {
  const { user } = useAuth();
  const { joinQueue, leaveQueue, matchmakingState, isConnected } = useSocket();
  const [selectedTimeControl, setSelectedTimeControl] = useState('10+0');

  const handleStartSearch = () => {
    if (!user?.id) {
      console.error('No user ID available');
      return;
    }

    console.log('🎯 Starting search with time control:', selectedTimeControl);
    joinQueue(selectedTimeControl, 1200); // Default rating for now
  };

  const handleCancelSearch = () => {
    console.log('🚪 Cancelling search');
    leaveQueue();
  };

  const formatDuration = (startTime: number | null) => {
    if (!startTime) return '0:00';
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isConnected) {
    return (
      <div className="text-center p-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
          <Icon icon={Search} size="lg" className="text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          Not Connected
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we connect to the game server...
        </p>
      </div>
    );
  }

  if (matchmakingState.isSearching) {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center p-8 bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-xl">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
            <Icon icon={Search} size="lg" className="text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Searching for opponent...
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {formatDuration(matchmakingState.startTime)} elapsed
          </p>
          
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div>Time Control: {matchmakingState.timeControl}</div>
            <div>Rating Range: ±200 points</div>
            <div className="flex items-center justify-center gap-2">
              <Icon icon={Users} size="sm" />
              Players in queue: {matchmakingState.queueSize}
            </div>
          </div>

          <button
            onClick={handleCancelSearch}
            className="mt-6 w-full py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors duration-200"
          >
            Cancel Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="p-8 bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
            <Icon icon={Search} size="lg" className="text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Find an Opponent
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Choose your preferred time control and start searching
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Control
            </label>
            <div className="grid grid-cols-2 gap-2">
              {timeControls.map((control) => (
                <button
                  key={control.value}
                  onClick={() => setSelectedTimeControl(control.value)}
                  className={`p-3 text-sm font-medium rounded-lg border transition-colors duration-200 ${
                    selectedTimeControl === control.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-white/20 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/30'
                  }`}
                >
                  {control.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartSearch}
            className="w-full py-3 px-6 bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-500 hover:to-purple-600 transition-all duration-200"
          >
            <Icon icon={Search} size="sm" className="mr-2" />
            Find Opponent
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Find opponents of similar skill level</p>
          <p>Games are automatically rated</p>
        </div>
      </div>
    </div>
  );
} 