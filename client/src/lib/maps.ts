export interface MapConfig {
  id: string;
  baseTokensPerLoad: number;
  multiplier: number;
}

export const MAPS: MapConfig[] = [
  { id: 'forest', baseTokensPerLoad: 48, multiplier: 1.0 },
  { id: 'desert', baseTokensPerLoad: 52, multiplier: 1.1 },
  { id: 'tundra', baseTokensPerLoad: 45, multiplier: 1.05 },
];

export function getMapById(id: string): MapConfig | undefined {
  return MAPS.find((m) => m.id === id);
}

export function computeExpectedTokens(loadsUsed: number, mapId: string, efficiency: number): number {
  const cfg = getMapById(mapId);
  if (!cfg) return 0;
  const eff = !isFinite(efficiency) || efficiency <= 0 ? 1 : efficiency;
  const tokens = loadsUsed * cfg.baseTokensPerLoad * cfg.multiplier * eff;
  return Math.max(0, Math.floor(tokens));
}