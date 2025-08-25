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
  // 🆕 Novos campos
  level?: string;        // Level I-V
  tier?: string;         // Tier I-III
  charge?: number;       // Carga
  playerName?: string;   // Nome do usuário
}

interface ActivityStreamResponse {
  success: boolean;
  runs: ActivityRun[];
  cached?: boolean;
  total?: number;
  error?: string;
  fallback?: boolean;
}

// 🎯 Card Clean - Layout Horizontal Igual ao Planejador
const RunCard = ({ run, index }: { run: ActivityRun; index: number }) => {
  // 🎯 FASE 2: Usar playerName da API ou fallback
  const playerName = run.playerName || (run.id.includes('demo') ? 'demo_user' : 'Player');

  // Formatar data
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  // Formatar horário
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div
      className={cn(
        "bg-slate-800 rounded-lg border border-slate-700",
        "hover:bg-slate-750 hover:border-slate-600 transition-all duration-200",
        "px-6 py-4"
      )}
      style={{
        animationDelay: `${index * 50}ms`,
        animation: 'fadeInUp 0.4s ease-out forwards'
      }}
    >
      <div className="grid grid-cols-6 gap-4 items-center text-sm">
        {/* PLAYER */}
        <div>
          <div className="text-slate-400 text-xs uppercase tracking-wide mb-1 font-medium">PLAYER</div>
          <div className="text-white font-medium">{playerName}</div>
        </div>

        {/* MAP */}
        <div>
          <div className="text-slate-400 text-xs uppercase tracking-wide mb-1 font-medium">MAP</div>
          <div className="bg-slate-600 text-white px-2 py-1 rounded text-center font-medium text-xs">
            {run.map.replace(' Map', '')}
          </div>
        </div>

        {/* LEVEL/TIER */}
        <div>
          <div className="text-slate-400 text-xs uppercase tracking-wide mb-1 font-medium">LEVEL/TIER</div>
          <div className="text-white">
            <div className="font-medium">Level {run.level || 'IV'}</div>
            <div className="text-slate-300 text-xs">Tier {run.tier || 'I'}</div>
          </div>
        </div>

        {/* TOKEN */}
        <div>
          <div className="text-slate-400 text-xs uppercase tracking-wide mb-1 font-medium">TOKEN</div>
          <div className="bg-yellow-600 text-white px-3 py-1 rounded text-center font-bold text-sm">
            {run.tokens}
          </div>
        </div>

        {/* DATE */}
        <div>
          <div className="text-slate-400 text-xs uppercase tracking-wide mb-1 font-medium">DATE</div>
          <div className="text-white font-mono text-sm">
            {formatDate(run.timestamp)}
          </div>
        </div>

        {/* CHARGE */}
        <div>
          <div className="text-slate-400 text-xs uppercase tracking-wide mb-1 font-medium">CHARGE</div>
          <div className="text-white text-sm">
            <span className="text-slate-400">CHARGE:</span> <span className="font-medium">{run.charge || 4}</span>
          </div>
        </div>
      </div>

      {/* Segunda linha com informações adicionais */}
      <div className="mt-3 pt-3 border-t border-slate-700">
        <div className="grid grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400">Luck:</span>
            <span className="text-white ml-1 font-medium">{run.luck.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-400">Efficiency:</span>
            <span className="text-white ml-1 font-medium">
              {run.luck > 0 ? (run.tokens / run.luck * 1000).toFixed(1) : '0.0'}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Time:</span>
            <span className="text-white ml-1 font-medium">{formatTime(run.timestamp)}</span>
          </div>
          <div>
            <span className="text-slate-400">Status:</span>
            <span className="text-green-400 ml-1 font-medium">{run.timeAgo}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton loading
const RunSkeleton = () => (
  <div className="bg-slate-800 rounded-lg border border-slate-700 px-6 py-4 animate-pulse">
    <div className="grid grid-cols-6 gap-4 items-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 bg-slate-700 rounded w-16"></div>
          <div className="h-4 bg-slate-600 rounded w-20"></div>
        </div>
      ))}
    </div>
    <div className="mt-3 pt-3 border-t border-slate-700">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-3 bg-slate-700 rounded w-16"></div>
        ))}
      </div>
    </div>
  </div>
);

export function ActivityStream() {
  const [runs, setRuns] = useState<ActivityRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const fetchRuns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Buscando runs do feed...');
      
      const response = await fetch('/api/feed/feed-runs', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ActivityStreamResponse = await response.json();
      console.log('📊 Dados recebidos:', data);

      if (data.success && data.runs) {
        setRuns(data.runs);
        setLastUpdate(new Date().toLocaleTimeString());
        setError(null);
      } else {
        throw new Error(data.error || 'Dados inválidos recebidos');
      }
    } catch (err) {
      console.error('❌ Erro ao carregar feed:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setRuns([]);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados iniciais e configurar auto-refresh
  useEffect(() => {
    fetchRuns();
    
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(fetchRuns, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Feed de Atividade - Layout Clean
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Runs da comunidade com Level/Tier/Charge (última atualização: {lastUpdate || 'Carregando...'})
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchRuns}
            disabled={loading}
            className="min-w-[100px]"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            {loading ? 'Carregando...' : 'Atualizar'}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Estados de Loading/Error */}
        {loading && runs.length === 0 && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <RunSkeleton key={i} />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="text-red-500 text-sm mb-2">❌ {error}</div>
            <Button variant="outline" size="sm" onClick={fetchRuns}>
              Tentar Novamente
            </Button>
          </div>
        )}

        {/* Lista de Runs */}
        {!loading && !error && runs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma atividade recente encontrada</p>
            <p className="text-xs mt-1">As runs aparecerão aqui quando os usuários salvarem suas atividades</p>
          </div>
        )}

        {runs.length > 0 && (
          <div className="space-y-3">
            {runs.map((run, index) => (
              <RunCard key={run.id} run={run} index={index} />
            ))}
          </div>
        )}

        {/* Footer com informações */}
        {runs.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-4">
                <span>📊 {runs.length} runs encontradas</span>
                <span>🔄 Auto-refresh: 30s</span>
                <span>🎯 Layout: Clean Horizontal</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Ao vivo</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}