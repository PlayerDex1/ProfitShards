import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Palette, Layout, BarChart3, Settings, 
  Sun, Moon, Monitor, Zap, Grid3X3, Sliders,
  TrendingUp, Users, Gift, Trophy, Star
} from "lucide-react";

// Componente de Busca Inteligente
function SmartSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleSearch = (term: string) => {
    if (term.trim()) {
      setSearchHistory(prev => [term, ...prev.filter(h => h !== term)].slice(0, 5));
      // Aqui implementaríamos a busca real
      console.log('🔍 Buscando:', term);
    }
  };

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    
    // Simular sugestões baseadas no input
    if (value.length > 2) {
      const mockSuggestions = [
        'giveaway', 'calculator', 'analytics', 'winners', 'maps'
      ].filter(s => s.includes(value.toLowerCase()));
      setSuggestions(mockSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Busca Inteligente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Campo de busca principal */}
        <div className="relative">
          <Input
            placeholder="Buscar giveaways, calculadoras, análises..."
            value={searchTerm}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
            className="pr-10"
          />
          <Button
            size="sm"
            className="absolute right-1 top-1 h-8 w-8 p-0"
            onClick={() => handleSearch(searchTerm)}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Sugestões em tempo real */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Sugestões:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => handleSearch(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Histórico de buscas */}
        {searchHistory.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Buscas recentes:</p>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((term, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => handleSearch(term)}
                >
                  {term}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Filtros avançados */}
        <div className="pt-4 border-t">
          <p className="text-sm font-medium mb-3">Filtros:</p>
          <div className="flex flex-wrap gap-2">
            {['Todos', 'Giveaways', 'Calculadora', 'Analytics', 'Ganhadores'].map((filter) => (
              <Badge
                key={filter}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
              >
                {filter}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de Dashboard Personalizável
function CustomizableDashboard() {
  const [widgets, setWidgets] = useState([
    { id: 1, type: 'stats', title: 'Estatísticas Gerais', position: 0, visible: true },
    { id: 2, type: 'chart', title: 'Gráfico de Atividade', position: 1, visible: true },
    { id: 3, type: 'recent', title: 'Atividades Recentes', position: 2, visible: true },
    { id: 4, type: 'quick', title: 'Ações Rápidas', position: 3, visible: true }
  ]);

  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  const toggleWidget = (id: number) => {
    setWidgets(prev => prev.map(w => 
      w.id === id ? { ...w, visible: !w.visible } : w
    ));
  };

  const moveWidget = (id: number, direction: 'up' | 'down') => {
    setWidgets(prev => {
      const newWidgets = [...prev];
      const index = newWidgets.findIndex(w => w.id === id);
      if (direction === 'up' && index > 0) {
        [newWidgets[index], newWidgets[index - 1]] = [newWidgets[index - 1], newWidgets[index]];
      } else if (direction === 'down' && index < newWidgets.length - 1) {
        [newWidgets[index], newWidgets[index + 1]] = [newWidgets[index + 1], newWidgets[index]];
      }
      return newWidgets;
    });
  };

  return (
    <Card className="w-full">
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
              onClick={() => setLayout('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={layout === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLayout('list')}
            >
              <Layout className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Controles de personalização */}
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-3">Personalizar Widgets:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {widgets.map((widget) => (
              <div key={widget.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={widget.visible}
                  onChange={() => toggleWidget(widget.id)}
                  className="rounded"
                />
                <span className="text-sm">{widget.title}</span>
                {widget.visible && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 w-6 p-0"
                      onClick={() => moveWidget(widget.id, 'up')}
                    >
                      ↑
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 w-6 p-0"
                      onClick={() => moveWidget(widget.id, 'down')}
                    >
                      ↓
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Grid de widgets */}
        <div className={`grid gap-4 ${
          layout === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {widgets.filter(w => w.visible).map((widget) => (
            <Card key={widget.id} className="min-h-[200px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{widget.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {widget.type === 'stats' && (
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
                )}
                {widget.type === 'chart' && (
                  <div className="h-32 bg-muted rounded flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                {widget.type === 'recent' && (
                  <div className="space-y-2">
                    <div className="text-sm">🎉 Novo ganhador anunciado</div>
                    <div className="text-sm">📊 Métricas atualizadas</div>
                    <div className="text-sm">🎁 Giveaway criado</div>
                  </div>
                )}
                {widget.type === 'quick' && (
                  <div className="space-y-2">
                    <Button size="sm" className="w-full">Criar Giveaway</Button>
                    <Button size="sm" variant="outline" className="w-full">Ver Analytics</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de Gráficos Interativos
function InteractiveCharts() {
  const [selectedChart, setSelectedChart] = useState<'activity' | 'performance' | 'distribution'>('activity');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const mockData = {
    activity: [
      { day: 'Seg', users: 120, giveaways: 8, winners: 24 },
      { day: 'Ter', users: 145, giveaways: 12, winners: 36 },
      { day: 'Qua', users: 98, giveaways: 6, winners: 18 },
      { day: 'Qui', users: 167, giveaways: 15, winners: 45 },
      { day: 'Sex', users: 189, giveaways: 18, winners: 54 },
      { day: 'Sáb', users: 134, giveaways: 10, winners: 30 },
      { day: 'Dom', users: 156, giveaways: 14, winners: 42 }
    ],
    performance: [
      { metric: 'Eficiência', value: 85, target: 90, status: 'warning' },
      { metric: 'Engajamento', value: 92, target: 85, status: 'success' },
      { metric: 'Conversão', value: 78, target: 80, status: 'warning' },
      { metric: 'Retenção', value: 88, target: 85, status: 'success' }
    ],
    distribution: [
      { category: 'Small Maps', value: 25, color: '#3B82F6' },
      { category: 'Medium Maps', value: 35, color: '#10B981' },
      { category: 'Large Maps', value: 28, color: '#F59E0B' },
      { category: 'XLarge Maps', value: 12, color: '#EF4444' }
    ]
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Gráficos Interativos
          </CardTitle>
          <div className="flex items-center gap-2">
            <select
              value={selectedChart}
              onChange={(e) => setSelectedChart(e.target.value as any)}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="activity">Atividade</option>
              <option value="performance">Performance</option>
              <option value="distribution">Distribuição</option>
            </select>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="7d">7 dias</option>
              <option value="30d">30 dias</option>
              <option value="90d">90 dias</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Gráfico de Atividade */}
        {selectedChart === 'activity' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {mockData.activity.map((day, index) => (
                <div key={index} className="text-center p-3 bg-muted rounded">
                  <div className="text-lg font-bold">{day.users}</div>
                  <div className="text-sm text-muted-foreground">{day.day}</div>
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

        {/* Gráfico de Performance */}
        {selectedChart === 'performance' && (
          <div className="space-y-4">
            {mockData.performance.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded">
                <span className="font-medium">{item.metric}</span>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-lg font-bold">{item.value}%</div>
                    <div className="text-sm text-muted-foreground">Meta: {item.target}%</div>
                  </div>
                  <Badge variant={item.status === 'success' ? 'default' : 'secondary'}>
                    {item.status === 'success' ? '✅' : '⚠️'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Gráfico de Distribuição */}
        {selectedChart === 'distribution' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {mockData.distribution.map((item, index) => (
                <div key={index} className="p-4 bg-muted rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium">{item.category}</span>
                  </div>
                  <div className="text-2xl font-bold">{item.value}%</div>
                </div>
              ))}
            </div>
            <div className="h-64 bg-muted rounded flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Gráfico de pizza interativo</p>
                <p className="text-sm text-muted-foreground">Hover para detalhes</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Componente de Personalização
function PersonalizationPanel() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [accentColor, setAccentColor] = useState('#3B82F6');
  const [fontSize, setFontSize] = useState('medium');
  const [animations, setAnimations] = useState(true);
  const [shortcuts, setShortcuts] = useState({
    'Ctrl+K': 'Busca rápida',
    'Ctrl+D': 'Dashboard',
    'Ctrl+C': 'Calculadora',
    'Ctrl+G': 'Giveaways'
  });

  const accentColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  const fontSizes = [
    { key: 'small', label: 'Pequeno', size: '14px' },
    { key: 'medium', label: 'Médio', size: '16px' },
    { key: 'large', label: 'Grande', size: '18px' },
    { key: 'xlarge', label: 'Extra Grande', size: '20px' }
  ];

  return (
    <Card className="w-full">
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
                onClick={() => setTheme(key as any)}
                className="flex items-center gap-2"
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
                className={`w-8 h-8 rounded-full border-2 ${
                  accentColor === color ? 'border-foreground' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setAccentColor(color)}
              />
            ))}
          </div>
        </div>

        {/* Tamanho da fonte */}
        <div className="space-y-3">
          <h3 className="font-medium">Tamanho da Fonte</h3>
          <div className="flex gap-2">
            {fontSizes.map(({ key, label, size }) => (
              <Button
                key={key}
                variant={fontSize === key ? 'default' : 'outline'}
                onClick={() => setFontSize(key)}
                style={{ fontSize: size }}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Animações */}
        <div className="space-y-3">
          <h3 className="font-medium">Animações</h3>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={animations}
              onChange={(e) => setAnimations(e.target.checked)}
              className="rounded"
            />
            <span>Habilitar animações e transições</span>
          </div>
        </div>

        {/* Atalhos de teclado */}
        <div className="space-y-3">
          <h3 className="font-medium">Atalhos de Teclado</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(shortcuts).map(([key, action]) => (
              <div key={key} className="flex justify-between items-center p-2 bg-muted rounded">
                <kbd className="px-2 py-1 bg-background rounded text-sm font-mono">{key}</kbd>
                <span className="text-sm">{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={() => console.log('Salvando preferências...')}>
            Salvar Preferências
          </Button>
          <Button variant="outline" onClick={() => console.log('Resetando...')}>
            Resetar Padrões
          </Button>
          <Button variant="outline" onClick={() => console.log('Exportando...')}>
            Exportar Configuração
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TestPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">🧪 Página de Teste - Novas Funcionalidades</h1>
        <p className="text-xl text-muted-foreground">
          Testando melhorias de UX antes de implementar na produção
        </p>
      </div>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Busca
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Gráficos
          </TabsTrigger>
          <TabsTrigger value="personalization" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Personalização
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          <SmartSearch />
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

      <div className="text-center p-6 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold mb-2">📝 Notas de Teste</h3>
        <p className="text-muted-foreground">
          Esta página é para testar novas funcionalidades antes de implementar na produção.
          <br />
          Todas as funcionalidades existentes permanecem intactas e funcionais.
        </p>
      </div>
    </div>
  );
}