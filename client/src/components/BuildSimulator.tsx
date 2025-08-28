import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n";
import { 
  Search, Target, Zap, Coins, Shield, Sword, Crown, 
  TrendingUp, BarChart3, RefreshCw, Sparkles, Calculator
} from "lucide-react";

// Tipos para o simulador
interface Equipment {
  id: string;
  name: string;
  type: 'helmet' | 'armor' | 'weapon' | 'accessory';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  luck: number;
  price: number;
  description: string;
}

interface Build {
  helmet?: Equipment;
  armor?: Equipment;
  weapon?: Equipment;
  accessory?: Equipment;
}

interface SimulationResult {
  totalLuck: number;
  totalCost: number;
  expectedTokens: number;
  efficiency: number;
  roi: number;
  breakEven: number;
}

// Base de dados de equipamentos (exemplo)
const EQUIPMENT_DATABASE: Equipment[] = [
  // Helmets
  { id: 'h1', name: 'Capacete de Ferro', type: 'helmet', rarity: 'common', luck: 50, price: 500, description: 'Proteção básica' },
  { id: 'h2', name: 'Elmo Encantado', type: 'helmet', rarity: 'rare', luck: 120, price: 1500, description: 'Bônus de sorte moderado' },
  { id: 'h3', name: 'Coroa Dourada', type: 'helmet', rarity: 'epic', luck: 250, price: 4000, description: 'Sorte excepcional' },
  { id: 'h4', name: 'Diadema Celestial', type: 'helmet', rarity: 'legendary', luck: 400, price: 8000, description: 'Poder divino' },
  
  // Armors
  { id: 'a1', name: 'Armadura de Couro', type: 'armor', rarity: 'common', luck: 30, price: 300, description: 'Proteção leve' },
  { id: 'a2', name: 'Cota de Malha', type: 'armor', rarity: 'rare', luck: 80, price: 1200, description: 'Resistência aprimorada' },
  { id: 'a3', name: 'Armadura Élfica', type: 'armor', rarity: 'epic', luck: 180, price: 3500, description: 'Elegância e poder' },
  { id: 'a4', name: 'Armadura Dragão', type: 'armor', rarity: 'legendary', luck: 350, price: 7500, description: 'Escamas de dragão' },
  
  // Weapons
  { id: 'w1', name: 'Espada de Ferro', type: 'weapon', rarity: 'common', luck: 40, price: 400, description: 'Lâmina confiável' },
  { id: 'w2', name: 'Lâmina Rúnica', type: 'weapon', rarity: 'rare', luck: 100, price: 1300, description: 'Runas antigas' },
  { id: 'w3', name: 'Espada Flamejante', type: 'weapon', rarity: 'epic', luck: 220, price: 3800, description: 'Fogo eterno' },
  { id: 'w4', name: 'Excalibur', type: 'weapon', rarity: 'legendary', luck: 380, price: 7800, description: 'A espada lendária' },
  
  // Accessories
  { id: 'ac1', name: 'Anel de Ferro', type: 'accessory', rarity: 'common', luck: 20, price: 200, description: 'Simples mas útil' },
  { id: 'ac2', name: 'Anel Mágico', type: 'accessory', rarity: 'rare', luck: 60, price: 800, description: 'Energia mística' },
  { id: 'ac3', name: 'Anel da Fortuna', type: 'accessory', rarity: 'epic', luck: 150, price: 2500, description: 'Sorte suprema' },
  { id: 'ac4', name: 'Anel dos Deuses', type: 'accessory', rarity: 'legendary', luck: 300, price: 6000, description: 'Poder divino' },
];

