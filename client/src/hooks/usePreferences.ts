import { useCallback, useEffect, useState } from "react";
import { getCurrentUsername } from "@/hooks/use-auth";
import { useCloudStorage } from "@/hooks/useCloudStorage";

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'pt' | 'en';
  currency: 'USD' | 'BRL' | 'EUR';
  autoSave: boolean;
  notifications: boolean;
  [key: string]: any;
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'pt',
  currency: 'USD',
  autoSave: true,
  notifications: true
};

export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const { savePreferences, isCloudEnabled } = useCloudStorage();

  const saveToStorage = useCallback((newPrefs: UserPreferences) => {
    const username = getCurrentUsername();
    const key = username ? `worldshards-prefs-${username}` : 'worldshards-prefs-guest';
    
    try {
      localStorage.setItem(key, JSON.stringify(newPrefs));
      console.log('💾 [LOCAL] Preferences saved to localStorage');
      
      // Save to cloud if user is logged in
      if (isCloudEnabled && username) {
        savePreferences({
          theme: newPrefs.theme,
          language: newPrefs.language,
          currency: newPrefs.currency,
          data: newPrefs
        }).then((result) => {
          if (result.success) {
            console.log('☁️ [CLOUD] Preferences synced to cloud');
          }
        });
      }
    } catch (error) {
      console.error('❌ Failed to save preferences:', error);
    }
  }, [savePreferences, isCloudEnabled]);

  const loadFromStorage = useCallback(() => {
    const username = getCurrentUsername();
    const key = username ? `worldshards-prefs-${username}` : 'worldshards-prefs-guest';
    
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsedPrefs = { ...defaultPreferences, ...JSON.parse(saved) };
        setPreferences(parsedPrefs);
        console.log('📥 [LOCAL] Preferences loaded from localStorage');
        return parsedPrefs;
      }
    } catch (error) {
      console.error('❌ Failed to load preferences:', error);
    }
    
    setPreferences(defaultPreferences);
    return defaultPreferences;
  }, []);

  // Load preferences on mount and auth change
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    const onAuth = () => {
      console.log('🔄 [PREFERENCES] Auth changed, reloading preferences');
      loadFromStorage();
    };
    
    window.addEventListener('worldshards-auth-updated', onAuth);
    return () => window.removeEventListener('worldshards-auth-updated', onAuth);
  }, [loadFromStorage]);

  // Listen for cloud data loaded event
  useEffect(() => {
    const onCloudDataLoaded = (event: CustomEvent) => {
      const cloudData = event.detail;
      console.log('☁️ [PREFERENCES] Cloud data received:', cloudData);
      
      if (cloudData?.data?.preferences) {
        const cloudPrefs = cloudData.data.preferences;
        const mergedPrefs = {
          ...defaultPreferences,
          ...cloudPrefs.data,
          theme: cloudPrefs.theme || defaultPreferences.theme,
          language: cloudPrefs.language || defaultPreferences.language,
          currency: cloudPrefs.currency || defaultPreferences.currency
        };
        
        console.log('📥 [PREFERENCES] Loading preferences from cloud');
        setPreferences(mergedPrefs);
        
        // Also save to localStorage for offline access
        const username = getCurrentUsername();
        const key = username ? `worldshards-prefs-${username}` : 'worldshards-prefs-guest';
        localStorage.setItem(key, JSON.stringify(mergedPrefs));
      }
    };

    window.addEventListener('cloud-data-loaded', onCloudDataLoaded as EventListener);
    return () => window.removeEventListener('cloud-data-loaded', onCloudDataLoaded as EventListener);
  }, []);

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    const newPrefs = { ...preferences, ...updates };
    setPreferences(newPrefs);
    saveToStorage(newPrefs);
  }, [preferences, saveToStorage]);

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
    saveToStorage(defaultPreferences);
  }, [saveToStorage]);

  return {
    preferences,
    updatePreferences,
    resetPreferences,
    isCloudSynced: isCloudEnabled
  };
}