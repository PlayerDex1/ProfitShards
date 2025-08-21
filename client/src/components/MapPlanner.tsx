import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePreferences } from "@/hooks/usePreferences";
import { useI18n } from "@/i18n";
import { appendMapDropEntry, getMapDropsHistory, deleteMapDropEntry, clearMapDropsHistory } from "@/lib/mapDropsHistory";
import { useEquipment } from "@/hooks/useEquipment";

interface MapPlannerProps {}

type SizeKey = 'small' | 'medium' | 'large' | 'xlarge';

export function MapPlanner({}: MapPlannerProps) {
  const { prefs, save } = usePreferences();
  const { t } = useI18n();
  const [mapSize, setMapSize] = useState<SizeKey>((prefs.mapSize as SizeKey) || 'medium');
  const [loads, setLoads] = useState<number>(prefs.loadsPerMap || 0);
  const [tokensDropped, setTokensDropped] = useState<number>(0);
  const [history, setHistory] = useState(getMapDropsHistory());
  const { totalLuck } = useEquipment();
  const [luck, setLuck] = useState<number>(totalLuck || 0);
  const [status, setStatus] = useState<'excellent' | 'positive' | 'negative' | 'neutral'>('neutral');

  useEffect(() => {
    const onUpd = () => setHistory(getMapDropsHistory());
    window.addEventListener('worldshards-mapdrops-updated', onUpd);
    return () => window.removeEventListener('worldshards-mapdrops-updated', onUpd);
  }, []);

  const costs = prefs.energyCosts;
  const costBySize: Record<SizeKey, number> = {
    small: costs.small,
    medium: costs.medium,
    large: costs.large,
    xlarge: costs.xlarge,
  };

  const sizeCards: Array<{ key: SizeKey; label: string }> = [
    { key: 'small', label: t('planner.small') },
    { key: 'medium', label: t('planner.medium') },
    { key: 'large', label: t('planner.large') },
    { key: 'xlarge', label: t('planner.xlarge') },
  ];

  const apply = () => {
    save({ mapSize, loadsPerMap: loads });
    appendMapDropEntry({ timestamp: Date.now(), mapSize, tokensDropped, loads, totalLuck: luck, status });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="bg-black/50 border-white/10">
        <CardHeader className="py-3">
          <CardTitle className="text-base">{t('planner.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-xs text-white/70 mb-2">{t('planner.mapSize')}</div>
            <div className="grid grid-cols-2 gap-2">
              {sizeCards.map((s) => {
                const selected = mapSize === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setMapSize(s.key)}
                    className={`text-left rounded-lg px-3 py-2 border ${selected ? 'bg-white text-black border-white' : 'bg-white/5 text-white border-white/10'} hover:bg-white/10`}
                  >
                    <div className="text-sm font-semibold">{s.label}</div>
                    <div className="text-xs text-white/70">{t('planner.energyCost')}: {costBySize[s.key]}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/70 mb-1 block">{t('planner.loads')}</label>
              <Input type="number" value={loads} onChange={(e) => setLoads(parseInt(e.target.value || '0'))} className="bg-white/10 border-white/20 text-white h-9" />
            </div>
            <div>
              <label className="text-xs text-white/70 mb-1 block">{t('planner.tokensDropped')}</label>
              <Input type="number" value={tokensDropped} onChange={(e) => setTokensDropped(parseInt(e.target.value || '0'))} className="bg-white/10 border-white/20 text-white h-9" placeholder={t('planner.example')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/70 mb-1 block">{t('planner.luck')}</label>
              <Input type="number" value={luck} onChange={(e) => setLuck(parseInt(e.target.value || '0'))} className="bg-white/10 border-white/20 text-white h-9" />
            </div>
            <div>
              <label className="text-xs text-white/70 mb-1 block">{t('planner.status')}</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="h-9 w-full rounded bg-white/10 text-white border border-white/20 px-2"
              >
                <option className="bg-black text-white" value="neutral">{t('status.neutral')}</option>
                <option className="bg-black text-white" value="positive">{t('status.positive')}</option>
                <option className="bg-black text-white" value="negative">{t('status.negative')}</option>
                <option className="bg-black text-white" value="excellent">{t('status.excellent')}</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button className="bg-white text-black hover:bg-white/90 h-9" onClick={apply}>{t('planner.apply')}</Button>
            {history.length > 0 && (
              <Button className="bg-white/10 text-white hover:bg-white/20 h-9" onClick={() => clearMapDropsHistory()}>{t('planner.clear')}</Button>
            )}
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
            <div className="space-y-2 max-h-96 overflow-auto pr-2">
              <div className="sticky top-0 z-10 bg-black/60 backdrop-blur px-2 py-1 rounded border border-white/10 grid grid-cols-6 gap-2 text-xs text-white/60">
                <div>{t('planner.mapSize')}</div>
                <div className="text-center">{t('planner.tokensDropped')}</div>
                <div className="text-center">{t('planner.loads')}</div>
                <div className="text-center">Luck</div>
                <div className="text-center">{t('planner.status')}</div>
                <div className="text-right">{t('planner.when')}</div>
              </div>
              {history
                .slice()
                .reverse()
                .map((h, i) => (
                  <div key={i} className="border border-white/10 rounded-lg px-3 py-2 bg-white/5 text-sm grid grid-cols-6 gap-2 items-center">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-white/10 text-white text-xs">{t(`planner.${h.mapSize}`)}</span>
                    </div>
                    <div className="text-center font-mono text-white">{h.tokensDropped.toLocaleString()}</div>
                    <div className="text-center font-mono text-white">{h.loads}</div>
                    <div className="text-center font-mono text-white">{h.totalLuck ?? '-'}</div>
                    <div className="text-center text-white/80">{h.status ? t(`status.${h.status}`) : '-'}</div>
                    <div className="text-right text-white/70 text-[10px] md:text-xs">{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {new Date(h.timestamp).toLocaleDateString()}</div>
                    <div className="col-span-6 flex justify-end mt-1">
                      <Button className="h-7 px-2 bg-white/10 text-white hover:bg-white/20" onClick={() => deleteMapDropEntry(h.timestamp)}>{t('planner.delete')}</Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}