import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Activity, TrendingUp } from "lucide-react";

interface FeedRun {
  id: string;
  user: string;
  mapName: string;
  tokens: number;
  energy: number;
  efficiency: number;
  luck: number;
  timestamp: number;
  timeAgo: string;
}

interface FeedCardProps {
  run: FeedRun;
}

const FeedCard = ({ run }: FeedCardProps) => {
  // Determinar cor baseado na eficiência - usando tema verde/esmeralda do site
  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 25) return 'text-emerald-700 bg-gradient-to-br from-emerald-500/10 to-green-600/10 border border-emerald-500/20 hover:from-emerald-500/15 hover:to-green-600/15';
    if (efficiency >= 15) return 'text-green-700 bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/20 hover:from-green-500/15 hover:to-emerald-600/15';
    if (efficiency >= 10) return 'text-primary bg-gradient-to-br from-primary/5 to-blue-600/10 border border-primary/20 hover:from-primary/10 hover:to-blue-600/15';
    return 'text-muted-foreground bg-gradient-to-br from-muted/30 to-muted/10 border border-border hover:from-muted/40 hover:to-muted/20';
  };

  const efficiencyClass = getEfficiencyColor(run.efficiency);

  return (
    <div className={`p-4 rounded-lg transition-all duration-200 hover:shadow-md ${efficiencyClass}`}>
      {/* Header com ação */}
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-sm font-medium">
          🎮 {run.user} completou uma run
        </span>
      </div>
      
      {/* Conteúdo principal */}
      <div className="space-y-2">
        <div className="font-semibold text-base">
          🗺️ {run.mapName} → {run.tokens.toLocaleString()} tokens
        </div>
        <div className="text-sm opacity-90">
          ⚡ {run.energy} energia • T/E: <span className="font-medium">{run.efficiency.toFixed(1)}</span>
        </div>
        <div className="text-sm opacity-90">
          🍀 Luck: <span className="font-medium">{run.luck.toLocaleString()}</span>
        </div>
      </div>
      
      {/* Timestamp */}
      <div className="text-xs opacity-70 mt-3 border-t border-current/20 pt-2">
        {run.timeAgo}
      </div>
    </div>
  );
};

export function ActivityFeed() {
  const [runs, setRuns] = useState<FeedRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFeed = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/feed/recent-runs', {
        method: 'GET',
        credentials: 'include',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setRuns(result.runs || []);
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

  useEffect(() => {
    loadFeed();
    
    // Auto-refresh a cada 2 minutos
    const interval = setInterval(loadFeed, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading && runs.length === 0) {
    return (
      <Card className="mt-8 bg-gradient-to-br from-primary/5 to-blue-600/10 border border-primary/20">
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
            Carregando atividades da comunidade...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && runs.length === 0) {
    return (
      <Card className="mt-8 bg-gradient-to-br from-primary/5 to-blue-600/10 border border-primary/20">
        <CardContent className="py-8">
          <div className="text-center">
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200 mb-4">
              ❌ {error}
            </div>
            <Button
              onClick={loadFeed}
              variant="outline"
              size="sm"
              className="border-primary/20 hover:bg-primary/10"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (runs.length === 0) {
    return (
      <Card className="mt-8 bg-gradient-to-br from-primary/5 to-blue-600/10 border border-primary/20">
        <CardHeader className="py-4">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">🔥 Atividade da Comunidade</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50 text-primary" />
            <p>Nenhuma atividade recente</p>
            <p className="text-xs mt-1">As runs aparecerão aqui quando jogadores usarem o MapPlanner</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8 bg-gradient-to-br from-primary/5 to-blue-600/10 border border-primary/20 hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
      <CardHeader className="py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">🔥 Atividade da Comunidade</span>
            <span className="text-xs bg-gradient-to-r from-emerald-500/10 to-green-600/10 text-emerald-700 px-2 py-1 rounded-full font-normal border border-emerald-500/20">
              {runs.length} runs
            </span>
          </CardTitle>
          <Button
            onClick={loadFeed}
            variant="outline"
            size="sm"
            disabled={loading}
            className="h-8 border-primary/20 hover:bg-primary/10 hover:border-primary/30"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin text-primary' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {runs.slice(0, 9).map(run => (
            <FeedCard key={run.id} run={run} />
          ))}
        </div>
        
        {runs.length > 9 && (
          <div className="text-center mt-4 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Mostrando 9 de {runs.length} atividades recentes
            </p>
          </div>
        )}
        
        {/* Auto-refresh info */}
        <div className="text-center mt-4 pt-2 border-t border-primary/10">
          <p className="text-xs text-muted-foreground">
            📡 Auto-atualização a cada 2 minutos • Dados das últimas 24 horas
          </p>
        </div>
      </CardContent>
    </Card>
  );
}