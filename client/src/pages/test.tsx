import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Layout, BarChart3, Settings, 
  Sun, Moon, Monitor, Grid3X3,
  TrendingUp, Users, Gift, Heart, Clock, Star,
  Trash2, Plus, Calculator, Map, BarChart, X
} from "lucide-react";
import { useSearchHistory } from "@/hooks/use-search-history";
import { useFavorites } from "@/hooks/use-favorites";
import { useToastNotifications, ToastNotification } from "@/components/ui/toast-notification";
import { Skeleton, CardSkeleton, ListSkeleton } from "@/components/ui/loading-skeleton";

// Componente de Busca Inteligente com Histórico
function SmartSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const { searchHistory, isLoading, performSearch, removeSearch, clearHistory } = useSearchHistory();
  const { addToast } = useToastNotifications();

  const handleSearch = async (term: string) => {
    if (!term.trim()) return;

    const result = await performSearch(term, selectedCategory);
    
    if (result.success) {
      addToast({
        type: 'success',
        title: 'Busca realizada!',
        message: `Encontrados ${result.resultCount} resultados para "${term}"`
      });
    } else {
      addToast({
        type: 'error',
        title: 'Erro na busca',
        message: 'Não foi possível realizar a busca. Tente novamente.'
      });
    }
  };

  const handleRemoveFromHistory = (id: string) => {
    removeSearch(id);
    addToast({
      type: 'info',
      title: 'Item removido',
      message: 'Item removido do histórico de busca'
    });
  };

  const handleClearHistory = () => {
    clearHistory();
    addToast({
      type: 'warning',
      title: 'Histórico limpo',
      message: 'Todo o histórico de busca foi removido'
    });
  };

  return (
    <Card className="w-full max-w-2xl hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Busca Inteligente com Histórico
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Campo de busca principal */}
        <div className="relative">
          <Input
            placeholder="Buscar giveaways, calculadoras, análises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
            className="pr-10 hover:border-primary/50 focus:border-primary transition-colors"
          />
          <Button
            size="sm"
            className="absolute right-1 top-1 h-8 w-8 p-0 hover:scale-105 transition-transform"
            onClick={() => handleSearch(searchTerm)}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Filtros */}
        <div className="pt-4 border-t">
          <p className="text-sm font-medium mb-3">Filtros:</p>
          <div className="flex flex-wrap gap-2">
            {['Todos', 'Giveaways', 'Calculadora', 'Analytics', 'Ganhadores'].map((filter) => (
              <Badge
                key={filter}
                variant={selectedCategory === filter ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => setSelectedCategory(filter)}
              >
                {filter}
              </Badge>
            ))}
          </div>
        </div>

        {/* Histórico de buscas */}
        {searchHistory.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Buscas recentes:
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearHistory}
                className="text-xs hover:text-destructive"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Limpar
              </Button>
            </div>
            
            <div className="space-y-2">
              {searchHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      {item.category || 'Geral'}
                    </Badge>
                    <span className="text-sm cursor-pointer hover:text-primary" onClick={() => handleSearch(item.term)}>
                      {item.term}
                    </span>
                    {item.resultCount && (
                      <span className="text-xs text-muted-foreground">
                        ({item.resultCount} resultados)
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                    onClick={() => handleRemoveFromHistory(item.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Componente de Favoritos para Cálculos
function FavoritesManager() {
  const { favorites, isLoading, addToFavorites, removeFromFavorites, getFavoritesByType } = useFavorites();
  const { addToast } = useToastNotifications();
  const [selectedType, setSelectedType] = useState<string>('Todos');

  const handleAddToFavorites = (calculation: any) => {
    addToFavorites(calculation);
    addToast({
      type: 'success',
      title: 'Adicionado aos favoritos!',
      message: `${calculation.name} foi salvo nos seus favoritos`
    });
  };

  const handleRemoveFromFavorites = (id: string) => {
    removeFromFavorites(id);
    addToast({
      type: 'info',
      title: 'Removido dos favoritos',
      message: 'Item removido da lista de favoritos'
    });
  };

  const filteredFavorites = selectedType === 'Todos' 
    ? favorites 
    : getFavoritesByType(selectedType);

  const calculationTypes = [
    { key: 'Todos', icon: Star, label: 'Todos' },
    { key: 'calculator', icon: Calculator, label: 'Calculadora' },
    { key: 'planner', icon: Map, label: 'Planejador' },
    { key: 'analysis', icon: BarChart, label: 'Análises' }
  ];

  return (
    <Card className="w-full hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Favoritos - Cálculos Salvos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros de tipo */}
        <div className="flex flex-wrap gap-2">
          {calculationTypes.map(({ key, icon: Icon, label }) => (
            <Badge
              key={key}
              variant={selectedType === key ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => setSelectedType(key)}
            >
              <Icon className="h-3 w-3 mr-1" />
              {label}
            </Badge>
          ))}
        </div>

        {/* Lista de favoritos */}
        {isLoading ? (
          <ListSkeleton count={3} />
        ) : filteredFavorites.length > 0 ? (
          <div className="space-y-3">
            {filteredFavorites.map((favorite) => (
              <div
                key={favorite.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {favorite.type === 'calculator' && <Calculator className="h-4 w-4 text-primary" />}
                    {favorite.type === 'planner' && <Map className="h-4 w-4 text-primary" />}
                    {favorite.type === 'analysis' && <BarChart className="h-4 w-4 text-primary" />}
                  </div>
                  <div>
                    <h4 className="font-medium">{favorite.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {favorite.description || 'Cálculo salvo'}
                    </p>
                    {favorite.tags && (
                      <div className="flex gap-1 mt-1">
                        {favorite.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:text-destructive"
                    onClick={() => handleRemoveFromFavorites(favorite.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum favorito encontrado</p>
            <p className="text-sm">Adicione cálculos aos seus favoritos para vê-los aqui</p>
          </div>
        )}

        {/* Botão para adicionar novo favorito de exemplo */}
        <div className="pt-4 border-t">
          <Button
            onClick={() => handleAddToFavorites({
              name: 'Cálculo de Exemplo',
              type: 'calculator',
              data: { investment: 1000, tokens: 50 },
              description: 'Exemplo de cálculo salvo',
              tags: ['exemplo', 'teste']
            })}
            className="w-full hover:scale-105 transition-transform"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Favorito de Exemplo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de Dashboard Personalizável com Loading
function CustomizableDashboard() {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(false);

  const handleLayoutChange = (newLayout: 'grid' | 'list') => {
    setIsLoading(true);
    setTimeout(() => {
      setLayout(newLayout);
      setIsLoading(false);
    }, 500);
  };

  return (
    <Card className="w-full hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Dashboard Personalizável
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={layout === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleLayoutChange('grid')}
              disabled={isLoading}
              className="hover:scale-105 transition-transform"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={layout === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleLayoutChange('list')}
              disabled={isLoading}
              className="hover:scale-105 transition-transform"
            >
              <Layout className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className={`grid gap-4 ${
            layout === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {/* Widget de Estatísticas */}
            <Card className="min-h-[200px] hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Estatísticas Gerais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-2xl font-bold">1,234</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-green-500" />
                    <span className="text-2xl font-bold">56</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Widget de Gráfico */}
            <Card className="min-h-[200px] hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Gráfico de Atividade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-muted rounded flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Widget de Atividades */}
            <Card className="min-h-[200px] hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Atividades Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">🎉 Novo ganhador anunciado</div>
                  <div className="text-sm">📊 Métricas atualizadas</div>
                  <div className="text-sm">🎁 Giveaway criado</div>
                </div>
              </CardContent>
            </Card>

            {/* Widget de Ações */}
            <Card className="min-h-[200px] hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button size="sm" className="w-full hover:scale-105 transition-transform">Criar Giveaway</Button>
                  <Button size="sm" variant="outline" className="w-full hover:scale-105 transition-transform">Ver Analytics</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Componente de Gráficos Interativos com Loading
function InteractiveCharts() {
  const [selectedChart, setSelectedChart] = useState<'activity' | 'performance'>('activity');
  const [isLoading, setIsLoading] = useState(false);

  const handleChartChange = (chart: 'activity' | 'performance') => {
    setIsLoading(true);
    setTimeout(() => {
      setSelectedChart(chart);
      setIsLoading(false);
    }, 300);
  };

  return (
    <Card className="w-full hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Gráficos Interativos
          </CardTitle>
          <select
            value={selectedChart}
            onChange={(e) => handleChartChange(e.target.value as any)}
            className="px-3 py-1 border rounded text-sm hover:border-primary/50 focus:border-primary transition-colors"
            disabled={isLoading}
          >
            <option value="activity">Atividade</option>
            <option value="performance">Performance</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <>
            {selectedChart === 'activity' && (
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-2">
                  {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, index) => (
                    <div key={index} className="text-center p-3 bg-muted rounded hover:bg-muted/80 transition-colors cursor-pointer">
                      <div className="text-lg font-bold">{Math.floor(Math.random() * 200) + 50}</div>
                      <div className="text-sm text-muted-foreground">{day}</div>
                    </div>
                  ))}
                </div>
                <div className="h-64 bg-muted rounded flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Gráfico interativo de atividade</p>
                    <p className="text-sm text-muted-foreground">Clique nos dados para detalhes</p>
                  </div>
                </div>
              </div>
            )}

            {selectedChart === 'performance' && (
              <div className="space-y-4">
                {[
                  { metric: 'Eficiência', value: 85, target: 90 },
                  { metric: 'Engajamento', value: 92, target: 85 },
                  { metric: 'Conversão', value: 78, target: 80 },
                  { metric: 'Retenção', value: 88, target: 85 }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded hover:bg-muted/80 transition-colors">
                    <span className="font-medium">{item.metric}</span>
                    <div className="text-right">
                      <div className="text-lg font-bold">{item.value}%</div>
                      <div className="text-sm text-muted-foreground">Meta: {item.target}%</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Componente de Personalização com Feedback
function PersonalizationPanel() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [accentColor, setAccentColor] = useState('#3B82F6');
  const { addToast } = useToastNotifications();

  const accentColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    addToast({
      type: 'success',
      title: 'Tema alterado!',
      message: `Tema alterado para ${newTheme === 'system' ? 'sistema' : newTheme === 'light' ? 'claro' : 'escuro'}`
    });
  };

  const handleColorChange = (color: string) => {
    setAccentColor(color);
    addToast({
      type: 'info',
      title: 'Cor alterada!',
      message: 'Cor de destaque atualizada'
    });
  };

  const handleSavePreferences = () => {
    addToast({
      type: 'success',
      title: 'Preferências salvas!',
      message: 'Suas configurações foram salvas com sucesso'
    });
  };

  const handleResetDefaults = () => {
    setTheme('system');
    setAccentColor('#3B82F6');
    addToast({
      type: 'warning',
      title: 'Padrões restaurados',
      message: 'Configurações retornaram aos valores padrão'
    });
  };

  return (
    <Card className="w-full hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Personalização
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tema */}
        <div className="space-y-3">
          <h3 className="font-medium">Tema</h3>
          <div className="flex gap-2">
            {[
              { key: 'light', icon: Sun, label: 'Claro' },
              { key: 'dark', icon: Moon, label: 'Escuro' },
              { key: 'system', icon: Monitor, label: 'Sistema' }
            ].map(({ key, icon: Icon, label }) => (
              <Button
                key={key}
                variant={theme === key ? 'default' : 'outline'}
                onClick={() => handleThemeChange(key as any)}
                className="flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Cor de destaque */}
        <div className="space-y-3">
          <h3 className="font-medium">Cor de Destaque</h3>
          <div className="flex gap-2">
            {accentColors.map((color) => (
              <button
                key={color}
                className={`w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform ${
                  accentColor === color ? 'border-foreground' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorChange(color)}
              />
            ))}
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-3 pt-4 border-t">
          <Button 
            onClick={handleSavePreferences}
            className="hover:scale-105 transition-transform"
          >
            Salvar Preferências
          </Button>
          <Button 
            variant="outline" 
            onClick={handleResetDefaults}
            className="hover:scale-105 transition-transform"
          >
            Resetar Padrões
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TestPage() {
  const { toasts, addToast } = useToastNotifications();

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <ToastNotification key={toast.id} {...toast} />
      ))}

      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">🧪 Página de Teste - Novas Funcionalidades</h1>
        <p className="text-xl text-muted-foreground">
          Testando melhorias de UX antes de implementar na produção
        </p>
      </div>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="search" className="flex items-center gap-2 hover:scale-105 transition-transform">
            <Search className="h-4 w-4" />
            Busca
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center gap-2 hover:scale-105 transition-transform">
            <Heart className="h-4 w-4" />
            Favoritos
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2 hover:scale-105 transition-transform">
            <Layout className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="charts" className="flex items-center gap-2 hover:scale-105 transition-transform">
            <BarChart3 className="h-4 w-4" />
            Gráficos
          </TabsTrigger>
          <TabsTrigger value="personalization" className="flex items-center gap-2 hover:scale-105 transition-transform">
            <Settings className="h-4 w-4" />
            Personalização
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          <SmartSearch />
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6">
          <FavoritesManager />
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <CustomizableDashboard />
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <InteractiveCharts />
        </TabsContent>

        <TabsContent value="personalization" className="space-y-6">
          <PersonalizationPanel />
        </TabsContent>
      </Tabs>

      <div className="text-center p-6 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
        <h3 className="text-lg font-semibold mb-2">📝 Notas de Teste</h3>
        <p className="text-muted-foreground">
          Esta página é para testar novas funcionalidades antes de implementar na produção.
          <br />
          <strong>Novas funcionalidades implementadas:</strong>
          <br />
          🔍 <strong>Search History</strong> - Histórico de pesquisas persistente
          <br />
          ❤️ <strong>Favorites</strong> - Sistema de favoritos para cálculos
          <br />
          ⚡ <strong>Loading States</strong> - Estados de carregamento com skeletons
          <br />
          🔔 <strong>Toast Notifications</strong> - Notificações elegantes
          <br />
          🎨 <strong>Hover Effects</strong> - Efeitos visuais interativos
        </p>
      </div>
    </div>
  );
}