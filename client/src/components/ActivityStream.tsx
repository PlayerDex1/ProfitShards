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

// Componente para cada run individual - versão melhorada
const RunCard = ({ run }: { run: ActivityRun }) => {
  // Cores baseadas no tipo de mapa - versão aprimorada
  const getMapConfig = (map: string) => {
    if (map.includes('Small')) return { 
      color: 'bg-gradient-to-br from-green-500 to-green-600', 
      text: 'text-white', 
      badge: 'bg-green-100 text-green-800',
      glow: 'shadow-green-200'
    };
    if (map.includes('Medium')) return { 
      color: 'bg-gradient-to-br from-blue-500 to-blue-600', 
      text: 'text-white', 
      badge: 'bg-blue-100 text-blue-800',
      glow: 'shadow-blue-200'
    };
    if (map.includes('Large')) return { 
      color: 'bg-gradient-to-br from-purple-500 to-purple-600', 
      text: 'text-white', 
      badge: 'bg-purple-100 text-purple-800',
      glow: 'shadow-purple-200'
    };
    if (map.includes('XLarge')) return { 
      color: 'bg-gradient-to-br from-orange-500 to-orange-600', 
      text: 'text-white', 
      badge: 'bg-orange-100 text-orange-800',
      glow: 'shadow-orange-200'
    };
    return { 
      color: 'bg-gradient-to-br from-gray-500 to-gray-600', 
      text: 'text-white', 
      badge: 'bg-gray-100 text-gray-800',
      glow: 'shadow-gray-200'
    };
  };

  const mapConfig = getMapConfig(run.map);
  
  // Calcular eficiência estimada (tokens/luck)
  const efficiency = run.luck > 0 ? (run.tokens / run.luck * 1000).toFixed(1) : '0.0';
  
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm",
      "transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02]",
      "group cursor-pointer"
    )}>
      {/* Header colorido do mapa */}
      <div className={cn("px-4 py-3", mapConfig.color, mapConfig.text)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span className="font-semibold text-sm">{run.map}</span>
          </div>
          <Badge variant="secondary" className={cn("text-xs", mapConfig.badge)}>
            {efficiency} eff
          </Badge>
        </div>
      </div>
      
      {/* Conteúdo principal */}
      <div className="p-4 space-y-3">
        {/* Estatísticas principais */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2 text-sm">
            <div className="p-1.5 rounded-md bg-yellow-100 text-yellow-800">
              <Zap className="h-3 w-3" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Luck</div>
              <div className="font-semibold">{run.luck.toLocaleString()}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <div className="p-1.5 rounded-md bg-blue-100 text-blue-800">
              <Coins className="h-3 w-3" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Tokens</div>
              <div className="font-semibold">{run.tokens.toLocaleString()}</div>
            </div>
          </div>
        </div>
        
        {/* Tempo e indicador de atividade */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="text-xs text-muted-foreground flex items-center space-x-1">
            <Activity className="h-3 w-3" />
            <span>{run.timeAgo}</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        </div>
      </div>
      
      {/* Efeito de hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
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