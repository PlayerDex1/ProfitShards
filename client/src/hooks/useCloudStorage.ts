import { useCallback, useEffect } from 'react';
import { useAuth } from './use-auth';

interface CalculationData {
  type: 'profit' | 'equipment' | 'mapdrops';
  data: any;
  results?: any;
}

interface PreferencesData {
  theme?: 'light' | 'dark' | 'system';
  language?: 'pt' | 'en';
  currency?: string;
  data?: any;
}

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }
  
  return response.json();
}

export function useCloudStorage() {
  const { isAuthenticated, user } = useAuth();

  // Save calculation to cloud
  const saveCalculation = useCallback(async (calculationData: CalculationData) => {
    if (!isAuthenticated) {
      console.log('💾 [CLOUD] Not authenticated, skipping cloud save');
      return { success: false, reason: 'not_authenticated' };
    }

    try {
      console.log('💾 [CLOUD] Saving calculation to cloud:', calculationData.type);
      const result = await apiCall('/api/user/save-calculation', {
        method: 'POST',
        body: JSON.stringify(calculationData)
      });
      console.log('✅ [CLOUD] Calculation saved successfully');
      return { success: true, result };
    } catch (error) {
      console.error('❌ [CLOUD] Failed to save calculation:', error);
      return { success: false, error: error.message };
    }
  }, [isAuthenticated]);

  // Save preferences to cloud
  const savePreferences = useCallback(async (preferencesData: PreferencesData) => {
    if (!isAuthenticated) {
      console.log('💾 [CLOUD] Not authenticated, skipping preferences save');
      return { success: false, reason: 'not_authenticated' };
    }

    try {
      console.log('💾 [CLOUD] Saving preferences to cloud');
      const result = await apiCall('/api/user/save-preferences', {
        method: 'POST',
        body: JSON.stringify(preferencesData)
      });
      console.log('✅ [CLOUD] Preferences saved successfully');
      return { success: true, result };
    } catch (error) {
      console.error('❌ [CLOUD] Failed to save preferences:', error);
      return { success: false, error: error.message };
    }
  }, [isAuthenticated]);

  // Load all user data from cloud
  const loadUserData = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('💾 [CLOUD] Not authenticated, skipping cloud load');
      return { success: false, reason: 'not_authenticated' };
    }

    try {
      console.log('📥 [CLOUD] Loading user data from cloud');
      const result = await apiCall('/api/user/get-data');
      console.log('✅ [CLOUD] User data loaded successfully');
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ [CLOUD] Failed to load user data:', error);
      return { success: false, error: error.message };
    }
  }, [isAuthenticated]);

  // Auto-save when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🔄 [CLOUD] User logged in, preparing data sync');
      
      // Load cloud data after a brief delay
      setTimeout(() => {
        loadUserData().then((result) => {
          if (result.success) {
            console.log('📥 [CLOUD] User data loaded from cloud');
            // Here you can integrate with existing hooks to load the data
            window.dispatchEvent(new CustomEvent('cloud-data-loaded', { 
              detail: result.data 
            }));
          }
        });
      }, 2000);
    }
  }, [isAuthenticated, user, loadUserData]);

  return {
    saveCalculation,
    savePreferences,
    loadUserData,
    isCloudEnabled: isAuthenticated
  };
}