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

export function PublicWinnersList() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Função simples para carregar ganhadores
  const loadWinners = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando ganhadores...');
      
      const response = await fetch('/api/winners/public?limit=20');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Ganhadores carregados:', data.winners?.length || 0);
      
      if (data.winners) {
        setWinners(data.winners);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('❌ Erro ao carregar ganhadores:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar na montagem e a cada 10 segundos
  useEffect(() => {
    loadWinners();
    
    const interval = setInterval(loadWinners, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Função para atualizar manualmente
  const handleRefresh = () => {
    console.log('🔄 Atualização manual solicitada');
    loadWinners();
  };

  if (winners.length === 0 && !loading) {
    return null;
  }

  return (
    <Card className="w-[700px] min-h-[500px] bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
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
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-purple-200 text-center">
            <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-700">{winners.length}</div>
            <div className="text-sm text-gray-600">Total Ganhadores</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-pink-200 text-center">
            <Gift className="h-6 w-6 text-pink-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-pink-700">
              {new Set(winners.map(w => w.giveawayId)).size}
            </div>
            <div className="text-sm text-gray-600">Giveaways</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-orange-200 text-center">
            <TrendingUp className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-700">
              {new Set(winners.map(w => w.prize)).size}
            </div>
            <div className="text-sm text-gray-600">Prêmios</div>
          </div>
        </div>

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
                      {winner.position === 1 ? (
                        <Crown className="h-6 w-6 text-white" />
                      ) : winner.position === 2 ? (
                        <Award className="h-6 w-6 text-white" />
                      ) : (
                        <Star className="h-6 w-6 text-white" />
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg">
                          {winner.position === 1 ? '🥇' : winner.position === 2 ? '🥈' : winner.position === 3 ? '🥉' : `${winner.position}º`}
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
                          {new Date(winner.announcedAt).toLocaleDateString('pt-BR')}
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