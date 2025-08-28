import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  Dice1, Users, Trophy, Gift, Crown, Sparkles, 
  AlertCircle, CheckCircle, User, Calendar, Award,
  RefreshCw, Download, Eye
} from "lucide-react";

interface Participant {
  id: string;
  userId: string;
  userEmail: string;
  totalPoints: number;
  participatedAt: string;
  isWinner: boolean;
  winnerPosition?: number;
  winnerAnnouncedAt?: string;
}

interface Winner {
  id: string;
  userId: string;
  userEmail: string;
  position: number;
  announcedAt: string;
  totalPoints: number;
}

export function LotteryManager() {
  const [activeGiveaway, setActiveGiveaway] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(false);
  const [winnerCount, setWinnerCount] = useState(1);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Buscar giveaway ativo
  useEffect(() => {
    loadActiveGiveaway();
  }, []);

  // Buscar participantes quando giveaway carregar
  useEffect(() => {
    if (activeGiveaway) {
      loadParticipants();
    }
  }, [activeGiveaway]);

  const loadActiveGiveaway = async () => {
    try {
      const response = await fetch('/api/giveaways/active');
      const result = await response.json();
      setActiveGiveaway(result.giveaway);
    } catch (error) {
      console.error('Erro ao buscar giveaway:', error);
    }
  };

  const loadParticipants = async () => {
    if (!activeGiveaway) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/participants/list?giveawayId=${activeGiveaway.id}`);
      const result = await response.json();
      
      setParticipants(result.participants || []);
      setWinners(result.winners || []);
    } catch (error) {
      console.error('Erro ao buscar participantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const drawWinners = async () => {
    if (!activeGiveaway || winnerCount < 1) return;

    const eligibleParticipants = participants.filter(p => !p.isWinner);
    
    if (eligibleParticipants.length < winnerCount) {
      alert(`Apenas ${eligibleParticipants.length} participantes elegíveis disponíveis!`);
      return;
    }

    if (!confirm(`Sortear ${winnerCount} ganhador(es)? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/participants/lottery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giveawayId: activeGiveaway.id,
          winnerCount
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`🎉 ${result.winners.length} ganhador(es) sorteado(s) com sucesso!`);
        await loadParticipants(); // Recarregar dados
      } else {
        alert(`❌ Erro no sorteio: ${result.error}`);
      }
    } catch (error) {
      console.error('Erro no sorteio:', error);
      alert('❌ Erro no sorteio. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const exportWinners = () => {
    if (winners.length === 0) return;

    const csvContent = [
      ['Posição', 'User ID', 'Email', 'Pontos', 'Data Participação', 'Data Sorteio'],
      ...winners.map(w => [
        w.position,
        w.userId,
        w.userEmail || '',
        w.totalPoints,
        new Date(participants.find(p => p.userId === w.userId)?.participatedAt || '').toLocaleString('pt-BR'),
        new Date(w.announcedAt).toLocaleString('pt-BR')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ganhadores_${activeGiveaway?.title || 'giveaway'}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!activeGiveaway) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum giveaway ativo</h3>
          <p className="text-muted-foreground">
            Crie um giveaway ativo para gerenciar participantes e sorteios.
          </p>
        </CardContent>
      </Card>
    );
  }

  const eligibleParticipants = participants.filter(p => !p.isWinner);

  return (
    <div className="space-y-6">
      {/* Header do Giveaway */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
              <Dice1 className="h-8 w-8" />
              Sistema de Sorteio
            </h2>
            <p className="text-purple-700 dark:text-purple-300">
              Giveaway ativo: <strong>{activeGiveaway.title}</strong>
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={loadParticipants}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-100 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Total Participantes</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">{participants.length}</span>
          </div>

          <div className="bg-green-100 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">Ganhadores</span>
            </div>
            <span className="text-2xl font-bold text-green-600">{winners.length}</span>
          </div>

          <div className="bg-yellow-100 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-900">Elegíveis</span>
            </div>
            <span className="text-2xl font-bold text-yellow-600">{eligibleParticipants.length}</span>
          </div>

          <div className="bg-purple-100 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-900">Máx. Participantes</span>
            </div>
            <span className="text-2xl font-bold text-purple-600">{activeGiveaway.maxParticipants || '∞'}</span>
          </div>
        </div>
      </div>

      {/* Área de Sorteio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dice1 className="h-6 w-6 text-orange-500" />
            Realizar Sorteio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="winnerCount">Número de ganhadores</Label>
              <Input
                id="winnerCount"
                type="number"
                min="1"
                max={eligibleParticipants.length}
                value={winnerCount}
                onChange={(e) => setWinnerCount(parseInt(e.target.value) || 1)}
                placeholder="1"
              />
            </div>
            <Button
              onClick={drawWinners}
              disabled={loading || eligibleParticipants.length === 0}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Dice1 className="h-4 w-4 mr-2" />
              )}
              Sortear Ganhadores
            </Button>
          </div>

          {eligibleParticipants.length === 0 && participants.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                ⚠️ Todos os participantes já são ganhadores. Não há mais participantes elegíveis para sorteio.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Ganhadores */}
      {winners.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-6 w-6 text-yellow-500" />
                Ganhadores ({winners.length})
              </CardTitle>
              <Button variant="outline" onClick={exportWinners}>
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {winners.map((winner) => (
                <div key={winner.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-yellow-500 text-white">
                      #{winner.position}
                    </Badge>
                    <div>
                      <div className="font-medium">
                        {winner.userEmail || winner.userId.slice(0, 20)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {winner.totalPoints} pontos • Sorteado em {new Date(winner.announcedAt).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <Crown className="h-5 w-5 text-yellow-500" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Participantes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-500" />
            Todos os Participantes ({participants.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {participants.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum participante ainda</p>
            </div>
          ) : (
            <div className="space-y-2">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {participant.userEmail || participant.userId.slice(0, 20)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {participant.totalPoints} pontos • {new Date(participant.participatedAt).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {participant.isWinner && (
                      <Badge className="bg-yellow-500 text-white">
                        <Crown className="h-3 w-3 mr-1" />
                        Ganhador #{participant.winnerPosition}
                      </Badge>
                    )}
                    <Dialog open={dialogOpen && selectedParticipant?.id === participant.id} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedParticipant(participant)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Detalhes do Participante</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>User ID</Label>
                            <p className="text-sm text-muted-foreground">{participant.userId}</p>
                          </div>
                          <div>
                            <Label>Email</Label>
                            <p className="text-sm text-muted-foreground">{participant.userEmail || 'Não informado'}</p>
                          </div>
                          <div>
                            <Label>Total de Pontos</Label>
                            <p className="text-sm text-muted-foreground">{participant.totalPoints}</p>
                          </div>
                          <div>
                            <Label>Data de Participação</Label>
                            <p className="text-sm text-muted-foreground">
                              {new Date(participant.participatedAt).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          {participant.isWinner && (
                            <div>
                              <Label>Status de Ganhador</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Crown className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm">
                                  Ganhador #{participant.winnerPosition} - {new Date(participant.winnerAnnouncedAt || '').toLocaleString('pt-BR')}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}