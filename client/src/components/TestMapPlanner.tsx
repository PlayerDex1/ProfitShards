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

// Dados dos mapas L1-L5 baseados na interface do jogo
const MAPS: MapData[] = [
  // Level 1
  { id: 'L1t1', name: 'L1t1', level: 1, tier: 1, energyCost: 4 },
  { id: 'L1t2', name: 'L1t2', level: 1, tier: 2, energyCost: 5 },
  { id: 'L1t3', name: 'L1t3', level: 1, tier: 3, energyCost: 6 },
  { id: 'L1t4', name: 'L1t4', level: 1, tier: 4, energyCost: 7 },
  // Level 2
  { id: 'L2t1', name: 'L2t1', level: 2, tier: 1, energyCost: 8 },
  { id: 'L2t2', name: 'L2t2', level: 2, tier: 2, energyCost: 9 },
  { id: 'L2t3', name: 'L2t3', level: 2, tier: 3, energyCost: 10 },
  { id: 'L2t4', name: 'L2t4', level: 2, tier: 4, energyCost: 11 },
  // Level 3
  { id: 'L3t1', name: 'L3t1', level: 3, tier: 1, energyCost: 12 },
  { id: 'L3t2', name: 'L3t2', level: 3, tier: 2, energyCost: 13 },
  { id: 'L3t3', name: 'L3t3', level: 3, tier: 3, energyCost: 14 },
  { id: 'L3t4', name: 'L3t4', level: 3, tier: 4, energyCost: 15 },
  // Level 4
  { id: 'L4t1', name: 'L4t1', level: 4, tier: 1, energyCost: 16 },
  { id: 'L4t2', name: 'L4t2', level: 4, tier: 2, energyCost: 17 },
  { id: 'L4t3', name: 'L4t3', level: 4, tier: 3, energyCost: 18 },
  { id: 'L4t4', name: 'L4t4', level: 4, tier: 4, energyCost: 19 },
  // Level 5
  { id: 'L5t1', name: 'L5t1', level: 5, tier: 1, energyCost: 20 },
  { id: 'L5t2', name: 'L5t2', level: 5, tier: 2, energyCost: 21 },
  { id: 'L5t3', name: 'L5t3', level: 5, tier: 3, energyCost: 22 },
  { id: 'L5t4', name: 'L5t4', level: 5, tier: 4, energyCost: 23 },
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
      
      console.log('🧪 TEST: Entrada salva localmente (isolado do D1):', entry);
      
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
      <Card className="bg-gradient-to-br from-purple-50/50 to-blue-50/50 border-purple-200/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TestTube className="h-5 w-5 text-purple-600" />
            <span>Map Planner - Versão Teste Completa (L1-L5)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Sistema de Luck (baseado no MapPlanner original) */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground flex items-center space-x-2">
              <span>🍀 Luck (The Final Attraction Force)</span>
              {savedLuck && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center space-x-1">
                  <Save className="h-3 w-3" />
                  <span>Salvo</span>
                </span>
              )}
            </label>
            
            {savedLuck && !isEditingLuck ? (
              <div className="flex items-center space-x-2">
                <div className="flex-1 h-9 px-3 bg-green-50 border border-green-200 rounded-md flex items-center">
                  <span className="font-mono text-green-700">{savedLuck.toLocaleString()}</span>
                  <span className="ml-2 text-xs text-green-600">💾 Salvo</span>
                </div>
                <Button onClick={() => { setTempLuck(savedLuck); setIsEditingLuck(true); }} variant="outline" size="sm" className="h-9">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button onClick={unlockLuck} variant="outline" size="sm" className="h-9 text-red-600 hover:text-red-700">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
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
                    placeholder="Digite seu luck (ex: 4517)"
                    className="flex-1 h-9"
                    min="0"
                  />
                  {isEditingLuck ? (
                    <>
                      <Button onClick={saveLuck} size="sm" className="h-9">
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button onClick={cancelEdit} variant="outline" size="sm" className="h-9">
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    luck > 0 && (
                      <Button onClick={() => { setTempLuck(luck); saveLuck(); }} size="sm" className="h-9">
                        <Save className="h-4 w-4" />
                      </Button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Seletor de Mapa L1-L5 */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">🗺️ Selecionar Mapa (L1-L5)</label>
            
            {/* Dropdown principal */}
            <select
              value={selectedMap}
              onChange={(e) => setSelectedMap(e.target.value)}
              className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 cursor-pointer hover:border-purple-300 transition-colors"
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
                    {map.name} - Level {map.level} Tier {map.tier} (⚡{map.energyCost}) {isRecommended ? '⭐ Recomendado' : ''}
                  </option>
                );
              })}
            </select>
            
            {/* Info do mapa selecionado */}
            <div className="p-3 bg-muted/50 rounded-md">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{currentMap.name}</span>
                <span className="text-purple-600">Level {currentMap.level} • Tier {currentMap.tier}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                ⚡ Energia: {currentMap.energyCost} • 💰 Recomendado para luck {(currentMap.level * currentMap.tier * 100).toLocaleString()}+
              </div>
            </div>

            {/* Recomendação */}
            {recommendedMap && luck > 0 && (
              <div className="text-xs text-green-600 bg-green-50 p-2 rounded border border-green-200">
                ⭐ <strong>Recomendado:</strong> {recommendedMap.name} é ideal para seu luck atual ({luck.toLocaleString()})
              </div>
            )}

            {/* Grid visual de referência */}
            <div className="mt-3">
              <div className="text-xs font-medium text-muted-foreground mb-2">💡 Seleção rápida:</div>
              <div className="grid grid-cols-5 gap-1">
                {[1, 2, 3, 4, 5].map(level => (
                  <div key={level} className="space-y-1">
                    <div className="text-xs font-medium text-center text-muted-foreground">L{level}</div>
                    {[1, 2, 3, 4].map(tier => {
                      const mapId = `L${level}t${tier}`;
                      const isSelected = selectedMap === mapId;
                      const isRecommended = recommendedMap?.id === mapId;
                      
                      return (
                        <button
                          key={mapId}
                          onClick={() => setSelectedMap(mapId)}
                          className={`w-full px-1 py-1 text-xs rounded border transition-colors ${
                            isSelected
                              ? 'bg-purple-600 text-white border-purple-600'
                              : isRecommended
                              ? 'bg-green-100 text-green-700 border-green-300'
                              : 'bg-background border-border hover:bg-muted'
                          }`}
                          title={`${mapId} - ${MAPS.find(m => m.id === mapId)?.energyCost} energia`}
                        >
                          t{tier}
                          {isRecommended && <span className="ml-1">⭐</span>}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Inputs principais */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                ⚡ Energia <span className="text-xs text-muted-foreground">(automático)</span>
              </label>
              <Input 
                type="number" 
                value={currentMap.energyCost} 
                readOnly
                className="h-9 bg-muted/50 cursor-not-allowed"
                title={`${currentMap.name} consome ${currentMap.energyCost} energia`}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">🪙 Tokens Dropados</label>
              <Input 
                type="number" 
                value={tokensDropped} 
                onChange={(e) => setTokensDropped(parseInt(e.target.value || '0'))} 
                className="h-9" 
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">🍀 Luck Atual</label>
              <Input 
                type="number" 
                value={luck} 
                onChange={(e) => setLuck(parseInt(e.target.value || '0'))} 
                className="h-9"
                min="0"
                disabled={!!savedLuck}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">📊 Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="h-9 w-full rounded border border-border bg-background text-foreground px-2"
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
            <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <div className="text-sm font-medium text-foreground mb-2">📈 Métricas de Eficiência</div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="text-muted-foreground">Tokens/Energia</div>
                  <div className="font-mono font-medium text-purple-600">{tokensPerEnergy.toFixed(2)}</div>
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

          {/* Botão de aplicar */}
          <div className="flex items-center gap-2">
            <Button 
              onClick={apply} 
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-400 hover:to-blue-500 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
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

          {/* Info sobre isolamento */}
          <div className="text-xs text-purple-600 bg-purple-50 p-3 rounded border border-purple-200">
            <div className="font-medium mb-1">🧪 Ambiente de Teste Isolado:</div>
            <ul className="space-y-1 text-xs">
              <li>• <strong>Dados locais:</strong> Salvos apenas no localStorage (não afeta D1)</li>
              <li>• <strong>Dashboard protegido:</strong> Métricas globais permanecem intactas</li>
              <li>• <strong>20 mapas granulares:</strong> L1t1 até L5t4 para análise detalhada</li>
              <li>• <strong>Estrutura completa:</strong> Todas funcionalidades do MapPlanner original</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Teste (isolado) */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base flex items-center space-x-2">
            <TestTube className="h-4 w-4" />
            <span>Histórico de Teste (Isolado)</span>
            {history.length > 0 && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
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
                      <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-700 border border-purple-200">
                        {h.mapName}
                      </span>
                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 border border-blue-200">
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
                      <div className="font-mono font-medium text-purple-600">{h.efficiency.toFixed(2)}</div>
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