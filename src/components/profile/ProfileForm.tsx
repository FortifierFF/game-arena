import React, { useState } from 'react';
import { UserProfile } from '@/types/auth';
import Icon, { Save, X, User, Mail, Phone, Globe, MapPin, Edit3 } from '@/components/ui/Icon';
import CountryCodeSelector from './CountryCodeSelector';

interface ProfileFormProps {
  profile: UserProfile | null;
  isEditing: boolean;
  onSave: (updates: Partial<UserProfile>) => Promise<void>;
  onCancel: () => void;
  onChange: (profile: UserProfile | null) => void;
}

export default function ProfileForm({ 
  profile, 
  isEditing, 
  onSave, 
  onCancel, 
  onChange 
}: ProfileFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [countryCode, setCountryCode] = useState('+1');

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    if (!profile) return;
    
    const updatedProfile = { ...profile, [field]: value };
    onChange(updatedProfile);
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (profile?.['username'] && profile['username'].length < 3) {
      newErrors['username'] = 'Username must be at least 3 characters';
    }
    
    if (profile?.['email'] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile['email'])) {
      newErrors['email'] = 'Please enter a valid email address';
    }
    
    if (profile?.['phone'] && !/^[\+]?[1-9][\d]{0,15}$/.test(profile['phone'].replace(/\s/g, ''))) {
      newErrors['phone'] = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!profile || !validateForm()) return;
    
    setIsSaving(true);
    try {
      const updates: Partial<UserProfile> = {};
      if (profile.username) updates.username = profile.username;
      if (profile.email) updates.email = profile.email;
      if (profile.phone) updates.phone = `${countryCode} ${profile.phone}`;
      if (profile.bio) updates.bio = profile.bio;
      if (profile.country) updates.country = profile.country;
      if (profile.timezone) updates.timezone = profile.timezone;
      
      await onSave(updates);
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) return null;

  const formFields = [
    {
      key: 'username' as keyof UserProfile,
      label: 'Username',
      icon: User,
      placeholder: 'Enter your username',
      type: 'text',
      required: false,
      maxLength: 30,
    },
    {
      key: 'email' as keyof UserProfile,
      label: 'Email',
      icon: Mail,
      placeholder: 'Enter your email address',
      type: 'email',
      required: false,
    },
    {
      key: 'phone' as keyof UserProfile,
      label: 'Phone',
      icon: Phone,
      placeholder: 'Enter your phone number',
      type: 'tel',
      required: false,
    },
    {
      key: 'country' as keyof UserProfile,
      label: 'Country',
      icon: MapPin,
      placeholder: 'Enter your country',
      type: 'text',
      required: false,
    },
    // Temporarily hidden - will implement auto-detection later
    // {
    //   key: 'timezone' as keyof UserProfile,
    //   label: 'Timezone',
    //   icon: Clock,
    //   placeholder: 'e.g., UTC-5, Europe/London',
    //   type: 'text',
    //   required: false,
    // },
  ];

  return (
    <div className="backdrop-blur-xl bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-3xl p-8 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
            <Icon icon={Edit3} size="sm" className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Profile Information</h2>
            <p className="text-gray-600 dark:text-gray-300">Update your personal details and preferences</p>
          </div>
        </div>
        
        {isEditing && (
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="px-4 py-2 bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white rounded-xl border border-gray-200 dark:border-white/20 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors duration-200 disabled:opacity-50"
            >
              <Icon icon={X} size="sm" className="mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-purple-500 text-white rounded-xl hover:from-cyan-500 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
            >
              <Icon icon={Save} size="sm" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {formFields.map((field) => {
          const IconComponent = field.icon;
          const value = profile[field.key] || '';
          const error = errors[field.key];
          
          // Special handling for phone field
          if (field.key === 'phone') {
            return (
              <div key={field.key} className="space-y-2">
                <label className="flex items-center gap-2 text-gray-800 dark:text-white font-medium">
                  <Icon icon={field.icon} size="xs" className="text-cyan-400" />
                  {field.label}
                </label>
                
                <div className="relative">
                  <div className="flex">
                    <CountryCodeSelector
                      selectedCode={countryCode}
                      onCodeChange={setCountryCode}
                    />
                                             <input
                           type="tel"
                           value={value}
                           onChange={(e) => handleInputChange(field.key, e.target.value)}
                           placeholder="Enter phone number"
                           disabled={!isEditing || isSaving}
                           className="flex-1 px-4 py-3 bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-r-xl text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 focus:ring-4 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed h-[52px]"
                         />
                  </div>
                  
                  {error && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <Icon icon={IconComponent} size="xs" />
                      {error}
                    </p>
                  )}
                  
                </div>
              </div>
            );
          }
          
          return (
            <div key={field.key} className="space-y-2">
              <label className="flex items-center gap-2 text-gray-800 dark:text-white font-medium">
                <Icon icon={field.icon} size="xs" className="text-cyan-500 dark:text-cyan-400" />
                {field.label}
              </label>
              
              <div className="relative">
                <input
                  type={field.type}
                  value={value}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                  disabled={!isEditing || isSaving}
                  className={`w-full px-4 py-3 bg-gray-100 dark:bg-white/10 border rounded-xl text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 h-[52px] ${
                    error 
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' 
                      : 'border-gray-200 dark:border-white/20 focus:border-cyan-400 focus:ring-cyan-400/20'
                  } focus:ring-4 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                />
                
                {error && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <Icon icon={IconComponent} size="xs" />
                    {error}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bio Field - Full Width */}
      <div className="mt-6 space-y-2">
        <label className="flex items-center gap-2 text-gray-800 dark:text-white font-medium">
          <Icon icon={Globe} size="xs" className="text-cyan-500 dark:text-cyan-400" />
          Bio
        </label>
        
        <textarea
          value={profile.bio || ''}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          placeholder="Tell us about yourself..."
          rows={4}
          maxLength={500}
          disabled={!isEditing || isSaving}
          className="w-full px-4 py-3 bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-xl text-gray-800 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 focus:ring-4 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
        />
        
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Share your story, interests, or gaming preferences</span>
          <span>{profile.bio?.length || 0}/500</span>
        </div>
      </div>

      {/* Read-only Fields */}
      <div className="mt-8 p-6 bg-gray-100 dark:bg-black/20 rounded-2xl border border-gray-200 dark:border-white/10">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-600 dark:text-gray-400 text-sm">Wallet Address</label>
            <p className="text-gray-800 dark:text-white font-mono text-sm break-all">{profile.wallet_address}</p>
          </div>
          <div>
            <label className="text-gray-600 dark:text-gray-400 text-sm">Wallet Type</label>
            <p className="text-gray-800 dark:text-white capitalize">{profile.wallet_type}</p>
          </div>
          <div>
            <label className="text-gray-600 dark:text-gray-400 text-sm">Member Since</label>
            <p className="text-gray-800 dark:text-white">{new Date(profile.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <label className="text-gray-600 dark:text-gray-400 text-sm">Last Updated</label>
            <p className="text-gray-800 dark:text-white">{new Date(profile.updated_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 