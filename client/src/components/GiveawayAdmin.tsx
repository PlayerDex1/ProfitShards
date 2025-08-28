import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/i18n";
import { 
  Gift, Plus, Edit, Trash2, Users, Trophy, Calendar, 
  Clock, Target, Sparkles, Crown, Download, Upload,
  Eye, EyeOff, Play, Pause, Square, BarChart3
} from "lucide-react";
import { Giveaway } from "@/types/giveaway";
import { WinnerManager } from "@/components/WinnerManager";
import { RequirementsEditor } from "@/components/RequirementsEditor";
import { 
  getAllGiveaways, 
  upsertGiveaway, 
  deleteGiveaway as deleteGiveawayFromStorage,
  setActiveGiveaway as setActiveGiveawayInStorage,
  initializeGiveawayData
} from "@/lib/giveawayStorage";
import { DEFAULT_REQUIREMENTS } from "@/types/giveaway";

interface GiveawayAdminProps {
  className?: string;
}

export function GiveawayAdmin({ className }: GiveawayAdminProps) {
  const { t } = useI18n();
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [selectedGiveaway, setSelectedGiveaway] = useState<Giveaway | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prize: '',
    startDate: '',
    endDate: '',
    maxParticipants: '',
    status: 'draft' as 'draft' | 'active' | 'ended',
    rules: [''],
    winnerAnnouncement: '',
    requirements: DEFAULT_REQUIREMENTS.map((req, index) => ({
      ...req,
      id: `req_${index}`,
    })),
  });

  // Carregar dados do storage
  useEffect(() => {
    initializeGiveawayData();
    loadGiveaways();
    
    // Escutar mudanças no storage
    const handleStorageChange = () => {
      loadGiveaways();
    };
    
    window.addEventListener('giveaway-data-updated', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('giveaway-data-updated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loadGiveaways = () => {
    const stored = getAllGiveaways();
    setGiveaways(stored);
  };

  const handleCreateGiveaway = async () => {
    setLoading(true);
    try {
      const newGiveaway: Giveaway = {
        id: `giveaway_${Date.now()}`,
        title: formData.title,
        description: formData.description,
        prize: formData.prize,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        status: formData.status,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        currentParticipants: 0,
        rules: formData.rules.filter(rule => rule.trim() !== ''),
        requirements: formData.requirements,
        winnerAnnouncement: formData.winnerAnnouncement ? new Date(formData.winnerAnnouncement).toISOString() : undefined,
        createdAt: new Date().toISOString(),
      };
      
      upsertGiveaway(newGiveaway);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating giveaway:', error);
      alert('Erro ao criar giveaway');
    } finally {
      setLoading(false);
    }
  };

  const handleEditGiveaway = async () => {
    if (!selectedGiveaway) return;
    
    setLoading(true);
    try {
      const updatedGiveaway: Giveaway = {
        ...selectedGiveaway,
        title: formData.title,
        description: formData.description,
        prize: formData.prize,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        status: formData.status,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        rules: formData.rules.filter(rule => rule.trim() !== ''),
        requirements: formData.requirements,
        winnerAnnouncement: formData.winnerAnnouncement ? new Date(formData.winnerAnnouncement).toISOString() : undefined,
      };
      
      upsertGiveaway(updatedGiveaway);
      setIsEditDialogOpen(false);
      setSelectedGiveaway(null);
      resetForm();
    } catch (error) {
      console.error('Error editing giveaway:', error);
      alert('Erro ao editar giveaway');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGiveaway = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este giveaway?')) return;
    
    try {
      deleteGiveawayFromStorage(id);
    } catch (error) {
      console.error('Error deleting giveaway:', error);
      alert('Erro ao deletar giveaway');
    }
  };

  const handleSelectWinner = async (giveawayId: string) => {
    if (!confirm('Selecionar ganhador automaticamente com base nos pontos?')) return;
    
    try {
      // TODO: API call para selecionar ganhador
      console.log('Selecting winner for:', giveawayId);
      // Simular seleção de ganhador
      alert('Ganhador selecionado com sucesso! Notificação enviada.');
    } catch (error) {
      console.error('Error selecting winner:', error);
    }
  };

  const handleSetAsActive = (giveawayId: string) => {
    if (!confirm('Definir este giveaway como ativo? Isso irá desativar outros giveaways ativos.')) return;
    
    try {
      // Atualizar status de todos os giveaways
      const updatedGiveaways = giveaways.map(g => ({
        ...g,
        status: g.id === giveawayId ? 'active' as const : 
               g.status === 'active' ? 'ended' as const : g.status
      }));
      
      // Salvar todos os giveaways atualizados
      updatedGiveaways.forEach(g => upsertGiveaway(g));
      
      // Definir como ativo no storage
      setActiveGiveawayInStorage(giveawayId);
      
      alert('Giveaway definido como ativo! Agora ele aparecerá na Home.');
    } catch (error) {
      console.error('Error setting giveaway as active:', error);
      alert('Erro ao definir giveaway como ativo');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      prize: '',
      startDate: '',
      endDate: '',
      maxParticipants: '',
      status: 'draft',
      rules: [''],
      winnerAnnouncement: '',
      requirements: DEFAULT_REQUIREMENTS.map((req, index) => ({
        ...req,
        id: `req_${index}`,
      })),
    });
  };

  const openEditDialog = (giveaway: Giveaway) => {
    setSelectedGiveaway(giveaway);
    setFormData({
      title: giveaway.title,
      description: giveaway.description,
      prize: giveaway.prize,
      startDate: giveaway.startDate.split('T')[0],
      endDate: giveaway.endDate.split('T')[0],
      maxParticipants: giveaway.maxParticipants?.toString() || '',
      status: giveaway.status,
      rules: giveaway.rules,
      requirements: giveaway.requirements || DEFAULT_REQUIREMENTS.map((req, index) => ({
        ...req,
        id: `req_${index}`,
      })),
      winnerAnnouncement: giveaway.winnerAnnouncement?.split('T')[0] || '',
    });
    setIsEditDialogOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-4 w-4" />;
      case 'ended': return <Square className="h-4 w-4" />;
      default: return <Pause className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'ended': return 'bg-gray-500';
      default: return 'bg-yellow-500';
    }
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Gift className="h-8 w-8 text-orange-500" />
              🎁 Giveaway Administration
            </h2>
            <p className="text-muted-foreground mt-2">
              Gerencie giveaways, participantes e selecione ganhadores
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="giveaways" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="giveaways" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Giveaways
            </TabsTrigger>
            <TabsTrigger value="winners" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Ganhadores
            </TabsTrigger>
          </TabsList>

          <TabsContent value="giveaways" className="space-y-6">
            {/* Create Button */}
            <div className="flex justify-end">
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                <Plus className="h-4 w-4 mr-2" />
                Novo Giveaway
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>🎁 Criar Novo Giveaway</DialogTitle>
              </DialogHeader>
              <GiveawayForm 
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleCreateGiveaway}
                loading={loading}
                isEdit={false}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Gift className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{giveaways.length}</p>
                  <p className="text-sm text-muted-foreground">Total Giveaways</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Play className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {giveaways.filter(g => g.status === 'active').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {giveaways.reduce((acc, g) => acc + g.currentParticipants, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Participantes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Crown className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {giveaways.filter(g => g.status === 'ended').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Finalizados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Giveaways List */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Giveaways Existentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {giveaways.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum giveaway criado ainda</p>
                  <p className="text-sm">Clique em "Novo Giveaway" para começar</p>
                </div>
              ) : (
                giveaways.map((giveaway) => (
                  <Card key={giveaway.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{giveaway.title}</h3>
                            <Badge className={`${getStatusColor(giveaway.status)} text-white`}>
                              {getStatusIcon(giveaway.status)}
                              <span className="ml-1 capitalize">{giveaway.status}</span>
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {giveaway.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Trophy className="h-4 w-4 text-yellow-500" />
                              {giveaway.prize}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-blue-500" />
                              {giveaway.currentParticipants} participantes
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              Até {new Date(giveaway.endDate).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4 flex-wrap">
                          {giveaway.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSelectWinner(giveaway.id)}
                              className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                            >
                              <Crown className="h-4 w-4 mr-1" />
                              Selecionar Ganhador
                            </Button>
                          )}

                          {giveaway.status !== 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSetAsActive(giveaway.id)}
                              className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Ativar na Home
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(giveaway)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteGiveaway(giveaway.id)}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>✏️ Editar Giveaway</DialogTitle>
                </DialogHeader>
                <GiveawayForm 
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleEditGiveaway}
                  loading={loading}
                  isEdit={true}
                />
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="winners">
            <WinnerManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Componente do formulário
interface GiveawayFormProps {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: () => void;
  loading: boolean;
  isEdit: boolean;
}

function GiveawayForm({ formData, setFormData, onSubmit, loading, isEdit }: GiveawayFormProps) {
  const addRule = () => {
    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, '']
    }));
  };

  const removeRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const updateRule = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.map((rule, i) => i === index ? value : rule)
    }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Nome do giveaway"
          />
        </div>
        
        <div>
          <Label htmlFor="prize">Prêmio</Label>
          <Input
            id="prize"
            value={formData.prize}
            onChange={(e) => setFormData(prev => ({ ...prev, prize: e.target.value }))}
            placeholder="Ex: Starter Pack + 1000 tokens"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Descrição detalhada do prêmio"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="startDate">Data Início</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
          />
        </div>
        
        <div>
          <Label htmlFor="endDate">Data Fim</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
          />
        </div>
        
        <div>
          <Label htmlFor="winnerAnnouncement">Anúncio Ganhador</Label>
          <Input
            id="winnerAnnouncement"
            type="date"
            value={formData.winnerAnnouncement}
            onChange={(e) => setFormData(prev => ({ ...prev, winnerAnnouncement: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="maxParticipants">Máx. Participantes</Label>
          <Input
            id="maxParticipants"
            type="number"
            value={formData.maxParticipants}
            onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: e.target.value }))}
            placeholder="Ex: 1000"
          />
        </div>
        
        <div>
          <Label htmlFor="status">Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="ended">Finalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Regras</Label>
        <div className="space-y-2">
          {formData.rules.map((rule, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={rule}
                onChange={(e) => updateRule(index, e.target.value)}
                placeholder={`Regra ${index + 1}`}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeRule(index)}
                disabled={formData.rules.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addRule}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Regra
          </Button>
        </div>
      </div>

      <RequirementsEditor
        requirements={formData.requirements}
        onChange={(requirements) => setFormData(prev => ({ ...prev, requirements }))}
      />

      <Separator />
      
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          Cancelar
        </Button>
        <Button 
          onClick={onSubmit}
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600"
        >
          {loading ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Giveaway'}
        </Button>
      </div>
    </div>
  );
}