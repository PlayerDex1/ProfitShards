import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { Calculator, TrendingUp, TrendingDown, Minus, MapPin, Trash2, Edit2, Save, X, TestTube } from "lucide-react";

interface MapData {
  id: string;
  name: string;
  level: number;
  tier: number;
  energyCost: number;
}

// Sistema de cargas por tier (como funciona realmente)
const ENERGY_PER_TIER = {
  1: 1, // 1 carga por equipamento × 4 equipamentos = 4 total
  2: 2, // 2 cargas por equipamento × 4 equipamentos = 8 total  
  3: 4, // 4 cargas por equipamento × 4 equipamentos = 16 total
  4: 6  // 6 cargas por equipamento × 4 equipamentos = 24 total
};

// Dados dos mapas L1-L5 baseados na interface do jogo
const MAPS: MapData[] = [
  // Level 1
  { id: 'L1t1', name: 'L1t1', level: 1, tier: 1, energyCost: ENERGY_PER_TIER[1] * 4 },
  { id: 'L1t2', name: 'L1t2', level: 1, tier: 2, energyCost: ENERGY_PER_TIER[2] * 4 },
  { id: 'L1t3', name: 'L1t3', level: 1, tier: 3, energyCost: ENERGY_PER_TIER[3] * 4 },
  { id: 'L1t4', name: 'L1t4', level: 1, tier: 4, energyCost: ENERGY_PER_TIER[4] * 4 },
  // Level 2
  { id: 'L2t1', name: 'L2t1', level: 2, tier: 1, energyCost: ENERGY_PER_TIER[1] * 4 },
  { id: 'L2t2', name: 'L2t2', level: 2, tier: 2, energyCost: ENERGY_PER_TIER[2] * 4 },
  { id: 'L2t3', name: 'L2t3', level: 2, tier: 3, energyCost: ENERGY_PER_TIER[3] * 4 },
  { id: 'L2t4', name: 'L2t4', level: 2, tier: 4, energyCost: ENERGY_PER_TIER[4] * 4 },
  // Level 3
  { id: 'L3t1', name: 'L3t1', level: 3, tier: 1, energyCost: ENERGY_PER_TIER[1] * 4 },
  { id: 'L3t2', name: 'L3t2', level: 3, tier: 2, energyCost: ENERGY_PER_TIER[2] * 4 },
  { id: 'L3t3', name: 'L3t3', level: 3, tier: 3, energyCost: ENERGY_PER_TIER[3] * 4 },
  { id: 'L3t4', name: 'L3t4', level: 3, tier: 4, energyCost: ENERGY_PER_TIER[4] * 4 },
  // Level 4
  { id: 'L4t1', name: 'L4t1', level: 4, tier: 1, energyCost: ENERGY_PER_TIER[1] * 4 },
  { id: 'L4t2', name: 'L4t2', level: 4, tier: 2, energyCost: ENERGY_PER_TIER[2] * 4 },
  { id: 'L4t3', name: 'L4t3', level: 4, tier: 3, energyCost: ENERGY_PER_TIER[3] * 4 },
  { id: 'L4t4', name: 'L4t4', level: 4, tier: 4, energyCost: ENERGY_PER_TIER[4] * 4 },
  // Level 5
  { id: 'L5t1', name: 'L5t1', level: 5, tier: 1, energyCost: ENERGY_PER_TIER[1] * 4 },
  { id: 'L5t2', name: 'L5t2', level: 5, tier: 2, energyCost: ENERGY_PER_TIER[2] * 4 },
  { id: 'L5t3', name: 'L5t3', level: 5, tier: 3, energyCost: ENERGY_PER_TIER[3] * 4 },
  { id: 'L5t4', name: 'L5t4', level: 5, tier: 4, energyCost: ENERGY_PER_TIER[4] * 4 },
];

type MapKey = string;

interface TestMapEntry {
  timestamp: number;
  mapId: string;
  mapName: string;
  level: number;
  tier: number;
  tokensDropped: number;
  energyCost: number;
  totalLuck: number;
  status: 'excellent' | 'positive' | 'negative' | 'neutral';
  efficiency: number;
}

