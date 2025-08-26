import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMapDropsHistory, MapSize } from "@/lib/mapDropsHistory";
import { useI18n } from "@/i18n";
import { useEffect, useMemo, useState } from "react";

function getReset5am(ts: number) {
  const d = new Date(ts);
  const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 5, 0, 0, 0).getTime();
  if (ts < dayStart) {
    // before 05:00, use previous day's 05:00
    const prev = new Date(dayStart - 24 * 60 * 60 * 1000);
    return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), 5, 0, 0, 0).getTime();
  }
  return dayStart;
}

export function MapMetrics() {
  const { t } = useI18n();
  const [data, setData] = useState(getMapDropsHistory());

  useEffect(() => {
    const onUpd = () => setData(getMapDropsHistory());
    window.addEventListener('worldshards-mapdrops-updated', onUpd);
    return () => window.removeEventListener('worldshards-mapdrops-updated', onUpd);
  }, []);

  const { avgPerMapToday, totalToday, totalPrev, bestHourToday } = useMemo(() => {
    const sizes: MapSize[] = ['small', 'medium', 'large', 'xlarge'];
    const now = Date.now();
    const todayStart = getReset5am(now);
    const prevStart = todayStart - 24 * 60 * 60 * 1000;

    const today = data.filter(e => e.timestamp >= todayStart && e.timestamp < todayStart + 24 * 60 * 60 * 1000);
    const prev = data.filter(e => e.timestamp >= prevStart && e.timestamp < todayStart);

    const sumsToday: Record<MapSize, { tokens: number; loads: number }> = {
      small: { tokens: 0, loads: 0 },
      medium: { tokens: 0, loads: 0 },
      large: { tokens: 0, loads: 0 },
      xlarge: { tokens: 0, loads: 0 },
    };

    const byHourToday: Record<number, { tokens: number; loads: number }> = {};

    for (const e of today) {
      sumsToday[e.mapSize].tokens += e.tokensDropped;
      sumsToday[e.mapSize].loads += e.loads;
      const hour = new Date(e.timestamp).getHours();
      byHourToday[hour] = byHourToday[hour] || { tokens: 0, loads: 0 };
      byHourToday[hour].tokens += e.tokensDropped;
      byHourToday[hour].loads += e.loads;
    }

    const avgPerMapToday = sizes.map((s) => {
      const loads = sumsToday[s].loads;
      const avg = loads > 0 ? sumsToday[s].tokens / loads : 0;
      return { size: s, avg, loads };
    });

    const totalToday = {
      tokens: today.reduce((a, e) => a + e.tokensDropped, 0),
      loads: today.reduce((a, e) => a + e.loads, 0),
    };

    const totalPrev = {
      tokens: prev.reduce((a, e) => a + e.tokensDropped, 0),
      loads: prev.reduce((a, e) => a + e.loads, 0),
    };

    let bestHourToday: null | { hour: number; score: number } = null;
    for (let h = 0; h < 24; h++) {
      const v = byHourToday[h];
      if (!v) continue;
      const score = v.loads > 0 ? v.tokens / v.loads : 0;
      if (!bestHourToday || score > bestHourToday.score) bestHourToday = { hour: h, score };
    }

    return { avgPerMapToday, totalToday, totalPrev, bestHourToday };
  }, [data]);

  return (
    <Card className="bg-black/50 border-white/10">
      <CardHeader className="py-3">
        <CardTitle className="text-base">{t('metrics.todayTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-white/80 text-xs mb-1">{t('metrics.avgPerRunToday')}</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {avgPerMapToday.map((m) => (
              <div key={m.size} className="flex items-center justify-between bg-white/5 rounded px-2 py-1">
                <span className="text-white/80">{t(`planner.${m.size}`)}</span>
                <span className="text-white font-mono">{m.avg.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-white/80 text-xs mb-1">{t('metrics.totals')}</div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between bg-white/5 rounded px-2 py-1">
              <span className="text-white/80">{t('metrics.todayFromTime')}</span>
              <span className="text-white font-mono">{totalToday.tokens} tokens / {totalToday.loads} {t('metrics.runShort')}</span>
            </div>
            <div className="flex items-center justify-between bg-white/5 rounded px-2 py-1">
              <span className="text-white/80">{t('metrics.yesterdayRange')}</span>
              <span className="text-white font-mono">{totalPrev.tokens} tokens / {totalPrev.loads} {t('metrics.runShort')}</span>
            </div>
          </div>
        </div>
        <div>
          <div className="text-white/80 text-xs mb-1">{t('metrics.bestHourToday')}</div>
          {bestHourToday ? (
            <div className="text-sm text-white">
              <span className="font-mono">{String(bestHourToday.hour).padStart(2, '0')}:00</span>
              <span className="mx-2 text-white/60">•</span>
              <span className="font-mono">{bestHourToday.score.toFixed(1)} {t('results.tokenLabel')}/{t('metrics.runShort')}</span>
            </div>
          ) : (
            <div className="text-white/60 text-xs">{t('metrics.noData')}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}