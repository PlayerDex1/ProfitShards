import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Crown, Mail, ExternalLink, Copy, Eye, Send, 
  Trophy, Users, Calendar, Gift, Check, X, AlertCircle
} from "lucide-react";

interface Winner {
  id: string;
  giveawayId: string;
  giveawayTitle: string;
  userEmail: string;
  userName: string;
  points: number;
  selectedAt: string;
  notified: boolean;
  claimed: boolean;
  shippingStatus: 'pending' | 'shipped' | 'delivered';
  trackingCode?: string;
}

interface WinnerManagerProps {
  className?: string;
}

export function WinnerManager({ className }: WinnerManagerProps) {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [selectedWinner, setSelectedWinner] = useState<Winner | null>(null);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);

  // Mock data - substituir por API real
  useEffect(() => {
    const mockWinners: Winner[] = [
      {
        id: 'winner_1',
        giveawayId: 'giveaway_1',
        giveawayTitle: 'WorldShards Starter Pack',
        userEmail: 'winner@example.com',
        userName: 'GamerWinner123',
        points: 45,
        selectedAt: new Date().toISOString(),
        notified: true,
        claimed: false,
        shippingStatus: 'pending',
      }
    ];
    setWinners(mockWinners);
  }, []);

  const handleNotifyWinner = async (winner: Winner) => {
    setSelectedWinner(winner);
    setNotificationMessage(
      `🎉 Parabéns! Você ganhou o "${winner.giveawayTitle}"!\n\n` +
      `Prêmio: Starter Pack + 1000 tokens\n` +
      `Pontos acumulados: ${winner.points}\n\n` +
      `Para reivindicar seu prêmio, responda este email com:\n` +
      `- Nome completo\n` +
      `- Endereço completo para entrega\n` +
      `- Telefone para contato\n\n` +
      `Você tem 7 dias para responder, caso contrário um novo ganhador será sorteado.\n\n` +
      `Obrigado por participar!`
    );
    setShowNotificationDialog(true);
  };

  const handleSendNotification = async () => {
    if (!selectedWinner) return;
    
    setLoading(true);
    try {
      // TODO: API call para enviar notificação
      console.log('Sending notification to:', selectedWinner.userEmail);
      console.log('Message:', notificationMessage);
      
      // Simular envio
      setWinners(prev => 
        prev.map(w => 
          w.id === selectedWinner.id 
            ? { ...w, notified: true }
            : w
        )
      );
      
      setShowNotificationDialog(false);
      alert('Notificação enviada com sucesso!');
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Erro ao enviar notificação');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateShipping = async (winnerId: string, status: Winner['shippingStatus'], trackingCode?: string) => {
    try {
      // TODO: API call para atualizar status de envio
      console.log('Updating shipping:', winnerId, status, trackingCode);
      
      setWinners(prev => 
        prev.map(w => 
          w.id === winnerId 
            ? { ...w, shippingStatus: status, trackingCode }
            : w
        )
      );
    } catch (error) {
      console.error('Error updating shipping:', error);
    }
  };

  const handleMarkClaimed = async (winnerId: string) => {
    try {
      // TODO: API call para marcar como reivindicado
      console.log('Marking as claimed:', winnerId);
      
      setWinners(prev => 
        prev.map(w => 
          w.id === winnerId 
            ? { ...w, claimed: true }
            : w
        )
      );
    } catch (error) {
      console.error('Error marking as claimed:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado para área de transferência!');
  };

  const getShippingStatusColor = (status: Winner['shippingStatus']) => {
    switch (status) {
      case 'shipped': return 'bg-blue-500';
      case 'delivered': return 'bg-green-500';
      default: return 'bg-yellow-500';
    }
  };

  const getShippingStatusText = (status: Winner['shippingStatus']) => {
    switch (status) {
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregue';
      default: return 'Pendente';
    }
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <Crown className="h-7 w-7 text-yellow-500" />
              👑 Gerenciamento de Ganhadores
            </h3>
            <p className="text-muted-foreground mt-1">
              Notifique ganhadores e gerencie entregas de prêmios
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <div>
                  <p className="text-xl font-bold">{winners.length}</p>
                  <p className="text-xs text-muted-foreground">Total Ganhadores</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="text-xl font-bold">
                    {winners.filter(w => w.notified).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Notificados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Check className="h-6 w-6 text-green-500" />
                <div>
                  <p className="text-xl font-bold">
                    {winners.filter(w => w.claimed).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Reivindicados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Gift className="h-6 w-6 text-purple-500" />
                <div>
                  <p className="text-xl font-bold">
                    {winners.filter(w => w.shippingStatus === 'delivered').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Entregues</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Winners List */}
        <Card>
          <CardHeader>
            <CardTitle>🏆 Lista de Ganhadores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {winners.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Crown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum ganhador selecionado ainda</p>
                </div>
              ) : (
                winners.map((winner) => (
                  <Card key={winner.id} className="border-l-4 border-l-yellow-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Crown className="h-5 w-5 text-yellow-500" />
                            <h4 className="font-semibold">{winner.giveawayTitle}</h4>
                            <Badge className={`${getShippingStatusColor(winner.shippingStatus)} text-white`}>
                              {getShippingStatusText(winner.shippingStatus)}
                            </Badge>
                            {winner.notified && (
                              <Badge variant="outline" className="text-blue-600 border-blue-600">
                                <Mail className="h-3 w-3 mr-1" />
                                Notificado
                              </Badge>
                            )}
                            {winner.claimed && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <Check className="h-3 w-3 mr-1" />
                                Reivindicado
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Ganhador:</span>
                              <p className="font-medium">{winner.userName}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Email:</span>
                              <p className="font-medium flex items-center gap-1">
                                {winner.userEmail}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(winner.userEmail)}
                                  className="h-4 w-4 p-0"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Pontos:</span>
                              <p className="font-medium">{winner.points} pts</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Selecionado em:</span>
                              <p className="font-medium">
                                {new Date(winner.selectedAt).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>

                          {winner.trackingCode && (
                            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border">
                              <span className="text-sm text-muted-foreground">Código de rastreamento:</span>
                              <p className="font-mono text-sm font-medium flex items-center gap-2">
                                {winner.trackingCode}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(winner.trackingCode!)}
                                  className="h-4 w-4 p-0"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4 flex-col">
                          {!winner.notified && (
                            <Button
                              size="sm"
                              onClick={() => handleNotifyWinner(winner)}
                              className="bg-blue-500 hover:bg-blue-600"
                            >
                              <Mail className="h-4 w-4 mr-1" />
                              Notificar
                            </Button>
                          )}
                          
                          {winner.notified && !winner.claimed && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkClaimed(winner.id)}
                              className="text-green-600 border-green-600"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Marcar Reivindicado
                            </Button>
                          )}

                          {winner.claimed && (
                            <div className="flex gap-1">
                              <Select
                                value={winner.shippingStatus}
                                onValueChange={(value: Winner['shippingStatus']) => 
                                  handleUpdateShipping(winner.id, value)
                                }
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pendente</SelectItem>
                                  <SelectItem value="shipped">Enviado</SelectItem>
                                  <SelectItem value="delivered">Entregue</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              {winner.shippingStatus === 'shipped' && !winner.trackingCode && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const code = prompt('Código de rastreamento:');
                                    if (code) {
                                      handleUpdateShipping(winner.id, 'shipped', code);
                                    }
                                  }}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notification Dialog */}
        <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>📧 Notificar Ganhador</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Para:</Label>
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <Mail className="h-4 w-4" />
                  <span>{selectedWinner?.userEmail}</span>
                </div>
              </div>
              
              <div>
                <Label>Assunto:</Label>
                <Input 
                  value={`🎉 Você ganhou: ${selectedWinner?.giveawayTitle}!`}
                  readOnly
                />
              </div>
              
              <div>
                <Label>Mensagem:</Label>
                <textarea
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  rows={12}
                  className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowNotificationDialog(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSendNotification}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {loading ? 'Enviando...' : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Notificação
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}