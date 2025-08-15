export interface LuckRange {
  min: number;
  max: number;
  count: number;
}

export function createLuckRangesFromSessions(sessions: { luck: number }[]) {
  if (sessions.length === 0) return { labels: [], counts: [], ranges: [] as LuckRange[] };

  const luckValues = sessions.map(s => s.luck).sort((a, b) => a - b);
  const min = Math.min(...luckValues);
  const max = Math.max(...luckValues);
  const range = max - min;
  const rangeSize = Math.max(10, Math.ceil(range / 5));

  const ranges: LuckRange[] = [];
  for (let i = min; i <= max; i += rangeSize) {
    ranges.push({ min: i, max: Math.min(i + rangeSize - 1, max), count: 0 });
  }

  sessions.forEach(session => {
    const idx = ranges.findIndex(r => session.luck >= r.min && session.luck <= r.max);
    if (idx !== -1) ranges[idx].count++;
  });

  return {
    labels: ranges.map(r => `${r.min}-${r.max}`),
    counts: ranges.map(r => r.count),
    ranges,
  };
}

export function bucketizeLuck(luck: number, ranges: LuckRange[]): number {
  return ranges.findIndex(r => luck >= r.min && luck <= r.max);
}