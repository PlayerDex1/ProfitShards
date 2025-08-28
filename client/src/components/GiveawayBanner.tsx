import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n";
import { Gift, Clock, Users, Trophy, Sparkles, X } from "lucide-react";
import { Giveaway } from "@/types/giveaway";

interface GiveawayBannerProps {
  giveaway?: Giveaway;
  onJoin?: () => void;
  compact?: boolean;
}

export function GiveawayBanner({ giveaway, onJoin, compact = false }: GiveawayBannerProps) {
  const { t } = useI18n();
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [dismissed, setDismissed] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);

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

  // Calcular tempo restante
  useEffect(() => {
    if (!giveaway || giveaway.status !== 'active') return;

    const updateTimer = () => {
      const now = new Date();
      const end = new Date(giveaway.endDate);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Encerrado");
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
  }, [giveaway]);

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
    <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-blue-600 text-white border border-emerald-400 shadow-lg">
      <CardContent className="relative p-4">
        <div className="text-center mb-3">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Gift className="h-5 w-5 text-yellow-300" />
            <h3 className="text-base font-bold text-white">🎁 Giveaway</h3>
          </div>
          <p className="text-sm text-yellow-100 font-medium">{giveaway.prize}</p>
          <Badge className="bg-yellow-400 text-emerald-800 border-yellow-300 text-xs px-2 py-1 mt-2 font-semibold">
            ATIVO
          </Badge>
        </div>

        <div className="space-y-2 mb-4 text-sm">
          <div className="bg-white/20 backdrop-blur-sm rounded p-2 text-center border border-white/30">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Clock className="h-3 w-3 text-yellow-300" />
              <span className="text-xs text-white">Termina em:</span>
            </div>
            <span className="font-semibold text-white">{timeLeft}</span>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded p-2 text-center border border-white/30">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Users className="h-3 w-3 text-yellow-300" />
              <span className="text-xs text-white">Participantes:</span>
            </div>
            <span className="font-semibold text-white">{participantCount}</span>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Button 
            size="sm"
            onClick={onJoin}
            className="bg-yellow-400 text-emerald-800 hover:bg-yellow-300 font-bold w-full text-xs border border-yellow-300 shadow-md"
          >
            🎯 PARTICIPAR
          </Button>
          <p className="text-xs mt-1 text-yellow-100">
            Grátis • Ganhe pontos
          </p>
        </div>
      </CardContent>
    </Card>
  );
}