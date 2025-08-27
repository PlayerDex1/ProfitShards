import { useState, useEffect } from 'react';

interface Preferences {
  mapSize?: string;
  savedLuck?: number;
  energyCosts?: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
  [key: string]: any;
}

const STORAGE_KEY = 'worldshards-preferences';

// Default energy costs
const DEFAULT_ENERGY_COSTS = {
  small: 1,
  medium: 2,
  large: 4,
  xlarge: 8
};

// Default preferences
const DEFAULT_PREFERENCES: Preferences = {
  mapSize: 'medium',
  savedLuck: 0,
  energyCosts: DEFAULT_ENERGY_COSTS
};

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Merge with defaults to ensure all required fields exist
        const merged = {
          ...DEFAULT_PREFERENCES,
          ...parsed,
          energyCosts: {
            ...DEFAULT_ENERGY_COSTS,
            ...(parsed.energyCosts || {})
          }
        };
        
        setPreferences(merged);
        console.log('✅ Preferences loaded:', merged);
      } else {
        // First time - save defaults
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PREFERENCES));
        setPreferences(DEFAULT_PREFERENCES);
        console.log('✅ Default preferences set');
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      setPreferences(DEFAULT_PREFERENCES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = (newPrefs: Partial<Preferences>) => {
    try {
      const updated = { 
        ...preferences, 
        ...newPrefs,
        // Ensure energyCosts is properly merged
        energyCosts: {
          ...preferences.energyCosts,
          ...(newPrefs.energyCosts || {})
        }
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setPreferences(updated);
      console.log('✅ Preferences saved:', updated);
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('worldshards-preferences-updated', {
        detail: updated
      }));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  // Update a single preference
  const updatePreference = (key: string, value: any) => {
    savePreferences({ [key]: value });
  };

  // Update energy costs
  const updateEnergyCosts = (costs: Partial<typeof DEFAULT_ENERGY_COSTS>) => {
    savePreferences({
      energyCosts: {
        ...preferences.energyCosts,
        ...costs
      }
    });
  };

  // Reset to defaults
  const resetPreferences = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PREFERENCES));
      setPreferences(DEFAULT_PREFERENCES);
      console.log('🔄 Preferences reset to defaults');
    } catch (error) {
      console.error('Error resetting preferences:', error);
    }
  };

  // Backward compatibility - expose as 'prefs' and 'save'
  return {
    prefs: preferences,
    preferences,
    save: savePreferences,
    updatePreference,
    updateEnergyCosts,
    resetPreferences,
    isLoading
  };
}