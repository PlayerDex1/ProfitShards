import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Layout, BarChart3, Settings, 
  Sun, Moon, Monitor, Grid3X3,
  TrendingUp, Users, Gift
} from "lucide-react";

// Componente de Busca Inteligente Simplificado
function SmartSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const handleSearch = (term: string) => {
    if (term.trim()) {
      setSearchHistory(prev => [term, ...prev.filter(h => h !== term)].slice(0, 5));
      console.log('🔍 Buscando:', term);
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
            onChange={(e) => setSearchTerm(e.target.value)}
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

        {/* Filtros */}
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

// Componente de Dashboard Personalizável Simplificado
function CustomizableDashboard() {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

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
        {/* Grid de widgets */}
        <div className={`grid gap-4 ${
          layout === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {/* Widget de Estatísticas */}
          <Card className="min-h-[200px]">
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
          <Card className="min-h-[200px]">
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
          <Card className="min-h-[200px]">
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
          <Card className="min-h-[200px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button size="sm" className="w-full">Criar Giveaway</Button>
                <Button size="sm" variant="outline" className="w-full">Ver Analytics</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de Gráficos Interativos Simplificado
function InteractiveCharts() {
  const [selectedChart, setSelectedChart] = useState<'activity' | 'performance'>('activity');

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Gráficos Interativos
          </CardTitle>
          <select
            value={selectedChart}
            onChange={(e) => setSelectedChart(e.target.value as any)}
            className="px-3 py-1 border rounded text-sm"
          >
            <option value="activity">Atividade</option>
            <option value="performance">Performance</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {selectedChart === 'activity' && (
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2">
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, index) => (
                <div key={index} className="text-center p-3 bg-muted rounded">
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
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded">
                <span className="font-medium">{item.metric}</span>
                <div className="text-right">
                  <div className="text-lg font-bold">{item.value}%</div>
                  <div className="text-sm text-muted-foreground">Meta: {item.target}%</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Componente de Personalização Simplificado
function PersonalizationPanel() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [accentColor, setAccentColor] = useState('#3B82F6');

  const accentColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
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

        {/* Botões de ação */}
        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={() => console.log('Salvando preferências...')}>
            Salvar Preferências
          </Button>
          <Button variant="outline" onClick={() => console.log('Resetando...')}>
            Resetar Padrões
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