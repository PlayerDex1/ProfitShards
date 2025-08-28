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

// Tipos para o simulador baseados na Wiki oficial do WorldShards
interface Equipment {
  id: string;
  name: string;
  type: 'chestplate' | 'helmet' | 'gloves' | 'boots' | 'weapon' | 'tool';
  weaponType?: 'club' | 'sword_shield' | 'claws' | 'giant_hammer' | 'greatsword' | 'dual_axes';
  toolType?: 'axe' | 'pickaxe' | 'scythe';
  tier: 1 | 2 | 3 | 4 | 5;
  level: 1 | 2 | 3 | 4 | 5;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  luck: number;
  price: number;
  description: string;
  craftingMaterials?: string[];
  isCollectible?: boolean;
}

interface Build {
  chestplate?: Equipment;
  helmet?: Equipment;
  gloves?: Equipment;
  boots?: Equipment;
  weapon?: Equipment;
  tool?: Equipment;
}

interface SimulationResult {
  totalLuck: number;
  totalCost: number;
  expectedTokens: number;
  efficiency: number;
  roi: number;
  breakEven: number;
}

// Base de dados de equipamentos baseados no WorldShards real
const EQUIPMENT_DATABASE: Equipment[] = [
  // === WEAPONS (Based on real WorldShards weapon types) ===
  
  // Clubs (Clavas)
  { id: 'w_club_1', name: 'Clava de Madeira', type: 'weapon', weaponType: 'club', tier: 1, level: 1, rarity: 'common', luck: 25, price: 150, description: 'Arma básica de madeira', craftingMaterials: ['Wood'] },
  { id: 'w_club_2', name: 'Clava de Ferro', type: 'weapon', weaponType: 'club', tier: 2, level: 2, rarity: 'uncommon', luck: 45, price: 400, description: 'Clava resistente de ferro', craftingMaterials: ['Iron', 'Wood'] },
  { id: 'w_club_3', name: 'Clava Arcana', type: 'weapon', weaponType: 'club', tier: 3, level: 3, rarity: 'rare', luck: 85, price: 1200, description: 'Clava imbuída com magia', craftingMaterials: ['Mithril', 'Crystals'] },
  
  // Sword & Shield (Espada e Escudo)
  { id: 'w_sword_1', name: 'Espada e Escudo de Ferro', type: 'weapon', weaponType: 'sword_shield', tier: 1, level: 2, rarity: 'common', luck: 35, price: 300, description: 'Combo equilibrado de ataque e defesa', craftingMaterials: ['Iron', 'Leather'] },
  { id: 'w_sword_2', name: 'Lâmina Real', type: 'weapon', weaponType: 'sword_shield', tier: 2, level: 3, rarity: 'rare', luck: 75, price: 1000, description: 'Armamento de alta qualidade', craftingMaterials: ['Steel', 'Gems'] },
  { id: 'w_sword_3', name: 'Conjunto Celestial', type: 'weapon', weaponType: 'sword_shield', tier: 3, level: 4, rarity: 'epic', luck: 145, price: 3500, description: 'Forjado com metal celestial', craftingMaterials: ['Celestial Metal', 'Divine Essence'] },
  
  // Claws (Garras)
  { id: 'w_claws_1', name: 'Garras de Ferro', type: 'weapon', weaponType: 'claws', tier: 1, level: 1, rarity: 'uncommon', luck: 30, price: 250, description: 'Garras afiadas para ataques rápidos', craftingMaterials: ['Iron', 'Monster Parts'] },
  { id: 'w_claws_2', name: 'Garras Sombrias', type: 'weapon', weaponType: 'claws', tier: 2, level: 3, rarity: 'rare', luck: 70, price: 900, description: 'Garras forjadas na escuridão', craftingMaterials: ['Dark Steel', 'Shadow Essence'] },
  { id: 'w_claws_3', name: 'Garras do Dragão', type: 'weapon', weaponType: 'claws', tier: 3, level: 5, rarity: 'legendary', luck: 165, price: 5000, description: 'Garras de dragão ancestral', craftingMaterials: ['Dragon Scale', 'Ancient Bone'] },
  
  // Giant Hammer (Martelo Gigante)
  { id: 'w_hammer_1', name: 'Martelo de Guerra', type: 'weapon', weaponType: 'giant_hammer', tier: 1, level: 2, rarity: 'common', luck: 40, price: 350, description: 'Martelo pesado devastador', craftingMaterials: ['Iron', 'Stone', 'Wood'] },
  { id: 'w_hammer_2', name: 'Martelo dos Titãs', type: 'weapon', weaponType: 'giant_hammer', tier: 2, level: 4, rarity: 'epic', luck: 110, price: 2800, description: 'Martelo dos antigos titãs', craftingMaterials: ['Titan Steel', 'Elemental Core'] },
  { id: 'w_hammer_3', name: 'Mjolnir Sombrio', type: 'weapon', weaponType: 'giant_hammer', tier: 3, level: 5, rarity: 'legendary', luck: 180, price: 6500, description: 'Martelo lendário dos deuses', craftingMaterials: ['Divine Ore', 'Lightning Essence'] },
  
  // Greatsword (Espada Grande)
  { id: 'w_great_1', name: 'Espadão de Aço', type: 'weapon', weaponType: 'greatsword', tier: 1, level: 2, rarity: 'uncommon', luck: 50, price: 450, description: 'Grande espada de duas mãos', craftingMaterials: ['Steel', 'Refined Metal'] },
  { id: 'w_great_2', name: 'Lâmina do Destino', type: 'weapon', weaponType: 'greatsword', tier: 2, level: 4, rarity: 'rare', luck: 95, price: 2200, description: 'Espada que corta o próprio destino', craftingMaterials: ['Mystic Steel', 'Fate Crystal'] },
  { id: 'w_great_3', name: 'Excalibur das Trevas', type: 'weapon', weaponType: 'greatsword', tier: 3, level: 5, rarity: 'legendary', luck: 190, price: 7000, description: 'A lendária espada corrompida', craftingMaterials: ['Corrupted Mithril', 'Dark Soul'] },
  
  // Dual Axes (Machados Duplos)
  { id: 'w_axes_1', name: 'Machados Gêmeos', type: 'weapon', weaponType: 'dual_axes', tier: 1, level: 1, rarity: 'common', luck: 28, price: 200, description: 'Par de machados balanceados', craftingMaterials: ['Iron', 'Hardwood'] },
  { id: 'w_axes_2', name: 'Machados Flamejantes', type: 'weapon', weaponType: 'dual_axes', tier: 2, level: 3, rarity: 'rare', luck: 88, price: 1800, description: 'Machados envolvidos em chamas', craftingMaterials: ['Fire Steel', 'Flame Core'] },
  { id: 'w_axes_3', name: 'Machados do Apocalipse', type: 'weapon', weaponType: 'dual_axes', tier: 3, level: 4, rarity: 'epic', luck: 155, price: 4200, description: 'Machados que prenunciam o fim', craftingMaterials: ['Void Metal', 'Chaos Essence'] },
  
  // === ARMOR (Baseado no sistema de defesa do WorldShards) ===
  { id: 'a_leather_1', name: 'Armadura de Couro', type: 'armor', tier: 1, level: 1, rarity: 'common', luck: 15, price: 120, description: 'Proteção básica de couro', craftingMaterials: ['Leather', 'Thread'] },
  { id: 'a_chain_1', name: 'Cota de Malha', type: 'armor', tier: 1, level: 2, rarity: 'uncommon', luck: 32, price: 280, description: 'Armadura de anéis metálicos', craftingMaterials: ['Iron', 'Chain Links'] },
  { id: 'a_plate_1', name: 'Armadura de Placas', type: 'armor', tier: 2, level: 2, rarity: 'uncommon', luck: 48, price: 520, description: 'Proteção pesada de placas', craftingMaterials: ['Steel', 'Reinforcement'] },
  { id: 'a_mithril_1', name: 'Armadura de Mithril', type: 'armor', tier: 2, level: 3, rarity: 'rare', luck: 78, price: 1400, description: 'Armadura leve mas resistente', craftingMaterials: ['Mithril', 'Enchanted Thread'] },
  { id: 'a_dragon_1', name: 'Armadura Draconiana', type: 'armor', tier: 3, level: 4, rarity: 'epic', luck: 125, price: 3200, description: 'Feita com escamas de dragão', craftingMaterials: ['Dragon Scale', 'Fire Resistance'] },
  { id: 'a_celestial_1', name: 'Armadura Celestial', type: 'armor', tier: 3, level: 5, rarity: 'legendary', luck: 175, price: 5800, description: 'Proteção dos próprios céus', craftingMaterials: ['Celestial Plate', 'Divine Blessing'] },
  
  // === HELMETS (Proteção de cabeça) ===
  { id: 'h_iron_1', name: 'Capacete de Ferro', type: 'helmet', tier: 1, level: 1, rarity: 'common', luck: 18, price: 100, description: 'Proteção básica para a cabeça', craftingMaterials: ['Iron', 'Padding'] },
  { id: 'h_steel_1', name: 'Elmo de Aço', type: 'helmet', tier: 1, level: 2, rarity: 'uncommon', luck: 35, price: 240, description: 'Elmo resistente de aço', craftingMaterials: ['Steel', 'Leather Padding'] },
  { id: 'h_knight_1', name: 'Elmo de Cavaleiro', type: 'helmet', tier: 2, level: 2, rarity: 'uncommon', luck: 52, price: 450, description: 'Elmo nobre com plumas', craftingMaterials: ['Fine Steel', 'Noble Crest'] },
  { id: 'h_crown_1', name: 'Coroa de Batalha', type: 'helmet', tier: 2, level: 3, rarity: 'rare', luck: 82, price: 1100, description: 'Coroa que confere autoridade', craftingMaterials: ['Gold', 'Battle Gems'] },
  { id: 'h_dragon_1', name: 'Elmo Draconiano', type: 'helmet', tier: 3, level: 4, rarity: 'epic', luck: 118, price: 2900, description: 'Elmo moldado em forma de dragão', craftingMaterials: ['Dragon Horn', 'Mystic Alloy'] },
  { id: 'h_divine_1', name: 'Diadema Divino', type: 'helmet', tier: 3, level: 5, rarity: 'legendary', luck: 165, price: 5200, description: 'Diadema abençoado pelos deuses', craftingMaterials: ['Divine Crystal', 'Heavenly Gold'] },
  
  // === TOOLS (Ferramentas de coleta baseadas no WorldShards) ===
  { id: 't_axe_1', name: 'Machado de Madeira', type: 'tool', tier: 1, level: 1, rarity: 'common', luck: 20, price: 80, description: 'Ferramenta básica para cortar árvores', craftingMaterials: ['Wood', 'Stone'] },
  { id: 't_axe_2', name: 'Machado de Ferro', type: 'tool', tier: 1, level: 2, rarity: 'uncommon', luck: 38, price: 180, description: 'Machado mais eficiente', craftingMaterials: ['Iron', 'Hardwood'] },
  { id: 't_pickaxe_1', name: 'Picareta de Ferro', type: 'tool', tier: 1, level: 2, rarity: 'uncommon', luck: 35, price: 160, description: 'Para mineração básica', craftingMaterials: ['Iron', 'Wood Handle'] },
  { id: 't_pickaxe_2', name: 'Picareta de Mithril', type: 'tool', tier: 2, level: 3, rarity: 'rare', luck: 72, price: 850, description: 'Minera materiais raros', craftingMaterials: ['Mithril', 'Reinforced Handle'] },
  { id: 't_multi_1', name: 'Ferramenta Universal', type: 'tool', tier: 2, level: 4, rarity: 'epic', luck: 105, price: 2400, description: 'Corta e minera com eficiência', craftingMaterials: ['Multi-Alloy', 'Versatile Core'] },
  { id: 't_legendary_1', name: 'Ferramenta do Artesão', type: 'tool', tier: 3, level: 5, rarity: 'legendary', luck: 155, price: 4800, description: 'Ferramenta mágica suprema', craftingMaterials: ['Master Alloy', 'Artisan Soul'] },
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

  // Calcular estatísticas do build (baseado no sistema WorldShards real)
  const calculateBuildStats = (currentBuild: Build): SimulationResult => {
    const items = Object.values(currentBuild).filter(Boolean) as Equipment[];
    const totalLuck = items.reduce((sum, item) => sum + item.luck, 0);
    const totalCost = items.reduce((sum, item) => sum + item.price, 0);
    
    // Fórmulas de simulação baseadas no WorldShards
    // - Luck afeta diretamente a chance de drop de tokens
    // - Base tokens por Large Map: ~200-300 com 0 luck
    // - Cada ponto de luck aumenta em ~0.15-0.25 tokens esperados
    // - Tier e Level dos itens também influenciam
    
    const baseLargeMapTokens = 240; // Base para Large Map sem luck
    const luckMultiplier = 0.2; // Cada ponto de luck = +0.2 tokens esperados
    const tierBonus = items.reduce((sum, item) => sum + (item.tier * 5), 0); // Tier bonus
    const levelBonus = items.reduce((sum, item) => sum + (item.level * 3), 0); // Level bonus
    
    const expectedTokens = Math.round(
      baseLargeMapTokens + 
      (totalLuck * luckMultiplier) + 
      tierBonus + 
      levelBonus +
      (Math.random() * 40 - 20) // Variação ±20 tokens
    );
    
    const efficiency = totalLuck > 0 ? (expectedTokens / totalLuck * 100) : 0;
    const tokenValue = 1.0; // Proxy tokens value (ajustável)
    const grossProfit = expectedTokens * tokenValue;
    const netProfit = grossProfit - totalCost;
    const roi = totalCost > 0 ? (netProfit / totalCost * 100) : 0;
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

  // Cor da raridade (atualizada com 'uncommon')
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300';
      case 'uncommon': return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300';
      case 'rare': return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900 dark:text-purple-300';
      case 'legendary': return 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Ícone do tipo (atualizado para WorldShards)
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'helmet': return Crown;
      case 'armor': return Shield;
      case 'weapon': return Sword;
      case 'tool': return Zap; // Ferramentas de coleta
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
            <span>🛠️ Build Simulator - WorldShards</span>
          </CardTitle>
          <p className="text-muted-foreground">
            Teste combinações de equipamentos baseados no sistema real do WorldShards. 
            Simule builds com armas (6 tipos), armaduras, capacetes e ferramentas. 
            Veja como Tier, Level e Luck afetam seus tokens em Large Maps.
          </p>
          <div className="flex flex-wrap gap-2 mt-3 text-xs">
            <Badge variant="outline">🎯 6 Tipos de Armas</Badge>
            <Badge variant="outline">⚡ Sistema Tier/Level</Badge>
            <Badge variant="outline">🍀 Luck Baseado no Jogo</Badge>
            <Badge variant="outline">💰 ROI Realista</Badge>
          </div>
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
                {['all', 'chestplate', 'helmet', 'gloves', 'boots', 'weapon', 'tool'].map(type => (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(type)}
                    className="text-xs"
                  >
                    {type === 'all' ? 'Todos' : 
                     type === 'chestplate' ? 'Peitorais' :
                     type === 'helmet' ? 'Elmos' :
                     type === 'gloves' ? 'Luvas' :
                     type === 'boots' ? 'Botas' :
                     type === 'weapon' ? 'Armas' :
                     type === 'tool' ? 'Ferramentas' : type}
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
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                T{equipment.tier}
                              </Badge>
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                L{equipment.level}
                              </Badge>
                              {equipment.weaponType && (
                                <Badge variant="secondary" className="text-xs px-1 py-0">
                                  {equipment.weaponType.replace('_', ' ')}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`${getRarityColor(equipment.rarity)} text-xs mb-1`}>
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
            {(['helmet', 'armor', 'weapon', 'tool'] as const).map(type => {
              const Icon = getTypeIcon(type);
              const item = build[type];
              
              return (
                <Card key={type} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium capitalize">
                            {type === 'helmet' ? 'Capacete' :
                             type === 'armor' ? 'Armadura' :
                             type === 'weapon' ? 'Arma' :
                             type === 'tool' ? 'Ferramenta' : type}
                          </div>
                          {item ? (
                            <div>
                              <div className="text-sm font-medium">{item.name}</div>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-1">
                                <Badge variant="outline" className="text-xs px-1 py-0">T{item.tier}</Badge>
                                <Badge variant="outline" className="text-xs px-1 py-0">L{item.level}</Badge>
                                <Badge className={`${getRarityColor(item.rarity)} text-xs px-1 py-0`}>
                                  {item.rarity}
                                </Badge>
                              </div>
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