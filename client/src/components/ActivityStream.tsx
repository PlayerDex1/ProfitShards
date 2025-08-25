import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Zap, MapPin, Coins, TrendingUp, Activity, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityRun {
  id: string;
  map: string;           // Small/Medium/Large/XLarge Map
  luck: number;          // Luck usado
  tokens: number;        // Tokens dropados
  timeAgo: string;       // "há 5 min"
  timestamp: number;     // Para ordenação
}

interface ActivityStreamResponse {
  success: boolean;
  runs: ActivityRun[];
  cached?: boolean;
  total?: number;
  error?: string;
  fallback?: boolean;
}

// 🎨 Card Premium - Versão Melhorada com Design Avançado
const RunCard = ({ run, index }: { run: ActivityRun; index: number }) => {
  // Configuração avançada por tipo de mapa
  const getMapConfig = (map: string) => {
    if (map.includes('Small')) return { 
      gradient: 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600', 
      bgGlow: 'bg-emerald-50',
      borderGlow: 'border-emerald-200',
      textColor: 'text-white',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      shadowColor: 'hover:shadow-emerald-500/20',
      icon: '🌿',
      difficulty: 'Fácil'
    };
    if (map.includes('Medium')) return { 
      gradient: 'bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600', 
      bgGlow: 'bg-blue-50',
      borderGlow: 'border-blue-200',
      textColor: 'text-white',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      shadowColor: 'hover:shadow-blue-500/20',
      icon: '💧',
      difficulty: 'Médio'
    };
    if (map.includes('Large')) return { 
      gradient: 'bg-gradient-to-br from-purple-500 via-violet-500 to-purple-600', 
      bgGlow: 'bg-purple-50',
      borderGlow: 'border-purple-200',
      textColor: 'text-white',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
      shadowColor: 'hover:shadow-purple-500/20',
      icon: '🔮',
      difficulty: 'Difícil'
    };
    if (map.includes('XLarge')) return { 
      gradient: 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-600', 
      bgGlow: 'bg-orange-50',
      borderGlow: 'border-orange-200',
      textColor: 'text-white',
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
      shadowColor: 'hover:shadow-orange-500/20',
      icon: '🔥',
      difficulty: 'Extremo'
    };
    return { 
      gradient: 'bg-gradient-to-br from-slate-500 to-slate-600', 
      bgGlow: 'bg-slate-50',
      borderGlow: 'border-slate-200',
      textColor: 'text-white',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      shadowColor: 'hover:shadow-slate-500/20',
      icon: '❓',
      difficulty: 'Desconhecido'
    };
  };

  const mapConfig = getMapConfig(run.map);
  
  // Calcular métricas avançadas
  const efficiency = run.luck > 0 ? (run.tokens / run.luck * 1000).toFixed(1) : '0.0';
  const efficiencyNum = parseFloat(efficiency);
  
  // Sistema de ranking baseado em eficiência
  const getPerformanceRank = (eff: number) => {
    if (eff >= 0.25) return { rank: 'Legendary', color: 'text-yellow-600', badge: '👑' };
    if (eff >= 0.20) return { rank: 'Elite', color: 'text-purple-600', badge: '💎' };
    if (eff >= 0.15) return { rank: 'Pro', color: 'text-blue-600', badge: '⭐' };
    if (eff >= 0.10) return { rank: 'Good', color: 'text-green-600', badge: '✨' };
    return { rank: 'Novice', color: 'text-gray-600', badge: '🔰' };
  };

  const performance = getPerformanceRank(efficiencyNum);
  
  // Determinar se é run recente (badge "Novo")
  const isRecent = Date.now() - run.timestamp < 5 * 60 * 1000; // 5 minutos
  
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/30",
        "bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-md",
        "transition-all duration-500 ease-out",
        "hover:scale-[1.03] hover:shadow-2xl hover:border-primary/30",
        mapConfig.shadowColor,
        "group cursor-pointer transform-gpu"
      )}
      style={{
        animationDelay: `${index * 100}ms`,
        animation: 'slideInUp 0.6s ease-out forwards'
      }}
    >
      {/* Glow effect background */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        mapConfig.bgGlow,
        "blur-xl scale-105 -z-10"
      )} />
      
      {/* Header Premium do Mapa */}
      <div className={cn(
        "relative px-5 py-4",
        mapConfig.gradient,
        mapConfig.textColor,
        "overflow-hidden"
      )}>
        {/* Pattern decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"%3E%3Cpath d="M 20 0 L 0 0 0 20" fill="none" stroke="white" stroke-width="0.5"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100%25" height="100%25" fill="url(%23grid)" /%3E%3C/svg%3E')]" />
        </div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{mapConfig.icon}</div>
            <div>
              <div className="font-bold text-lg leading-tight">{run.map}</div>
              <div className="text-xs opacity-90">{mapConfig.difficulty}</div>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-1">
            <Badge className={cn("text-xs font-semibold border", mapConfig.badgeColor)}>
              {efficiency} eff
            </Badge>
            {isRecent && (
              <Badge className="text-xs bg-green-500 text-white animate-pulse">
                ✨ Novo
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {/* Conteúdo Principal */}
      <div className="p-5 space-y-4">
        {/* Ranking e Performance */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{performance.badge}</span>
            <div>
              <div className={cn("text-sm font-semibold", performance.color)}>
                {performance.rank}
              </div>
              <div className="text-xs text-muted-foreground">Performance</div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-foreground">
              {run.tokens.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">tokens</div>
          </div>
        </div>
        
        {/* Estatísticas Detalhadas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200/50">
            <div className="p-2 rounded-lg bg-yellow-100 text-yellow-700">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs text-yellow-700 font-medium">Luck Total</div>
              <div className="text-lg font-bold text-yellow-800">
                {(run.luck / 1000).toFixed(1)}K
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/50">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs text-blue-700 font-medium">Eficiência</div>
              <div className="text-lg font-bold text-blue-800">
                {efficiency}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer com Tempo e Status */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span className="font-medium">{run.timeAgo}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">Live</span>
          </div>
        </div>
      </div>
      
      {/* Efeito de Hover Avançado */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
      
      {/* Shine effect no hover */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
    </div>
  );
};

// Skeleton loading
const RunSkeleton = () => (
  <div className="p-3 rounded-lg border border-gray-200 bg-gray-50 animate-pulse">
    <div className="flex items-center space-x-2 mb-2">
      <div className="h-4 w-4 bg-gray-300 rounded"></div>
      <div className="h-4 w-20 bg-gray-300 rounded"></div>
    </div>
    <div className="grid grid-cols-2 gap-2 mb-2">
      <div className="h-3 w-16 bg-gray-300 rounded"></div>
      <div className="h-3 w-20 bg-gray-300 rounded"></div>
    </div>
    <div className="h-3 w-12 bg-gray-300 rounded mt-2"></div>
  </div>
);

export function ActivityStream() {
  const [runs, setRuns] = useState<ActivityRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const loadActivity = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/feed/feed-runs', {
        method: 'GET',
        credentials: 'include',
      });
      
      const result: ActivityStreamResponse = await response.json();
      
      if (result.success) {
        setRuns(result.runs || []);
        setLastUpdate(new Date().toLocaleTimeString());
        
        // Log informativo no console
        console.log(`🔥 Feed carregado: ${result.runs?.length || 0} runs ${result.cached ? '(cache)' : '(fresh)'}`);
        
        if (result.fallback) {
          console.log('⚠️ Usando dados demo:', result.error);
        }
      } else {
        setError(result.error || 'Erro ao carregar atividades');
      }
    } catch (error) {
      console.error('Erro ao carregar activity stream:', error);
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados iniciais e configurar auto-refresh
  useEffect(() => {
    loadActivity();
    
    // Auto-refresh a cada 5 minutos (menos agressivo)
    const interval = setInterval(loadActivity, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <span className="text-2xl">🔥</span>
            <span>Atividade Recente</span>
            {runs.length > 0 && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-normal">
                {runs.length} runs
              </span>
            )}
          </CardTitle>
          
          <Button
            onClick={loadActivity}
            variant="outline"
            size="sm"
            disabled={loading}
            className="h-8"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
        
        {lastUpdate && (
          <p className="text-xs text-muted-foreground">
            Última atualização: {lastUpdate}
          </p>
        )}
      </CardHeader>
      
      <CardContent>
        {/* Estado de erro */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200 mb-4">
            ❌ {error}
          </div>
        )}
        
        {/* Loading skeleton */}
        {loading && runs.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => <RunSkeleton key={i} />)}
          </div>
        ) : runs.length === 0 ? (
          /* Estado vazio */
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhuma atividade recente</p>
            <p className="text-xs mt-1">As runs aparecerão aqui quando usuários usarem o MapPlanner</p>
          </div>
        ) : (
          /* Grid de runs */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {runs.slice(0, 12).map(run => (
              <RunCard key={run.id} run={run} />
            ))}
          </div>
        )}
        
        {/* Info sobre dados */}
        {runs.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground text-center">
            📊 Feed automático baseado na atividade real dos usuários • Atualização a cada 5 min
          </div>
        )}
        
        {runs.length > 12 && (
          <div className="mt-2 text-xs text-muted-foreground text-center">
            Mostrando 12 de {runs.length} atividades recentes
          </div>
        )}
      </CardContent>
    </Card>
  );
}