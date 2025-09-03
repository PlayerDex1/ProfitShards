import { useState, useEffect, useRef } from "react";
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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const lastWinnerCount = useRef(0);
  const lastWinnerId = useRef<string>('');

  useEffect(() => {
    loadWinners();
    
    // Atualizar mais frequentemente para detectar novos ganhadores
    const interval = setInterval(loadWinners, 5000); // A cada 5 segundos
    
    // Escutar eventos de novos ganhadores
    const handleNewWinner = () => {
      console.log('🎉 Novo ganhador detectado, atualizando lista...');
      // Aguardar um pouco para garantir que dados foram salvos
      setTimeout(() => {
        setForceUpdate(prev => prev + 1);
        loadWinners();
      }, 1000);
    };
    
    // Escutar eventos específicos
    window.addEventListener('lottery-completed', handleNewWinner);
    window.addEventListener('giveaway-finished', handleNewWinner);
    window.addEventListener('new-winner-announced', handleNewWinner);
    
    // Também escutar eventos customizados que podem ser disparados
    window.addEventListener('winner-announced', handleNewWinner);
    window.addEventListener('giveaway-winner-selected', handleNewWinner);
    
    // Polling mais agressivo para detectar mudanças
    const aggressivePolling = setInterval(() => {
      console.log('🔍 Polling agressivo: verificando novos ganhadores...');
      loadWinners();
    }, 3000); // A cada 3 segundos
    
    // Verificação de mudanças a cada 2 segundos
    const changeDetection = setInterval(() => {
      if (winners.length > 0) {
        const latestWinner = winners[0];
        if (latestWinner.id !== lastWinnerId.current) {
          console.log('🔄 MUDANÇA DETECTADA: Novo ganhador identificado!');
          lastWinnerId.current = latestWinner.id;
          setForceUpdate(prev => prev + 1);
        }
      }
    }, 2000);
    
    return () => {
      clearInterval(interval);
      clearInterval(aggressivePolling);
      clearInterval(changeDetection);
      window.removeEventListener('lottery-completed', handleNewWinner);
      window.removeEventListener('giveaway-finished', handleNewWinner);
      window.removeEventListener('new-winner-announced', handleNewWinner);
      window.removeEventListener('winner-announced', handleNewWinner);
      window.removeEventListener('giveaway-winner-selected', handleNewWinner);
    };
  }, [winners.length]);

  // Forçar atualização quando forceUpdate mudar
  useEffect(() => {
    if (forceUpdate > 0) {
      console.log('🚀 Forçando atualização dos ganhadores...');
      loadWinners();
    }
  }, [forceUpdate]);

  const loadWinners = async () => {
    try {
      setLoading(true);
      
      // Cache busting para garantir dados frescos
      const timestamp = Date.now();
      const response = await fetch(`/api/winners/public?limit=20&_t=${timestamp}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('🏆 Ganhadores carregados:', result.winners?.length || 0, 'ganhadores');
      
      if (result.winners) {
        // Verificar se há mudanças nos ganhadores
        const hasChanges = JSON.stringify(result.winners) !== JSON.stringify(winners);
        const countChanged = result.winners.length !== lastWinnerCount.current;
        
        if (hasChanges || countChanged) {
          console.log('🔄 Mudanças detectadas nos ganhadores!');
          console.log('📊 Ganhadores anteriores:', lastWinnerCount.current);
          console.log('📊 Ganhadores atuais:', result.winners.length);
          
          // Se há novos ganhadores, destacar
          if (result.winners.length > lastWinnerCount.current) {
            console.log('🎉 NOVOS GANHADORES DETECTADOS!');
            // Disparar evento customizado para outros componentes
            window.dispatchEvent(new CustomEvent('winners-updated', {
              detail: { 
                previousCount: lastWinnerCount.current, 
                currentCount: result.winners.length,
                newWinners: result.winners.slice(0, result.winners.length - lastWinnerCount.current)
              }
            }));
            
            // Forçar re-render
            setForceUpdate(prev => prev + 1);
          }
          
          lastWinnerCount.current = result.winners.length;
        }
        
        setWinners(result.winners);
        setStats(result.stats);
        setLastUpdated(new Date());
        
        // Log dos ganhadores mais recentes para debug
        if (result.winners.length > 0) {
          const latest = result.winners[0];
          console.log('🥇 Ganhador mais recente:', {
            id: latest.id,
            giveaway: latest.giveawayTitle,
            prize: latest.prize,
            announcedAt: latest.announcedAt,
            position: latest.position
          });
          
          // Atualizar referência do último ganhador
          lastWinnerId.current = latest.id;
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar ganhadores:', error);
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
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 w-[700px] min-h-[500px]">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🏆 Ganhadores Recentes
            </span>
          </CardTitle>
          <div className="flex flex-col items-end gap-2">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={loadWinners}
              disabled={loading}
              className="border-purple-200 hover:bg-purple-50 px-4 py-2"
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Estatísticas MAIORES */}
        {stats && (
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-purple-200 dark:border-purple-700 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-7 w-7 text-purple-600" />
                <span className="font-semibold text-purple-900 dark:text-purple-100 text-base">Total Ganhadores</span>
              </div>
              <span className="text-4xl font-bold text-purple-600">{stats.totalWinners}</span>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-pink-200 dark:border-pink-700 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <Gift className="h-7 w-7 text-pink-600" />
                <span className="font-semibold text-pink-900 dark:text-pink-100 text-base">Giveaways</span>
              </div>
              <span className="text-4xl font-bold text-pink-600">{stats.giveaways}</span>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-orange-200 dark:border-orange-700 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="h-7 w-7 text-orange-600" />
                <span className="font-semibold text-orange-900 dark:text-orange-100 text-base">Prêmios Diferentes</span>
              </div>
              <span className="text-4xl font-bold text-orange-600">{stats.totalPrizes}</span>
            </div>
          </div>
        )}

        <Separator className="mb-6" />

        {/* Botão de Atualização Forçada */}
        <div className="text-center mb-6">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => {
              console.log('🔄 Atualização forçada solicitada pelo usuário');
              setForceUpdate(prev => prev + 1);
              loadWinners();
            }}
            disabled={loading}
            className="border-purple-300 hover:bg-purple-100 text-purple-700 px-8 py-3 text-lg font-semibold"
          >
            <RefreshCw className={`h-5 w-5 mr-3 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Atualizando...' : '🔄 FORÇAR ATUALIZAÇÃO'}
          </Button>
          
          {/* Indicador de última verificação */}
          <div className="mt-3 text-sm text-muted-foreground">
            <span className="font-medium">Última verificação:</span> {lastUpdated ? lastUpdated.toLocaleTimeString('pt-BR') : 'Nunca'}
            {forceUpdate > 0 && (
              <span className="ml-3 text-purple-600 font-semibold">
                🔄 {forceUpdate} atualizações forçadas
              </span>
            )}
          </div>
        </div>

        {/* Lista de Ganhadores */}
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando ganhadores...</p>
          </div>
        ) : (
          <div className="space-y-6 max-h-80 overflow-y-auto">
            {winners.slice(0, 6).map((winner) => (
              <div key={winner.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg">
                      {getPositionIcon(winner.position)}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-xl">{getPositionText(winner.position)}</span>
                        <span className="text-base text-muted-foreground font-medium">
                          {winner.userEmail || winner.userId}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-base text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <Gift className="h-5 w-5" />
                          {winner.giveawayTitle}
                        </span>
                        <span className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          {formatDate(winner.announcedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white mb-3 px-4 py-2 text-base font-semibold">
                      {winner.prize}
                    </Badge>
                    <div className="text-base text-muted-foreground font-medium">
                      {winner.totalPoints} pontos
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {winners.length > 6 && (
              <div className="text-center pt-6">
                <p className="text-base text-muted-foreground font-medium">
                  E mais {winners.length - 6} ganhador{winners.length - 6 !== 1 ? 'es' : ''}...
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