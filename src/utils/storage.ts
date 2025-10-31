import { Profile, Settings, CounterState } from '../types';

const DB_NAME = 'vibe_profiles_db';
const DB_VERSION = 1;
const STORE_NAME = 'profiles';
const SETTINGS_KEY = 'vibe_settings_v1';
const COUNTER_KEY = 'vibe_counter_v1';

let db: IDBDatabase | null = null;

export async function initDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('created_at', 'created_at', { unique: false });
        objectStore.createIndex('updated_at', 'updated_at', { unique: false });
      }
    };
  });
}

export async function getAllProfiles(): Promise<Profile[]> {
  try {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  } catch (error) {
    console.error('Error getting profiles from IndexedDB, falling back to localStorage:', error);
    return getProfilesFromLocalStorage();
  }
}

export async function getProfile(id: string): Promise<Profile | null> {
  try {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  } catch (error) {
    console.error('Error getting profile from IndexedDB:', error);
    return null;
  }
}

export async function saveProfile(profile: Profile): Promise<void> {
  try {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.put(profile);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        saveProfilesToLocalStorage();
        resolve();
      };
    });
  } catch (error) {
    console.error('Error saving profile to IndexedDB, falling back to localStorage:', error);
    saveProfileToLocalStorage(profile);
  }
}

export async function deleteProfile(id: string): Promise<void> {
  try {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        saveProfilesToLocalStorage();
        resolve();
      };
    });
  } catch (error) {
    console.error('Error deleting profile from IndexedDB:', error);
    deleteProfileFromLocalStorage(id);
  }
}

function getProfilesFromLocalStorage(): Profile[] {
  try {
    const stored = localStorage.getItem('vibe_profiles_v1');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveProfileToLocalStorage(profile: Profile): void {
  try {
    const profiles = getProfilesFromLocalStorage();
    const index = profiles.findIndex(p => p.id === profile.id);
    if (index >= 0) {
      profiles[index] = profile;
    } else {
      profiles.push(profile);
    }
    localStorage.setItem('vibe_profiles_v1', JSON.stringify(profiles));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

function deleteProfileFromLocalStorage(id: string): void {
  try {
    const profiles = getProfilesFromLocalStorage();
    const filtered = profiles.filter(p => p.id !== id);
    localStorage.setItem('vibe_profiles_v1', JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting from localStorage:', error);
  }
}

async function saveProfilesToLocalStorage(): Promise<void> {
  try {
    const profiles = await getAllProfiles();
    localStorage.setItem('vibe_profiles_v1', JSON.stringify(profiles));
  } catch (error) {
    console.error('Error syncing to localStorage:', error);
  }
}

export function loadSettings(): Settings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }

  return {
    soundEnabled: true,
    hapticsEnabled: false,
    longPressAcceleration: true,
    keepScreenAwake: false,
    theme: 'auto'
  };
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

export function loadCounter(): CounterState {
  try {
    const stored = localStorage.getItem(COUNTER_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading counter:', error);
  }

  return {
    value: 0,
    label: 'Reps'
  };
}

export function saveCounter(counter: CounterState): void {
  try {
    localStorage.setItem(COUNTER_KEY, JSON.stringify(counter));
  } catch (error) {
    console.error('Error saving counter:', error);
  }
}

export async function clearAllData(): Promise<void> {
  try {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        localStorage.removeItem('vibe_profiles_v1');
        localStorage.removeItem(SETTINGS_KEY);
        localStorage.removeItem(COUNTER_KEY);
        resolve();
      };
    });
  } catch (error) {
    console.error('Error clearing data:', error);
    localStorage.removeItem('vibe_profiles_v1');
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(COUNTER_KEY);
  }
}

export function exportProfiles(profiles: Profile[]): void {
  const dataStr = JSON.stringify(profiles, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `vibe-profiles-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function importProfiles(file: File): Promise<Profile[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const profiles = JSON.parse(e.target?.result as string);
        resolve(profiles);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
