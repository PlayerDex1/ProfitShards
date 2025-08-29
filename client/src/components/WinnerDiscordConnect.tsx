import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, Trophy, Gift, User, MapPin, 
  Phone, CheckCircle, Clock, AlertCircle 
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface WinnerDiscordConnectProps {
  isOpen: boolean;
  onClose: () => void;
  winnerData: {
    giveawayTitle: string;
    prize: string;
    position: number;
    points: number;
  };
}

export function WinnerDiscordConnect({ isOpen, onClose, winnerData }: WinnerDiscordConnectProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'connect' | 'form' | 'success'>('connect');
  const [loading, setLoading] = useState(false);
  
  // Dados do Discord
  const [discordUsername, setDiscordUsername] = useState('');
  
  // Dados opcionais do ganhador
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const handleConnectDiscord = () => {
    if (!discordUsername.trim()) {
      alert('Por favor, digite seu username do Discord');
      return;
    }

    setStep('form');
  };

  const handleSubmitContact = async () => {
    if (!fullName.trim() || !address.trim()) {
      alert('Nome completo e endereço são obrigatórios');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/winners/connect-discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user,
          discordUsername: discordUsername.trim(),
          fullName: fullName.trim(),
          address: address.trim(),
          phone: phone.trim(),
          giveawayId: 'current' // ou ID específico se disponível
        })
      });

      const result = await response.json();

      if (result.success) {
        setStep('success');
      } else {
        alert(`❌ Erro: ${result.message}`);
      }

    } catch (error) {
      console.error('Error connecting Discord:', error);
      alert('❌ Erro ao conectar Discord. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-yellow-500" />
            🎉 PARABÉNS, VOCÊ GANHOU!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Prêmio */}
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200">
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="font-bold text-lg text-yellow-800 dark:text-yellow-200 mb-2">
                  {winnerData.giveawayTitle}
                </h3>
                <div className="flex items-center justify-center gap-4 text-sm">
                  <Badge className="bg-yellow-500 text-white">
                    <Gift className="h-3 w-3 mr-1" />
                    {winnerData.prize}
                  </Badge>
                  <Badge className="bg-blue-500 text-white">
                    #{winnerData.position}º Lugar
                  </Badge>
                  <Badge className="bg-green-500 text-white">
                    {winnerData.points} pontos
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {step === 'connect' && (
            <>
              <div className="text-center space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
                  <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Para receber seu prêmio, conecte seu Discord para contato direto
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="discord">Seu username do Discord</Label>
                  <Input
                    id="discord"
                    value={discordUsername}
                    onChange={(e) => setDiscordUsername(e.target.value)}
                    placeholder="Ex: playerhold#1234 ou playerhold"
                    className="text-center font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Pode ser com ou sem #1234
                  </p>
                </div>

                <Button 
                  onClick={handleConnectDiscord}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Conectar Discord
                </Button>
              </div>
            </>
          )}

          {step === 'form' && (
            <>
              <div className="space-y-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200">
                  <p className="text-sm text-green-800 dark:text-green-200 text-center">
                    ✅ Discord conectado: <strong>{discordUsername}</strong>
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Nome Completo *</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Endereço Completo *</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Rua, número, cidade, CEP, estado"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Telefone (opcional)</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep('connect')}
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button 
                    onClick={handleSubmitContact}
                    disabled={loading || !fullName.trim() || !address.trim()}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {loading ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Finalizar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}

          {step === 'success' && (
            <>
              <div className="text-center space-y-4">
                <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-bold text-green-800 dark:text-green-200 mb-2">
                    🎉 Dados Enviados com Sucesso!
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Você será contactado no Discord <strong>{discordUsername}</strong> em até 24-48 horas.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    📋 Próximos Passos:
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 text-left">
                    <li>• Aguarde contato no Discord</li>
                    <li>• Mantenha DMs abertos</li>
                    <li>• Responda em até 7 dias</li>
                    <li>• Seu prêmio será enviado!</li>
                  </ul>
                </div>

                <Button 
                  onClick={onClose}
                  className="w-full"
                  variant="outline"
                >
                  Fechar
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}