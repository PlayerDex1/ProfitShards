import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Trophy, Crown, Gift, Users, Calendar, Award, 
  RefreshCw, TrendingUp, Sparkles, Star 
} from "lucide-react";

interface PublicWinner {
  id: string;
  giveawayId: string;
  userId: string;
  userEmail: string;
  totalPoints: number;
  position: number;
  announcedAt: string;
  giveawayTitle: string;
  prize: string;
  giveawayStatus: string;
}

interface WinnerStats {
  totalWinners: number;
  giveaways: number;
  totalPrizes: number;
  latestWinner: PublicWinner | null;
}

export function PublicWinnersList() {
  const [winners, setWinners] = useState<PublicWinner[]>([]);
  const [stats, setStats] = useState<WinnerStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWinners();
  }, []);

  const loadWinners = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/winners/public?limit=20');
      const result = await response.json();
      
      if (result.winners) {
        setWinners(result.winners);
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Erro ao carregar ganhadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (position === 2) return <Award className="h-5 w-5 text-gray-400" />;
    if (position === 3) return <Trophy className="h-5 w-5 text-orange-500" />;
    return <Star className="h-5 w-5 text-purple-500" />;
  };

  const getPositionText = (position: number) => {
    if (position === 1) return "🥇";
    if (position === 2) return "🥈"; 
    if (position === 3) return "🥉";
    return `${position}º`;
  };

  if (winners.length === 0 && !loading) {
    return null; // Não mostrar se não há ganhadores
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🏆 Ganhadores Recentes
            </span>
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadWinners}
            disabled={loading}
            className="border-purple-200 hover:bg-purple-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-900 dark:text-purple-100">Total Ganhadores</span>
              </div>
              <span className="text-2xl font-bold text-purple-600">{stats.totalWinners}</span>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-pink-200 dark:border-pink-700">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="h-5 w-5 text-pink-600" />
                <span className="font-medium text-pink-900 dark:text-pink-100">Giveaways</span>
              </div>
              <span className="text-2xl font-bold text-pink-600">{stats.giveaways}</span>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-orange-900 dark:text-orange-100">Prêmios Diferentes</span>
              </div>
              <span className="text-2xl font-bold text-orange-600">{stats.totalPrizes}</span>
            </div>
          </div>
        )}

        <Separator className="mb-6" />

        {/* Lista de Ganhadores */}
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando ganhadores...</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {winners.slice(0, 10).map((winner) => (
              <div key={winner.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full">
                      {getPositionIcon(winner.position)}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-lg">{getPositionText(winner.position)}</span>
                        <span className="text-sm text-muted-foreground">
                          {winner.userEmail || winner.userId}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white mb-2">
                      {winner.prize}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {winner.totalPoints} pontos
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {winners.length > 10 && (
              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  E mais {winners.length - 10} ganhador{winners.length - 10 !== 1 ? 'es' : ''}...
                </p>
              </div>
            )}
          </div>
        )}

        {winners.length === 0 && !loading && (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum ganhador ainda</h3>
            <p className="text-muted-foreground">
              Quando houver sorteios, os ganhadores aparecerão aqui!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}