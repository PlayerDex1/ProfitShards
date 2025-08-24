import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useAuth } from '../hooks/use-auth';
import { useI18n } from '../i18n';
import { HybridDashboard } from './HybridDashboard';
import { TestMapPlanner } from './TestMapPlanner';
import { TestActivityFeed } from './TestActivityFeed';

export function MetricsDashboard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'test' | 'hybrid'>('hybrid');
  const [adminLoading, setAdminLoading] = useState(false);

  // Verificar se é admin
  const isAdmin = user === 'holdboy01@gmail.com';

  // Função para testar D1 (comentada - interface removida mas código preservado)
  /*
  const testD1Direct = async () => {
    if (!isAdmin) {
      alert('❌ Acesso negado. Apenas admins podem executar testes.');
      return;
    }

    setAdminLoading(true);
    try {
      const response = await fetch('/api/admin/test-d1-direct', {
        method: 'POST',
        credentials: 'include',
      });
      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Teste D1 bem-sucedido!\n\nInserção: ${result.insertResult.success ? '✅' : '❌'}\nBusca: ${result.queryResult.success ? '✅' : '❌'}\nLimpeza: ${result.cleanupResult.success ? '✅' : '❌'}`);
      } else {
        alert(`❌ Erro no teste: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Erro: ${error.message}`);
    } finally {
      setAdminLoading(false);
    }
  };
  */

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold mb-2">Acesso Restrito</h2>
              <p className="text-muted-foreground">
                Esta seção é exclusiva para administradores.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('hybrid')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'hybrid'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          🔥 Dashboard Principal
        </button>
        <button
          onClick={() => setActiveTab('test')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'test'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          🧪 Ferramentas de Teste
        </button>
      </div>

      {/* Test Dashboard Tab */}
      {activeTab === 'test' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🧪 Ferramentas de Teste</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Reset Completo */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center space-x-2">
                    <span className="text-red-500">🧹</span>
                    <span>Reset Completo</span>
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Remove todos os dados de teste do dashboard
                  </p>
                  <Button 
                    onClick={async () => {
                      const confirmMessage = `🚨 RESET COMPLETO DO DASHBOARD 🚨

Esta ação vai remover TODOS os dados de teste:
• Todas as métricas de usuários
• Usuários: holdboy02@gmail.com, catdrizi@gmail.com  
• Todas as sessões expiradas
• Todas as tabelas de backup

⚠️ ESTA AÇÃO É IRREVERSÍVEL!

Digite "RESET" para confirmar:`;
                      
                      const confirmation = prompt(confirmMessage);
                      if (confirmation !== 'RESET') {
                        alert('❌ Reset cancelado.');
                        return;
                      }
                      
                      setAdminLoading(true);
                      try {
                        const response = await fetch('/api/admin/reset-test-data', {
                          method: 'POST',
                          credentials: 'include',
                        });
                        const result = await response.json();
                        if (result.success) {
                          alert(`✅ Dashboard limpo com sucesso!\n\n${result.details.status}`);
                        } else {
                          alert(`❌ Erro: ${result.error}`);
                        }
                      } catch (error) {
                        alert(`❌ Erro: ${error.message}`);
                      } finally {
                        setAdminLoading(false);
                      }
                    }}
                    variant="destructive" 
                    className="w-full"
                    disabled={adminLoading}
                  >
                    {adminLoading ? 'Processando...' : '🧹 Executar Reset'}
                  </Button>
                </div>

              </div>

              {/* Feed de Atividades de Teste */}
              <div className="mt-6">
                <TestActivityFeed />
              </div>

              {/* Map Planner de Teste */}
              <div className="mt-6">
                <h4 className="font-semibold mb-4 flex items-center space-x-2">
                  <span>🗺️</span>
                  <span>Map Planner - Teste de Melhorias</span>
                </h4>
                <TestMapPlanner />
              </div>

              {/* Status de Desenvolvimento */}
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center space-x-2">
                  <span>📊</span>
                  <span>Status do Sistema</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Dashboard Híbrido</div>
                    <div className="font-medium text-green-600">✅ Funcionando</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Analytics</div>
                    <div className="font-medium text-green-600">✅ Funcionando</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Dados Globais</div>
                    <div className="font-medium text-green-600">✅ Funcionando</div>
                  </div>
                </div>
              </div>

              {/* Loading indicator */}
              {adminLoading && (
                <div className="mt-4 text-center">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Processando...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hybrid Dashboard Tab */}
      {activeTab === 'hybrid' && (
        <div className="space-y-4">
          <HybridDashboard />
        </div>
      )}
    </div>
  );
}