import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useDataSync } from '@/hooks/use-data-sync';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function DataSyncDebug() {
  const { isAuthenticated, user } = useAuth();
  const { isLoading, lastSync, loadServerData, saveCalculationToServer } = useDataSync();
  const [serverData, setServerData] = useState<any>(null);
  const [testResult, setTestResult] = useState<string>('');

  const testServerConnection = async () => {
    if (!isAuthenticated) {
      setTestResult('❌ Usuário não autenticado');
      return;
    }

    try {
      setTestResult('🔄 Testando conexão com servidor...');
      
      // Teste 1: Carregar dados do servidor
      const data = await loadServerData();
      setServerData(data);
      
      if (data) {
        setTestResult(`✅ Dados carregados: ${data.calculations?.length || 0} cálculos, ${data.equipmentBuilds?.length || 0} builds`);
      } else {
        setTestResult('⚠️ Nenhum dado encontrado no servidor');
      }
      
      // Teste 2: Salvar um cálculo de teste
      const testCalculation = {
        weaponGems: 10,
        weaponTokens: 5,
        armorGems: 8,
        armorTokens: 3,
        axeGems: 6,
        axeTokens: 2,
        pickaxeGems: 4,
        pickaxeTokens: 1,
        tokensFarmed: 100,
        loadsUsed: 1,
        tokenPrice: 0.001,
        gemPrice: 0.00714
      };
      
      const testResults = {
        finalProfit: 50,
        roi: 25,
        gemsCost: 20,
        totalTokens: 100
      };
      
      const saved = await saveCalculationToServer(testCalculation, testResults);
      if (saved) {
        setTestResult(prev => prev + ' | ✅ Teste de salvamento: OK');
      } else {
        setTestResult(prev => prev + ' | ❌ Teste de salvamento: FALHOU');
      }
      
    } catch (error) {
      setTestResult(`❌ Erro: ${error.message}`);
    }
  };

  const checkLocalStorage = () => {
    const history = localStorage.getItem('worldshards-history');
    const mapDrops = localStorage.getItem('worldshards-map-drops');
    const equipmentBuilds = localStorage.getItem('worldshards-equip-builds-' + user);
    
    console.log('📊 LocalStorage Debug:');
    console.log('- History:', history ? JSON.parse(history).length + ' itens' : 'vazio');
    console.log('- Map Drops:', mapDrops ? JSON.parse(mapDrops).length + ' itens' : 'vazio');
    console.log('- Equipment Builds:', equipmentBuilds ? JSON.parse(equipmentBuilds).length + ' itens' : 'vazio');
  };

  const forceSync = async () => {
    if (!isAuthenticated) {
      setTestResult('❌ Usuário não autenticado');
      return;
    }

    try {
      setTestResult('🔄 Forçando sincronização...');
      
      // Recarregar dados do servidor
      const data = await loadServerData();
      setServerData(data);
      
      if (data?.calculations) {
        // Atualizar localStorage com dados do servidor
        const mapDrops = data.calculations
          .filter((calc: any) => calc.type === 'mapdrops')
          .map((calc: any) => calc.data);
        
        const profitCalculations = data.calculations
          .filter((calc: any) => calc.type === 'profit')
          .map((calc: any) => ({
            timestamp: calc.createdAt,
            formData: calc.data,
            results: calc.results
          }));
        
        if (mapDrops.length > 0) {
          localStorage.setItem('worldshards-map-drops', JSON.stringify(mapDrops));
          window.dispatchEvent(new CustomEvent('worldshards-mapdrops-updated'));
        }
        
        if (profitCalculations.length > 0) {
          localStorage.setItem('worldshards-history', JSON.stringify(profitCalculations));
          window.dispatchEvent(new CustomEvent('worldshards-history-updated'));
        }
        
        setTestResult(`✅ Sincronização forçada: ${mapDrops.length} map drops, ${profitCalculations.length} cálculos`);
      } else {
        setTestResult('⚠️ Nenhum dado encontrado no servidor');
      }
      
    } catch (error) {
      setTestResult(`❌ Erro na sincronização: ${error.message}`);
    }
  };

  useEffect(() => {
    checkLocalStorage();
  }, []);

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🔧 Debug de Sincronização</CardTitle>
        </CardHeader>
        <CardContent>
          <p>❌ Usuário não autenticado - faça login para testar a sincronização</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔧 Debug de Sincronização</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p><strong>Usuário:</strong> {user}</p>
          <p><strong>Status:</strong> {isLoading ? '🔄 Sincronizando...' : '✅ Pronto'}</p>
          <p><strong>Última Sincronização:</strong> {lastSync ? new Date(lastSync).toLocaleString() : 'Nunca'}</p>
        </div>
        
        <div className="space-y-2">
          <Button onClick={testServerConnection} disabled={isLoading}>
            🧪 Testar Conexão com Servidor
          </Button>
          <Button onClick={forceSync} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
            🔄 Forçar Sincronização
          </Button>
          <Button onClick={checkLocalStorage} variant="outline">
            📊 Verificar LocalStorage
          </Button>
        </div>
        
        {testResult && (
          <div className="p-3 bg-muted rounded-lg">
            <p><strong>Resultado do Teste:</strong></p>
            <p>{testResult}</p>
          </div>
        )}
        
        {serverData && (
          <div className="p-3 bg-muted rounded-lg">
            <p><strong>Dados do Servidor:</strong></p>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(serverData, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}