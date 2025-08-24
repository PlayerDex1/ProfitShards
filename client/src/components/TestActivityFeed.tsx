import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Activity } from "lucide-react";

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
  return (
    <div className="p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200 hover:shadow-sm">
      {/* Header com ação */}
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-sm font-medium text-muted-foreground">
          🎮 {run.user} completou uma run
        </span>
      </div>
      
      {/* Conteúdo principal */}
      <div className="space-y-2">
        <div className="font-semibold text-primary text-base">
          🗺️ {run.mapName} → {run.tokens} tokens
        </div>
        <div className="text-sm text-muted-foreground">
          ⚡ {run.energy} energia • T/E: {run.efficiency.toFixed(1)}
        </div>
        <div className="text-sm text-muted-foreground">
          🍀 Luck: {run.luck.toLocaleString()}
        </div>
      </div>
      
      {/* Timestamp */}
      <div className="text-xs text-muted-foreground mt-3 border-t border-border/50 pt-2">
        {run.timeAgo}
      </div>
    </div>
  );
};

export function TestActivityFeed() {
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
  }, []);

  return (
    <Card>
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>🔥 Atividade da Comunidade</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              TEST
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
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200 mb-4">
            ❌ {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            Carregando atividades...
          </div>
        ) : runs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhuma atividade recente encontrada</p>
            <p className="text-xs mt-1">Runs aparecerão aqui quando usuarios usarem o MapPlanner</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {runs.slice(0, 6).map(run => (
                <FeedCard key={run.id} run={run} />
              ))}
            </div>
            
            {runs.length > 6 && (
              <div className="text-center mt-4 pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  Mostrando 6 de {runs.length} atividades recentes
                </p>
              </div>
            )}
          </>
        )}
        
        {/* Info sobre o teste */}
        <div className="mt-6 text-xs text-blue-600 bg-blue-50 p-3 rounded border border-blue-200">
          <div className="font-medium mb-1">🧪 Feed de Teste:</div>
          <div className="text-xs">
            • <strong>Dados reais:</strong> Últimas runs do MapPlanner (4 horas)<br/>
            • <strong>Fallback:</strong> Dados fake se não houver atividade<br/>
            • <strong>Anonimato:</strong> Usuários aparecem como Player1, Player2, etc.<br/>
            • <strong>Auto-refresh:</strong> Use o botão Atualizar para ver novas atividades
          </div>
        </div>
      </CardContent>
    </Card>
  );
}