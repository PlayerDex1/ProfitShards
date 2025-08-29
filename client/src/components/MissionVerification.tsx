import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, Circle, ExternalLink, Twitter, MessageCircle, 
  Calculator, Map, Share2, LogIn, Loader2, AlertCircle,
  Copy, Eye, Trophy, Target
} from "lucide-react";
import { GiveawayRequirement } from "@/types/giveaway";
import { 
  getUserMissionProgress, 
  isMissionCompleted, 
  manualVerification,
  checkDailyLogin,
  checkCalculatorUsage,
  checkPlannerUsage,
  markSocialShare
} from "@/lib/missionVerification";

interface MissionVerificationProps {
  requirements: GiveawayRequirement[];
  userId: string;
  giveawayId: string;
  onProgressUpdate?: () => void;
}

export function MissionVerification({ requirements, userId, giveawayId, onProgressUpdate }: MissionVerificationProps) {
  const [progress, setProgress] = useState(getUserMissionProgress(userId, giveawayId));
  const [verifyingMission, setVerifyingMission] = useState<string | null>(null);
  const [verificationDialog, setVerificationDialog] = useState<{
    requirement: GiveawayRequirement | null;
    open: boolean;
  }>({ requirement: null, open: false });
  const [userInput, setUserInput] = useState('');

  useEffect(() => {
    const updateProgress = () => {
      setProgress(getUserMissionProgress(userId, giveawayId));
      onProgressUpdate?.();
    };

    // Auto-completar missões baseadas em eventos do site
    const handleCalculatorUsed = () => {
      const calcRequirement = requirements.find(r => r.type === 'use_calculator');
      if (calcRequirement && !isMissionCompleted(userId, giveawayId, calcRequirement.id)) {
        checkCalculatorUsage(userId, giveawayId, calcRequirement);
        updateProgress();
      }
    };

    const handlePlannerUsed = () => {
      const plannerRequirement = requirements.find(r => r.type === 'use_planner');
      if (plannerRequirement && !isMissionCompleted(userId, giveawayId, plannerRequirement.id)) {
        checkPlannerUsage(userId, giveawayId, plannerRequirement);
        updateProgress();
      }
    };

    // Escutar mudanças no progresso
    window.addEventListener('mission-progress-updated', updateProgress);
    window.addEventListener('calculation-completed', handleCalculatorUsed);
    window.addEventListener('planner-used', handlePlannerUsed);
    
    // Verificar login diário automaticamente
    const loginRequirement = requirements.find(r => r.type === 'login');
    if (loginRequirement) {
      checkDailyLogin(userId, giveawayId, loginRequirement);
      updateProgress();
    }

    return () => {
      window.removeEventListener('mission-progress-updated', updateProgress);
      window.removeEventListener('calculation-completed', handleCalculatorUsed);
      window.removeEventListener('planner-used', handlePlannerUsed);
    };
  }, [userId, giveawayId, requirements, onProgressUpdate]);

  const getRequirementIcon = (type: GiveawayRequirement['type']) => {
    switch (type) {
      case 'login': return LogIn;
      case 'twitter_follow': return Twitter;
      case 'discord_join': return MessageCircle;
      case 'use_calculator': return Calculator;
      case 'use_planner': return Map;
      case 'share_social': return Share2;
      case 'external_link': return ExternalLink;
      default: return Circle;
    }
  };

  const handleMissionClick = async (requirement: GiveawayRequirement) => {
    if (isMissionCompleted(userId, giveawayId, requirement.id)) {
      return; // Já completada
    }

    setVerifyingMission(requirement.id);

    try {
      switch (requirement.type) {
        case 'login':
          checkDailyLogin(userId, giveawayId, requirement);
          break;
          
        case 'use_calculator':
          checkCalculatorUsage(userId, giveawayId, requirement);
          break;
          
        case 'use_planner':
          checkPlannerUsage(userId, giveawayId, requirement);
          break;
          
        case 'twitter_follow':
        case 'discord_join':
        case 'external_link':
          // Abrir dialog de verificação manual
          setVerificationDialog({ requirement, open: true });
          break;
          
        case 'share_social':
          // Copiar link para compartilhar
          const shareText = `🎁 Participando do giveaway ${window.location.origin}! Concorra a prêmios incríveis! #WorldShards #Giveaway`;
          await navigator.clipboard.writeText(shareText);
          markSocialShare(userId, giveawayId, requirement, 'clipboard');
          alert('Link copiado! Cole nas suas redes sociais para completar a missão.');
          break;
      }
    } catch (error) {
      console.error('Error handling mission:', error);
    } finally {
      setVerifyingMission(null);
    }
  };

  const handleManualVerification = async () => {
    if (!verificationDialog.requirement) return;
    
    // Para external_link, o input é opcional
    if (verificationDialog.requirement.type !== 'external_link' && !userInput.trim()) return;

    setVerifyingMission(verificationDialog.requirement.id);
    
    try {
      const success = await manualVerification(
        userId, 
        giveawayId, 
        verificationDialog.requirement,
        userInput.trim()
      );
      
      if (success) {
        setVerificationDialog({ requirement: null, open: false });
        setUserInput('');
        alert('✅ Missão verificada com sucesso!');
      } else {
        alert('❌ Não foi possível verificar. Verifique os dados inseridos.');
      }
    } catch (error) {
      console.error('Error in manual verification:', error);
      alert('❌ Erro na verificação. Tente novamente.');
    } finally {
      setVerifyingMission(null);
    }
  };

  const openExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getProgressPercentage = () => {
    if (requirements.length === 0) return 0;
    return (progress.completedRequirements.length / requirements.length) * 100;
  };

  const getVerificationButtonText = (requirement: GiveawayRequirement) => {
    switch (requirement.type) {
      case 'login': return 'Verificar Login';
      case 'twitter_follow': return 'Confirmar que Segui';
      case 'discord_join': return 'Confirmar que Entrei';
      case 'use_calculator': return 'Marcar como Usado';
      case 'use_planner': return 'Marcar como Usado';
      case 'share_social': return 'Copiar e Compartilhar';
      default: return 'Completar';
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            🎯 Missões para Ganhar Pontos
          </CardTitle>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                Progresso: {progress.completedRequirements.length}/{requirements.length}
              </span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {progress.totalPoints} pontos
              </Badge>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {requirements.map((requirement) => {
            const Icon = getRequirementIcon(requirement.type);
            const completed = isMissionCompleted(userId, giveawayId, requirement.id);
            const isVerifying = verifyingMission === requirement.id;
            
            return (
              <div
                key={requirement.id}
                className={`p-4 rounded-lg border transition-all ${
                  completed 
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                    : 'bg-card border-border hover:border-blue-300 cursor-pointer'
                }`}
                onClick={() => !completed && !isVerifying && handleMissionClick(requirement)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    )}
                    
                    <div>
                      <div className="font-medium text-foreground">{requirement.description}</div>
                      {requirement.required && (
                        <div className="text-xs text-orange-500 font-medium">⭐ Obrigatório</div>
                      )}
                      {requirement.url && (
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openExternalLink(requirement.url!);
                            }}
                            className="text-blue-500 hover:underline"
                          >
                            Abrir link
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={completed ? "default" : "secondary"}
                      className={completed ? "bg-green-500 text-white" : ""}
                    >
                      +{requirement.points} pts
                    </Badge>
                    
                    {!completed && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isVerifying}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMissionClick(requirement);
                        }}
                        className="ml-2"
                      >
                        {isVerifying ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          getVerificationButtonText(requirement)
                        )}
                      </Button>
                    )}
                    
                    {completed && (
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completo
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {progress.completedRequirements.length === requirements.length && (
            <div className="mt-4 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg text-center">
              <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="font-bold text-green-700 dark:text-green-300">
                🎉 Todas as missões completadas!
              </h3>
              <p className="text-sm text-muted-foreground">
                Você acumulou {progress.totalPoints} pontos e está participando do sorteio!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Verificação Manual */}
      <Dialog 
        open={verificationDialog.open} 
        onOpenChange={(open) => setVerificationDialog(prev => ({ ...prev, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {verificationDialog.requirement?.type === 'twitter_follow' 
                ? '🐦 Verificar Follow no Twitter'
                : verificationDialog.requirement?.type === 'discord_join'
                ? '💬 Verificar Entrada no Discord'
                : '🔗 Completar Missão Externa'
              }
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {verificationDialog.requirement?.type === 'twitter_follow' ? (
              <>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded border">
                  <h4 className="font-medium mb-2">📋 Como verificar:</h4>
                  <ol className="text-sm space-y-1 list-decimal list-inside">
                    <li>Clique no link para abrir o perfil</li>
                    <li>Clique em "Seguir" no Twitter</li>
                    <li>Digite seu @ do Twitter abaixo</li>
                  </ol>
                </div>
                
                {verificationDialog.requirement.url && (
                  <Button 
                    onClick={() => openExternalLink(verificationDialog.requirement!.url!)}
                    className="w-full"
                    variant="outline"
                  >
                    <Twitter className="h-4 w-4 mr-2" />
                    Abrir Perfil no Twitter
                  </Button>
                )}
                
                <div>
                  <Label htmlFor="twitter-handle">Seu @ do Twitter:</Label>
                  <Input
                    id="twitter-handle"
                    placeholder="@seuusername"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Digite seu nome de usuário do Twitter (com ou sem @)
                  </p>
                </div>
              </>
            ) : verificationDialog.requirement?.type === 'discord_join' ? (
              <>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded border">
                  <h4 className="font-medium mb-2">📋 Como verificar:</h4>
                  <ol className="text-sm space-y-1 list-decimal list-inside">
                    <li>Clique no link para entrar no Discord</li>
                    <li>Entre no servidor</li>
                    <li>Digite seu username do Discord abaixo</li>
                  </ol>
                </div>
                
                {verificationDialog.requirement?.url && (
                  <Button 
                    onClick={() => openExternalLink(verificationDialog.requirement!.url!)}
                    className="w-full"
                    variant="outline"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Entrar no Discord
                  </Button>
                )}
                
                <div>
                  <Label htmlFor="discord-user">Seu username do Discord:</Label>
                  <Input
                    id="discord-user"
                    placeholder="username#1234 ou username"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Digite seu nome de usuário do Discord
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded border">
                  <h4 className="font-medium mb-2">📋 Como completar:</h4>
                  <ol className="text-sm space-y-1 list-decimal list-inside">
                    <li>Clique no link abaixo para acessar</li>
                    <li>Complete a ação solicitada no site</li>
                    <li>Volte aqui e clique em "Confirmar Conclusão"</li>
                  </ol>
                </div>
                
                {verificationDialog.requirement?.url && (
                  <Button 
                    onClick={() => openExternalLink(verificationDialog.requirement!.url!)}
                    className="w-full mb-4"
                    variant="outline"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Acessar Link da Missão
                  </Button>
                )}
                
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
                    <CheckCircle className="h-4 w-4 inline mr-1" />
                    Completou a ação no link? Clique no botão abaixo para confirmar!
                  </p>
                </div>
                
                <Button 
                  onClick={handleManualVerification}
                  disabled={verifyingMission === verificationDialog.requirement?.id}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3"
                >
                  {verifyingMission === verificationDialog.requirement?.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Confirmando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      ✅ Confirmar Conclusão da Missão
                    </>
                  )}
                </Button>
              </>
            )}
            
            {verificationDialog.requirement?.type !== 'external_link' && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setVerificationDialog({ requirement: null, open: false })}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleManualVerification}
                  disabled={!userInput.trim() || verifyingMission !== null}
                  className="flex-1"
                >
                  {verifyingMission ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Verificar
                </Button>
              </div>
            )}

            {verificationDialog.requirement?.type === 'external_link' && (
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => setVerificationDialog({ requirement: null, open: false })}
                  className="w-full"
                >
                  Fechar
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}