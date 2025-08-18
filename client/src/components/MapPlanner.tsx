import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePreferences } from "@/hooks/usePreferences";
import { useI18n } from "@/i18n";
import { appendMapDropEntry, getMapDropsHistory } from "@/lib/mapDropsHistory";

interface MapPlannerProps {}

export function MapPlanner({}: MapPlannerProps) {
  const { prefs, save } = usePreferences();
  const { t } = useI18n();
  const [mapSize, setMapSize] = useState<string>(prefs.mapSize || 'medium');
  const [loads, setLoads] = useState<number>(prefs.loadsPerMap || 0);
  const [tokensDropped, setTokensDropped] = useState<number>(0);
  const [history, setHistory] = useState(getMapDropsHistory());

  useEffect(() => {
    const onUpd = () => setHistory(getMapDropsHistory());
    window.addEventListener('worldshards-mapdrops-updated', onUpd);
    return () => window.removeEventListener('worldshards-mapdrops-updated', onUpd);
  }, []);

  const costs = prefs.energyCosts;
  const energyCost = (mapSize === 'small' ? costs.small : mapSize === 'large' ? costs.large : mapSize === 'xlarge' ? costs.xlarge : costs.medium) || 0;

  const apply = () => {
    save({ mapSize, loadsPerMap: loads });
    appendMapDropEntry({ timestamp: Date.now(), mapSize: mapSize as any, tokensDropped, loads });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="bg-black/50 border-white/10">
        <CardHeader className="py-3">
          <CardTitle className="text-base">{t('planner.title')}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-white/70 mb-1 block">{t('planner.mapSize')}</label>
            <select value={mapSize} onChange={(e) => setMapSize(e.target.value)} className="w-full h-9 bg-white/10 border-white/20 text-white rounded">
              <option value="small" className="bg-black text-white">{t('planner.small')}</option>
              <option value="medium" className="bg-black text-white">{t('planner.medium')}</option>
              <option value="large" className="bg-black text-white">{t('planner.large')}</option>
              <option value="xlarge" className="bg-black text-white">{t('planner.xlarge')}</option>
            </select>
            <div className="text-white/60 text-xs mt-1">{t('planner.energyCost')}: {energyCost}</div>
          </div>
          <div>
            <label className="text-xs text-white/70 mb-1 block">{t('planner.loads')}</label>
            <Input type="number" value={loads} onChange={(e) => setLoads(parseInt(e.target.value || '0'))} className="bg-white/10 border-white/20 text-white h-9" />
          </div>
          <div>
            <label className="text-xs text-white/70 mb-1 block">{t('planner.tokensDropped')}</label>
            <Input type="number" value={tokensDropped} onChange={(e) => setTokensDropped(parseInt(e.target.value || '0'))} className="bg-white/10 border-white/20 text-white h-9" placeholder={t('planner.example')} />
          </div>
          <div className="flex items-end">
            <Button className="bg-white text-black hover:bg-white/90 h-9 w-full" onClick={apply}>{t('planner.apply')}</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/50 border-white/10">
        <CardHeader className="py-3">
          <CardTitle className="text-base">{t('planner.history')}</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-white/70 text-sm">{t('planner.noHistory')}</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-auto pr-2">
              {history
                .slice()
                .reverse()
                .map((h, i) => (
                  <div key={i} className="border border-white/10 rounded-lg p-3 bg-white/5 text-sm flex items-center justify-between">
                    <div className="text-white/90">
                      <span className="font-medium">{t(`planner.${h.mapSize}`)}</span>
                      <span className="mx-2">•</span>
                      <span>{h.tokensDropped} {t('results.tokenLabel')}</span>
                      <span className="mx-2">•</span>
                      <span>{t('planner.loads')}: {h.loads}</span>
                    </div>
                    <div className="text-white/60 text-xs">{new Date(h.timestamp).toLocaleString()}</div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}