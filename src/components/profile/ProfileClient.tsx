'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { UserProfile } from '@/types/auth';
import ProfileHero from './ProfileHero';
import ProfileForm from './ProfileForm';
import ProfileStats from './ProfileStats';
import ProfileActions from './ProfileActions';

export default function ProfileClient() {
  const { user, profile, stats, updateProfile, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (profile) {
      setLocalProfile(profile);
    }
  }, [profile]);

  const handleSave = async (updatedProfile: Partial<UserProfile>) => {
    try {
      await updateProfile(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    setLocalProfile(profile);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center text-gray-800 dark:text-white">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
          <p className="text-gray-600 dark:text-gray-300">Connect your wallet to access your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 dark:opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 dark:opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 dark:opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <ProfileHero 
          user={user} 
          profile={profile} 
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <ProfileForm
              profile={localProfile}
              isEditing={isEditing}
              onSave={handleSave}
              onCancel={handleCancel}
              onChange={setLocalProfile}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <ProfileStats stats={stats} />
            
            {/* Actions Card */}
            <ProfileActions 
              user={user}
              onEdit={() => setIsEditing(true)}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 