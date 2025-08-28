import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Gift, Plus, Edit, Trash2, Save, Clock, Calendar, 
  Users, Trophy, Target, AlertCircle, CheckCircle2,
  FileText, Sparkles
} from "lucide-react";
import { Giveaway } from "@/types/giveaway";
import { RequirementsEditor } from "@/components/RequirementsEditor";
export function MainGiveawaysEditor() {
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [selectedGiveaway, setSelectedGiveaway] = useState<Giveaway | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Carregar giveaways do banco
  const loadGiveaways = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/giveaways/list', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setGiveaways(data.giveaways || []);
      } else {
        console.error('Erro ao carregar giveaways:', response.status);
      }
    } catch (error) {
      console.error('Erro ao carregar giveaways:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar na inicialização
  useEffect(() => {
    loadGiveaways();
  }, []);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prize: '',
    startDate: '',
    endDate: '',
    maxParticipants: '',
    status: 'active' as 'draft' | 'active' | 'ended',
    rules: [''],
    requirements: [] as any[],
    winnerAnnouncement: '',
    imageUrl: ''
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      prize: '',
      startDate: '',
      endDate: '',
      maxParticipants: '',
      status: 'active',
      rules: [''],
      requirements: [],
      winnerAnnouncement: '',
      imageUrl: ''
    });
  };

  const handleCreateGiveaway = async () => {
    setLoading(true);
    try {
      const newGiveaway: Giveaway = {
        id: `giveaway_main_${Date.now()}`,
        title: formData.title,
        description: formData.description,
        prize: formData.prize,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        currentParticipants: 0,
        rules: formData.rules.filter(rule => rule.trim() !== ''),
        requirements: formData.requirements,
        winnerAnnouncement: formData.winnerAnnouncement,
        imageUrl: formData.imageUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const success = await saveToAPI(newGiveaway);
      if (success) {
        setIsCreateDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Erro ao criar giveaway:', error);
      setSaveStatus('error');
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
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        rules: formData.rules.filter(rule => rule.trim() !== ''),
        requirements: formData.requirements,
        winnerAnnouncement: formData.winnerAnnouncement,
        imageUrl: formData.imageUrl,
        updatedAt: new Date().toISOString()
      };

      const success = await saveToAPI(updatedGiveaway);
      if (success) {
        setIsEditDialogOpen(false);
        setSelectedGiveaway(null);
        resetForm();
      }
    } catch (error) {
      console.error('Erro ao editar giveaway:', error);
      setSaveStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGiveaway = async (giveawayId: string) => {
    if (!confirm('Tem certeza que deseja deletar este giveaway?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/giveaways/delete?id=${giveawayId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        // Recarregar lista
        await loadGiveaways();
        
        // Disparar evento para atualizar home
        window.dispatchEvent(new CustomEvent('main-giveaways-updated'));
        
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao deletar giveaway:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (giveaway: Giveaway) => {
    setSelectedGiveaway(giveaway);
    setFormData({
      title: giveaway.title,
      description: giveaway.description,
      prize: giveaway.prize,
      startDate: giveaway.startDate,
      endDate: giveaway.endDate,
      maxParticipants: giveaway.maxParticipants?.toString() || '',
      status: giveaway.status,
      rules: giveaway.rules.length > 0 ? giveaway.rules : [''],
      requirements: giveaway.requirements || [],
      winnerAnnouncement: giveaway.winnerAnnouncement || '',
      imageUrl: giveaway.imageUrl || ''
    });
    setIsEditDialogOpen(true);
  };

  const saveToAPI = async (giveaway: Giveaway) => {
    setSaveStatus('saving');
    try {
      const response = await fetch('/api/giveaways/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(giveaway)
      });

      if (response.ok) {
        setSaveStatus('success');
        
        // Recarregar lista de giveaways
        await loadGiveaways();
        
        // Disparar evento para atualizar em tempo real na home
        window.dispatchEvent(new CustomEvent('main-giveaways-updated'));
        
        // Reset status após 3 segundos
        setTimeout(() => setSaveStatus('idle'), 3000);
        return true;
      } else {
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao salvar na API:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return false;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Ativo</Badge>;
      case 'draft':
        return <Badge variant="secondary">Rascunho</Badge>;
      case 'ended':
        return <Badge variant="destructive">Finalizado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Save Status */}
      {saveStatus !== 'idle' && (
        <div className={`p-4 rounded-lg border flex items-center gap-3 ${
          saveStatus === 'saving' ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' :
          saveStatus === 'success' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' :
          'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
        }`}>
          {saveStatus === 'saving' && <Clock className="h-5 w-5 text-blue-600 animate-spin" />}
          {saveStatus === 'success' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
          {saveStatus === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
          <span className={`font-medium ${
            saveStatus === 'saving' ? 'text-blue-700 dark:text-blue-300' :
            saveStatus === 'success' ? 'text-green-700 dark:text-green-300' :
            'text-red-700 dark:text-red-300'
          }`}>
            {saveStatus === 'saving' && 'Salvando giveaway...'}
            {saveStatus === 'success' && 'Giveaway salvo! Todos os usuários podem ver na Home'}
            {saveStatus === 'error' && 'Erro ao salvar giveaway'}
          </span>
        </div>
      )}

      {/* Create Button */}
      <div className="flex justify-end">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-purple-500 hover:bg-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              Novo Giveaway Principal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>✨ Criar Giveaway Principal</DialogTitle>
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

      {/* Giveaways List */}
      <div className="grid gap-4">
        {giveaways.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum giveaway principal</h3>
              <p className="text-muted-foreground mb-4">
                Crie seu primeiro giveaway principal para aparecer na Home
              </p>
            </CardContent>
          </Card>
        ) : (
          giveaways.map((giveaway) => (
            <Card key={giveaway.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      <CardTitle className="text-lg">{giveaway.title}</CardTitle>
                      {getStatusBadge(giveaway.status)}
                    </div>
                    <p className="text-muted-foreground">{giveaway.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(giveaway)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteGiveaway(giveaway.id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    <span className="font-medium">{giveaway.prize}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">
                      {formatDate(giveaway.startDate)} → {formatDate(giveaway.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      {giveaway.currentParticipants || 0}
                      {giveaway.maxParticipants && ` / ${giveaway.maxParticipants}`} participantes
                    </span>
                  </div>
                </div>
                
                {giveaway.requirements && giveaway.requirements.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Missões ({giveaway.requirements.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {giveaway.requirements.slice(0, 3).map((req, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {req.description} (+{req.points}pts)
                        </Badge>
                      ))}
                      {giveaway.requirements.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{giveaway.requirements.length - 3} mais
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>✏️ Editar Giveaway Principal</DialogTitle>
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
    </div>
  );
}

// Form component
interface GiveawayFormProps {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: () => void;
  loading: boolean;
  isEdit: boolean;
}

function GiveawayForm({ formData, setFormData, onSubmit, loading, isEdit }: GiveawayFormProps) {
  const handleRuleChange = (index: number, value: string) => {
    const newRules = [...formData.rules];
    newRules[index] = value;
    setFormData(prev => ({ ...prev, rules: newRules }));
  };

  const addRule = () => {
    setFormData(prev => ({ ...prev, rules: [...prev.rules, ''] }));
  };

  const removeRule = (index: number) => {
    const newRules = formData.rules.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, rules: newRules }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Ex: 🎁 Mega Giveaway Janeiro"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="prize">Prêmio *</Label>
          <Input
            id="prize"
            value={formData.prize}
            onChange={(e) => setFormData(prev => ({ ...prev, prize: e.target.value }))}
            placeholder="Ex: 1x Game Box + Bonus Items"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição *</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Descreva o giveaway..."
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Data Início *</Label>
          <Input
            id="startDate"
            type="datetime-local"
            value={formData.startDate.slice(0, 16)}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value + ':00Z' }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Data Fim *</Label>
          <Input
            id="endDate"
            type="datetime-local"
            value={formData.endDate.slice(0, 16)}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value + ':00Z' }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="ended">Finalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxParticipants">Máximo de Participantes</Label>
        <Input
          id="maxParticipants"
          type="number"
          value={formData.maxParticipants}
          onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: e.target.value }))}
          placeholder="Ex: 1000 (deixe vazio para ilimitado)"
        />
      </div>

      {/* Rules */}
      <div className="space-y-2">
        <Label>Regras</Label>
        {formData.rules.map((rule, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={rule}
              onChange={(e) => handleRuleChange(index, e.target.value)}
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
        <Button type="button" variant="outline" onClick={addRule}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Regra
        </Button>
      </div>

      {/* Requirements */}
      <div className="space-y-2">
        <Label>Missões para Ganhar Pontos</Label>
        <RequirementsEditor
          requirements={formData.requirements}
          onChange={(requirements) => setFormData(prev => ({ ...prev, requirements }))}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isEdit ? 'Salvar Alterações' : 'Criar Giveaway'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}