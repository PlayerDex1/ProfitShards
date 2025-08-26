import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Zap, MapPin, Coins, TrendingUp, Activity, Filter, User, Clock, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityRun {
  id: string;
  map?: string;           // Small/Medium/Large/XLarge Map
  mapName?: string;       // Formato alternativo da API recent-runs
  luck: number;          // Luck usado
  tokens: number;        // Tokens dropados
  timeAgo: string;       // "há 5 min"
  timestamp: number;     // Para ordenação
  // 🆕 Novos campos
  level?: string;        // Level I-V
  tier?: string;         // Tier I-III
  charge?: number;       // Carga
  energy?: number;       // Energia (formato recent-runs)
  efficiency?: number;   // Eficiência já calculada
  playerName?: string;   // Nome do usuário
  user?: string;         // Formato alternativo da API recent-runs
}

interface ActivityStreamResponse {
  success: boolean;
  runs: ActivityRun[];
  cached?: boolean;
  total?: number;
  error?: string;
  fallback?: boolean;
  timestamp?: string;
}

// 🎯 Card Melhorado - Mais Atrativo e Visual
const RunCard = ({ run, index }: { run: ActivityRun; index: number }) => {
  // 🎯 Usar playerName de qualquer formato de API ou fallback
  const playerName = run.playerName || run.user || (run.id.includes('demo') ? 'demo_user' : 'Player');

  // Formatar data
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit'
    });
  };

  // Formatar horário
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Determinar cor do mapa
  const mapName = run.map || run.mapName || 'Unknown Map';
  const getMapColor = (map: string) => {
    if (map.includes('Small')) return 'bg-green-500/20 text-green-600 border-green-500/30';
    if (map.includes('Medium')) return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
    if (map.includes('Large')) return 'bg-purple-500/20 text-purple-600 border-purple-500/30';
    if (map.includes('XLarge')) return 'bg-red-500/20 text-red-600 border-red-500/30';
    return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
  };

  // Calcular ou usar eficiência existente
  const efficiency = run.efficiency?.toFixed(1) || (run.luck > 0 ? (run.tokens / run.luck * 1000).toFixed(1) : '0.0');

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
        "bg-gradient-to-br from-background to-muted/30",
        "border-border/50 hover:border-primary/30"
      )}
      style={{
        animationDelay: `${index * 100}ms`,
        animation: 'fadeInUp 0.5s ease-out forwards'
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{playerName}</CardTitle>
              <p className="text-xs text-muted-foreground">Acabou de farmar</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {run.timeAgo}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 p-5">
        {/* Informações Principais */}
        <div className="grid grid-cols-2 gap-6">
          {/* Mapa */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Mapa</span>
            </div>
            <Badge className={cn("px-3 py-1 border", getMapColor(mapName))}>
              {mapName.replace(' Map', '')}
            </Badge>
          </div>

          {/* Tokens */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Coins className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Tokens</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-yellow-600">{run.tokens}</span>
              <Badge variant="secondary" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                {efficiency} eff
              </Badge>
            </div>
          </div>
        </div>

        {/* Level/Tier e Luck */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Level</div>
            <div className="font-semibold text-primary">{run.level || 'IV'}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Tier</div>
            <div className="font-semibold text-blue-600">{run.tier || 'I'}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Luck</div>
            <div className="font-semibold text-purple-600">{run.luck.toLocaleString()}</div>
          </div>
        </div>

        {/* Footer com data/hora */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
          <span>{formatDate(run.timestamp)}</span>
          <span>{formatTime(run.timestamp)}</span>
                     <Badge variant="outline" className="text-xs">
             Charge: {run.charge || run.energy || 4}
           </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

// Skeleton loading melhorado
const RunSkeleton = () => (
  <Card className="animate-pulse">
    <CardHeader className="pb-3">
      <div className="flex items-center space-x-3">
        <div className="h-8 w-8 bg-muted rounded-full"></div>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-24"></div>
          <div className="h-3 bg-muted rounded w-16"></div>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded w-12"></div>
          <div className="h-6 bg-muted rounded w-20"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded w-12"></div>
          <div className="h-6 bg-muted rounded w-16"></div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 p-3 bg-muted/50 rounded-lg">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="text-center space-y-1">
            <div className="h-3 bg-muted rounded w-8 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-6 mx-auto"></div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export function ActivityStream() {
  const [runs, setRuns] = useState<ActivityRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const loadFeed = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const url = forceRefresh 
        ? '/api/feed/activity-stream?force=true&_=' + Date.now()
        : '/api/feed/activity-stream';
        
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: forceRefresh ? { 'Cache-Control': 'no-cache' } : {}
      });
      
      const result: ActivityStreamResponse = await response.json();
      
      if (result.success) {
        setRuns(result.runs || []);
        setIsCached(result.cached || false);
        setLastUpdate(new Date().toLocaleTimeString('pt-BR'));
      } else {
        setError(result.error || 'Erro ao carregar feed');
      }
    } catch (error) {
      console.error('Erro ao carregar feed:', error);
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const refreshFeed = async () => {
    setIsRefreshing(true);
    try {
      await loadFeed(true); // Força refresh ignorando cache
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadFeed();
    // Auto-refresh a cada 1 minuto para dados mais atuais
    const interval = setInterval(loadFeed, 1 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-full shadow-xl border border-border/60 bg-gradient-to-br from-background via-background to-muted/20">
      <CardHeader className="pb-6 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl shadow-lg">
              <Activity className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                🔥 Feed da Comunidade
              </CardTitle>
              <p className="text-muted-foreground mt-1 text-base">
                Últimas atividades em tempo real • {runs.length} runs ativas
                {lastUpdate && (
                  <span className="ml-2 text-xs">
                    • {lastUpdate}
                    {isCached && <span className="text-orange-500"> (cache)</span>}
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="lg"
              onClick={refreshFeed}
              disabled={isRefreshing}
              className="gap-2 min-h-[44px] px-4 hover:shadow-sm transition-all duration-200"
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              Atualizar
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <RunSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
            <CardContent className="pt-6 text-center">
              <div className="text-red-600 mb-2">⚠️ Erro ao carregar feed</div>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadFeed}
                className="mt-3"
              >
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        ) : runs.length === 0 ? (
          <Card className="bg-muted/50">
            <CardContent className="pt-6 text-center">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <div className="text-lg font-semibold text-muted-foreground mb-2">
                Nenhuma atividade ainda
              </div>
              <p className="text-sm text-muted-foreground">
                Seja o primeiro a fazer uma run e aparecer aqui!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {runs.map((run, index) => (
              <RunCard key={run.id} run={run} index={index} />
            ))}
          </div>
        )}

        {/* Call-to-action para incentivar participação */}
        {runs.length > 0 && (
          <Card className="mt-6 bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/30">
            <CardContent className="pt-6 text-center">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Target className="h-5 w-5 text-primary" />
                <span className="font-semibold text-primary">Sua vez!</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Faça sua run e apareça aqui para toda a comunidade ver
              </p>
              <Button className="bg-primary/20 hover:bg-primary/30 text-primary">
                <Zap className="mr-2 h-4 w-4" />
                Começar a Calcular
              </Button>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}