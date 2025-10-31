import { useState } from 'react';
import { Plus, GripVertical, Edit2, Trash2, Save, Bell, BellOff } from 'lucide-react';
import { Activity } from '../../types';
import { useSettings } from '../../contexts/SettingsContext';

interface ActivityEditorProps {
  activities: Activity[];
  repeatCount: number;
  onActivitiesChange: (activities: Activity[]) => void;
  onRepeatCountChange: (count: number) => void;
  onSave: () => void;
}

export function ActivityEditor({
  activities,
  repeatCount,
  onActivitiesChange,
  onRepeatCountChange,
  onSave
}: ActivityEditorProps) {
  const { settings, updateSettings } = useSettings();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addActivity = () => {
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      name: 'New Activity',
      duration: 30,
      color: 'green',
      order: activities.length
    };
    onActivitiesChange([...activities, newActivity]);
  };

  const updateActivity = (id: string, updates: Partial<Activity>) => {
    const updated = activities.map(a => a.id === id ? { ...a, ...updates } : a);
    onActivitiesChange(updated);
  };

  const deleteActivity = (id: string) => {
    const filtered = activities.filter(a => a.id !== id);
    onActivitiesChange(filtered.map((a, i) => ({ ...a, order: i })));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newActivities = [...activities];
    const draggedItem = newActivities[draggedIndex];
    newActivities.splice(draggedIndex, 1);
    newActivities.splice(index, 0, draggedItem);

    onActivitiesChange(newActivities.map((a, i) => ({ ...a, order: i })));
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const parseDuration = (value: string): number => {
    const parts = value.split(':');
    if (parts.length === 2) {
      const mins = parseInt(parts[0]) || 0;
      const secs = parseInt(parts[1]) || 0;
      return mins * 60 + secs;
    }
    return parseInt(value) || 0;
  };

  return (
    <div className="bg-white dark:bg-[#121316] rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Timer Sequence</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={settings.soundEnabled ? 'Disable sound' : 'Enable sound'}
          >
            {settings.soundEnabled ? (
              <Bell size={18} className="text-gray-600 dark:text-gray-400" />
            ) : (
              <BellOff size={18} className="text-gray-400 dark:text-gray-600" />
            )}
          </button>
          <button
            onClick={onSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Save size={16} />
            Save
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl group hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <button
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Drag to reorder"
            >
              <GripVertical size={20} />
            </button>

            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{
                backgroundColor:
                  activity.color === 'green'
                    ? '#4CAF50'
                    : activity.color === 'orange'
                    ? '#FF9800'
                    : '#6B7280'
              }}
            />

            <input
              type="text"
              value={activity.name}
              onChange={(e) => updateActivity(activity.id, { name: e.target.value })}
              className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white font-medium"
              placeholder="Activity name"
            />

            <input
              type="text"
              value={formatDuration(activity.duration)}
              onChange={(e) => updateActivity(activity.id, { duration: parseDuration(e.target.value) })}
              className="w-20 px-2 py-1 bg-white dark:bg-gray-900 rounded-lg text-center text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholder="0:00"
            />

            <select
              value={activity.color}
              onChange={(e) => updateActivity(activity.id, { color: e.target.value as Activity['color'] })}
              className="px-2 py-1 bg-white dark:bg-gray-900 rounded-lg text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
            >
              <option value="green">Active</option>
              <option value="orange">Rest</option>
              <option value="neutral">Warmup</option>
            </select>

            <button
              onClick={() => deleteActivity(activity.id)}
              className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Delete activity"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addActivity}
        className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2 font-medium"
      >
        <Plus size={20} />
        Add Activity
      </button>

      <div className="mt-4 flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Repeat
        </label>
        <input
          type="number"
          min="1"
          max="99"
          value={repeatCount}
          onChange={(e) => onRepeatCountChange(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-16 px-3 py-2 bg-white dark:bg-gray-900 rounded-lg text-center text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
        />
        <span className="text-sm text-gray-600 dark:text-gray-400">times</span>
      </div>
    </div>
  );
}
