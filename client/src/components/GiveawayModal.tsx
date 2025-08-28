import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/i18n";
import { useAuth } from "@/hooks/use-auth";
import { 
  Gift, Trophy, Users, Calendar, Clock, CheckCircle, Circle, 
  Twitter, MessageCircle, Calculator, Map, Share2, ExternalLink,
  Sparkles, Target, Zap
} from "lucide-react";
import { Giveaway, GiveawayParticipant, GiveawayRequirement, GIVEAWAY_POINTS } from "@/types/giveaway";
import { MissionVerification } from "@/components/MissionVerification";
import { getUserMissionProgress } from "@/lib/missionVerification";

interface GiveawayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  giveaway?: Giveaway;
}

export function GiveawayModal({ open, onOpenChange, giveaway }: GiveawayModalProps) {
  const { t } = useI18n();
  const { user, isAuthenticated } = useAuth();
  const [participant, setParticipant] = useState<GiveawayParticipant | null>(null);
  const [loading, setLoading] = useState(false);
  const [isParticipating, setIsParticipating] = useState(false);

  // Carregar dados do participante baseado no progresso das missões
  useEffect(() => {
    if (isAuthenticated && giveaway && user) {
      const progress = getUserMissionProgress(user, giveaway.id);
      
      // Verificar se está participando
      const participants = getGiveawayParticipants(giveaway.id);
      setIsParticipating(participants.includes(user));
      
      setParticipant({
        id: `participant_${user}_${giveaway.id}`,
        giveawayId: giveaway.id,
        userId: user,
        userEmail: user,
        participatedAt: progress.lastUpdated,
        totalPoints: progress.totalPoints,
        completedRequirements: progress.completedRequirements,
        dailyLogins: progress.activityLog.filter(log => 
          log.requirementId.includes('login') && 
          new Date(log.completedAt).toDateString() === new Date().toDateString()
        ).length,
      });
    }
  }, [isAuthenticated, giveaway, user]);

  // Função auxiliar para buscar participantes
  const getGiveawayParticipants = (giveawayId: string): string[] => {
    try {
      const stored = localStorage.getItem(`giveaway_participants_${giveawayId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erro ao buscar participantes:', error);
      return [];
    }
  };

  // Atualizar participant quando progresso mudar
  const handleProgressUpdate = () => {
    if (isAuthenticated && giveaway && user) {
      const progress = getUserMissionProgress(user, giveaway.id);
      
      // Verificar participação atualizada
      const participants = getGiveawayParticipants(giveaway.id);
      setIsParticipating(participants.includes(user));
      setParticipant(prev => prev ? {
        ...prev,
        totalPoints: progress.totalPoints,
        completedRequirements: progress.completedRequirements,
      } : null);
    }
  };

  // Listener para atualizações de participação
  useEffect(() => {
    const handleParticipationUpdate = () => {
      if (isAuthenticated && giveaway && user) {
        const participants = getGiveawayParticipants(giveaway.id);
        setIsParticipating(participants.includes(user));
      }
    };

    window.addEventListener('giveaway-participation-updated', handleParticipationUpdate);
    
    return () => {
      window.removeEventListener('giveaway-participation-updated', handleParticipationUpdate);
    };
  }, [isAuthenticated, giveaway, user]);

  if (!giveaway) return null;

  const handleJoinGiveaway = async () => {
    if (!isAuthenticated) {
      // Redirecionar para login
      return;
    }

    setLoading(true);
    try {
      // TODO: API call to join giveaway
      console.log('Joining giveaway:', giveaway.id);
      
      // Simular participação
      setParticipant({
        id: Date.now().toString(),
        giveawayId: giveaway.id,
        userId: user || '',
        userEmail: user || '',
        participatedAt: new Date().toISOString(),
        totalPoints: GIVEAWAY_POINTS.DAILY_LOGIN,
        completedRequirements: ['login'],
        dailyLogins: 1,
      });
    } catch (error) {
      console.error('Error joining giveaway:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRequirement = async (requirement: GiveawayRequirement) => {
    if (!participant) return;

    // Abrir link externo se houver
    if (requirement.url) {
      window.open(requirement.url, '_blank');
    }

    // TODO: Marcar requirement como completado via API
    console.log('Completing requirement:', requirement.id);
  };

  const getRequirementIcon = (type: string) => {
    switch (type) {
      case 'login': return CheckCircle;
      case 'twitter_follow': return Twitter;
      case 'discord_join': return MessageCircle;
      case 'use_calculator': return Calculator;
      case 'use_planner': return Map;
      case 'share_social': return Share2;
      default: return Circle;
    }
  };

  const isRequirementCompleted = (requirementId: string) => {
    return participant?.completedRequirements.includes(requirementId) || false;
  };

  const totalPossiblePoints = giveaway.requirements.reduce((sum, req) => sum + req.points, 0);
  const progressPercentage = participant ? (participant.totalPoints / totalPossiblePoints) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3 text-2xl">
            <Gift className="h-8 w-8 text-orange-500" />
            <span>{giveaway.title}</span>
            <Badge 
              className={
                giveaway.status === 'active' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-yellow-500 text-white'
              }
            >
              {giveaway.status === 'active' ? 'ATIVO' : 'EM BREVE'}
            </Badge>
            {isParticipating && (
              <Badge className="bg-blue-500 text-white animate-pulse">
                🎉 PARTICIPANDO
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações do Giveaway */}
          <div className="space-y-6">
            {/* Prêmio */}
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-700">
                  <Trophy className="h-6 w-6" />
                  <span>Prêmio</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="text-2xl font-bold text-orange-800 mb-2">{giveaway.prize}</h3>
                <p className="text-gray-700">{giveaway.description}</p>
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Estatísticas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Participantes:</span>
                  <span className="font-bold text-foreground">
                    {giveaway.currentParticipants}
                    {giveaway.maxParticipants && ` / ${giveaway.maxParticipants}`}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Término:</span>
                  <span className="font-bold text-foreground">
                    {new Date(giveaway.endDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                {giveaway.winnerAnnouncement && (
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">Resultado:</span>
                    <span className="font-bold text-foreground">
                      {new Date(giveaway.winnerAnnouncement).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Regras */}
            <Card>
              <CardHeader>
                <CardTitle>📋 Regras</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {giveaway.rules.map((rule, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-emerald-500 font-bold">{index + 1}.</span>
                      <span className="text-sm text-foreground">{rule}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Participação */}
          <div className="space-y-6">
            {!isAuthenticated ? (
              <Card className="border-blue-500/30 bg-blue-500/10">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <Zap className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      Faça login para participar!
                    </h3>
                    <p className="text-muted-foreground">
                      Entre com sua conta para começar a ganhar pontos
                    </p>
                  </div>
                  <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white">
                    Fazer Login
                  </Button>
                </CardContent>
              </Card>
            ) : !participant ? (
              <Card className="border-emerald-500/30 bg-emerald-500/10">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <Target className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      Participe agora!
                    </h3>
                    <p className="text-muted-foreground">
                      Clique para se inscrever e começar a ganhar pontos
                    </p>
                  </div>
                  <Button 
                    size="lg" 
                    onClick={handleJoinGiveaway}
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    {loading ? 'Entrando...' : '🎯 Participar'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Status da Participação */}
                <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-purple-700">
                      <Sparkles className="h-6 w-6" />
                      <span>Sua Participação</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-1">
                        {participant.totalPoints}
                      </div>
                      <div className="text-sm text-emerald-500">pontos acumulados</div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2 text-foreground">
                        <span>Progresso</span>
                        <span>{Math.round(progressPercentage)}%</span>
                      </div>
                      <Progress value={progressPercentage} className="h-3" />
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                      <p>Quanto mais pontos, maior sua chance de ganhar!</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Missões com Verificação */}
                <MissionVerification
                  requirements={giveaway.requirements}
                  userId={user || ''}
                  giveawayId={giveaway.id}
                  onProgressUpdate={handleProgressUpdate}
                />
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}