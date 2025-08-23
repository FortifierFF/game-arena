import React from 'react';
import { UserProfile } from '@/types/auth';
import Icon, { Settings, Shield, Download, Share2, Edit3 } from '@/components/ui/Icon';

interface ProfileActionsProps {
  user: UserProfile;
  onEdit: () => void;
}

export default function ProfileActions({ user, onEdit }: ProfileActionsProps) {
  const actions = [
    {
      icon: Edit3,
      label: 'Edit Profile',
      description: 'Update your information',
      action: onEdit,
      color: 'from-cyan-400 to-purple-500',
      hoverColor: 'from-cyan-500 to-purple-600',
    },
    {
      icon: Settings,
      label: 'Settings',
      description: 'Account preferences',
      action: () => console.log('Settings clicked'),
      color: 'from-blue-400 to-cyan-500',
      hoverColor: 'from-blue-500 to-cyan-600',
      disabled: true,
    },
    {
      icon: Shield,
      label: 'Privacy',
      description: 'Manage your privacy',
      action: () => console.log('Privacy clicked'),
      color: 'from-green-400 to-emerald-500',
      hoverColor: 'from-green-500 to-emerald-600',
      disabled: true,
    },
    {
      icon: Download,
      label: 'Export Data',
      description: 'Download your data',
      action: () => console.log('Export clicked'),
      color: 'from-orange-400 to-red-500',
      hoverColor: 'from-orange-500 to-red-600',
      disabled: true,
    },
    {
      icon: Share2,
      label: 'Share Profile',
      description: 'Share your profile',
      action: () => {
        if (navigator.share) {
          navigator.share({
            title: `${user.username || 'Player'}'s Profile`,
            text: `Check out ${user.username || 'this player'}'s profile on GameArena!`,
            url: window.location.href,
          });
        } else {
          navigator.clipboard.writeText(window.location.href);
          // You could add a toast notification here
        }
      },
      color: 'from-purple-400 to-pink-500',
      hoverColor: 'from-purple-500 to-pink-600',
    },
  ];

  return (
    <div className="backdrop-blur-xl bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-3xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
          <Icon icon={Settings} size="sm" className="text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Quick Actions</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Manage your account</p>
        </div>
      </div>

      <div className="space-y-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            disabled={action.disabled}
            className={`w-full p-4 bg-gradient-to-r ${action.color} hover:${action.hoverColor} text-white rounded-2xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none`}
          >
            <div className="flex items-center gap-3">
              <Icon icon={action.icon} size="sm" className="text-white" />
              <div className="text-left">
                <p className="font-semibold">{action.label}</p>
                <p className="text-sm opacity-90">{action.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Coming Soon Notice */}
      <div className="mt-6 p-4 bg-gray-100 dark:bg-black/20 rounded-2xl border border-gray-200 dark:border-white/10">
        <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
          More features coming soon! 🚀
        </p>
      </div>
    </div>
  );
} 