import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Gift, X, Sparkles, Clock, Users, ArrowRight, Trophy
} from "lucide-react";
import { useGiveaway } from "@/hooks/use-giveaway";
import { useI18n } from "@/i18n";

interface GiveawayTopBannerProps {
  onGiveawayClick: () => void;
}

export function GiveawayTopBanner({ onGiveawayClick }: GiveawayTopBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { activeGiveaway, timeLeft } = useGiveaway();
  const { t } = useI18n();

  // Não mostrar se não há giveaway ativo ou se foi fechado
  if (!activeGiveaway || !isVisible) {
    return null;
  }

  const formatTimeLeft = (time: { days: number; hours: number; minutes: number }) => {
    if (time.days > 0) return `${time.days}d ${time.hours}h`;
    if (time.hours > 0) return `${time.hours}h ${time.minutes}m`;
    return `${time.minutes}m`;
  };

  return (
    <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white shadow-lg border-b">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cg fill-opacity="0.1"%3E%3Cpolygon fill="%23ffffff" points="50 0 60 40 100 50 60 60 50 100 40 60 0 50 40 40"/%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      {/* Main Content */}
      <div className="relative px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left: Giveaway Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/20 rounded-full animate-pulse">
                <Gift className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <Badge className="bg-yellow-400 text-yellow-900 font-bold animate-bounce">
                  🎁 SORTEIO ATIVO
                </Badge>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold truncate">
                  {activeGiveaway.title}
                </h3>
                <Badge variant="outline" className="bg-white/20 border-white/30 text-white text-xs">
                  🏆 {activeGiveaway.prize}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 mt-1 text-xs sm:text-sm opacity-90">
                {timeLeft && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span className="font-medium">{formatTimeLeft(timeLeft)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{activeGiveaway.currentParticipants} participantes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Participate Button */}
            <Button 
              onClick={onGiveawayClick}
              size="sm"
              className="bg-white text-purple-700 hover:bg-white/90 font-bold shadow-lg border-0 px-3 sm:px-4"
            >
              <Trophy className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Participar</span>
              <span className="sm:hidden">🎯</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>

            {/* Close Button */}
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-1.5"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Sparkles Animation */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-pulse"></div>
    </div>
  );
}