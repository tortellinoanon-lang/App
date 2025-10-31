import { Copy, Edit2, Trash2, Play } from 'lucide-react';
import { Profile } from '../../types';

interface ProfileListProps {
  profiles: Profile[];
  onLoad: (profile: Profile) => void;
  onEdit: (profile: Profile) => void;
  onDuplicate: (profile: Profile) => void;
  onDelete: (id: string) => void;
}

export function ProfileList({ profiles, onLoad, onEdit, onDuplicate, onDelete }: ProfileListProps) {
  const getTotalTime = (profile: Profile): string => {
    const totalSeconds = profile.activities.reduce((sum, a) => sum + a.duration, 0) * profile.repeatCount;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  if (profiles.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg">No saved profiles yet</p>
        <p className="text-sm mt-2">Create and save your first flow</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
      {profiles.map((profile) => (
        <div
          key={profile.id}
          className="bg-white dark:bg-[#121316] rounded-xl shadow-md hover:shadow-lg transition-shadow p-5"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {profile.name}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>{profile.activities.length} activities</span>
                <span>•</span>
                <span>{getTotalTime(profile)}</span>
                {profile.repeatCount > 1 && (
                  <>
                    <span>•</span>
                    <span>×{profile.repeatCount}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {profile.activities.slice(0, 3).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      activity.color === 'green'
                        ? '#4CAF50'
                        : activity.color === 'orange'
                        ? '#FF9800'
                        : '#6B7280'
                  }}
                />
                <span className="text-gray-700 dark:text-gray-300">{activity.name}</span>
              </div>
            ))}
            {profile.activities.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{profile.activities.length - 3} more
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => onLoad(profile)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Play size={16} />
              Load
            </button>
            <button
              onClick={() => onEdit(profile)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Edit profile"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={() => onDuplicate(profile)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Duplicate profile"
            >
              <Copy size={18} />
            </button>
            <button
              onClick={() => onDelete(profile.id)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              aria-label="Delete profile"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
