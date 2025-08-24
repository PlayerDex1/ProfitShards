import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useI18n } from '../i18n';
import { MapPin, Lock, Unlock, Save, X, Edit2, TrendingUp } from 'lucide-react';

interface MapData {
  id: string;
  name: string;
  energyCost: number;
  level: number;
  tier: number;
}

// Dados dos mapas baseados na imagem (L1t1 até L5t4)
const MAPS: MapData[] = [
  // Level 1
  { id: 'L1t1', name: 'L1t1', energyCost: 4, level: 1, tier: 1 },
  { id: 'L1t2', name: 'L1t2', energyCost: 5, level: 1, tier: 2 },
  { id: 'L1t3', name: 'L1t3', energyCost: 6, level: 1, tier: 3 },
  { id: 'L1t4', name: 'L1t4', energyCost: 7, level: 1, tier: 4 },
  // Level 2
  { id: 'L2t1', name: 'L2t1', energyCost: 8, level: 2, tier: 1 },
  { id: 'L2t2', name: 'L2t2', energyCost: 9, level: 2, tier: 2 },
  { id: 'L2t3', name: 'L2t3', energyCost: 10, level: 2, tier: 3 },
  { id: 'L2t4', name: 'L2t4', energyCost: 11, level: 2, tier: 4 },
  // Level 3
  { id: 'L3t1', name: 'L3t1', energyCost: 12, level: 3, tier: 1 },
  { id: 'L3t2', name: 'L3t2', energyCost: 13, level: 3, tier: 2 },
  { id: 'L3t3', name: 'L3t3', energyCost: 14, level: 3, tier: 3 },
  { id: 'L3t4', name: 'L3t4', energyCost: 15, level: 3, tier: 4 },
  // Level 4
  { id: 'L4t1', name: 'L4t1', energyCost: 16, level: 4, tier: 1 },
  { id: 'L4t2', name: 'L4t2', energyCost: 17, level: 4, tier: 2 },
  { id: 'L4t3', name: 'L4t3', energyCost: 18, level: 4, tier: 3 },
  { id: 'L4t4', name: 'L4t4', energyCost: 19, level: 4, tier: 4 },
  // Level 5
  { id: 'L5t1', name: 'L5t1', energyCost: 20, level: 5, tier: 1 },
  { id: 'L5t2', name: 'L5t2', energyCost: 21, level: 5, tier: 2 },
  { id: 'L5t3', name: 'L5t3', energyCost: 22, level: 5, tier: 3 },
  { id: 'L5t4', name: 'L5t4', energyCost: 23, level: 5, tier: 4 },
];

