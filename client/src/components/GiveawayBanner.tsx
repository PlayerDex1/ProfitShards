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

  // Versão compacta (header) - REDUZIDA
  if (compact) {
    return (
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-1.5 px-3 relative text-sm">
        <div className="flex items-center justify-center space-x-3 max-w-5xl mx-auto">
          <div className="flex items-center space-x-1.5">
            <Gift className="h-4 w-4" />
            <span className="font-semibold">🎁 {giveaway.prize}</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-1.5 text-xs">
            <Clock className="h-3 w-3" />
            <span>{timeLeft}</span>
          </div>
          
          <Button 
            size="sm" 
            onClick={onJoin}
            className="bg-white text-orange-600 hover:bg-gray-100 font-semibold text-xs px-3 py-1 h-auto"
          >
            PARTICIPAR
          </Button>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setDismissed(true)}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 p-0.5 h-auto"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  // Versão completa (card) - COMPACTA
  return (
    <Card className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-red-500 text-white border border-orange-300 shadow-lg max-w-2xl mx-auto">
      <CardContent className="relative p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Gift className="h-6 w-6" />
            <div>
              <h3 className="text-lg font-bold">🎁 {giveaway.title}</h3>
              <p className="text-sm opacity-90">{giveaway.prize}</p>
            </div>
          </div>
          
          <Badge className="bg-white/20 text-white border-white/30 text-xs px-2 py-1">
            ATIVO
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="bg-white/15 rounded p-2">
            <div className="flex items-center space-x-1 mb-1">
              <Clock className="h-3 w-3" />
              <span className="text-xs">Termina em:</span>
            </div>
            <span className="font-semibold">{timeLeft}</span>
          </div>
          
          <div className="bg-white/15 rounded p-2">
            <div className="flex items-center space-x-1 mb-1">
              <Users className="h-3 w-3" />
              <span className="text-xs">Participantes:</span>
            </div>
            <span className="font-semibold">{giveaway.currentParticipants}</span>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Button 
            onClick={onJoin}
            className="bg-white text-orange-600 hover:bg-gray-100 font-semibold px-6 py-2 w-full"
          >
            🎯 PARTICIPAR AGORA
          </Button>
          <p className="text-xs mt-1 opacity-75">
            Grátis • Ganhe pontos completando missões
          </p>
        </div>
      </CardContent>
    </Card>
  );
}