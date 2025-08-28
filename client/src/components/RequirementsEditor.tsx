import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Target, Plus, Edit, Trash2, Move, Save, X, Check,
  Twitter, MessageCircle, Calculator, Map, Share2, 
  LogIn, ExternalLink, Star, AlertTriangle
} from "lucide-react";
import { GiveawayRequirement } from "@/types/giveaway";

interface RequirementsEditorProps {
  requirements: GiveawayRequirement[];
  onChange: (requirements: GiveawayRequirement[]) => void;
  className?: string;
}

export function RequirementsEditor({ requirements, onChange, className }: RequirementsEditorProps) {
  const [editingRequirement, setEditingRequirement] = useState<GiveawayRequirement | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'login' as GiveawayRequirement['type'],
    description: '',
    points: 1,
    url: '',
    required: false,
  });

  const requirementTypes = [
    { value: 'login', label: 'Login Diário', icon: LogIn, description: 'Usuário faz login no site' },
    { value: 'twitter_follow', label: 'Seguir Twitter', icon: Twitter, description: 'Seguir conta no Twitter' },
    { value: 'discord_join', label: 'Entrar Discord', icon: MessageCircle, description: 'Entrar no servidor Discord' },
    { value: 'use_calculator', label: 'Usar Calculadora', icon: Calculator, description: 'Usar calculadora do site' },
    { value: 'use_planner', label: 'Usar Planejador', icon: Map, description: 'Usar planejador de mapa' },
    { value: 'share_social', label: 'Compartilhar', icon: Share2, description: 'Compartilhar nas redes sociais' },
  ];

  const getTypeInfo = (type: string) => {
    return requirementTypes.find(t => t.value === type) || requirementTypes[0];
  };

  const handleCreateRequirement = () => {
    const newRequirement: GiveawayRequirement = {
      id: `req_${Date.now()}`,
      type: formData.type,
      description: formData.description,
      points: formData.points,
      url: formData.url || undefined,
      required: formData.required,
    };

    onChange([...requirements, newRequirement]);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleEditRequirement = () => {
    if (!editingRequirement) return;

    const updatedRequirements = requirements.map(req =>
      req.id === editingRequirement.id
        ? {
            ...req,
            type: formData.type,
            description: formData.description,
            points: formData.points,
            url: formData.url || undefined,
            required: formData.required,
          }
        : req
    );

    onChange(updatedRequirements);
    setIsEditDialogOpen(false);
    setEditingRequirement(null);
    resetForm();
  };

  const handleDeleteRequirement = (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta missão?')) return;
    onChange(requirements.filter(req => req.id !== id));
  };

  const openEditDialog = (requirement: GiveawayRequirement) => {
    setEditingRequirement(requirement);
    setFormData({
      type: requirement.type,
      description: requirement.description,
      points: requirement.points,
      url: requirement.url || '',
      required: requirement.required,
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      type: 'login',
      description: '',
      points: 1,
      url: '',
      required: false,
    });
  };

  const moveRequirement = (index: number, direction: 'up' | 'down') => {
    const newRequirements = [...requirements];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newRequirements.length) {
      [newRequirements[index], newRequirements[targetIndex]] = 
      [newRequirements[targetIndex], newRequirements[index]];
      onChange(newRequirements);
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                🎯 Missões para Ganhar Pontos
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Configure as missões que os usuários devem completar para ganhar pontos
              </p>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                  <Plus className="h-4 w-4 mr-1" />
                  Nova Missão
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>🎯 Criar Nova Missão</DialogTitle>
                </DialogHeader>
                <RequirementForm 
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleCreateRequirement}
                  requirementTypes={requirementTypes}
                  isEdit={false}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          {requirements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma missão configurada</p>
              <p className="text-sm">Clique em "Nova Missão" para começar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requirements.map((requirement, index) => {
                const typeInfo = getTypeInfo(requirement.type);
                const Icon = typeInfo.icon;
                
                return (
                  <Card key={requirement.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <Icon className="h-5 w-5 text-blue-500" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{requirement.description}</h4>
                              <Badge 
                                variant={requirement.required ? "default" : "secondary"}
                                className={requirement.required ? "bg-orange-500" : ""}
                              >
                                {requirement.required ? (
                                  <>
                                    <Star className="h-3 w-3 mr-1" />
                                    Obrigatório
                                  </>
                                ) : (
                                  'Opcional'
                                )}
                              </Badge>
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                +{requirement.points} pts
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {typeInfo.description}
                              {requirement.url && (
                                <span className="ml-2 inline-flex items-center gap-1">
                                  <ExternalLink className="h-3 w-3" />
                                  <a 
                                    href={requirement.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                  >
                                    {requirement.url.length > 30 
                                      ? `${requirement.url.substring(0, 30)}...` 
                                      : requirement.url
                                    }
                                  </a>
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moveRequirement(index, 'up')}
                            disabled={index === 0}
                            className="h-8 w-8 p-0"
                          >
                            ↑
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moveRequirement(index, 'down')}
                            disabled={index === requirements.length - 1}
                            className="h-8 w-8 p-0"
                          >
                            ↓
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDialog(requirement)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteRequirement(requirement.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          
          {requirements.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border">
              <div className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Resumo:</span>
                <span>{requirements.length} missões configuradas</span>
                <span>•</span>
                <span>{requirements.filter(r => r.required).length} obrigatórias</span>
                <span>•</span>
                <span>Máximo de {requirements.reduce((sum, r) => sum + r.points, 0)} pontos</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>✏️ Editar Missão</DialogTitle>
          </DialogHeader>
          <RequirementForm 
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleEditRequirement}
            requirementTypes={requirementTypes}
            isEdit={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente do formulário
interface RequirementFormProps {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: () => void;
  requirementTypes: any[];
  isEdit: boolean;
}

function RequirementForm({ formData, setFormData, onSubmit, requirementTypes, isEdit }: RequirementFormProps) {
  const selectedType = requirementTypes.find(t => t.value === formData.type);
  const showUrlField = ['twitter_follow', 'discord_join', 'share_social'].includes(formData.type);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="type">Tipo de Missão</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {requirementTypes.map((type) => {
              const Icon = type.icon;
              return (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{type.label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {selectedType && (
          <p className="text-xs text-muted-foreground mt-1">
            {selectedType.description}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Ex: Seguir @playerhold no Twitter"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="points">Pontos</Label>
          <Input
            id="points"
            type="number"
            min="1"
            max="100"
            value={formData.points}
            onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
          />
        </div>
        
        <div className="flex items-center space-x-2 pt-6">
          <input
            type="checkbox"
            id="required"
            checked={formData.required}
            onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
            className="rounded border-gray-300"
          />
          <Label htmlFor="required" className="text-sm">
            Missão obrigatória
          </Label>
        </div>
      </div>

      {showUrlField && (
        <div>
          <Label htmlFor="url">URL (opcional)</Label>
          <Input
            id="url"
            type="url"
            value={formData.url}
            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            placeholder="Ex: https://x.com/playerhold"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Link para onde o usuário deve ir para completar a missão
          </p>
        </div>
      )}

      <Separator />
      
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Cancelar
        </Button>
        <Button onClick={onSubmit} className="bg-blue-500 hover:bg-blue-600">
          <Save className="h-4 w-4 mr-2" />
          {isEdit ? 'Salvar Alterações' : 'Criar Missão'}
        </Button>
      </div>
    </div>
  );
}