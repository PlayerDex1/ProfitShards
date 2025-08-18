import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMapDropsHistory, MapSize } from "@/lib/mapDropsHistory";
import { useI18n } from "@/i18n";
import { useEffect, useMemo, useState } from "react";

export function MapMetrics() {
  const { t } = useI18n();
  const [data, setData] = useState(getMapDropsHistory());

  useEffect(() => {
    const onUpd = () => setData(getMapDropsHistory());
    window.addEventListener('worldshards-mapdrops-updated', onUpd);
    return () => window.removeEventListener('worldshards-mapdrops-updated', onUpd);
  }, []);

  const { avgPerMap, totalsByDay, bestHour } = useMemo(() => {
    const sizes: MapSize[] = ['small', 'medium', 'large', 'xlarge'];
    const sums: Record<MapSize, { tokens: number; loads: number }> = {
      small: { tokens: 0, loads: 0 },
      medium: { tokens: 0, loads: 0 },
      large: { tokens: 0, loads: 0 },
      xlarge: { tokens: 0, loads: 0 },
    };

    const byDay: Record<string, { tokens: number; loads: number }> = {};
    const byHour: Record<number, { tokens: number; loads: number }> = {};

    for (const e of data) {
      sums[e.mapSize].tokens += e.tokensDropped;
      sums[e.mapSize].loads += e.loads;
      const d = new Date(e.timestamp);
      const day = d.toISOString().slice(0, 10);
      const hour = d.getHours();
      byDay[day] = byDay[day] || { tokens: 0, loads: 0 };
      byDay[day].tokens += e.tokensDropped;
      byDay[day].loads += e.loads;
      byHour[hour] = byHour[hour] || { tokens: 0, loads: 0 };
      byHour[hour].tokens += e.tokensDropped;
      byHour[hour].loads += e.loads;
    }

    const avgPerMap = sizes.map((s) => {
      const loads = sums[s].loads;
      const avg = loads > 0 ? sums[s].tokens / loads : 0;
      return { size: s, avg, loads };
    });

    const totalsByDay = Object.entries(byDay)
      .sort((a, b) => a[0] < b[0] ? 1 : -1)
      .slice(0, 2)
      .map(([day, v]) => ({ day, tokens: v.tokens, loads: v.loads }));

    let bestHour = null as null | { hour: number; score: number };
    for (let h = 0; h < 24; h++) {
      const v = byHour[h];
      if (!v) continue;
      const score = v.loads > 0 ? v.tokens / v.loads : 0;
      if (!bestHour || score > bestHour.score) bestHour = { hour: h, score };
    }

    return { avgPerMap, totalsByDay, bestHour };
  }, [data]);

  return (
    <Card className="bg-black/50 border-white/10">
      <CardHeader className="py-3">
        <CardTitle className="text-base">{t('metrics.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-white/80 text-xs mb-1">{t('metrics.avgPerRun')}</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {avgPerMap.map((m) => (
              <div key={m.size} className="flex items-center justify-between bg-white/5 rounded px-2 py-1">
                <span className="text-white/80">{t(`planner.${m.size}`)}</span>
                <span className="text-white font-mono">{m.avg.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-white/80 text-xs mb-1">{t('metrics.totalByDay')}</div>
          {totalsByDay.length === 0 ? (
            <div className="text-white/60 text-xs">{t('metrics.noData')}</div>
          ) : (
            <div className="space-y-1 text-sm">
              {totalsByDay.map((d) => (
                <div key={d.day} className="flex items-center justify-between bg-white/5 rounded px-2 py-1">
                  <span className="text-white/80">{d.day}</span>
                  <span className="text-white font-mono">{d.tokens}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="text-white/80 text-xs mb-1">{t('metrics.bestHour')}</div>
          {bestHour ? (
            <div className="text-sm text-white">
              <span className="font-mono">{String(bestHour.hour).padStart(2, '0')}:00</span>
              <span className="mx-2 text-white/60">•</span>
              <span className="font-mono">{bestHour.score.toFixed(1)} {t('results.tokenLabel')}/{t('metrics.runShort')}</span>
            </div>
          ) : (
            <div className="text-white/60 text-xs">{t('metrics.noData')}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}