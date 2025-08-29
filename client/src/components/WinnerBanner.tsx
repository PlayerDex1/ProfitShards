import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  Trophy, Crown, Gift, Sparkles, Star, Zap, 
  Calendar, Award, PartyPopper, Target, MessageCircle
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
      {/* Banner de Ganhador - MUITO MAIOR */}
      <Card className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20 border-4 border-yellow-400 dark:border-yellow-500 shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
        <CardContent className="p-12">
          <div className="text-center space-y-8">
            {/* Ícone Central GIGANTE */}
            <div className="relative mx-auto w-fit">
              <div className="p-8 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full shadow-2xl animate-bounce">
                <div className="relative">
                  {getPositionIcon(winnerData.position)}
                  <div className="absolute -top-2 -right-2">
                    <Sparkles className="h-8 w-8 text-yellow-300 animate-spin" />
                  </div>
                  <div className="absolute -bottom-2 -left-2">
                    <Star className="h-6 w-6 text-orange-300 animate-pulse" />
                  </div>
                </div>
              </div>
              {/* Efeitos ao redor */}
              <div className="absolute -top-4 -left-4">
                <Zap className="h-8 w-8 text-yellow-400 animate-bounce" style={{animationDelay: '0.2s'}} />
              </div>
              <div className="absolute -top-4 -right-4">
                <Trophy className="h-8 w-8 text-orange-400 animate-bounce" style={{animationDelay: '0.4s'}} />
              </div>
              <div className="absolute -bottom-4 -left-4">
                <Crown className="h-8 w-8 text-yellow-500 animate-bounce" style={{animationDelay: '0.6s'}} />
              </div>
              <div className="absolute -bottom-4 -right-4">
                <Award className="h-8 w-8 text-orange-500 animate-bounce" style={{animationDelay: '0.8s'}} />
              </div>
            </div>

            {/* Título GIGANTE */}
            <div>
              <h3 className="text-6xl font-black bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-4 animate-pulse">
                🎉 PARABÉNS! 🎉
              </h3>
              <h4 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                VOCÊ GANHOU!
              </h4>
            </div>

            {/* Informações do Prêmio */}
            <div className="bg-white/80 dark:bg-gray-800/80 p-8 rounded-2xl border-2 border-yellow-300 dark:border-yellow-600 shadow-xl">
              <div className="space-y-6">
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 text-2xl font-bold rounded-full shadow-lg">
                  {getPositionText(winnerData.position)}
                </Badge>
                
                <h5 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                  {winnerData.giveawayTitle}
                </h5>
                
                <div className="flex items-center justify-center gap-3 text-xl text-gray-700 dark:text-gray-300">
                  <Gift className="h-8 w-8 text-green-600" />
                  <span className="font-bold">Prêmio:</span> 
                  <span className="text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {winnerData.prize}
                  </span>
                </div>
              </div>
            </div>

            {/* Botões GRANDES */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-2xl px-12 py-6 text-xl font-bold rounded-full transform hover:scale-105 transition-all duration-200">
                    <PartyPopper className="h-6 w-6 mr-3" />
                    Ver Detalhes do Prêmio
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

                    {/* Instruções Personalizadas */}
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

                    {/* Contato Discord - SEMPRE MOSTRAR */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-indigo-200 dark:border-indigo-700">
                      <h4 className="font-semibold mb-4 text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-indigo-600" />
                        💬 Contato para Retirar o Prêmio
                      </h4>
                      <div className="space-y-4">
                        <p className="text-indigo-800 dark:text-indigo-200">
                          <strong>Entre em contato comigo no Discord para combinar a entrega do seu prêmio!</strong>
                        </p>
                        
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-indigo-300 dark:border-indigo-600">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold text-indigo-900 dark:text-indigo-100">Discord:</p>
                              <p className="text-lg font-mono bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded text-indigo-800 dark:text-indigo-200">
                                @playerhold
                              </p>
                            </div>
                            <Button 
                              onClick={() => {
                                navigator.clipboard.writeText('@playerhold');
                                alert('Discord copiado! Cole no Discord para me encontrar.');
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                              📋 Copiar
                            </Button>
                          </div>
                        </div>

                        <div className="text-sm text-indigo-700 dark:text-indigo-300 space-y-2">
                          <p>📧 <strong>Aguarde nosso email com instruções!</strong></p>
                          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded text-sm">
                            <p className="font-medium mb-2">✉️ Você receberá um email em breve com:</p>
                            <ul className="text-left space-y-1">
                              <li>• Instruções para reivindicar</li>
                              <li>• Dados necessários para entrega</li>
                              <li>• Prazo para resposta (7 dias)</li>
                            </ul>
                          </div>
                          <p className="text-xs">
                            💡 <strong>Ou contate diretamente:</strong> Discord @playerhold
                          </p>
                        </div>
                      </div>
                    </div>

                    {!winnerData.winnerAnnouncement && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
                        <h4 className="font-semibold mb-3 text-blue-900 dark:text-blue-100">
                          ⏰ Instruções Adicionais
                        </h4>
                        <p className="text-blue-800 dark:text-blue-200">
                          Instruções específicas sobre a entrega podem ser adicionadas pelo administrador. 
                          Por enquanto, use o Discord acima para contato direto!
                        </p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              
              <Button 
                variant="outline" 
                onClick={handleDismiss}
                className="border-gray-400 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full"
              >
                Dispensar Notificação
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>


    </>
  );
}