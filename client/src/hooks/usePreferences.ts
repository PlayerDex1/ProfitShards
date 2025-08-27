import { useState, useEffect } from 'react';

interface Preferences {
  mapSize?: string;
  savedLuck?: number;
  [key: string]: any;
}

const STORAGE_KEY = 'worldshards-preferences';

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences(parsed);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = (newPrefs: Preferences) => {
    try {
      const updated = { ...preferences, ...newPrefs };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setPreferences(updated);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  // Update a single preference
  const updatePreference = (key: string, value: any) => {
    savePreferences({ [key]: value });
  };

  // Backward compatibility - expose as 'prefs' and 'save'
  return {
    prefs: preferences,
    preferences,
    save: savePreferences,
    updatePreference,
    isLoading
  };
}