// Minimal version for MapMetrics compatibility
export type MapSize = 'small' | 'medium' | 'large' | 'xlarge';

export interface MapDrop {
  mapSize: MapSize;
  tokensDropped: number;
  loads: number;
  charges: number;
  timestamp: number;
}

export async function getMapDropsHistory(): Promise<MapDrop[]> {
  // Return empty array since we're not using this functionality
  return [];
}

export async function getMapDropsHistoryGroupedByDay(): Promise<any[]> {
  // Return empty array since we're not using this functionality
  return [];
}

export async function appendMapDropEntry(drop: MapDrop): Promise<void> {
  // No-op since we're not using this functionality
  return Promise.resolve();
}

export async function deleteMapDropEntry(timestamp: number): Promise<void> {
  // No-op since we're not using this functionality
  return Promise.resolve();
}

export async function clearMapDropsHistory(): Promise<void> {
  // No-op since we're not using this functionality
  return Promise.resolve();
}

export function getDayStats(): any {
  // Return empty stats since we're not using this functionality
  return {};
}