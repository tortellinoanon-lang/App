import { useState } from 'react';
import { Home, Users, Settings as SettingsIcon } from 'lucide-react';
import { Timer } from './Timer/Timer';
import { Counter } from './Counter/Counter';
import { ProfileList } from './Profiles/ProfileList';
import { SaveProfileModal } from './Profiles/SaveProfileModal';
import { SettingsPanel } from './Settings/SettingsPanel';
import { Activity, Profile } from '../types';
import { useStorage } from '../contexts/StorageContext';

type Tab = 'home' | 'profiles' | 'settings';

export function MobileLayout() {
  const { profiles, saveProfile, deleteProfile } = useStorage();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [repeatCount, setRepeatCount] = useState(1);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  const handleSaveProfile = async (name: string) => {
    const profile: Profile = {
      id: editingProfile?.id || crypto.randomUUID(),
      name,
      activities,
      repeatCount,
      created_at: editingProfile?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await saveProfile(profile);
    setEditingProfile(null);
  };

  const handleLoadProfile = (profile: Profile) => {
    setActivities(profile.activities);
    setRepeatCount(profile.repeatCount);
    setEditingProfile(null);
    setActiveTab('home');
  };

  const handleEditProfile = (profile: Profile) => {
    setActivities(profile.activities);
    setRepeatCount(profile.repeatCount);
    setEditingProfile(profile);
    setActiveTab('home');
  };

  const handleDuplicateProfile = async (profile: Profile) => {
    const newProfile: Profile = {
      ...profile,
      id: crypto.randomUUID(),
      name: `${profile.name} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await saveProfile(newProfile);
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9] dark:bg-[#0F1113] flex flex-col">
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {activeTab === 'home' && (
            <div className="space-y-6">
              <Timer
                activities={activities}
                repeatCount={repeatCount}
                onActivitiesChange={setActivities}
                onRepeatCountChange={setRepeatCount}
                onSave={() => setShowSaveModal(true)}
              />
              <Counter />
            </div>
          )}

          {activeTab === 'profiles' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Saved Profiles
              </h1>
              <ProfileList
                profiles={profiles}
                onLoad={handleLoadProfile}
                onEdit={handleEditProfile}
                onDuplicate={handleDuplicateProfile}
                onDelete={deleteProfile}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Settings
              </h1>
              <SettingsPanel />
            </div>
          )}
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#121316] border-t border-gray-200 dark:border-gray-800 shadow-lg">
        <div className="flex items-center justify-around px-4 py-3">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
              activeTab === 'home'
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Home size={24} />
            <span className="text-xs font-medium">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('profiles')}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
              activeTab === 'profiles'
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Users size={24} />
            <span className="text-xs font-medium">Profiles</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
              activeTab === 'settings'
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <SettingsIcon size={24} />
            <span className="text-xs font-medium">Settings</span>
          </button>
        </div>
      </nav>

      <SaveProfileModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveProfile}
        defaultName={editingProfile?.name || ''}
      />
    </div>
  );
}
