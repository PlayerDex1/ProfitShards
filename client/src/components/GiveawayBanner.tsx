import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n";
import { Gift, Clock, Users, Trophy, Sparkles, X, Target, Zap } from "lucide-react";
import { Giveaway } from "@/types/giveaway";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useAuth } from "@/hooks/use-auth";

interface GiveawayBannerProps {
  giveaway?: Giveaway;
  onJoin?: () => void;
  compact?: boolean;
}

export function GiveawayBanner({ giveaway, onJoin, compact = false }: GiveawayBannerProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const { checkForWinnerNotification } = usePushNotifications();
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [dismissed, setDismissed] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [hasCheckedWinner, setHasCheckedWinner] = useState(false);

  // Buscar participantes da API global
  useEffect(() => {
    if (!giveaway) return;
    
    const getParticipants = async () => {
      try {
        // Primeiro tentar da API
        const response = await fetch(`/api/participants/list?giveawayId=${giveaway.id}`);
        if (response.ok) {
          const result = await response.json();
          setParticipantCount(result.total || 0);
          console.log('🎯 PARTICIPANTES API:', result.total);
        } else {
          // Fallback para giveaway.currentParticipants
          setParticipantCount(giveaway.currentParticipants || 0);
          console.log('🔄 FALLBACK PARTICIPANTES:', giveaway.currentParticipants);
        }
      } catch (error) {
        console.error('Erro ao buscar participantes da API:', error);
        setParticipantCount(giveaway.currentParticipants || 0);
      }
    };
    
    getParticipants();
    
    // Listener para atualizações
    const handleParticipationUpdate = () => getParticipants();
    window.addEventListener('giveaway-participation-updated', handleParticipationUpdate);
    
    return () => {
      window.removeEventListener('giveaway-participation-updated', handleParticipationUpdate);
    };
  }, [giveaway]);

  // Calcular tempo restante e verificar ganhador
  useEffect(() => {
    if (!giveaway || giveaway.status !== 'active') return;

    const updateTimer = () => {
      const now = new Date();
      const end = new Date(giveaway.endDate);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Encerrado");
        
        // Verificar se o usuário é ganhador quando o giveaway termina
        if (user && !hasCheckedWinner) {
          checkForWinnerNotification(giveaway.id);
          setHasCheckedWinner(true);
        }
        
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Atualizar a cada minuto

    return () => clearInterval(interval);
  }, [giveaway, user, hasCheckedWinner, checkForWinnerNotification]);

  // Se não há giveaway ativo ou foi dispensado
  if (!giveaway || giveaway.status !== 'active' || dismissed) {
    return null;
  }

  // Versão compacta (header) - REDUZIDA
  if (compact) {
    return (
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-1.5 px-3 relative text-sm">
        <div className="flex items-center justify-center space-x-3 max-w-5xl mx-auto">
          <div className="flex items-center space-x-1.5">
            <Gift className="h-4 w-4 text-yellow-300" />
            <span className="font-semibold text-white">🎁 {giveaway.prize}</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-1.5 text-xs">
            <Clock className="h-3 w-3 text-yellow-300" />
            <span className="text-white">{timeLeft}</span>
          </div>
          
          <Button 
            size="sm" 
            onClick={onJoin}
            className="bg-yellow-400 text-emerald-800 hover:bg-yellow-300 font-bold text-xs px-3 py-1 h-auto border border-yellow-300"
          >
            PARTICIPAR
          </Button>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setDismissed(true)}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 text-yellow-200 hover:bg-white/20 p-0.5 h-auto"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  // Versão completa (card) - SIDEBAR FRIENDLY - CORES MELHORADAS
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-blue-600 text-white border border-emerald-400 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <CardContent className="relative p-6">
        {/* Header com ícone e título */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl group-hover:scale-110 transition-transform">
              <Gift className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">🎁 Giveaway Ativo</h3>
          </div>
          <p className="text-lg text-yellow-100 font-medium mb-3">{giveaway.prize}</p>
          <Badge className="bg-yellow-400 text-emerald-800 border-yellow-300 text-sm px-3 py-1 font-semibold">
            ATIVO
          </Badge>
        </div>

        {/* Barra de progresso visual */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-yellow-100">Progresso</span>
            <span className="text-white font-semibold">{participantCount} / {giveaway.maxParticipants || 100}</span>
          </div>
          <div className="w-full bg-white/20 backdrop-blur-sm rounded-full h-3 border border-white/30">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.min((participantCount / (giveaway.maxParticipants || 100)) * 100, 100)}%` 
              }}
            />
          </div>
          <p className="text-xs text-yellow-100 mt-1 text-center">
            {participantCount} participantes • Meta: {giveaway.maxParticipants || 100}
          </p>
        </div>

        {/* Informações principais */}
        <div className="space-y-4 mb-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center border border-white/30">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-yellow-300" />
              <span className="text-sm text-white">Termina em:</span>
            </div>
            <span className="font-bold text-lg text-white">{timeLeft}</span>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center border border-white/30">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Users className="h-4 w-4 text-yellow-300" />
              <span className="text-sm text-white">Participantes:</span>
            </div>
            <span className="font-bold text-lg text-white">{participantCount}</span>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Button 
            size="lg"
            onClick={onJoin}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-emerald-800 hover:from-yellow-500 hover:to-orange-600 font-bold w-full text-base border border-yellow-300 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            🎯 PARTICIPAR AGORA
          </Button>
          <p className="text-sm mt-2 text-yellow-100">
            Grátis • Ganhe pontos • Prêmios incríveis
          </p>
        </div>

        {/* Informações adicionais */}
        <div className="mt-6 pt-4 border-t border-white/20">
          <div className="grid grid-cols-2 gap-4 text-xs text-yellow-100">
            <div className="flex items-center gap-2">
              <Target className="h-3 w-3" />
              <span>Requisitos simples</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-3 w-3" />
              <span>Ganhe pontos</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}