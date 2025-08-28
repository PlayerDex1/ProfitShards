import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  History, Trophy, Users, Calendar, Crown, Eye, 
  Download, RefreshCw, Archive, Scroll, Gift
} from "lucide-react";

interface LotteryEntry {
  id: string;
  giveawayId: string;
  giveawayTitle: string;
  totalParticipants: number;
  winnersCount: number;
  winnersData: any[];
  drawnAt: string;
  drawnBy?: string;
  notes?: string;
  createdAt: string;
}

export function LotteryHistory() {
  const [history, setHistory] = useState<LotteryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<LotteryEntry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/lottery/history');
      const result = await response.json();
      setHistory(result.history || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportHistory = () => {
    if (history.length === 0) return;

    const csvContent = [
      ['Data', 'Giveaway', 'Participantes', 'Ganhadores', 'Vencedores'],
      ...history.map(entry => [
        new Date(entry.drawnAt).toLocaleString('pt-BR'),
        entry.giveawayTitle,
        entry.totalParticipants,
        entry.winnersCount,
        entry.winnersData.map(w => w.userId.slice(0, 15)).join('; ')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico_sorteios_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-indigo-200 dark:border-indigo-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-2 flex items-center gap-2">
              <History className="h-8 w-8" />
              Histórico de Sorteios
            </h2>
            <p className="text-indigo-700 dark:text-indigo-300">
              Registro completo de todos os sorteios realizados
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={exportHistory}
              disabled={history.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <Button 
              variant="outline" 
              onClick={loadHistory}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-100 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Archive className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Total de Sorteios</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">{history.length}</span>
          </div>

          <div className="bg-green-100 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">Total de Ganhadores</span>
            </div>
            <span className="text-2xl font-bold text-green-600">
              {history.reduce((sum, entry) => sum + entry.winnersCount, 0)}
            </span>
          </div>

          <div className="bg-purple-100 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-900">Média de Participantes</span>
            </div>
            <span className="text-2xl font-bold text-purple-600">
              {history.length > 0 
                ? Math.round(history.reduce((sum, entry) => sum + entry.totalParticipants, 0) / history.length)
                : 0
              }
            </span>
          </div>
        </div>
      </div>

      {/* Lista do Histórico */}
      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando histórico...</p>
          </CardContent>
        </Card>
      ) : history.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Scroll className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum sorteio realizado</h3>
            <p className="text-muted-foreground">
              Quando você realizar sorteios, eles aparecerão aqui no histórico.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <Gift className="h-6 w-6 text-indigo-600" />
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg">{entry.giveawayTitle}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(entry.drawnAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {entry.totalParticipants} participantes
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4" />
                          {entry.winnersCount} ganhador{entry.winnersCount !== 1 ? 'es' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Concluído
                    </Badge>
                    
                    <Dialog open={dialogOpen && selectedEntry?.id === entry.id} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedEntry(entry)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalhes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Detalhes do Sorteio</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Giveaway</label>
                              <p className="text-sm text-muted-foreground">{entry.giveawayTitle}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Data do Sorteio</label>
                              <p className="text-sm text-muted-foreground">{formatDate(entry.drawnAt)}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Total de Participantes</label>
                              <p className="text-sm text-muted-foreground">{entry.totalParticipants}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Ganhadores Sorteados</label>
                              <p className="text-sm text-muted-foreground">{entry.winnersCount}</p>
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <label className="text-sm font-medium mb-3 block">Lista de Ganhadores</label>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {entry.winnersData.map((winner, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                                  <div className="flex items-center gap-2">
                                    <Crown className="h-4 w-4 text-yellow-500" />
                                    <span className="text-sm">#{winner.position}</span>
                                    <span className="text-sm font-medium">
                                      {winner.userEmail || winner.userId.slice(0, 20)}
                                    </span>
                                  </div>
                                  <Badge variant="secondary" className="text-xs">
                                    {winner.totalPoints} pts
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {entry.notes && (
                            <div>
                              <label className="text-sm font-medium">Observações</label>
                              <p className="text-sm text-muted-foreground">{entry.notes}</p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}