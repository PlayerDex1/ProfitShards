import { useCallback, useEffect, useState } from "react";
import { getCurrentUsername } from "@/hooks/use-auth";
import { useCloudStorage } from "@/hooks/useCloudStorage";

export interface EquipmentBuild {
  id: string;
  name: string;
  type: string;
  data: any;
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export function useEquipment() {
  const [builds, setBuilds] = useState<EquipmentBuild[]>([]);
  const [currentBuild, setCurrentBuild] = useState<any>({});
  const { saveCalculation, isCloudEnabled } = useCloudStorage();

  const saveToStorage = useCallback((buildsData: EquipmentBuild[], currentData: any) => {
    const username = getCurrentUsername();
    const buildsKey = username ? `worldshards-equip-builds-${username}` : 'worldshards-equip-builds-guest';
    const currentKey = username ? `worldshards-equipment-${username}` : 'worldshards-equipment-guest';
    
    try {
      localStorage.setItem(buildsKey, JSON.stringify(buildsData));
      localStorage.setItem(currentKey, JSON.stringify(currentData));
      console.log('💾 [LOCAL] Equipment data saved to localStorage');
      
      // Save to cloud if user is logged in
      if (isCloudEnabled && username) {
        // Save each build to cloud
        buildsData.forEach(build => {
          saveCalculation({
            type: 'equipment',
            data: {
              buildId: build.id,
              name: build.name,
              type: build.type,
              equipment: build.data,
              isFavorite: build.isFavorite
            }
          }).then((result) => {
            if (result.success) {
              console.log('☁️ [CLOUD] Equipment build synced:', build.name);
            }
          });
        });
      }
    } catch (error) {
      console.error('❌ Failed to save equipment data:', error);
    }
  }, [saveCalculation, isCloudEnabled]);

  const loadFromStorage = useCallback(() => {
    const username = getCurrentUsername();
    const buildsKey = username ? `worldshards-equip-builds-${username}` : 'worldshards-equip-builds-guest';
    const currentKey = username ? `worldshards-equipment-${username}` : 'worldshards-equipment-guest';
    
    try {
      const savedBuilds = localStorage.getItem(buildsKey);
      const savedCurrent = localStorage.getItem(currentKey);
      
      if (savedBuilds) {
        const parsedBuilds = JSON.parse(savedBuilds);
        setBuilds(parsedBuilds);
        console.log('📥 [LOCAL] Equipment builds loaded from localStorage');
      }
      
      if (savedCurrent) {
        const parsedCurrent = JSON.parse(savedCurrent);
        setCurrentBuild(parsedCurrent);
        console.log('📥 [LOCAL] Current equipment loaded from localStorage');
      }
    } catch (error) {
      console.error('❌ Failed to load equipment data:', error);
      setBuilds([]);
      setCurrentBuild({});
    }
  }, []);

  // Load on mount and auth change
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    const onAuth = () => {
      console.log('🔄 [EQUIPMENT] Auth changed, reloading equipment data');
      loadFromStorage();
    };
    
    window.addEventListener('worldshards-auth-updated', onAuth);
    return () => window.removeEventListener('worldshards-auth-updated', onAuth);
  }, [loadFromStorage]);

  // Listen for cloud data loaded event
  useEffect(() => {
    const onCloudDataLoaded = (event: CustomEvent) => {
      const cloudData = event.detail;
      console.log('☁️ [EQUIPMENT] Cloud data received:', cloudData);
      
      if (cloudData?.data?.equipmentBuilds) {
        const cloudBuilds = cloudData.data.equipmentBuilds.map((build: any) => ({
          id: build.id,
          name: build.name,
          type: build.type || 'custom',
          data: build.data.equipment || build.data,
          isFavorite: build.isFavorite || false,
          createdAt: build.createdAt,
          updatedAt: build.updatedAt
        }));
        
        console.log('📥 [EQUIPMENT] Loading equipment builds from cloud');
        setBuilds(cloudBuilds);
        
        // Save to localStorage for offline access
        const username = getCurrentUsername();
        const key = username ? `worldshards-equip-builds-${username}` : 'worldshards-equip-builds-guest';
        localStorage.setItem(key, JSON.stringify(cloudBuilds));
      }
    };

    window.addEventListener('cloud-data-loaded', onCloudDataLoaded as EventListener);
    return () => window.removeEventListener('cloud-data-loaded', onCloudDataLoaded as EventListener);
  }, []);

  const saveBuild = useCallback((build: Omit<EquipmentBuild, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    const newBuild: EquipmentBuild = {
      ...build,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now
    };
    
    const newBuilds = [...builds, newBuild];
    setBuilds(newBuilds);
    saveToStorage(newBuilds, currentBuild);
  }, [builds, currentBuild, saveToStorage]);

  const updateBuild = useCallback((buildId: string, updates: Partial<EquipmentBuild>) => {
    const newBuilds = builds.map(build => 
      build.id === buildId 
        ? { ...build, ...updates, updatedAt: Date.now() }
        : build
    );
    setBuilds(newBuilds);
    saveToStorage(newBuilds, currentBuild);
  }, [builds, currentBuild, saveToStorage]);

  const deleteBuild = useCallback((buildId: string) => {
    const newBuilds = builds.filter(build => build.id !== buildId);
    setBuilds(newBuilds);
    saveToStorage(newBuilds, currentBuild);
  }, [builds, currentBuild, saveToStorage]);

  const updateCurrentBuild = useCallback((updates: any) => {
    const newCurrent = { ...currentBuild, ...updates };
    setCurrentBuild(newCurrent);
    saveToStorage(builds, newCurrent);
  }, [currentBuild, builds, saveToStorage]);

  return {
    builds,
    currentBuild,
    saveBuild,
    updateBuild,
    deleteBuild,
    updateCurrentBuild,
    isCloudSynced: isCloudEnabled
  };
}