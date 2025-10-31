import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Profile } from '../types';
import { getAllProfiles, saveProfile as saveProfileToStorage, deleteProfile as deleteProfileFromStorage, initDB } from '../utils/storage';

interface StorageContextType {
  profiles: Profile[];
  loadProfiles: () => Promise<void>;
  saveProfile: (profile: Profile) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  isLoading: boolean;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export function StorageProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfiles = async () => {
    setIsLoading(true);
    try {
      await initDB();
      const loadedProfiles = await getAllProfiles();
      setProfiles(loadedProfiles);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async (profile: Profile) => {
    await saveProfileToStorage(profile);
    await loadProfiles();
  };

  const deleteProfile = async (id: string) => {
    await deleteProfileFromStorage(id);
    await loadProfiles();
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  return (
    <StorageContext.Provider value={{ profiles, loadProfiles, saveProfile, deleteProfile, isLoading }}>
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within StorageProvider');
  }
  return context;
}
