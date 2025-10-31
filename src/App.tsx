import { useState, useEffect } from 'react';
import { MobileLayout } from './components/MobileLayout';
import { DesktopLayout } from './components/DesktopLayout';
import { useMediaQuery } from './hooks/useMediaQuery';
import { StorageProvider } from './contexts/StorageContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { registerServiceWorker } from './utils/serviceWorker';

function App() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    registerServiceWorker();

    if ('storage' in navigator && 'persist' in navigator.storage) {
      navigator.storage.persist().then(persistent => {
        console.log('Persistent storage:', persistent);
      });
    }

    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6F7F9] dark:bg-[#0F1113] flex items-center justify-center">
        <div className="text-[#6B7280] text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <SettingsProvider>
      <StorageProvider>
        {isMobile ? <MobileLayout /> : <DesktopLayout />}
      </StorageProvider>
    </SettingsProvider>
  );
}

export default App;
