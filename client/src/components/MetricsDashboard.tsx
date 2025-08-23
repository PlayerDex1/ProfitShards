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
      const response = await fetch('/api/admin/global-metrics', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🌍 Dados globais carregados:', data);
      setGlobalData(data);
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados globais:', error);
      setGlobalError(error.message);
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
              <Button onClick={loadGlobalData} variant="outline" size="sm">
                🔄 Atualizar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderLuckTable(globalData.luckRanges, globalData.totalRuns, true)}
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