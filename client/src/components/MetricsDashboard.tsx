import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface LuckRange {
  range: string;
  min: number;
  max: number;
  runs: number;
  totalTokens: number;
  avgTokens: number;
  users?: number;
}

interface LocalMapData {
  timestamp: number;
  mapSize: string;
  tokensDropped: number;
  totalLuck?: number;
  luck?: number;
  loads?: number;
}

interface GlobalMetricsData {
  success: boolean;
  totalRuns: number;
  totalTokens: number;
  uniqueUsers: number;
  totalRegisteredUsers: number;
  luckRanges: LuckRange[];
  rawData: any[];
}

export function MetricsDashboard() {
  const [activeTab, setActiveTab] = useState<'local' | 'global'>('local');
  
  // Local data state
  const [luckRanges, setLuckRanges] = useState<LuckRange[]>([]);
  const [totalRuns, setTotalRuns] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  
  // Global data state
  const [globalData, setGlobalData] = useState<GlobalMetricsData | null>(null);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [tableStatus, setTableStatus] = useState<any>(null);

  const loadLocalData = () => {
    console.log('📊 Carregando dados locais...');
    const allData: LocalMapData[] = [];

    // 1. Dados novos: worldshards-mapdrops-history (atual)
    try {
      const currentData = localStorage.getItem('worldshards-mapdrops-history');
      if (currentData) {
        const parsed = JSON.parse(currentData);
        if (Array.isArray(parsed)) {
          allData.push(...parsed);
          console.log('✅ Dados atuais:', parsed.length, 'registros');
        }
      }
    } catch (error) {
      console.log('⚠️ Erro ao ler dados atuais:', error);
    }

    // 2. Dados antigos: worldshards-mapdrops-{email}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('worldshards-mapdrops-') || key === 'worldshards-mapdrops-history') continue;

      try {
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        if (Array.isArray(data)) {
          allData.push(...data);
          console.log('✅ Dados antigos de', key, ':', data.length, 'registros');
        }
      } catch (error) {
        console.log('⚠️ Erro ao ler', key, ':', error);
      }
    }

    console.log('📊 Total de dados coletados:', allData.length);

    // Processar dados por faixas de luck
    const ranges = [
      { range: '1k - 2k Luck', min: 1000, max: 1999 },
      { range: '2k - 3k Luck', min: 2000, max: 2999 },
      { range: '3k - 4k Luck', min: 3000, max: 3999 },
      { range: '4k - 5k Luck', min: 4000, max: 4999 },
      { range: '5k - 6k Luck', min: 5000, max: 5999 },
      { range: '6k - 7k Luck', min: 6000, max: 6999 },
      { range: '7k - 8k Luck', min: 7000, max: 7999 },
      { range: '8k+ Luck', min: 8000, max: 999999 },
    ];

    const processedRanges: LuckRange[] = ranges.map(({ range, min, max }) => {
      const rangeData = allData.filter(item => {
        const luck = item.totalLuck || item.luck || 0;
        return luck >= min && luck <= max;
      });

      const totalTokens = rangeData.reduce((sum, item) => sum + (item.tokensDropped || 0), 0);
      const avgTokens = rangeData.length > 0 ? totalTokens / rangeData.length : 0;

      return {
        range,
        min,
        max,
        runs: rangeData.length,
        totalTokens,
        avgTokens
      };
    });

    const totalRunsCount = allData.length;
    const totalTokensCount = allData.reduce((sum, item) => sum + (item.tokensDropped || 0), 0);

    setLuckRanges(processedRanges);
    setTotalRuns(totalRunsCount);
    setTotalTokens(totalTokensCount);

    console.log('📊 Processamento concluído:', {
      totalRuns: totalRunsCount,
      totalTokens: totalTokensCount,
      ranges: processedRanges
    });
  };

  const loadGlobalData = async () => {
    console.log('🌍 Carregando dados globais...');
    setGlobalLoading(true);
    setGlobalError(null);
    
    try {
      // Tentar API normal primeiro
      let response = await fetch('/api/admin/global-metrics', {
        credentials: 'include'
      });

      // Se falhar, usar API local
      if (!response.ok) {
        console.log('🔄 API principal falhou, usando API local...');
        response = await fetch('/api/admin/global-metrics-local', {
          credentials: 'include'
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🌍 Resposta da API:', data);
      
      // Se a API indicar para usar localStorage, processar localmente
      if (data.useLocalStorage) {
        console.log('📊 Processando dados localmente...');
        const processedData = processLocalStorageGlobally();
        setGlobalData(processedData);
      } else {
        setGlobalData(data);
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados globais:', error);
      setGlobalError(error.message);
    } finally {
      setGlobalLoading(false);
    }
  };

  const processLocalStorageGlobally = () => {
    console.log('📊 Processando localStorage globalmente...');
    
    // Coletar TODOS os dados do localStorage (incluindo outros usuários se existirem)
    const allData: LocalMapData[] = [];
    const userEmails = new Set<string>();
    
    // Dados atuais (sem email específico)
    try {
      const currentData = localStorage.getItem('worldshards-mapdrops-history');
      if (currentData) {
        const parsed = JSON.parse(currentData);
        if (Array.isArray(parsed)) {
          allData.push(...parsed);
          userEmails.add('current-user'); // Usuário atual
        }
      }
    } catch (error) {
      console.log('⚠️ Erro ao ler dados atuais:', error);
    }

    // Dados de usuários específicos (chaves com email)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('worldshards-mapdrops-') || key === 'worldshards-mapdrops-history') continue;

      try {
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        if (Array.isArray(data)) {
          allData.push(...data);
          const email = key.replace('worldshards-mapdrops-', '');
          userEmails.add(email);
        }
      } catch (error) {
        console.log('⚠️ Erro ao ler', key, ':', error);
      }
    }

    console.log(`📊 Dados coletados: ${allData.length} registros de ${userEmails.size} usuários`);

    // Processar faixas de luck
    const ranges = [
      { range: '1k - 2k Luck', min: 1000, max: 1999 },
      { range: '2k - 3k Luck', min: 2000, max: 2999 },
      { range: '3k - 4k Luck', min: 3000, max: 3999 },
      { range: '4k - 5k Luck', min: 4000, max: 4999 },
      { range: '5k - 6k Luck', min: 5000, max: 5999 },
      { range: '6k - 7k Luck', min: 6000, max: 6999 },
      { range: '7k - 8k Luck', min: 7000, max: 7999 },
      { range: '8k+ Luck', min: 8000, max: 999999 },
    ];

    const processedRanges = ranges.map(({ range, min, max }) => {
      const rangeData = allData.filter(item => {
        const luck = item.totalLuck || item.luck || 0;
        return luck >= min && luck <= max;
      });

      const totalTokens = rangeData.reduce((sum, item) => sum + (item.tokensDropped || 0), 0);
      const avgTokens = rangeData.length > 0 ? totalTokens / rangeData.length : 0;

      return {
        range,
        runs: rangeData.length,
        totalTokens,
        avgTokens,
        users: userEmails.size // Aproximação - todos os usuários podem ter dados em qualquer faixa
      };
    });

    const totalRuns = allData.length;
    const totalTokens = allData.reduce((sum, item) => sum + (item.tokensDropped || 0), 0);

    return {
      success: true,
      totalRuns,
      totalTokens,
      uniqueUsers: userEmails.size,
      totalRegisteredUsers: userEmails.size,
      luckRanges: processedRanges,
      rawData: allData.slice(0, 10) // Primeiros 10 para debug
    };
  };

  const checkTableStatus = async () => {
    try {
      const response = await fetch('/api/admin/check-metrics-table');
      const data = await response.json();
      setTableStatus(data);
      console.log('🔍 Status da tabela:', data);
    } catch (error) {
      console.error('❌ Erro ao verificar tabela:', error);
    }
  };

  const testSaveData = async () => {
    try {
      console.log('🧪 Testando salvamento direto no banco...');
      const response = await fetch('/api/admin/test-save', {
        method: 'POST',
        credentials: 'include'
      });
      
      const data = await response.json();
      console.log('🧪 Resultado do teste:', data);
      
      if (data.success) {
        alert(`✅ Teste de salvamento OK!\nTotal de registros: ${data.totalRecords}`);
        // Recarregar status da tabela
        await checkTableStatus();
      } else {
        alert(`❌ Erro no teste: ${data.message}`);
      }
    } catch (error) {
      console.error('❌ Erro no teste:', error);
      alert(`❌ Erro no teste: ${error.message}`);
    }
  };

  const syncUserData = async () => {
    try {
      console.log('🔄 Sincronizando dados do usuário...');
      
      // Coletar dados do localStorage
      const allMapDrops = [];
      
      // Dados atuais
      const currentData = localStorage.getItem('worldshards-mapdrops-history');
      if (currentData) {
        const parsed = JSON.parse(currentData);
        if (Array.isArray(parsed)) {
          allMapDrops.push(...parsed);
        }
      }
      
      // Dados antigos (com email na chave)
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith('worldshards-mapdrops-') || key === 'worldshards-mapdrops-history') continue;
        
        try {
          const data = JSON.parse(localStorage.getItem(key) || '[]');
          if (Array.isArray(data)) {
            allMapDrops.push(...data);
          }
        } catch (error) {
          console.log('⚠️ Erro ao ler', key, ':', error);
        }
      }
      
      console.log(`📊 Coletados ${allMapDrops.length} registros do localStorage`);
      
      if (allMapDrops.length === 0) {
        alert('❌ Nenhum dado encontrado no localStorage!\nFaça alguns testes no Map Planner primeiro.');
        return;
      }
      
      // Enviar para o servidor
      const response = await fetch('/api/admin/collect-user-data', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mapDropsData: allMapDrops })
      });
      
      const result = await response.json();
      console.log('🔄 Resultado da sincronização:', result);
      
      if (result.success) {
        alert(`✅ Dados sincronizados!\nUsuário: ${result.user}\nRecebidos: ${result.received}\nSalvos: ${result.saved}\nIgnorados: ${result.skipped}`);
        // Recarregar dados globais
        await loadGlobalData();
      } else {
        alert(`❌ Erro na sincronização: ${result.message}`);
      }
      
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      alert(`❌ Erro na sincronização: ${error.message}`);
    }
  };

  // Função para testar D1 diretamente
  const testD1Direct = async () => {
    setGlobalLoading(true);
    setGlobalError(null);
    
    try {
      console.log('🧪 Testando D1 diretamente...');
      
      const response = await fetch('/api/admin/test-d1-direct', {
        method: 'POST',
        credentials: 'include',
      });
      
      const result = await response.json();
      console.log('🧪 Resultado do teste D1:', result);
      
      if (result.success) {
        alert(`✅ D1 Teste OK!\n\nInseridos: ${result.inserted} registros\nTotal: ${result.totalRecords} registros\n\nPor usuário:\n${result.recordsByUser.map(r => `${r.user_email}: ${r.count}`).join('\n')}`);
      } else {
        alert(`❌ D1 Teste FALHOU:\n${result.error}`);
      }
      
    } catch (error) {
      console.error('❌ Erro no teste D1:', error);
      alert(`❌ Erro no teste D1:\n${error.message}`);
    } finally {
      setGlobalLoading(false);
    }
  };

  useEffect(() => {
    loadLocalData();
  }, []);

  useEffect(() => {
    if (activeTab === 'global' && !globalData) {
      loadGlobalData();
    }
  }, [activeTab]);

  const renderLocalTab = () => (
    <div className="space-y-6">
      {/* Resumo Geral Local */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Minhas Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalRuns}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Meus Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalTokens.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Minha Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {totalRuns > 0 ? (totalTokens / totalRuns).toFixed(1) : '0'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Local */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            📊 Minhas Faixas de Luck
            <Button onClick={loadLocalData} variant="outline" size="sm">
              🔄 Atualizar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderLuckTable(luckRanges, totalRuns, false)}
        </CardContent>
      </Card>
    </div>
  );

  const renderGlobalTab = () => {
    if (globalLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Carregando dados de todos os usuários...</p>
          </div>
        </div>
      );
    }

    if (globalError) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <p className="text-red-500 mb-4">Erro ao carregar dados globais: {globalError}</p>
              <Button onClick={loadGlobalData} variant="outline">
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!globalData) {
      return (
        <div className="text-center py-12">
          <Button onClick={loadGlobalData} variant="outline">
            Carregar Dados Globais
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Resumo Geral Global */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Runs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{globalData.totalRuns}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{globalData.totalTokens.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{globalData.uniqueUsers}</div>
              <div className="text-xs text-muted-foreground">de {globalData.totalRegisteredUsers} registrados</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Média Global</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {globalData.totalRuns > 0 ? (globalData.totalTokens / globalData.totalRuns).toFixed(1) : '0'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela Global */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              🌍 Faixas de Luck - Todos os Usuários
              <div className="flex space-x-2">
                <Button onClick={syncUserData} variant="outline" size="sm">
                  🔄 Sync Data
                </Button>
                <Button onClick={checkTableStatus} variant="outline" size="sm">
                  🔍 Status Tabela
                </Button>
                <Button onClick={testSaveData} variant="outline" size="sm">
                  🧪 Test Save
                </Button>
                <Button onClick={loadGlobalData} variant="outline" size="sm">
                  🔄 Atualizar
                </Button>
                <Button onClick={testD1Direct} variant="outline" size="sm">
                  🧪 Test D1
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderLuckTable(globalData.luckRanges, globalData.totalRuns, true)}
            
            {/* Status da Tabela */}
            {tableStatus && (
              <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <h4 className="font-semibold mb-2">📊 Status da Tabela de Métricas:</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Existe:</strong> {tableStatus.table.exists ? '✅ Sim' : '❌ Não'}</p>
                  <p><strong>Total de Registros:</strong> {tableStatus.table.totalRecords}</p>
                  {tableStatus.table.lastInsert && (
                    <p><strong>Último Insert:</strong> {tableStatus.table.lastInsert}</p>
                  )}
                  <p><strong>Verificado em:</strong> {tableStatus.timestamp}</p>
                  {tableStatus.table.recentRecords.length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer font-medium">Ver últimos registros</summary>
                      <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                        {JSON.stringify(tableStatus.table.recentRecords, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderLuckTable = (ranges: LuckRange[], totalRunsCount: number, showUsers: boolean) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-semibold">Faixa de Luck</th>
            <th className="text-center p-3 font-semibold">Runs</th>
            <th className="text-center p-3 font-semibold">Total Tokens</th>
            <th className="text-center p-3 font-semibold">Média/Run</th>
            {showUsers && <th className="text-center p-3 font-semibold">Usuários</th>}
            <th className="text-center p-3 font-semibold">% do Total</th>
          </tr>
        </thead>
        <tbody>
          {ranges.map((range, index) => {
            const percentage = totalRunsCount > 0 ? (range.runs / totalRunsCount * 100) : 0;
            return (
              <tr key={index} className="border-b hover:bg-muted/50">
                <td className="p-3 font-medium">{range.range}</td>
                <td className="p-3 text-center">
                  <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-semibold">
                    {range.runs}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-semibold">
                    {range.totalTokens.toLocaleString()}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-semibold">
                    {range.avgTokens.toFixed(1)}
                  </span>
                </td>
                {showUsers && (
                  <td className="p-3 text-center">
                    <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-semibold">
                      {range.users || 0}
                    </span>
                  </td>
                )}
                <td className="p-3 text-center">
                  <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                    {percentage.toFixed(1)}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {totalRunsCount === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>📊 Nenhum dado encontrado.</p>
          <p>Faça algumas runs no Map Planner para ver as estatísticas aqui!</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('local')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'local'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          📊 Meus Dados
        </button>
        <button
          onClick={() => setActiveTab('global')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'global'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          🌍 Dados Globais
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'local' ? renderLocalTab() : renderGlobalTab()}
    </div>
  );
}