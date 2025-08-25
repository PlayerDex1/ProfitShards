import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePreferences } from "@/hooks/usePreferences";
import { useI18n } from "@/i18n";
import { appendMapDropEntry, getMapDropsHistory, deleteMapDropEntry, clearMapDropsHistory, getMapDropsHistoryGroupedByDay, getDayStats } from "@/lib/mapDropsHistory";
import { useEquipment } from "@/hooks/useEquipment";
import { useAuth } from "@/hooks/use-auth";
import { Calculator, TrendingUp, TrendingDown, Minus, MapPin, Trash2, Edit2, Save, X } from "lucide-react";

interface MapPlannerProps {}

type SizeKey = 'small' | 'medium' | 'large' | 'xlarge';

export function MapPlanner({}: MapPlannerProps) {
  const { prefs, save } = usePreferences();
  const { t } = useI18n();
  const { isAuthenticated, userProfile } = useAuth();
  const [mapSize, setMapSize] = useState<SizeKey>((prefs.mapSize as SizeKey) || 'medium');
  const [loads, setLoads] = useState<number>(0);
  const [tokensDropped, setTokensDropped] = useState<number>(0);
  const [history, setHistory] = useState(getMapDropsHistory());
  const [groupedHistory, setGroupedHistory] = useState(getMapDropsHistoryGroupedByDay());
  const { totalLuck } = useEquipment();
  const [luck, setLuck] = useState<number>(prefs.savedLuck || totalLuck || 0);
  const [status, setStatus] = useState<'excellent' | 'positive' | 'negative' | 'neutral'>('neutral');
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [isEditingLuck, setIsEditingLuck] = useState<boolean>(false);
  const [tempLuck, setTempLuck] = useState<number>(luck);
  
  // 🆕 Novos campos para Level/Tier/Charge
  const [level, setLevel] = useState<string>('I');
  const [tier, setTier] = useState<string>('I');
  const [charge, setCharge] = useState<number>(0);

  useEffect(() => {
    const onUpd = () => {
      setHistory(getMapDropsHistory());
      setGroupedHistory(getMapDropsHistoryGroupedByDay());
    };
    window.addEventListener('worldshards-mapdrops-updated', onUpd);
    return () => window.removeEventListener('worldshards-mapdrops-updated', onUpd);
  }, []);

  // Update luck from equipment only if no saved luck exists
  useEffect(() => {
    if (totalLuck && totalLuck > 0 && !prefs.savedLuck) {
      setLuck(totalLuck);
      setTempLuck(totalLuck);
    }
  }, [totalLuck, prefs.savedLuck]);

  // Remover auto-cálculo de cargas - agora é manual via charge
  // useEffect removido - loads será igual ao charge

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

  // Calculate efficiency metrics usando charge em vez de loads
  const totalEnergy = charge * costBySize[mapSize];
  const tokensPerEnergy = totalEnergy > 0 ? tokensDropped / totalEnergy : 0;
  const tokensPerCharge = charge > 0 ? tokensDropped / charge : 0;

  const apply = async () => {

    const entry = {
      timestamp: Date.now(),
      mapSize,
      tokensDropped,
      loads: charge, // usar charge como loads
      totalLuck: luck,
      status,
      // 🆕 Novos campos Level/Tier/Charge
      level: level,
      tier: tier,
      charge: charge
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
        
        const timestamp = Date.now();
        const runData = {
          mapSize: mapSize,
          luck: luck,
          loads: charge, // usar charge como loads
          tokensDropped: tokensDropped,
          timestamp: timestamp,
          // 🆕 Novos campos
          level: level,
          tier: tier,
          charge: charge,
          // 📧 FASE 1: Email do usuário (seguro)
          userEmail: userProfile?.email || 'anonymous@feed.com'
        };

        console.log('🎯 FASE 1 - Dados enviados:', {
          userEmail: runData.userEmail,
          hasUserProfile: !!userProfile,
          userProfileEmail: userProfile?.email
        });

        // CHAMADA 1: API original para manter dashboard global funcionando
        try {
          const dashboardResponse = await fetch('/api/admin/save-user-metrics', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(runData)
          });
          
          const dashboardResult = await dashboardResponse.json();
          console.log('%c✅ DASHBOARD: Métricas salvas para dashboard global', 'color: #8B5CF6; font-weight: bold;', dashboardResult);
          
        } catch (error) {
          console.log('%c❌ ERROR: Falha salvando para dashboard', 'color: #EF4444;', error);
        }

        // CHAMADA 2: Nova API para alimentar o feed
        try {
          const feedResponse = await fetch('/api/feed/feed-runs', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(runData)
          });
          
          const feedResult = await feedResponse.json();
          console.log('%c✅ FEED: Métricas salvas para feed da comunidade', 'color: #10B981; font-weight: bold;', feedResult);
          
          if (!feedResult.success) {
            console.log('%c⚠️ WARNING: Falha ao salvar para feed', 'color: #F59E0B;', feedResult.error);
          }
          
        } catch (error) {
          console.log('%c❌ ERROR: Erro ao salvar para feed', 'color: #EF4444; font-weight: bold;', error);
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
          {/* 🎯 PRIORIDADE PRINCIPAL - Level/Tier/Charge */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-4">
            <div className="text-sm font-bold text-primary mb-3 flex items-center">
              ⭐ Configuração Principal do Mapa
            </div>
            
            {/* Level e Tier em destaque */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-foreground mb-2 block">🎖️ Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="h-10 w-full rounded-lg border-2 border-primary/30 bg-background text-foreground px-3 font-medium focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="I">Level I</option>
                  <option value="II">Level II</option>
                  <option value="III">Level III</option>
                  <option value="IV">Level IV</option>
                  <option value="V">Level V</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-foreground mb-2 block">🏆 Tier</label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value)}
                  className="h-10 w-full rounded-lg border-2 border-primary/30 bg-background text-foreground px-3 font-medium focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="I">Tier I</option>
                  <option value="II">Tier II</option>
                  <option value="III">Tier III</option>
                </select>
              </div>
            </div>

            {/* Charge */}
            <div>
              <label className="text-sm font-bold text-foreground mb-2 block">⚡ Cargas (Manual)</label>
              <Input 
                type="number" 
                value={charge} 
                onChange={(e) => setCharge(parseInt(e.target.value || '0'))} 
                className="h-10 border-2 border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 font-medium"
                min="0"
                max="99"
                placeholder="Quantas cargas vai usar?"
              />
            </div>
          </div>

          {/* 📋 Campos Secundários */}
          <div className="space-y-4">
            {/* Tokens Dropados */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">{t('planner.tokensDropped')}</label>
              <Input 
                type="number" 
                value={tokensDropped} 
                onChange={(e) => setTokensDropped(parseInt(e.target.value || '0'))} 
                className="h-9" 
                placeholder="Quantos tokens droparam?"
                min="0"
              />
            </div>

            {/* Luck e Status */}
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

            {/* Map (opcional, menor destaque) */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">📍 Mapa (Opcional)</label>
              <select
                value={mapSize}
                onChange={(e) => setMapSize(e.target.value as SizeKey)}
                className="h-9 w-full rounded border border-border bg-background text-foreground px-2 text-sm"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="xlarge">XLarge</option>
              </select>
            </div>
          </div>

          {/* Efficiency Metrics */}
          {tokensDropped > 0 && charge > 0 && (
            <div className="p-3 bg-muted/50 rounded-lg border">
              <div className="text-sm font-medium text-foreground mb-2">Métricas de Eficiência</div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="text-muted-foreground">Tokens/Charge</div>
                  <div className="font-mono font-medium">{tokensPerCharge.toFixed(1)}</div>
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
            <Button 
              onClick={apply} 
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {t('planner.apply')}
            </Button>
            {history.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => clearMapDropsHistory()}
                className="hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500 transition-all duration-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
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
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">📊 Histórico de Runs</CardTitle>
            {history.length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => clearMapDropsHistory()}
                className="h-7 px-2 text-xs hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Limpar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum histórico encontrado</p>
              <p className="text-xs mt-1">Suas runs aparecerão aqui após serem salvas</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-auto">
              {/* 🗓️ Agrupar por dias */}
              {Object.entries(groupedHistory)
                .sort(([a], [b]) => b.localeCompare(a)) // Mais recente primeiro
                .slice(0, 7) // Últimos 7 dias
                .map(([day, dayEntries]) => {
                  const stats = getDayStats(day);
                  const isToday = day === new Date().toISOString().split('T')[0];
                  
                  return (
                    <div key={day} className="border rounded-lg bg-muted/20">
                      {/* Header do Dia */}
                      <div className="px-4 py-3 border-b bg-muted/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-bold text-foreground">
                              📅 {isToday ? 'Hoje' : new Date(day + 'T12:00:00Z').toLocaleDateString('pt-BR', { 
                                weekday: 'short', 
                                day: '2-digit', 
                                month: '2-digit' 
                              })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {day}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {stats.totalRuns} runs • {stats.totalTokens.toLocaleString()} tokens
                          </div>
                        </div>
                      </div>

                      {/* Runs do Dia - Layout Clean Horizontal */}
                      <div className="p-3 space-y-2">
                        {dayEntries.map((h, i) => (
                          <div 
                            key={h.timestamp} 
                            className="bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-750 transition-colors duration-200 px-4 py-3"
                          >
                            <div className="grid grid-cols-6 gap-3 items-center text-xs">
                              {/* LEVEL/TIER */}
                              <div>
                                <div className="text-slate-400 uppercase tracking-wide mb-1">LEVEL/TIER</div>
                                <div className="text-white">
                                  <div className="font-medium">Level {h.level || 'IV'}</div>
                                  <div className="text-slate-300">Tier {h.tier || 'I'}</div>
                                </div>
                              </div>

                              {/* MAP */}
                              <div>
                                <div className="text-slate-400 uppercase tracking-wide mb-1">MAP</div>
                                <div className="bg-slate-600 text-white px-2 py-1 rounded text-center font-medium">
                                  {h.mapSize}
                                </div>
                              </div>

                              {/* TOKENS */}
                              <div>
                                <div className="text-slate-400 uppercase tracking-wide mb-1">TOKENS</div>
                                <div className="bg-yellow-600 text-white px-2 py-1 rounded text-center font-bold">
                                  {h.tokensDropped}
                                </div>
                              </div>

                              {/* CHARGE */}
                              <div>
                                <div className="text-slate-400 uppercase tracking-wide mb-1">CHARGE</div>
                                <div className="text-white font-medium">
                                  {h.charge || h.loads}
                                </div>
                              </div>

                              {/* TIME */}
                              <div>
                                <div className="text-slate-400 uppercase tracking-wide mb-1">TIME</div>
                                <div className="text-white font-mono text-xs">
                                  {new Date(h.timestamp).toLocaleTimeString('pt-BR', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </div>
                              </div>

                              {/* ACTIONS */}
                              <div className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => deleteMapDropEntry(h.timestamp)}
                                  className="h-6 w-6 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                                >
                                  ✕
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}