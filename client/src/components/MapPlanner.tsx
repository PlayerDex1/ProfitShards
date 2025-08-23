import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePreferences } from "@/hooks/usePreferences";
import { useI18n } from "@/i18n";
import { appendMapDropEntry, getMapDropsHistory, deleteMapDropEntry, clearMapDropsHistory } from "@/lib/mapDropsHistory";
import { useEquipment } from "@/hooks/useEquipment";
import { useAuth } from "@/hooks/use-auth";
import { Calculator, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MapPlannerProps {}

type SizeKey = 'small' | 'medium' | 'large' | 'xlarge';

export function MapPlanner({}: MapPlannerProps) {
  const { prefs, save } = usePreferences();
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const [mapSize, setMapSize] = useState<SizeKey>((prefs.mapSize as SizeKey) || 'medium');
  const [loads, setLoads] = useState<number>(prefs.loadsPerMap || 1);
  const [tokensDropped, setTokensDropped] = useState<number>(0);
  const [history, setHistory] = useState(getMapDropsHistory());
  const { totalLuck } = useEquipment();
  const [luck, setLuck] = useState<number>(totalLuck || 0);
  const [status, setStatus] = useState<'excellent' | 'positive' | 'negative' | 'neutral'>('neutral');
  const [saveMessage, setSaveMessage] = useState<string>('');

  useEffect(() => {
    const onUpd = () => setHistory(getMapDropsHistory());
    window.addEventListener('worldshards-mapdrops-updated', onUpd);
    return () => window.removeEventListener('worldshards-mapdrops-updated', onUpd);
  }, []);

  // Update luck from equipment
  useEffect(() => {
    if (totalLuck && totalLuck > 0) {
      setLuck(totalLuck);
    }
  }, [totalLuck]);

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

  // Calculate efficiency metrics
  const totalEnergy = loads * costBySize[mapSize];
  const tokensPerEnergy = totalEnergy > 0 ? tokensDropped / totalEnergy : 0;
  const tokensPerLoad = loads > 0 ? tokensDropped / loads : 0;

  const apply = async () => {
    if (loads <= 0) {
      setSaveMessage('⚠️ Número de loads deve ser maior que 0');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    const entry = {
      timestamp: Date.now(),
      mapSize,
      tokensDropped,
      loads,
      totalLuck: luck,
      status
    };

    try {
      // Save preferences
      save({ mapSize, loadsPerMap: loads });
      
      // Save to history
      appendMapDropEntry(entry);
      
      // Salvar métricas anônimas se usuário autenticado
      if (isAuthenticated && tokensDropped > 0) {
        try {
          await fetch('/api/admin/save-metrics', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'map_drop',
              data: {
                mapName: mapSize,
                luck: luck,
                loads: loads,
                tokensDropped: tokensDropped
              }
            })
          });
        } catch (metricsError) {
          console.log('Metrics save failed (non-critical):', metricsError);
        }
      }
      
      // Reset form
      setTokensDropped(0);
      setStatus('neutral');
      
      setSaveMessage('✅ Dados salvos com sucesso!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('❌ Erro ao salvar dados');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'positive': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'negative': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'positive': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'negative': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-muted-foreground bg-muted/50 border-border';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>{t('planner.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-medium text-foreground mb-2">{t('planner.mapSize')}</div>
            <div className="grid grid-cols-2 gap-2">
              {sizeCards.map((s) => {
                const selected = mapSize === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setMapSize(s.key)}
                    className={`text-left rounded-lg px-3 py-2 border transition-colors ${
                      selected 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-background text-foreground border-border hover:bg-muted'
                    }`}
                  >
                    <div className="text-sm font-semibold">{s.label}</div>
                    <div className="text-xs opacity-70">{t('planner.energyCost')}: {costBySize[s.key]}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">{t('planner.loads')}</label>
              <Input 
                type="number" 
                value={loads} 
                onChange={(e) => setLoads(parseInt(e.target.value || '1'))} 
                className="h-9"
                min="1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">{t('planner.tokensDropped')}</label>
              <Input 
                type="number" 
                value={tokensDropped} 
                onChange={(e) => setTokensDropped(parseInt(e.target.value || '0'))} 
                className="h-9" 
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">{t('planner.luck')}</label>
              <Input 
                type="number" 
                value={luck} 
                onChange={(e) => setLuck(parseInt(e.target.value || '0'))} 
                className="h-9"
                min="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">{t('planner.status')}</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="h-9 w-full rounded border border-border bg-background text-foreground px-2"
              >
                <option value="neutral">{t('status.neutral')}</option>
                <option value="positive">{t('status.positive')}</option>
                <option value="negative">{t('status.negative')}</option>
                <option value="excellent">{t('status.excellent')}</option>
              </select>
            </div>
          </div>

          {/* Efficiency Metrics */}
          {tokensDropped > 0 && loads > 0 && (
            <div className="p-3 bg-muted/50 rounded-lg border">
              <div className="text-sm font-medium text-foreground mb-2">Métricas de Eficiência</div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="text-muted-foreground">Tokens/Load</div>
                  <div className="font-mono font-medium">{tokensPerLoad.toFixed(1)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Tokens/Energia</div>
                  <div className="font-mono font-medium">{tokensPerEnergy.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Energia Total</div>
                  <div className="font-mono font-medium">{totalEnergy}</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button onClick={apply} className="flex-1">
              {t('planner.apply')}
            </Button>
            {history.length > 0 && (
              <Button variant="outline" onClick={() => clearMapDropsHistory()}>
                {t('planner.clear')}
              </Button>
            )}
          </div>

          {saveMessage && (
            <div className="text-sm text-center p-2 rounded border bg-muted/50">
              {saveMessage}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">{t('planner.history')}</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('planner.noHistory')}</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-auto">
              {history.slice(0, 10).map((h, i) => (
                <div key={i} className="border rounded-lg p-3 bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 rounded text-xs bg-primary/10 text-primary border border-primary/20">
                        {t(`planner.${h.mapSize}`)}
                      </span>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs border ${getStatusColor(h.status || 'neutral')}`}>
                        {getStatusIcon(h.status || 'neutral')}
                        <span>{h.status ? t(`status.${h.status}`) : '-'}</span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => deleteMapDropEntry(h.timestamp)}
                      className="h-6 px-2 text-xs"
                    >
                      ✕
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Tokens</div>
                      <div className="font-mono font-medium">{h.tokensDropped.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Loads</div>
                      <div className="font-mono font-medium">{h.loads}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Luck</div>
                      <div className="font-mono font-medium">{h.totalLuck ?? '-'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">T/Load</div>
                      <div className="font-mono font-medium">{h.loads > 0 ? (h.tokensDropped / h.loads).toFixed(1) : '-'}</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-2">
                    {new Date(h.timestamp).toLocaleString()}
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