export function BuildSimulator() {
  const { t } = useI18n();
  const [build, setBuild] = useState<Build>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [budget, setBudget] = useState(5000);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);

  // Filtrar equipamentos
  const filteredEquipments = EQUIPMENT_DATABASE.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Calcular estatísticas do build
  const calculateBuildStats = (currentBuild: Build): SimulationResult => {
    const items = Object.values(currentBuild).filter(Boolean) as Equipment[];
    const totalLuck = items.reduce((sum, item) => sum + item.luck, 0);
    const totalCost = items.reduce((sum, item) => sum + item.price, 0);
    
    // Fórmulas de simulação (baseadas em mecânicas do jogo)
    const expectedTokens = Math.round(totalLuck * 0.18 + Math.random() * 50); // Base + variação
    const efficiency = totalLuck > 0 ? (expectedTokens / totalLuck * 1000) : 0;
    const roi = totalCost > 0 ? ((expectedTokens * 100 - totalCost) / totalCost * 100) : 0;
    const breakEven = totalCost > 0 && expectedTokens > 0 ? Math.ceil(totalCost / expectedTokens) : 0;

    return {
      totalLuck,
      totalCost,
      expectedTokens,
      efficiency,
      roi,
      breakEven
    };
  };

  // Atualizar simulação quando build mudar
  useEffect(() => {
    setSimulation(calculateBuildStats(build));
  }, [build]);

  // Adicionar item ao build
  const addToBuild = (equipment: Equipment) => {
    setBuild(prev => ({
      ...prev,
      [equipment.type]: equipment
    }));
  };

  // Remover item do build
  const removeFromBuild = (type: keyof Build) => {
    setBuild(prev => {
      const newBuild = { ...prev };
      delete newBuild[type];
      return newBuild;
    });
  };

  // Otimizar build automaticamente
  const optimizeBuild = () => {
    // Algoritmo simples: selecionar melhor custo-benefício dentro do orçamento
    const availableItems = EQUIPMENT_DATABASE.filter(item => item.price <= budget / 4);
    
    const bestHelmet = availableItems.filter(i => i.type === 'helmet').sort((a, b) => (b.luck / b.price) - (a.luck / a.price))[0];
    const bestArmor = availableItems.filter(i => i.type === 'armor').sort((a, b) => (b.luck / b.price) - (a.luck / a.price))[0];
    const bestWeapon = availableItems.filter(i => i.type === 'weapon').sort((a, b) => (b.luck / b.price) - (a.luck / a.price))[0];
    const bestAccessory = availableItems.filter(i => i.type === 'accessory').sort((a, b) => (b.luck / b.price) - (a.luck / a.price))[0];

    const optimizedBuild: Build = {};
    if (bestHelmet) optimizedBuild.helmet = bestHelmet;
    if (bestArmor) optimizedBuild.armor = bestArmor;
    if (bestWeapon) optimizedBuild.weapon = bestWeapon;
    if (bestAccessory) optimizedBuild.accessory = bestAccessory;

    setBuild(optimizedBuild);
  };

  // Limpar build
  const clearBuild = () => {
    setBuild({});
  };

  // Cor da raridade
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'rare': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'legendary': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Ícone do tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'helmet': return Crown;
      case 'armor': return Shield;
      case 'weapon': return Sword;
      case 'accessory': return Sparkles;
      default: return Target;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-6 w-6 text-primary" />
            <span>🛠️ Build Simulator</span>
          </CardTitle>
          <p className="text-muted-foreground">
            Teste diferentes combinações de equipamentos e veja qual build oferece melhor ROI
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equipamentos Disponíveis */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">📦 Equipamentos</CardTitle>
            <div className="space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar equipamentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Filter */}
              <div className="flex flex-wrap gap-2">
                {['all', 'helmet', 'armor', 'weapon', 'accessory'].map(type => (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(type)}
                    className="text-xs"
                  >
                    {type === 'all' ? 'Todos' : type}
                  </Button>
                ))}
              </div>

              {/* Budget */}
              <div>
                <label className="text-sm font-medium">💰 Orçamento:</label>
                <Input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {filteredEquipments.map(equipment => {
                const Icon = getTypeIcon(equipment.type);
                const isExpensive = equipment.price > budget;
                
                return (
                  <Card 
                    key={equipment.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${isExpensive ? 'opacity-50' : ''}`}
                    onClick={() => !isExpensive && addToBuild(equipment)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4" />
                          <div>
                            <div className="font-medium text-sm">{equipment.name}</div>
                            <div className="text-xs text-muted-foreground">{equipment.description}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`${getRarityColor(equipment.rarity)} text-xs`}>
                            {equipment.rarity}
                          </Badge>
                          <div className="flex items-center space-x-1 mt-1">
                            <Sparkles className="h-3 w-3 text-purple-500" />
                            <span className="text-xs font-bold">{equipment.luck}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Coins className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs">{equipment.price.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Build Atual */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-lg">⚔️ Seu Build</span>
              <div className="space-x-2">
                <Button size="sm" variant="outline" onClick={optimizeBuild}>
                  <Target className="h-4 w-4 mr-1" />
                  Otimizar
                </Button>
                <Button size="sm" variant="outline" onClick={clearBuild}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Slots de Equipamentos */}
            {(['helmet', 'armor', 'weapon', 'accessory'] as const).map(type => {
              const Icon = getTypeIcon(type);
              const item = build[type];
              
              return (
                <Card key={type} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium capitalize">{type}</div>
                          {item ? (
                            <div>
                              <div className="text-sm font-medium">{item.name}</div>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <span>🍀 {item.luck}</span>
                                <span>💰 {item.price.toLocaleString()}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">Vazio</div>
                          )}
                        </div>
                      </div>
                      {item && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => removeFromBuild(type)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Stats do Build */}
            {simulation && (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3">📊 Estatísticas</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Luck:</span>
                      <span className="font-bold text-purple-600">{simulation.totalLuck.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Custo Total:</span>
                      <span className="font-bold text-yellow-600">{simulation.totalCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Eficiência:</span>
                      <span className="font-bold">{simulation.efficiency.toFixed(1)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Simulação de Resultados */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">📈 Simulação</CardTitle>
          </CardHeader>
          <CardContent>
            {simulation && simulation.totalLuck > 0 ? (
              <div className="space-y-4">
                {/* Simulação Large Map */}
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Large Map Simulation
                    </h4>
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {simulation.expectedTokens}
                        </div>
                        <div className="text-sm text-muted-foreground">tokens esperados</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="text-center p-2 bg-background/50 rounded">
                          <div className="font-bold text-green-600">
                            {simulation.roi > 0 ? '+' : ''}{simulation.roi.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">ROI por run</div>
                        </div>
                        <div className="text-center p-2 bg-background/50 rounded">
                          <div className="font-bold text-orange-600">{simulation.breakEven}</div>
                          <div className="text-xs text-muted-foreground">runs p/ payback</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Projeções */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3">🔮 Projeções</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>1 dia (10 runs):</span>
                        <span className="font-bold text-green-600">
                          +{(simulation.expectedTokens * 10 - simulation.totalCost).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>1 semana (70 runs):</span>
                        <span className="font-bold text-green-600">
                          +{(simulation.expectedTokens * 70 - simulation.totalCost).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>1 mês (300 runs):</span>
                        <span className="font-bold text-green-600">
                          +{(simulation.expectedTokens * 300 - simulation.totalCost).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recomendações */}
                <Card className="border-green-200 bg-green-50 dark:bg-green-950">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2 text-green-700 dark:text-green-300">💡 Dicas</h4>
                    <div className="text-sm text-green-600 dark:text-green-400 space-y-1">
                      {simulation.roi < 10 && <div>• Considere equipamentos com melhor custo-benefício</div>}
                      {simulation.breakEven > 50 && <div>• Payback muito longo, reduza investimento</div>}
                      {simulation.efficiency < 100 && <div>• Eficiência baixa, foque em luck</div>}
                      {simulation.roi > 20 && <div>• ✅ Excelente build! ROI muito bom</div>}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Adicione equipamentos ao seu build para ver a simulação</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}