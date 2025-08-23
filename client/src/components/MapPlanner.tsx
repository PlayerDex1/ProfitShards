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
  const [loads, setLoads] = useState<number>(0);
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

  // Auto-calculate loads based on map size
  useEffect(() => {
    const loadsPerMap = {
      small: 4,    // 1 carga × 4 equipamentos
      medium: 8,   // 2 cargas × 4 equipamentos  
      large: 16,   // 4 cargas × 4 equipamentos
      xlarge: 24   // 6 cargas × 4 equipamentos
    };
    
    setLoads(loadsPerMap[mapSize] || loadsPerMap.medium);
  }, [mapSize]);

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
      save({ mapSize });
      
      // Save to history
      appendMapDropEntry(entry);
      
      // Salvar métricas anônimas se usuário autenticado
      if (isAuthenticated && tokensDropped > 0) {
        console.log('%c🔍 DEBUG: Tentando salvar métricas no D1', 'color: #3B82F6; font-weight: bold; font-size: 14px;', {
          isAuthenticated,
          tokensDropped,
          mapSize,
          luck,
          loads
        });
        
        try {
          const metricsResponse = await fetch('/api/admin/save-user-metrics', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              mapSize: mapSize,
              luck: luck,
              loads: loads,
              tokensDropped: tokensDropped,
              timestamp: Date.now()
            })
          });
          
          const metricsResult = await metricsResponse.json();
          console.log('%c✅ SUCCESS: Métricas salvas no D1', 'color: #10B981; font-weight: bold;', metricsResult);
          
          if (!metricsResult.success) {
            console.log('%c⚠️ WARNING: Falha ao salvar métricas', 'color: #F59E0B;', metricsResult.error);
          }
          
        } catch (error) {
          console.log('%c❌ ERROR: Erro ao salvar métricas no D1', 'color: #EF4444; font-weight: bold;', error);
        }
      } else {
        console.log('%c⚠️ Métricas não enviadas', 'color: #F59E0B; font-weight: bold; font-size: 14px;', {
          isAuthenticated,
          tokensDropped,
          reason: !isAuthenticated ? 'Não autenticado' : 'Tokens = 0'
        });
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
              <label className="text-sm font-medium text-foreground mb-1 block">
                {t('planner.loads')} <span className="text-xs text-muted-foreground">(automático)</span>
              </label>
              <Input 
                type="number" 
                value={loads} 
                readOnly
                className="h-9 bg-muted/50 cursor-not-allowed"
                title={`Cargas calculadas automaticamente: ${mapSize} = ${loads} cargas`