// Funções para gerenciar histórico LOCAL (isolado do sistema principal)
const getTestMapHistory = (): TestMapEntry[] => {
  try {
    const stored = localStorage.getItem('test-map-planner-history');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveTestMapHistory = (history: TestMapEntry[]) => {
  try {
    localStorage.setItem('test-map-planner-history', JSON.stringify(history));
    window.dispatchEvent(new CustomEvent('test-mapdrops-updated'));
  } catch (error) {
    console.error('Erro ao salvar histórico de teste:', error);
  }
};

const appendTestMapEntry = (entry: TestMapEntry) => {
  const history = getTestMapHistory();
  history.unshift(entry); // Adiciona no início
  if (history.length > 50) { // Limite de 50 entradas
    history.splice(50);
  }
  saveTestMapHistory(history);
};

const deleteTestMapEntry = (timestamp: number) => {
  const history = getTestMapHistory().filter(h => h.timestamp !== timestamp);
  saveTestMapHistory(history);
};

const clearTestMapHistory = () => {
  localStorage.removeItem('test-map-planner-history');
  window.dispatchEvent(new CustomEvent('test-mapdrops-updated'));
};

export function TestMapPlanner() {
  const { t } = useI18n();
  
  // Estados principais
  const [selectedMap, setSelectedMap] = useState<string>('L1t1');
  const [tokensDropped, setTokensDropped] = useState<number>(0);
  const [luck, setLuck] = useState<number>(0);
  const [status, setStatus] = useState<'excellent' | 'positive' | 'negative' | 'neutral'>('neutral');
  const [history, setHistory] = useState<TestMapEntry[]>(getTestMapHistory());
  const [saveMessage, setSaveMessage] = useState<string>('');
  
  // Estados para Luck management (baseado no MapPlanner original)
  const [savedLuck, setSavedLuck] = useState<number | null>(null);
  const [isEditingLuck, setIsEditingLuck] = useState<boolean>(false);
  const [tempLuck, setTempLuck] = useState<number>(0);

  // Carregar luck salvo
  useEffect(() => {
    const saved = localStorage.getItem('test-saved-luck');
    if (saved) {
      const parsedLuck = parseInt(saved);
      setSavedLuck(parsedLuck);
      setLuck(parsedLuck);
      setTempLuck(parsedLuck);
    }
  }, []);

  // Listener para atualizações do histórico
  useEffect(() => {
    const onUpd = () => setHistory(getTestMapHistory());
    window.addEventListener('test-mapdrops-updated', onUpd);
    return () => window.removeEventListener('test-mapdrops-updated', onUpd);
  }, []);

  // Encontrar dados do mapa selecionado
  const currentMap = MAPS.find(m => m.id === selectedMap) || MAPS[0];
  
  // Cálculos de eficiência (baseado no MapPlanner original)
  const totalEnergy = currentMap.energyCost;
  const tokensPerEnergy = totalEnergy > 0 ? tokensDropped / totalEnergy : 0;
  const efficiency = tokensPerEnergy;

  // Função para encontrar melhor mapa baseado no luck
  const getBestMap = () => {
    if (luck === 0) return null;
    
    let bestMap = MAPS[0];
    let bestScore = 0;
    
    MAPS.forEach(map => {
      // Algoritmo de recomendação: level + tier vs luck
      const mapScore = (map.level * map.tier * 100);
      const luckFit = Math.abs(luck - mapScore) / luck;
      const efficiency = (map.level * map.tier) / map.energyCost;
      const score = efficiency * (1 - luckFit);
      
      if (score > bestScore) {
        bestScore = score;
        bestMap = map;
      }
    });
    
    return bestMap;
  };

  const recommendedMap = getBestMap();

  // Função para salvar luck
  const saveLuck = () => {
    setSavedLuck(tempLuck);
    setLuck(tempLuck);
    localStorage.setItem('test-saved-luck', tempLuck.toString());
    setIsEditingLuck(false);
  };
  
  const cancelEdit = () => {
    setTempLuck(savedLuck || 0);
    setIsEditingLuck(false);
  };
  
  const unlockLuck = () => {
    setSavedLuck(null);
    setLuck(0);
    localStorage.removeItem('test-saved-luck');
  };

  // Função para aplicar/salvar entrada (ISOLADA - sem D1)
  const apply = async () => {
    if (tokensDropped === 0) {
      setSaveMessage('⚠️ Digite a quantidade de tokens antes de salvar');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    const entry: TestMapEntry = {
      timestamp: Date.now(),
      mapId: selectedMap,
      mapName: currentMap.name,
      level: currentMap.level,
      tier: currentMap.tier,
      tokensDropped,
      energyCost: currentMap.energyCost,
      totalLuck: luck,
      status,
      efficiency: tokensPerEnergy
    };

    try {
      // Salvar APENAS no localStorage (isolado do D1)
      appendTestMapEntry(entry);
      
      // Reset dos campos
      setTokensDropped(0);
      setStatus('neutral');
      
      setSaveMessage(`✅ ${currentMap.name} salvo com ${tokensDropped} tokens (T/E: ${tokensPerEnergy.toFixed(2)})`);
      setTimeout(() => setSaveMessage(''), 5000);
      
      console.log('🧪 TEST: Entrada salva localmente:', entry);
      
    } catch (error) {
      console.error('Erro ao salvar entrada de teste:', error);
      setSaveMessage('❌ Erro ao salvar');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-700 border-green-300';
      case 'positive': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'negative': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <TrendingUp className="w-3 h-3" />;
      case 'positive': return <TrendingUp className="w-3 h-3" />;
      case 'negative': return <TrendingDown className="w-3 h-3" />;
      default: return <Minus className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Map Planner - Teste L1-L5</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">TEST</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          
          {/* Sistema de Luck (Compacto) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">🍀 Luck {savedLuck && <span className="text-xs text-green-600">💾</span>}</label>
            
            <div className="flex items-center space-x-2">
              {savedLuck && !isEditingLuck ? (
                <>
                  <div className="flex-1 h-8 px-2 bg-green-50 border border-green-200 rounded text-sm flex items-center">
                    <span className="font-mono text-green-700">{savedLuck.toLocaleString()}</span>
                  </div>
                  <Button onClick={() => { setTempLuck(savedLuck); setIsEditingLuck(true); }} variant="outline" size="sm" className="h-8 px-2">
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button onClick={unlockLuck} variant="outline" size="sm" className="h-8 px-2 text-red-600">
                    <X className="h-3 w-3" />
                  </Button>
                </>
              ) : (
                <>
                  <Input
                    type="number"
                    value={isEditingLuck ? tempLuck : luck}
                    onChange={(e) => {
                      const value = parseInt(e.target.value || '0');
                      if (isEditingLuck) {
                        setTempLuck(value);
                      } else {
                        setLuck(value);
                      }
                    }}
                    placeholder="Luck (ex: 4517)"
                    className="flex-1 h-8"
                    min="0"
                  />
                  {isEditingLuck ? (
                    <>
                      <Button onClick={saveLuck} size="sm" className="h-8 px-2">
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button onClick={cancelEdit} variant="outline" size="sm" className="h-8 px-2">
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    luck > 0 && (
                      <Button onClick={() => { setTempLuck(luck); saveLuck(); }} size="sm" className="h-8 px-2">
                        <Save className="h-3 w-3" />
                      </Button>
                    )
                  )}
                </>
              )}
            </div>
          </div>

          {/* Seletor de Mapa L1-L5 (Otimizado) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">🗺️ Selecionar Mapa (Use scroll do mouse)</label>
            
            {/* Dropdown principal com scroll otimizado */}
            <div className="relative">
              <select
                value={selectedMap}
                onChange={(e) => setSelectedMap(e.target.value)}
                className="w-full h-9 px-3 bg-background border border-border rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer hover:border-primary/50 transition-colors appearance-none"
                onWheel={(e) => {
                  e.preventDefault();
                  const currentIndex = MAPS.findIndex(m => m.id === selectedMap);
                  if (e.deltaY > 0 && currentIndex < MAPS.length - 1) {
                    setSelectedMap(MAPS[currentIndex + 1].id);
                  } else if (e.deltaY < 0 && currentIndex > 0) {
                    setSelectedMap(MAPS[currentIndex - 1].id);
                  }
                }}
              >
                {MAPS.map(map => {
                  const isRecommended = recommendedMap?.id === map.id;
                  return (
                    <option key={map.id} value={map.id}>
                      {map.name} • L{map.level}t{map.tier} • ⚡{map.energyCost} ({ENERGY_PER_TIER[map.tier as keyof typeof ENERGY_PER_TIER]}×4){isRecommended ? ' ⭐' : ''}
                    </option>
                  );
                })}
              </select>
              
              {/* Ícone de dropdown customizado */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </div>
            </div>
            
            {/* Info compacta do mapa selecionado */}
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs">
              <div className="flex items-center space-x-3">
                <span className="font-medium text-primary">{currentMap.name}</span>
                <span className="text-muted-foreground">L{currentMap.level}t{currentMap.tier}</span>
                <span className="text-muted-foreground">⚡{currentMap.energyCost} ({ENERGY_PER_TIER[currentMap.tier as keyof typeof ENERGY_PER_TIER]}×4)</span>
              </div>
              {recommendedMap && recommendedMap.id === currentMap.id && (
                <span className="text-green-600 font-medium">⭐ Recomendado</span>
              )}
            </div>

            {/* Indicador de navegação por scroll */}
            <div className="text-xs text-center text-muted-foreground bg-muted/50 p-1 rounded">
              🖱️ Use o scroll do mouse para navegar • Sistema: t1=1×4, t2=2×4, t3=4×4, t4=6×4 energia
            </div>
          </div>

          {/* Inputs principais (Compactos) */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">⚡ Energia ({ENERGY_PER_TIER[currentMap.tier as keyof typeof ENERGY_PER_TIER]}×4)</label>
              <Input 
                type="number" 
                value={currentMap.energyCost} 
                readOnly
                className="h-8 bg-muted/50 cursor-not-allowed text-sm"
                title={`${currentMap.name}: ${ENERGY_PER_TIER[currentMap.tier as keyof typeof ENERGY_PER_TIER]} cargas por equipamento × 4 equipamentos = ${currentMap.energyCost} energia total`}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">🪙 Tokens</label>
              <Input 
                type="number" 
                value={tokensDropped} 
                onChange={(e) => setTokensDropped(parseInt(e.target.value || '0'))} 
                className="h-8 text-sm" 
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">📊 Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="h-8 w-full rounded border border-border bg-background text-foreground px-2 text-sm"
              >
                <option value="neutral">Neutro</option>
                <option value="positive">Positivo</option>
                <option value="negative">Negativo</option>
                <option value="excellent">Excelente</option>
              </select>
            </div>
          </div>

          {/* Métricas de Eficiência */}
          {tokensDropped > 0 && (
            <div className="p-3 bg-muted/50 rounded-lg border">
              <div className="text-sm font-medium text-foreground mb-2">Métricas de Eficiência</div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="text-muted-foreground">Tokens/Energia</div>
                  <div className="font-mono font-medium">{tokensPerEnergy.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Energia Total</div>
                  <div className="font-mono font-medium">{totalEnergy}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Level×Tier</div>
                  <div className="font-mono font-medium">{currentMap.level}×{currentMap.tier}</div>
                </div>
              </div>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex items-center gap-2">
            <Button 
              onClick={apply} 
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Salvar Run de Teste
            </Button>
            {history.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => clearTestMapHistory()}
                className="hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500 transition-all duration-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar
              </Button>
            )}
          </div>

          {saveMessage && (
            <div className="text-sm text-center p-2 rounded border bg-muted/50">
              {saveMessage}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info sobre teste */}
      <div className="text-xs text-muted-foreground bg-green-50/50 p-3 rounded border border-green-200/50">
        <div className="font-medium text-green-700 mb-1">🧪 Ambiente de Teste:</div>
        <div className="text-xs">
          • <strong>20 mapas granulares:</strong> L1t1 até L5t4 para análise detalhada<br/>
          • <strong>Sistema de cargas:</strong> t1=1×4, t2=2×4, t3=4×4, t4=6×4 energia<br/>
          • <strong>Dados locais:</strong> Histórico salvo no navegador<br/>
          • <strong>Navegação otimizada:</strong> Use scroll do mouse no dropdown
        </div>
      </div>
      {/* Histórico de Teste (isolado) */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base flex items-center space-x-2">
            <Calculator className="h-4 w-4" />
            <span>Histórico de Teste</span>
            {history.length > 0 && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                {history.length} runs
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhuma run de teste salva ainda</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-auto">
              {history.slice(0, 15).map((h, i) => (
                <div key={i} className="border rounded-lg p-3 bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 rounded text-xs bg-primary/10 text-primary border border-primary/20">
                        {h.mapName}
                      </span>
                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700 border border-green-200">
                        L{h.level}t{h.tier}
                      </span>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs border ${getStatusColor(h.status || 'neutral')}`}>
                        {getStatusIcon(h.status || 'neutral')}
                        <span>{h.status}</span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => deleteTestMapEntry(h.timestamp)}
                      className="h-6 px-2 text-xs"
                    >
                      ✕
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Tokens</div>
                      <div className="font-mono font-medium">{h.tokensDropped.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Energia</div>
                      <div className="font-mono font-medium">{h.energyCost}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Luck</div>
                      <div className="font-mono font-medium">{h.totalLuck.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">T/E</div>
                      <div className="font-mono font-medium">{h.efficiency.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Level×Tier</div>
                      <div className="font-mono font-medium">{h.level}×{h.tier}</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-2">
                    {new Date(h.timestamp).toLocaleString()}
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