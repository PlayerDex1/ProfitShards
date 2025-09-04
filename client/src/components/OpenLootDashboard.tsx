import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOpenLoot } from '@/hooks/use-openloot';
import { useI18n } from '@/i18n';
import { 
  Gamepad2, 
  Package, 
  TrendingUp, 
  DollarSign, 
  LogIn, 
  LogOut, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Zap,
  BarChart3,
  ShoppingCart,
  Gift
} from 'lucide-react';

export function OpenLootDashboard() {
  const { t } = useI18n();
  const {
    isAuthenticated,
    user,
    inventory,
    transactions,
    loading,
    error,
    authenticate,
    fetchUserData,
    fetchInventory,
    fetchTransactions,
    logout,
    getTotalInventoryValue,
    getTransactionROI
  } = useOpenLoot();

  const [activeTab, setActiveTab] = useState('overview');

  // Carregar dados quando autenticado
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
      fetchInventory();
      fetchTransactions();
    }
  }, [isAuthenticated, fetchUserData, fetchInventory, fetchTransactions]);

  // Se não estiver autenticado, mostrar tela de login
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="h-6 w-6 text-primary" />
              OpenLoot Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Conecte sua conta OpenLoot</h3>
              <p className="text-muted-foreground">
                Acesse seu inventário, transações e dados do WorldShards
              </p>
            </div>
            
            <Button 
              onClick={authenticate}
              size="lg"
              className="btn-premium"
              disabled={loading}
            >
              <LogIn className="h-4 w-4 mr-2" />
              {loading ? 'Conectando...' : 'Conectar com OpenLoot'}
            </Button>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalValue = getTotalInventoryValue();
  const roi = getTransactionROI();

  return (
    <div className="space-y-6">
      {/* Header com informações do usuário */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Gamepad2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl">OpenLoot Dashboard</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Bem-vindo, {user?.username || 'Usuário'}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={logout} size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-premium">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{inventory.length}</div>
            <div className="text-sm text-muted-foreground">Itens no Inventário</div>
          </CardContent>
        </Card>
        
        <Card className="card-premium">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              ${totalValue.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Valor Total</div>
          </CardContent>
        </Card>
        
        <Card className="card-premium">
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {roi.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">ROI Transações</div>
          </CardContent>
        </Card>
        
        <Card className="card-premium">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{transactions.length}</div>
            <div className="text-sm text-muted-foreground">Transações</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de navegação */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="inventory">Inventário</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Inventário Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {inventory.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-muted rounded"></div>
                      <div>
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.category}</div>
                      </div>
                    </div>
                    <Badge variant={item.rarity === 'legendary' ? 'default' : 'secondary'}>
                      ${item.value}
                    </Badge>
                  </div>
                ))}
                {inventory.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum item encontrado
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Transações Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        transaction.type === 'sale' ? 'bg-green-500' : 
                        transaction.type === 'purchase' ? 'bg-blue-500' : 'bg-yellow-500'
                      }`}></div>
                      <div>
                        <div className="font-medium text-sm">{transaction.item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium text-sm ${
                        transaction.type === 'sale' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'sale' ? '+' : '-'}${transaction.price}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhuma transação encontrada
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Inventário Completo
                </CardTitle>
                <Button variant="outline" size="sm" onClick={fetchInventory}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inventory.map((item) => (
                  <Card key={item.id} className="card-premium">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="w-full h-24 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant={item.rarity === 'legendary' ? 'default' : 'secondary'}>
                            {item.rarity}
                          </Badge>
                          <span className="font-bold text-green-600">${item.value}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {inventory.length === 0 && (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum item encontrado no inventário</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Histórico de Transações
                </CardTitle>
                <Button variant="outline" size="sm" onClick={fetchTransactions}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'sale' ? 'bg-green-100 dark:bg-green-900/20' :
                        transaction.type === 'purchase' ? 'bg-blue-100 dark:bg-blue-900/20' :
                        'bg-yellow-100 dark:bg-yellow-900/20'
                      }`}>
                        {transaction.type === 'sale' ? <TrendingUp className="h-4 w-4" /> :
                         transaction.type === 'purchase' ? <ShoppingCart className="h-4 w-4" /> :
                         <Gift className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="font-medium">{transaction.item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(transaction.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${
                        transaction.type === 'sale' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'sale' ? '+' : '-'}${transaction.price}
                      </div>
                      <Badge variant={
                        transaction.status === 'completed' ? 'default' :
                        transaction.status === 'pending' ? 'secondary' : 'destructive'
                      }>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma transação encontrada</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Análise de ROI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {roi.toFixed(1)}%
                    </div>
                    <p className="text-muted-foreground">ROI Total</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Vendas:</span>
                      <span className="font-medium">
                        ${transactions.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.price, 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Compras:</span>
                      <span className="font-medium">
                        ${transactions.filter(t => t.type === 'purchase').reduce((sum, t) => sum + t.price, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Itens por Raridade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['legendary', 'epic', 'rare', 'uncommon', 'common'].map((rarity) => {
                    const count = inventory.filter(item => item.rarity === rarity).length;
                    const percentage = inventory.length > 0 ? (count / inventory.length) * 100 : 0;
                    
                    return (
                      <div key={rarity} className="flex items-center justify-between">
                        <span className="capitalize">{rarity}:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}