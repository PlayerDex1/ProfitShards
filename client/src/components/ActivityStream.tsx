import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Zap, MapPin, Coins } from "lucide-react";

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

// Componente para cada run individual
const RunCard = ({ run }: { run: ActivityRun }) => {
  // Cores baseadas no tipo de mapa
  const getMapColor = (map: string) => {
    if (map.includes('Small')) return 'text-green-700 bg-green-50 border-green-200';
    if (map.includes('Medium')) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (map.includes('Large')) return 'text-purple-700 bg-purple-50 border-purple-200';
    if (map.includes('XLarge')) return 'text-orange-700 bg-orange-50 border-orange-200';
    return 'text-gray-700 bg-gray-50 border-gray-200';
  };

  const mapColorClass = getMapColor(run.map);

  return (
    <div className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${mapColorClass}`}>
      {/* Mapa */}
      <div className="flex items-center space-x-2 mb-2">
        <MapPin className="h-4 w-4" />
        <span className="font-medium text-sm">{run.map}</span>
      </div>
      
      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center space-x-1">
          <Zap className="h-3 w-3" />
          <span>Luck: {run.luck.toLocaleString()}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Coins className="h-3 w-3" />
          <span>{run.tokens.toLocaleString()} tokens</span>
        </div>
      </div>
      
      {/* Tempo */}
      <div className="text-xs opacity-70 mt-2 pt-2 border-t border-current/20">
        {run.timeAgo}
      </div>
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
      const response = await fetch('/api/feed/activity-stream', {
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