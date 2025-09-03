import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, Crown, Gift, Users, Calendar, Award, 
  RefreshCw, TrendingUp, Star 
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

  // Carregar na montagem e verificar a cada 10 segundos
  useEffect(() => {
    loadWinners();
    
    // Verificar novos ganhadores a cada 10 segundos
    const interval = setInterval(() => {
      console.log('⏰ Verificando novos ganhadores...');
      loadWinners();
    }, 10000);
    
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

  // Não mostrar se não há ganhadores
  if (winners.length === 0 && !loading) {
    return null;
  }

  return (
    <Card className="winners-card w-[700px] min-h-[500px] bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-purple-700">
              🏆 Ganhadores Recentes
            </span>
          </CardTitle>
          
          <div className="flex flex-col items-end gap-2">
            <Button 
              onClick={handleRefresh}
              disabled={loading}
              variant="outline"
              size="sm"
              className="border-purple-300 hover:bg-purple-100"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Atualizando...' : 'Atualizar'}
            </Button>
            
            {lastUpdate && (
              <span className="text-xs text-gray-500">
                Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-purple-200 text-center">
              <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-700">{stats.totalWinners}</div>
              <div className="text-sm text-gray-600">Total Ganhadores</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-pink-200 text-center">
              <Gift className="h-6 w-6 text-pink-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-pink-700">{stats.giveaways}</div>
              <div className="text-sm text-gray-600">Giveaways</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-orange-200 text-center">
              <TrendingUp className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-700">{stats.totalPrizes}</div>
              <div className="text-sm text-gray-600">Prêmios</div>
            </div>
          </div>
        )}

        {/* Lista de Ganhadores */}
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando ganhadores...</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {winners.slice(0, 6).map((winner) => (
              <div key={winner.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full">
                      {getPositionIcon(winner.position)}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg">
                          {getPositionText(winner.position)}
                        </span>
                        <span className="font-medium text-gray-800">
                          {winner.userEmail || winner.userId}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
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
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white mb-2 px-3 py-1">
                      {winner.prize}
                    </Badge>
                    <div className="text-sm text-gray-600">
                      {winner.totalPoints} pontos
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {winners.length > 6 && (
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  E mais {winners.length - 6} ganhador{winners.length - 6 !== 1 ? 'es' : ''}...
                </p>
              </div>
            )}
          </div>
        )}

        {winners.length === 0 && !loading && (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum ganhador ainda</h3>
            <p className="text-gray-600">
              Quando houver sorteios, os ganhadores aparecerão aqui!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}