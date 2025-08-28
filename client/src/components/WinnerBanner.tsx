import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  Trophy, Crown, Gift, Sparkles, Star, Confetti, 
  Calendar, Award, PartyPopper, Zap, Target
} from "lucide-react";

interface WinnerData {
  id: string;
  giveawayId: string;
  userId: string;
  userEmail: string;
  totalPoints: number;
  position: number;
  announcedAt: string;
  giveawayTitle: string;
  giveawayDescription: string;
  prize: string;
  giveawayStatus: string;
  winnerAnnouncement: string;
}

interface WinnerBannerProps {
  userId?: string;
  userEmail?: string;
}

export function WinnerBanner({ userId, userEmail }: WinnerBannerProps) {
  const [winnerData, setWinnerData] = useState<WinnerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkWinnerStatus();
  }, [userId, userEmail]);

  const checkWinnerStatus = async () => {
    if (!userId && !userEmail) return;

    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (userId) params.set('userId', userId);
      if (userEmail) params.set('userEmail', userEmail);

      const response = await fetch(`/api/winners/check?${params}`);
      const result = await response.json();

      if (result.isWinner && result.latestWinning) {
        setWinnerData(result.latestWinning);
        
        // Check if already dismissed
        const dismissKey = `winner_dismissed_${result.latestWinning.id}`;
        const isDismissed = localStorage.getItem(dismissKey) === 'true';
        setDismissed(isDismissed);
      }
    } catch (error) {
      console.error('Erro ao verificar status de ganhador:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    if (winnerData) {
      const dismissKey = `winner_dismissed_${winnerData.id}`;
      localStorage.setItem(dismissKey, 'true');
      setDismissed(true);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (position === 2) return <Award className="h-6 w-6 text-gray-400" />;
    if (position === 3) return <Trophy className="h-6 w-6 text-orange-500" />;
    return <Star className="h-6 w-6 text-purple-500" />;
  };

  const getPositionText = (position: number) => {
    if (position === 1) return "🥇 1º Lugar";
    if (position === 2) return "🥈 2º Lugar"; 
    if (position === 3) return "🥉 3º Lugar";
    return `🏆 ${position}º Lugar`;
  };

  // Não mostrar se não é ganhador, está carregando, ou foi dispensado
  if (loading || !winnerData || dismissed) {
    return null;
  }

  return (
    <>
      {/* Banner de Ganhador */}
      <Card className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20 border-2 border-yellow-300 dark:border-yellow-600 shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Ícone animado */}
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg animate-bounce">
                  {getPositionIcon(winnerData.position)}
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="h-4 w-4 text-yellow-400 animate-spin" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
                  🎉 PARABÉNS! VOCÊ GANHOU! 🎉
                </h3>
                <div className="flex items-center gap-4 mb-2">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 text-sm font-bold">
                    {getPositionText(winnerData.position)}
                  </Badge>
                  <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {winnerData.giveawayTitle}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  <strong>Prêmio:</strong> {winnerData.prize}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg px-6 py-2">
                    <PartyPopper className="h-4 w-4 mr-2" />
                    Ver Prêmio
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">
                      🏆 Parabéns! Você é um Ganhador! 🏆
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Header do prêmio */}
                    <div className="text-center bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-700">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        {getPositionIcon(winnerData.position)}
                        <h3 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                          {getPositionText(winnerData.position)}
                        </h3>
                      </div>
                      <h4 className="text-xl font-semibold mb-2">{winnerData.giveawayTitle}</h4>
                      <p className="text-gray-600 dark:text-gray-400">{winnerData.giveawayDescription}</p>
                    </div>

                    {/* Detalhes do prêmio */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                        <div className="flex items-center gap-2 mb-2">
                          <Gift className="h-5 w-5 text-green-600" />
                          <span className="font-semibold text-green-900 dark:text-green-100">Seu Prêmio</span>
                        </div>
                        <p className="text-green-800 dark:text-green-200 font-bold text-lg">{winnerData.prize}</p>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          <span className="font-semibold text-blue-900 dark:text-blue-100">Data do Sorteio</span>
                        </div>
                        <p className="text-blue-800 dark:text-blue-200">{formatDate(winnerData.announcedAt)}</p>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-5 w-5 text-purple-600" />
                          <span className="font-semibold text-purple-900 dark:text-purple-100">Seus Pontos</span>
                        </div>
                        <p className="text-purple-800 dark:text-purple-200 font-bold">{winnerData.totalPoints} pontos</p>
                      </div>

                      <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-5 w-5 text-orange-600" />
                          <span className="font-semibold text-orange-900 dark:text-orange-100">Status</span>
                        </div>
                        <Badge className="bg-green-500 text-white">Ganhador Confirmado</Badge>
                      </div>
                    </div>

                    {/* Instruções */}
                    {winnerData.winnerAnnouncement && (
                      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-purple-500" />
                          Instruções para Retirar o Prêmio
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                          {winnerData.winnerAnnouncement}
                        </p>
                      </div>
                    )}

                    {!winnerData.winnerAnnouncement && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
                        <h4 className="font-semibold mb-3 text-blue-900 dark:text-blue-100">
                          📧 Próximos Passos
                        </h4>
                        <p className="text-blue-800 dark:text-blue-200">
                          Em breve você receberá mais informações sobre como retirar seu prêmio. 
                          Fique atento ao seu email e às atualizações do site!
                        </p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Button 
                variant="outline" 
                onClick={handleDismiss}
                className="border-gray-300 hover:bg-gray-50"
              >
                Dispensar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}