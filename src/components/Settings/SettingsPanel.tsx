import { Download, Upload, Trash2, Bell, Smartphone, Zap, Moon } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { useStorage } from '../../contexts/StorageContext';
import { exportProfiles, importProfiles, clearAllData } from '../../utils/storage';
import { useState, useRef } from 'react';

export function SettingsPanel() {
  const { settings, updateSettings } = useSettings();
  const { profiles, loadProfiles } = useStorage();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportProfiles(profiles);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedProfiles = await importProfiles(file);
      for (const profile of importedProfiles) {
        await useStorage.getState().saveProfile(profile);
      }
      await loadProfiles();
      alert(`Successfully imported ${importedProfiles.length} profiles`);
    } catch (error) {
      alert('Failed to import profiles. Please check the file format.');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearData = async () => {
    if (showClearConfirm) {
      await clearAllData();
      await loadProfiles();
      setShowClearConfirm(false);
      alert('All data has been cleared');
    } else {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 3000);
    }
  };

  return (
    <div className="bg-white dark:bg-[#121316] rounded-2xl shadow-lg p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-gray-600 dark:text-gray-400" />
            <span className="text-gray-900 dark:text-white">Sound</span>
          </div>
          <button
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.soundEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                settings.soundEnabled ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone size={20} className="text-gray-600 dark:text-gray-400" />
            <span className="text-gray-900 dark:text-white">Haptics</span>
          </div>
          <button
            onClick={() => updateSettings({ hapticsEnabled: !settings.hapticsEnabled })}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.hapticsEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                settings.hapticsEnabled ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap size={20} className="text-gray-600 dark:text-gray-400" />
            <span className="text-gray-900 dark:text-white">Long press acceleration</span>
          </div>
          <button
            onClick={() => updateSettings({ longPressAcceleration: !settings.longPressAcceleration })}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.longPressAcceleration ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                settings.longPressAcceleration ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon size={20} className="text-gray-600 dark:text-gray-400" />
            <span className="text-gray-900 dark:text-white">Keep screen awake</span>
          </div>
          <button
            onClick={() => updateSettings({ keepScreenAwake: !settings.keepScreenAwake })}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.keepScreenAwake ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                settings.keepScreenAwake ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Data Management
        </h3>

        <button
          onClick={handleExport}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <Download size={18} />
          Export Profiles
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <Upload size={18} />
          Import Profiles
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        <button
          onClick={handleClearData}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
            showClearConfirm
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
          }`}
        >
          <Trash2 size={18} />
          {showClearConfirm ? 'Click again to confirm' : 'Clear All Data'}
        </button>
      </div>
    </div>
  );
}
