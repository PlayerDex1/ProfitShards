export function calculateLuckEffectFromArray(luckHistory: number[], targetLuck: number): number {
  if (!Array.isArray(luckHistory) || luckHistory.length === 0) return 1.0;
  const avgLuck = luckHistory.reduce((sum, v) => sum + v, 0) / luckHistory.length;
  if (avgLuck <= 0) return 1.0;
  const ratio = targetLuck / avgLuck;
  return Math.pow(ratio, 0.7);
}