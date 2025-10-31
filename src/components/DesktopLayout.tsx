import { useState } from 'react';
import { Timer } from './Timer/Timer';
import { Counter } from './Counter/Counter';
import { ProfileList } from './Profiles/ProfileList';
import { SaveProfileModal } from './Profiles/SaveProfileModal';
import { SettingsPanel } from './Settings/SettingsPanel';
import { Activity, Profile } from '../types';
import { useStorage } from '../contexts/StorageContext';

export function DesktopLayout() {
  const { profiles, saveProfile, deleteProfile } = useStorage();
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
  };

  const handleEditProfile = (profile: Profile) => {
    setActivities(profile.activities);
    setRepeatCount(profile.repeatCount);
    setEditingProfile(profile);
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
    <div className="min-h-screen bg-[#F6F7F9] dark:bg-[#0F1113]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Vibe Training
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Offline-first workout timer & counter
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Timer
              activities={activities}
              repeatCount={repeatCount}
              onActivitiesChange={setActivities}
              onRepeatCountChange={setRepeatCount}
              onSave={() => setShowSaveModal(true)}
            />
            <Counter />
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-[#121316] rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Saved Profiles
              </h2>
              <div className="max-h-[500px] overflow-y-auto">
                <ProfileList
                  profiles={profiles}
                  onLoad={handleLoadProfile}
                  onEdit={handleEditProfile}
                  onDuplicate={handleDuplicateProfile}
                  onDelete={deleteProfile}
                />
              </div>
            </div>

            <SettingsPanel />
          </div>
        </div>
      </div>

      <SaveProfileModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveProfile}
        defaultName={editingProfile?.name || ''}
      />
    </div>
  );
}
