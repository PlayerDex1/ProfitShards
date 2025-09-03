import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, Crown, Gift, Users, Calendar, Award, 
  RefreshCw, TrendingUp, Star, Filter, ChevronDown
} from "lucide-react";

interface Winner {
  id: string;
  giveawayId: string;
  userId: string;
  userEmail: string;
  totalPoints: number;
  position: number;
  announcedAt: string;
  giveawayTitle: string;
  prize: string;
}

interface WinnerStats {
  totalWinners: number;
  giveaways: number;
  totalPrizes: number;
}

export function WinnersDisplay() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [stats, setStats] = useState<WinnerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [lastWinnerCount, setLastWinnerCount] = useState(0);
  const [filterType, setFilterType] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Função para carregar ganhadores da API
  const loadWinners = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando ganhadores da API...');
      
      // Cache busting para evitar problemas de cache
      const timestamp = Date.now();
      const response = await fetch(`/api/winners/public?limit=20&_t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Ganhadores carregados:', data.winners?.length || 0);
      
      if (data.winners) {
        // Verificar se há novos ganhadores
        const currentCount = data.winners.length;
        const hasNewWinners = currentCount > lastWinnerCount;
        
        if (hasNewWinners && lastWinnerCount > 0) {
          console.log('🎉 NOVOS GANHADORES DETECTADOS!');
          console.log(`📊 Anterior: ${lastWinnerCount} → Atual: ${currentCount}`);
          
          // Destacar visualmente que há novos ganhadores
          const winnerCard = document.querySelector('.winners-card');
          if (winnerCard) {
            winnerCard.classList.add('animate-pulse', 'ring-4', 'ring-green-500');
            setTimeout(() => {
              winnerCard.classList.remove('animate-pulse', 'ring-4', 'ring-green-500');
            }, 3000);
          }
        }
        
        setWinners(data.winners);
        setStats(data.stats);
        setLastWinnerCount(currentCount);
        setLastUpdate(new Date());
        
        // Log dos ganhadores mais recentes
        if (data.winners.length > 0) {
          const latest = data.winners[0];
          console.log('🥇 Ganhador mais recente:', {
            email: latest.userEmail,
            giveaway: latest.giveawayTitle,
            announcedAt: latest.announcedAt
          });
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar ganhadores:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar na montagem e verificar a cada 30 segundos (otimizado para performance)
  useEffect(() => {
    loadWinners();
    
    // Verificar novos ganhadores a cada 30 segundos
    const interval = setInterval(() => {
      console.log('⏰ Verificando novos ganhadores... (30s)');
      loadWinners();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Função para atualizar manualmente
  const handleRefresh = () => {
    console.log('🔄 Atualização manual solicitada');
    loadWinners();
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Função para obter ícone da posição
  const getPositionIcon = (position: number) => {
    if (position === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (position === 2) return <Award className="h-5 w-5 text-gray-400" />;
    if (position === 3) return <Trophy className="h-5 w-5 text-orange-500" />;
    return <Star className="h-5 w-5 text-purple-500" />;
  };

  // Função para obter texto da posição
  const getPositionText = (position: number) => {
    if (position === 1) return "🥇";
    if (position === 2) return "🥈"; 
    if (position === 3) return "🥉";
    return `${position}º`;
  };

  // Função para filtrar ganhadores
  const getFilteredWinners = () => {
    if (filterType === "all") return winners;
    if (filterType === "recent") {
      return [...winners].sort((a, b) => new Date(b.announcedAt).getTime() - new Date(a.announcedAt).getTime());
    }
    if (filterType === "top") {
      return [...winners].sort((a, b) => b.totalPoints - a.totalPoints);
    }
    return winners;
  };

  // Não mostrar se não há ganhadores
  if (winners.length === 0 && !loading) {
    return null;
  }

  const filteredWinners = getFilteredWinners();

  return (
    <Card className="winners-card w-[700px] min-h-[500px] bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border border-purple-200 dark:border-purple-800 hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                🏆 Ganhadores Recentes
              </span>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                Última atualização: {lastUpdate?.toLocaleTimeString('pt-BR')}
              </p>
            </div>
          </CardTitle>
          
          <div className="flex items-center gap-3">
            {/* Filtros */}
            <div className="relative">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
                className="border-purple-300 dark:border-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
              
              {showFilters && (
                <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded-lg shadow-lg z-10 min-w-[150px]">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => setFilterType("all")}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        filterType === "all" 
                          ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300" 
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      Todos os Giveaways
                    </button>
                    <button
                      onClick={() => setFilterType("recent")}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        filterType === "recent" 
                          ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300" 
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      Mais Recentes
                    </button>
                    <button
                      onClick={() => setFilterType("top")}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        filterType === "top" 
                          ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300" 
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      Maiores Prêmios
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <Button 
              onClick={handleRefresh}
              disabled={loading}
              variant="outline"
              size="sm"
              className="border-purple-300 dark:border-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Estatísticas melhoradas */}
        {stats && (
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-purple-200 dark:border-purple-700 text-center hover:shadow-lg transition-all duration-200 group">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg w-fit mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-1">{stats.totalWinners}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Ganhadores</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-pink-200 dark:border-pink-700 text-center hover:shadow-lg transition-all duration-200 group">
              <div className="p-3 bg-pink-100 dark:bg-pink-900 rounded-lg w-fit mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Gift className="h-8 w-8 text-pink-600 dark:text-pink-400" />
              </div>
              <div className="text-3xl font-bold text-pink-700 dark:text-pink-300 mb-1">{stats.giveaways}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Giveaways</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-orange-200 dark:border-orange-700 text-center hover:shadow-lg transition-all duration-200 group">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg w-fit mx-auto mb-3 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-3xl font-bold text-orange-700 dark:text-orange-300 mb-1">{stats.totalPrizes}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Prêmios</div>
            </div>
          </div>
        )}

        {/* Lista de Ganhadores com melhor design */}
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Carregando ganhadores...</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {filteredWinners.slice(0, 6).map((winner, index) => (
              <div key={winner.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-purple-900/20 transition-all duration-200 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full text-white font-bold text-lg">
                      {index + 1}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-lg">
                          {getPositionText(winner.position)}
                        </span>
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                          {winner.prize}
                        </Badge>
                      </div>
                      
                      <span className="font-medium text-gray-800 dark:text-gray-200 block mb-1">
                        {winner.userEmail || winner.userId}
                      </span>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Gift className="h-4 w-4" />
                          {winner.giveawayTitle}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(winner.announcedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {winner.totalPoints} pontos
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(winner.announcedAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredWinners.length > 6 && (
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  E mais {filteredWinners.length - 6} ganhador{filteredWinners.length - 6 !== 1 ? 'es' : ''}...
                </p>
              </div>
            )}
          </div>
        )}

        {filteredWinners.length === 0 && !loading && (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">Nenhum ganhador ainda</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Quando houver sorteios, os ganhadores aparecerão aqui!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}