export function TestMapPlanner() {
  const { t } = useI18n();
  
  // Estados principais
  const [selectedMap, setSelectedMap] = useState<string>('L1t1');
  const [luck, setLuck] = useState<number>(0);
  const [tokensDropped, setTokensDropped] = useState<number>(0);
  const [gemCost, setGemCost] = useState<number>(0);
  
  // Estados para salvar luck
  const [savedLuck, setSavedLuck] = useState<number | null>(null);
  const [isEditingLuck, setIsEditingLuck] = useState<boolean>(false);
  const [tempLuck, setTempLuck] = useState<number>(0);
  
  // Carregar luck salvo do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('test-saved-luck');
    if (saved) {
      const parsedLuck = parseInt(saved);
      setSavedLuck(parsedLuck);
      setLuck(parsedLuck);
      setTempLuck(parsedLuck);
    }
  }, []);
  
  // Encontrar dados do mapa selecionado
  const currentMap = MAPS.find(m => m.id === selectedMap) || MAPS[0];
  
  // Cálculos de eficiência
  const totalEnergyCost = currentMap.energyCost;
  const totalCost = totalEnergyCost + gemCost;
  const efficiency = totalCost > 0 ? tokensDropped / totalCost : 0;
  const luckBonus = luck > 0 ? (luck / 1000) * 0.1 : 0; // Exemplo: cada 1000 luck = +10% bonus
  const estimatedTokens = Math.round(tokensDropped * (1 + luckBonus));
  
  // Função para salvar luck
  const saveLuck = () => {
    setSavedLuck(tempLuck);
    setLuck(tempLuck);
    localStorage.setItem('test-saved-luck', tempLuck.toString());
    setIsEditingLuck(false);
  };
  
  // Função para cancelar edição
  const cancelEdit = () => {
    setTempLuck(savedLuck || 0);
    setIsEditingLuck(false);
  };
  
  // Função para destravar luck
  const unlockLuck = () => {
    setSavedLuck(null);
    setLuck(0);
    localStorage.removeItem('test-saved-luck');
  };
  
  // Encontrar melhor mapa para o luck atual
  const getBestMap = () => {
    if (luck === 0) return null;
    
    let bestMap = MAPS[0];
    let bestEfficiency = 0;
    
    MAPS.forEach(map => {
      // Simulação simples: mapas de level mais alto são melhores para luck mais alto
      const mapEfficiency = (luck * map.level * map.tier) / map.energyCost;
      if (mapEfficiency > bestEfficiency) {
        bestEfficiency = mapEfficiency;
        bestMap = map;
      }
    });
    
    return bestMap;
  };
  
  const recommendedMap = getBestMap();
  
  return (
    <Card className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border-blue-200/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <span>Map Planner - Versão de Teste</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Sistema de Luck com Save/Lock */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground flex items-center space-x-2">
            <span>🍀 Luck (The Final Attraction Force)</span>
            {savedLuck && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center space-x-1">
                <Lock className="h-3 w-3" />
                <span>Salvo</span>
              </span>
            )}
          </label>
          
          {savedLuck && !isEditingLuck ? (
            // Modo locked - mostra luck salvo
            <div className="flex items-center space-x-2">
              <div className="flex-1 h-9 px-3 bg-green-50 border border-green-200 rounded-md flex items-center">
                <span className="font-mono text-green-700">{savedLuck.toLocaleString()}</span>
                <span className="ml-2 text-xs text-green-600">💾 Salvo</span>
              </div>
              <Button
                onClick={() => {
                  setTempLuck(savedLuck);
                  setIsEditingLuck(true);
                }}
                variant="outline"
                size="sm"
                className="h-9"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                onClick={unlockLuck}
                variant="outline"
                size="sm"
                className="h-9 text-red-600 hover:text-red-700"
              >
                <Unlock className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            // Modo editing - permite editar
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
                    <Button
                      onClick={() => {
                        setTempLuck(luck);
                        saveLuck();
                      }}
                      size="sm"
                      className="h-9"
                    >
                      <Lock className="h-4 w-4" />
                    </Button>
                  )
                )}
              </div>
              {!savedLuck && luck > 0 && !isEditingLuck && (
                <p className="text-xs text-blue-600">
                  💡 Clique no 🔒 para salvar este valor de luck
                </p>
              )}
            </div>
          )}
        </div>
        
        {/* Seletor de Mapa */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">🗺️ Selecionar Mapa</label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4, 5].map(level => (
              <div key={level} className="space-y-1">
                <div className="text-xs font-medium text-center text-muted-foreground">
                  Level {level}
                </div>
                {[1, 2, 3, 4].map(tier => {
                  const mapId = `L${level}t${tier}`;
                  const isSelected = selectedMap === mapId;
                  const isRecommended = recommendedMap?.id === mapId;
                  
                  return (
                    <button
                      key={mapId}
                      onClick={() => setSelectedMap(mapId)}
                      className={`w-full px-2 py-1 text-xs rounded border transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : isRecommended
                          ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
                          : 'bg-background border-border hover:bg-muted'
                      }`}
                    >
                      {mapId}
                      {isRecommended && <span className="ml-1">⭐</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          {recommendedMap && luck > 0 && (
            <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
              ⭐ <strong>Recomendado:</strong> {recommendedMap.name} é o melhor mapa para seu luck atual
            </div>
          )}
        </div>
        
        {/* Inputs de dados */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              ⚡ Custo de Energia
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
            <label className="text-sm font-medium text-foreground mb-1 block">
              💎 Custo em Gemas
            </label>
            <Input
              type="number"
              value={gemCost}
              onChange={(e) => setGemCost(parseInt(e.target.value || '0'))}
              placeholder="0"
              className="h-9"
              min="0"
            />
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">
            🪙 Tokens Dropados
          </label>
          <Input
            type="number"
            value={tokensDropped}
            onChange={(e) => setTokensDropped(parseInt(e.target.value || '0'))}
            placeholder="Quantos tokens você dropou?"
            className="h-9"
            min="0"
          />
        </div>
        
        {/* Métricas de Eficiência */}
        {tokensDropped > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 border border-blue-500/20 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Custo Total</div>
              <div className="text-lg font-bold text-blue-600 font-mono">
                {totalCost}
              </div>
              <div className="text-xs text-muted-foreground">
                {currentMap.energyCost}⚡ + {gemCost}💎
              </div>
            </div>
            
            <div className="text-center p-3 bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/20 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Eficiência</div>
              <div className="text-lg font-bold text-green-600 font-mono">
                {efficiency.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">Tokens/Custo</div>
            </div>
            
            <div className="text-center p-3 bg-gradient-to-br from-purple-500/10 to-violet-600/10 border border-purple-500/20 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Bônus Luck</div>
              <div className="text-lg font-bold text-purple-600 font-mono">
                +{(luckBonus * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Com {luck.toLocaleString()}</div>
            </div>
            
            <div className="text-center p-3 bg-gradient-to-br from-orange-500/10 to-red-600/10 border border-orange-500/20 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Estimativa</div>
              <div className="text-lg font-bold text-orange-600 font-mono">
                {estimatedTokens.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Tokens c/ Luck</div>
            </div>
          </div>
        )}
        
        {/* Info sobre o teste */}
        <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded border border-blue-200">
          <div className="font-medium mb-1">🧪 Versão de Teste - Melhorias:</div>
          <ul className="space-y-1 text-xs">
            <li>• <strong>Luck Persistente:</strong> Salve seu valor para não digitar toda vez</li>
            <li>• <strong>20 Mapas:</strong> L1t1 até L5t4 baseados na interface do jogo</li>
            <li>• <strong>Recomendações:</strong> Sistema sugere melhor mapa para seu luck</li>
            <li>• <strong>Custo Completo:</strong> Energia + Gemas para ROI real</li>
          </ul>
        </div>
        
      </CardContent>
    </Card>
  );
}