import React from 'react';
import { UserProfile } from '@/types/auth';
import Icon, { Edit3, Crown, Shield, Zap } from '@/components/ui/Icon';

interface ProfileHeroProps {
  user: UserProfile;
  profile: UserProfile | null;
  isEditing: boolean;
  onEdit: () => void;
}

export default function ProfileHero({ user, profile, isEditing, onEdit }: ProfileHeroProps) {
  const username = profile?.username || 'Anonymous Player';
  const walletType = user.wallet_type || 'unknown';
  const walletAddress = user.wallet_address || '';

  return (
    <div className="relative">
      {/* Glassmorphism Hero Card */}
      <div className="backdrop-blur-xl bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          {/* Avatar Section */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 p-1 shadow-lg">
              <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center text-white text-2xl font-bold">
                {username.charAt(0).toUpperCase()}
              </div>
            </div>
            
            {/* Hover effect ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm scale-110"></div>
            
            {/* Edit button overlay */}
            {!isEditing && (
              <button
                onClick={onEdit}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform duration-200"
              >
                <Icon icon={Edit3} size="xs" />
              </button>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 via-cyan-600 to-purple-600 dark:from-white dark:via-cyan-100 dark:to-purple-100 bg-clip-text text-transparent">
                {username}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                {profile?.bio || 'No bio yet. Tell us about yourself!'}
              </p>
            </div>

            {/* Wallet Info */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/10 rounded-full border border-gray-200 dark:border-white/20">
                <div className={`w-3 h-3 rounded-full ${
                  walletType === 'metamask' ? 'bg-orange-400' : 
                  walletType === 'phantom' ? 'bg-purple-400' : 'bg-gray-400'
                }`}></div>
                <span className="text-gray-800 dark:text-white font-medium capitalize">{walletType}</span>
              </div>
              
              <div className="px-4 py-2 bg-gray-100 dark:bg-black/20 rounded-full border border-gray-200 dark:border-white/10">
                <code className="text-gray-700 dark:text-gray-300 text-sm font-mono">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </code>
              </div>
            </div>

            {/* Achievement Badges */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full border border-yellow-400/30">
                <Icon icon={Crown} size="xs" className="text-yellow-400" />
                <span className="text-yellow-300 text-sm font-medium">New Player</span>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full border border-blue-400/30">
                <Icon icon={Shield} size="xs" className="text-blue-400" />
                <span className="text-blue-300 text-sm font-medium">Verified</span>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full border border-purple-400/30">
                <Icon icon={Zap} size="xs" className="text-purple-400" />
                <span className="text-purple-300 text-sm font-medium">Active</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {!isEditing && (
              <button
                onClick={onEdit}
                className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-500 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 