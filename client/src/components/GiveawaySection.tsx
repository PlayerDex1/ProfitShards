import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n";
import { Gift, Clock, Users, Trophy, Sparkles, Crown, Calendar, Target } from "lucide-react";
import { Giveaway } from "@/types/giveaway";
import { useAuth } from "@/hooks/use-auth";

interface GiveawaySectionProps {
  className?: string;
}

interface GiveawayData {
  id: string;
  title: string;
  description: string;
  prize: string;
  startDate: string;
  endDate: string;
  status: string;
  maxParticipants?: number;
  currentParticipants: number;
  requirements?: any[];
  winnerAnnouncement?: string;
}

export function GiveawaySection({ className }: GiveawaySectionProps) {
  const { t } = useI18n();
  const { user, isAuthenticated } = useAuth();
  const [giveaway, setGiveaway] = useState<GiveawayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participating, setParticipating] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isMounted, setIsMounted] = useState(true);

  // Função para buscar giveaway ativo com timeout e AbortController
  const fetchActiveGiveaway = useCallback(async () => {
    if (!isMounted) return;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/giveaways/active', {
        signal: controller.signal,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (isMounted) {
        if (data.giveaway) {
          setGiveaway(data.giveaway);
          console.log('✅ [GIVEAWAY] Dados carregados:', data.giveaway.title);
        } else {
          setGiveaway(null);
          console.log('ℹ️ [GIVEAWAY] Nenhum giveaway ativo');
        }
      }
    } catch (err) {
      if (isMounted) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('⏰ [GIVEAWAY] Timeout na busca');
          setError('Timeout ao carregar giveaway');
        } else {
          console.error('❌ [GIVEAWAY] Erro na busca:', err);
          setError('Erro ao carregar giveaway');
        }
      }
    } finally {
      if (isMounted) {
        setLoading(false);
        clearTimeout(timeoutId);
      }
    }
  }, [isMounted]);

  // Função para participar do giveaway
  const participateInGiveaway = useCallback(async (giveawayId: string) => {
    if (!isAuthenticated || !user) {
      setError('Você precisa estar logado para participar');
      return;
    }

    if (participating) return;

    try {
      setParticipating(true);
      setError(null);

      const response = await fetch('/api/giveaways/participate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ giveawayId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao participar');
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ [GIVEAWAY] Participação confirmada');
        // Recarregar dados do giveaway
        await fetchActiveGiveaway();
      } else {
        throw new Error(result.error || 'Erro ao participar');
      }
    } catch (err) {
      console.error('❌ [GIVEAWAY] Erro na participação:', err);
      setError(err instanceof Error ? err.message : 'Erro ao participar');
    } finally {
      setParticipating(false);
    }
  }, [isAuthenticated, user, participating, fetchActiveGiveaway]);

  // Calcular tempo restante
  const calculateTimeLeft = useCallback((endDate: string) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;

    if (diff <= 0) {
      return "Finalizado";
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }, []);

  // Atualizar tempo restante a cada minuto
  useEffect(() => {
    if (!giveaway?.endDate) return;

    const updateTime = () => {
      if (isMounted) {
        setTimeLeft(calculateTimeLeft(giveaway.endDate));
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Atualizar a cada minuto

    return () => clearInterval(interval);
  }, [giveaway?.endDate, calculateTimeLeft, isMounted]);

  // Buscar giveaway ao montar
  useEffect(() => {
    setIsMounted(true);
    fetchActiveGiveaway();

    return () => {
      setIsMounted(false);
    };
  }, [fetchActiveGiveaway]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      setIsMounted(false);
    };
  }, []);

  if (loading) {
    return (
      <div className={`space-y-6 ${className || ''}`}>
        <Card className="bg-gradient-to-br from-green-500/5 to-blue-500/5 border border-green-500/20">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-3"></div>
              <p className="text-muted-foreground">Carregando giveaway...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className || ''}`}>
        <Card className="bg-gradient-to-br from-red-500/5 to-orange-500/5 border border-red-500/20">
          <CardContent className="p-6">
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                <Gift className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                Erro ao carregar giveaway
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                {error}
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchActiveGiveaway}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!giveaway) {
    return (
      <div className={`space-y-6 ${className || ''}`}>
        <Card className="bg-gradient-to-br from-gray-500/5 to-slate-500/5 border border-gray-500/20">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <Gift className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                🎁 Nenhum Giveaway Ativo
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Não há sorteios ativos no momento. Volte em breve para novos giveaways!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = new Date(giveaway.endDate).getTime() <= new Date().getTime();
  const canParticipate = isAuthenticated && !isExpired && giveaway.status === 'active';

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Giveaway Principal */}
      <Card className="bg-gradient-to-br from-green-500/5 to-blue-500/5 border border-green-500/20 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg">
                <Gift className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-green-900 dark:text-green-100">
                  🎁 {giveaway.title}
                </CardTitle>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {giveaway.description}
                </p>
              </div>
            </div>
            <Badge 
              variant={isExpired ? "secondary" : "default"}
              className={isExpired ? "bg-gray-500" : "bg-green-600"}
            >
              {isExpired ? "Finalizado" : "Ativo"}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Informações do Prêmio */}
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-2 mb-2">
              <Trophy className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-900 dark:text-green-100">Prêmio:</span>
            </div>
            <p className="text-green-700 dark:text-green-300 font-medium">
              {giveaway.prize}
            </p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
              <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Participantes</p>
              <p className="font-semibold text-blue-600">
                {giveaway.currentParticipants}
                {giveaway.maxParticipants && ` / ${giveaway.maxParticipants}`}
              </p>
            </div>
            
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
              <Clock className="h-5 w-5 text-orange-600 mx-auto mb-1" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Tempo Restante</p>
              <p className="font-semibold text-orange-600">{timeLeft}</p>
            </div>
            
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
              <Calendar className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Início</p>
              <p className="font-semibold text-purple-600 text-xs">
                {new Date(giveaway.startDate).toLocaleDateString('pt-BR')}
              </p>
            </div>
            
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
              <Target className="h-5 w-5 text-red-600 mx-auto mb-1" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Fim</p>
              <p className="font-semibold text-red-600 text-xs">
                {new Date(giveaway.endDate).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          {/* Botão de Participação */}
          {canParticipate ? (
            <Button 
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3"
              onClick={() => participateInGiveaway(giveaway.id)}
              disabled={participating}
            >
              {participating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Participando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Participar do Sorteio
                </>
              )}
            </Button>
          ) : !isAuthenticated ? (
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-yellow-800 dark:text-yellow-200">
                🔐 Faça login para participar do sorteio
              </p>
            </div>
          ) : isExpired ? (
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400">
                ⏰ Este sorteio já foi finalizado
              </p>
            </div>
          ) : null}

          {/* Anúncio de Vencedor */}
          {giveaway.winnerAnnouncement && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center space-x-2 mb-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                <span className="font-semibold text-yellow-900 dark:text-yellow-100">Resultado:</span>
              </div>
              <p className="text-yellow-800 dark:text-yellow-200">
                {giveaway.winnerAnnouncement}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}