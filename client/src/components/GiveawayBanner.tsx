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

  // Versão compacta (header)
  if (compact) {
    return (
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white py-2 px-4 relative">
        <div className="flex items-center justify-center space-x-4 max-w-6xl mx-auto">
          <div className="flex items-center space-x-2">
            <Gift className="h-5 w-5 animate-bounce" />
            <span className="font-bold">🎁 GIVEAWAY: {giveaway.prize}</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4" />
            <span>Termina em: {timeLeft}</span>
          </div>
          
          <div className="hidden sm:flex items-center space-x-2 text-sm">
            <Users className="h-4 w-4" />
            <span>{giveaway.currentParticipants} participantes</span>
          </div>
          
          <Button 
            size="sm" 
            onClick={onJoin}
            className="bg-white text-orange-600 hover:bg-gray-100 font-bold shadow-lg"
          >
            PARTICIPAR
          </Button>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setDismissed(true)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 p-1"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Versão completa (card)
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 text-white border-2 border-yellow-300 shadow-2xl">
      {/* Efeito de brilho animado */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse" />
      
      <CardContent className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Gift className="h-10 w-10 animate-bounce" />
              <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-200 animate-spin" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                🎁 GIVEAWAY ATIVO!
              </h2>
              <p className="text-lg opacity-90">{giveaway.title}</p>
            </div>
          </div>
          
          <Badge className="bg-white/20 text-white border-white/30 text-sm font-bold px-3 py-1">
            {giveaway.status === 'active' ? 'ATIVO' : 'EM BREVE'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Prêmio */}
          <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center space-x-2 mb-2">
              <Trophy className="h-5 w-5 text-yellow-200" />
              <span className="font-semibold">Prêmio</span>
            </div>
            <p className="text-xl font-bold">{giveaway.prize}</p>
            <p className="text-sm opacity-80">{giveaway.description}</p>
          </div>

          {/* Estatísticas */}
          <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Termina em:</span>
                </div>
                <span className="font-bold">{timeLeft}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Participantes:</span>
                </div>
                <span className="font-bold">
                  {giveaway.currentParticipants}
                  {giveaway.maxParticipants && ` / ${giveaway.maxParticipants}`}
                </span>
              </div>

              {giveaway.maxParticipants && (
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white rounded-full h-2 transition-all duration-300"
                    style={{ 
                      width: `${Math.min((giveaway.currentParticipants / giveaway.maxParticipants) * 100, 100)}%` 
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Button 
            size="lg"
            onClick={onJoin}
            className="bg-white text-orange-600 hover:bg-gray-100 font-bold text-lg px-8 py-3 shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            <Gift className="h-5 w-5 mr-2" />
            🎯 PARTICIPAR AGORA
          </Button>
          <p className="text-sm mt-2 opacity-80">
            Grátis • Múltiplas formas de ganhar pontos
          </p>
        </div>
      </CardContent>
    </Card>
  );
}