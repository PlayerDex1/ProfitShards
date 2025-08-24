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
  // Determinar cor baseado na eficiência
  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 25) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (efficiency >= 15) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (efficiency >= 10) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const efficiencyClass = getEfficiencyColor(run.efficiency);

  return (
    <div className={`p-4 border rounded-lg transition-all duration-200 hover:shadow-md ${efficiencyClass}`}>
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
        <div className="text-sm opacity-80">
          ⚡ {run.energy} energia • T/E: {run.efficiency.toFixed(1)}
        </div>
        <div className="text-sm opacity-80">
          🍀 Luck: {run.luck.toLocaleString()}
        </div>
      </div>
      
      {/* Timestamp */}
      <div className="text-xs opacity-60 mt-3 border-t border-current/20 pt-2">
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
      <Card className="mt-8">
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            Carregando atividades da comunidade...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && runs.length === 0) {
    return (
      <Card className="mt-8">
        <CardContent className="py-8">
          <div className="text-center">
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200 mb-4">
              ❌ {error}
            </div>
            <Button
              onClick={loadFeed}
              variant="outline"
              size="sm"
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
      <Card className="mt-8">
        <CardHeader className="py-4">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <span>🔥 Atividade da Comunidade</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhuma atividade recente</p>
            <p className="text-xs mt-1">As runs aparecerão aqui quando jogadores usarem o MapPlanner</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader className="py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <span>🔥 Atividade da Comunidade</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-normal">
              {runs.length} runs
            </span>
          </CardTitle>
          <Button
            onClick={loadFeed}
            variant="outline"
            size="sm"
            disabled={loading}
            className="h-8"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
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
        <div className="text-center mt-4 pt-2 border-t border-border/20">
          <p className="text-xs text-muted-foreground">
            📡 Auto-atualização a cada 2 minutos • Dados das últimas 8 horas
          </p>
        </div>
      </CardContent>
    </Card>
  );
}