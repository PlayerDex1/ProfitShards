import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  History, Trophy, Users, Calendar, Crown, Eye, 
  Download, RefreshCw, Archive, Scroll, Gift,
  Clock, Target, Sparkles, Star, Award
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
      {/* Header - Estilo moderno como giveaway management */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-8 rounded-xl border border-purple-200 dark:border-purple-800 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <History className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Histórico de Sorteios
              </h2>
              <p className="text-purple-700 dark:text-purple-300 text-lg">
                Registro completo e auditoria de todos os sorteios realizados
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={exportHistory}
              disabled={history.length === 0}
              className="border-purple-200 hover:bg-purple-50 hover:border-purple-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <Button 
              onClick={loadHistory}
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Estatísticas - Cards modernos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <Archive className="h-6 w-6 text-white" />
              </div>
              <span className="font-semibold text-blue-900 dark:text-blue-100">Total de Sorteios</span>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {history.length}
            </span>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <span className="font-semibold text-green-900 dark:text-green-100">Total de Ganhadores</span>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {history.reduce((sum, entry) => sum + entry.winnersCount, 0)}
            </span>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <span className="font-semibold text-purple-900 dark:text-purple-100">Média de Participantes</span>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
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
        <div className="space-y-6">
          {history.map((entry) => (
            <Card key={entry.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-600">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                      <Gift className="h-8 w-8 text-white" />
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100 mb-3">{entry.giveawayTitle}</h3>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-800 dark:text-blue-200">{formatDate(entry.drawnAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                          <Users className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-800 dark:text-green-200">{entry.totalParticipants} participantes</span>
                        </div>
                        <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-lg">
                          <Trophy className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium text-yellow-800 dark:text-yellow-200">{entry.winnersCount} ganhador{entry.winnersCount !== 1 ? 'es' : ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 text-sm font-semibold">
                      <Award className="h-4 w-4 mr-2" />
                      Concluído
                    </Badge>
                    
                    <Dialog open={dialogOpen && selectedEntry?.id === entry.id} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          onClick={() => setSelectedEntry(entry)}
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 shadow-lg px-6 py-2"
                        >
                          <Eye className="h-4 w-4 mr-2" />
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