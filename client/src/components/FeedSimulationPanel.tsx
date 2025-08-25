import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, StopCircle, Settings, Activity, Zap } from "lucide-react";

interface SimulationConfig {
  duration: number;
  intensity: 'low' | 'medium' | 'high' | 'burst';
  agents: string[];
  mapTypes: string[];
  luckRange: [number, number];
}

export function FeedSimulationPanel() {
  const [config, setConfig] = useState<SimulationConfig>({
    duration: 30,
    intensity: 'medium',
    agents: ['bc-test-001', 'bc-test-002', 'bc-test-003'],
    mapTypes: ['medium', 'large'],
    luckRange: [100, 500]
  });

  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const startSimulation = async () => {
    setIsSimulating(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/simulate-feed-activity', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        console.log('✅ Simulação iniciada:', data);
        // Aguardar um pouco e atualizar feed
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('refresh-activity-feed'));
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Erro na simulação:', error);
      setResult({ success: false, error: error.message });
    } finally {
      setIsSimulating(false);
    }
  };

  const presets = {
    light: { duration: 15, intensity: 'low' as const, luckRange: [50, 200] as [number, number] },
    normal: { duration: 30, intensity: 'medium' as const, luckRange: [100, 500] as [number, number] },
    heavy: { duration: 60, intensity: 'high' as const, luckRange: [200, 1000] as [number, number] },
    burst: { duration: 10, intensity: 'burst' as const, luckRange: [500, 2000] as [number, number] }
  };

  const applyPreset = (preset: keyof typeof presets) => {
    setConfig(prev => ({ ...prev, ...presets[preset] }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-blue-500" />
          <span>🧪 Feed Simulation Control</span>
          <Badge variant="outline" className="text-blue-600">TEST MODE</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Presets Rápidos */}
        <div>
          <label className="text-sm font-medium mb-2 block">⚡ Presets Rápidos</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(presets).map(([key, preset]) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(key as keyof typeof presets)}
                className="h-auto py-2 px-3"
              >
                <div className="text-center">
                  <div className="font-medium capitalize">{key}</div>
                  <div className="text-xs text-muted-foreground">
                    {preset.duration}m • {preset.intensity}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Configuração Básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">🕐 Duração (minutos)</label>
            <Input
              type="number"
              min="1"
              max="120"
              value={config.duration}
              onChange={(e) => setConfig(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">⚡ Intensidade</label>
            <Select 
              value={config.intensity} 
              onValueChange={(value: any) => setConfig(prev => ({ ...prev, intensity: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">🟢 Low (0.5x)</SelectItem>
                <SelectItem value="medium">🟡 Medium (1.0x)</SelectItem>
                <SelectItem value="high">🟠 High (2.0x)</SelectItem>
                <SelectItem value="burst">🔴 Burst (5.0x)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Configuração de Luck */}
        <div>
          <label className="text-sm font-medium mb-2 block">🍀 Faixa de Luck</label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={config.luckRange[0]}
              onChange={(e) => setConfig(prev => ({ 
                ...prev, 
                luckRange: [parseInt(e.target.value) || 0, prev.luckRange[1]] 
              }))}
            />
            <Input
              type="number"
              placeholder="Max"
              value={config.luckRange[1]}
              onChange={(e) => setConfig(prev => ({ 
                ...prev, 
                luckRange: [prev.luckRange[0], parseInt(e.target.value) || 1000] 
              }))}
            />
          </div>
        </div>

        {/* Tipos de Mapa */}
        <div>
          <label className="text-sm font-medium mb-2 block">🗺️ Tipos de Mapa</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['small', 'medium', 'large', 'xlarge'].map(mapType => (
              <Button
                key={mapType}
                variant={config.mapTypes.includes(mapType) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setConfig(prev => ({
                    ...prev,
                    mapTypes: prev.mapTypes.includes(mapType)
                      ? prev.mapTypes.filter(t => t !== mapType)
                      : [...prev.mapTypes, mapType]
                  }));
                }}
              >
                {mapType}
              </Button>
            ))}
          </div>
        </div>

        {/* Controles */}
        <div className="flex space-x-2">
          <Button
            onClick={startSimulation}
            disabled={isSimulating || config.mapTypes.length === 0}
            className="flex-1"
          >
            {isSimulating ? (
              <>
                <StopCircle className="h-4 w-4 mr-2 animate-spin" />
                Simulando...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Iniciar Simulação
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.dispatchEvent(new CustomEvent('refresh-activity-feed'))}
          >
            Atualizar Feed
          </Button>
        </div>

        {/* Resultado */}
        {result && (
          <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="font-medium">
              {result.success ? '✅ Simulação Iniciada' : '❌ Erro na Simulação'}
            </div>
            {result.success && (
              <div className="text-sm text-green-700 mt-1">
                {result.runsGenerated} runs geradas • {result.runsSaved} salvas • {result.duration} minutos • {result.intensity}
              </div>
            )}
            {!result.success && (
              <div className="text-sm text-red-700 mt-1">
                {result.error}
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded border border-blue-200">
          <div className="font-medium mb-1">ℹ️ Como Funciona:</div>
          <div>
            • <strong>Dados Isolados:</strong> Simulação usa tabelas de teste<br/>
            • <strong>Agentes Virtuais:</strong> bc-test-001, bc-test-002, etc.<br/>
            • <strong>Zero Impacto:</strong> Não afeta dados de usuários reais<br/>
            • <strong>Feed Realista:</strong> Baseado nas mecânicas do jogo
          </div>
        </div>
      </CardContent>
    </Card>
  );
}