import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calculator, 
  Trash2, 
  Star, 
  StarOff, 
  Filter, 
  Search, 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Clock,
  Tag,
  Plus,
  X,
  Download,
  BarChart3,
  Eye,
  EyeOff
} from 'lucide-react';
import { HistoryItem } from '@/types/calculator';

interface ModernHistoryDisplayProps {
  history: HistoryItem[];
  onDeleteItem: (index: number) => void;
  onClearAll: () => void;
  onToggleFavorite?: (index: number) => void;
  onAddTag?: (index: number, tag: string) => void;
  onRemoveTag?: (index: number, tag: string) => void;
  onAddNote?: (index: number, note: string) => void;
}

type DateFilter = 'all' | '7days' | '30days' | '3months';
type SortOption = 'date' | 'profit' | 'roi' | 'efficiency' | 'cost';
type ViewMode = 'cards' | 'compact' | 'analytics';

const PREDEFINED_TAGS = [
  'teste', 'otimizado', 'falha', 'sucesso', 'experimento',
  'alta-roi', 'baixo-custo', 'eficiente', 'lucrativo', 'perda'
];

export function ModernHistoryDisplay({
  history,
  onDeleteItem,
  onClearAll,
  onToggleFavorite,
  onAddTag,
  onRemoveTag,
  onAddNote
}: ModernHistoryDisplayProps) {
  
  // Estados para filtros e visualização
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  // Filtrar e ordenar histórico
  const filteredAndSortedHistory = useMemo(() => {
    let filtered = [...history];

    // Filtro por data
    if (dateFilter !== 'all') {
      const now = Date.now();
      const filterTime = {
        '7days': 7 * 24 * 60 * 60 * 1000,
        '30days': 30 * 24 * 60 * 60 * 1000,
        '3months': 90 * 24 * 60 * 60 * 1000
      }[dateFilter];
      
      filtered = filtered.filter(item => 
        (now - item.timestamp) <= filterTime
      );
    }

    // Filtro por favoritos
    if (showFavoritesOnly) {
      filtered = filtered.filter(item => item.isFavorite);
    }

    // Filtro por tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(item => 
        selectedTags.some(tag => item.tags?.includes(tag))
      );
    }

    // Filtro por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.notes?.toLowerCase().includes(term) ||
        item.tags?.some(tag => tag.toLowerCase().includes(term)) ||
        item.results.finalProfit.toString().includes(term) ||
        item.results.roi.toString().includes(term)
      );
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.timestamp - a.timestamp; // Mais recente primeiro
        case 'profit':
          return (b.results.finalProfit || 0) - (a.results.finalProfit || 0);
        case 'roi':
          return (b.results.roi || 0) - (a.results.roi || 0);
        case 'efficiency':
          return (b.results.efficiency || 0) - (a.results.efficiency || 0);
        case 'cost':
          return (a.results.totalCost || 0) - (b.results.totalCost || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [history, dateFilter, sortBy, searchTerm, selectedTags, showFavoritesOnly]);

  // Estatísticas
  const stats = useMemo(() => {
    const validHistory = filteredAndSortedHistory.filter(h => h.results);
    const totalCalculations = validHistory.length;
    const profitableCalculations = validHistory.filter(h => h.results.finalProfit > 0).length;
    const totalProfit = validHistory.reduce((sum, h) => sum + h.results.finalProfit, 0);
    const avgProfit = totalCalculations > 0 ? totalProfit / totalCalculations : 0;
    const bestProfit = Math.max(...validHistory.map(h => h.results.finalProfit), 0);
    const successRate = totalCalculations > 0 ? (profitableCalculations / totalCalculations) * 100 : 0;

    return {
      totalCalculations,
      profitableCalculations,
      totalProfit,
      avgProfit,
      bestProfit,
      successRate
    };
  }, [filteredAndSortedHistory]);

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      relative: getRelativeTime(timestamp)
    };
  };

  const getRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
  };

  const getProfitIcon = (profit: number) => {
    if (profit > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (profit < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Target className="h-4 w-4 text-gray-500" />;
  };

  const getProfitColor = (profit: number) => {
    if (profit > 0) return 'text-green-600 dark:text-green-400';
    if (profit < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                📊 Histórico de Cálculos
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredAndSortedHistory.length} de {history.length} cálculos
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClearAll}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Tudo
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filtros e controles */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cálculos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por data */}
            <Select value={dateFilter} onValueChange={(value: DateFilter) => setDateFilter(value)}>
              <SelectTrigger>
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as datas</SelectItem>
                <SelectItem value="7days">Últimos 7 dias</SelectItem>
                <SelectItem value="30days">Últimos 30 dias</SelectItem>
                <SelectItem value="3months">Últimos 3 meses</SelectItem>
              </SelectContent>
            </Select>

            {/* Ordenação */}
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Mais recente</SelectItem>
                <SelectItem value="profit">Maior lucro</SelectItem>
                <SelectItem value="roi">Maior ROI</SelectItem>
                <SelectItem value="efficiency">Maior eficiência</SelectItem>
                <SelectItem value="cost">Menor custo</SelectItem>
              </SelectContent>
            </Select>

            {/* Modo de visualização */}
            <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
              <SelectTrigger>
                <BarChart3 className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cards">Cards</SelectItem>
                <SelectItem value="compact">Compacto</SelectItem>
                <SelectItem value="analytics">Analítico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtros adicionais */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              <Star className="h-4 w-4 mr-2" />
              Favoritos
            </Button>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2">
              {PREDEFINED_TAGS.map(tag => (
                <Button
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (selectedTags.includes(tag)) {
                      setSelectedTags(selectedTags.filter(t => t !== tag));
                    } else {
                      setSelectedTags([...selectedTags, tag]);
                    }
                  }}
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.totalCalculations}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Cálculos</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${stats.avgProfit.toFixed(2)}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">Lucro Médio</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              ${stats.bestProfit.toFixed(2)}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400">Melhor Lucro</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats.successRate.toFixed(0)}%
            </div>
            <div className="text-sm text-orange-600 dark:text-orange-400">Taxa de Sucesso</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de histórico */}
      {filteredAndSortedHistory.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <Calculator className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum cálculo encontrado
            </h3>
            <p className="text-muted-foreground">
              Ajuste os filtros ou faça seu primeiro cálculo
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedHistory.map((item, index) => {
            const isExpanded = expandedItems.has(index);
            const isProfit = item.results.finalProfit > 0;
            const dateInfo = formatDate(item.timestamp);

            return (
              <Card 
                key={index} 
                className={`border-0 shadow-sm transition-all duration-200 hover:shadow-md ${
                  item.isFavorite ? 'ring-2 ring-yellow-400 bg-yellow-50/50 dark:bg-yellow-950/20' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-4">
                      {/* Header com lucro e ROI */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getProfitIcon(item.results.finalProfit)}
                          <div className={`text-3xl font-bold font-mono ${getProfitColor(item.results.finalProfit)}`}>
                            {isProfit ? '+' : ''}${item.results.finalProfit.toFixed(2)}
                          </div>
                          <Badge 
                            variant={isProfit ? "default" : "destructive"}
                            className="text-sm font-medium"
                          >
                            ROI: {item.results.roi.toFixed(1)}%
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-2">
                          {onToggleFavorite && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onToggleFavorite(index)}
                              className="p-2"
                            >
                              {item.isFavorite ? (
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              ) : (
                                <StarOff className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(index)}
                            className="p-2"
                          >
                            {isExpanded ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteItem(index)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Data e tempo */}
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{dateInfo.date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{dateInfo.time}</span>
                        </div>
                        <div className="text-xs bg-muted px-2 py-1 rounded-full">
                          {dateInfo.relative}
                        </div>
                      </div>

                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {item.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Detalhes expandidos */}
                      {isExpanded && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                          <div>
                            <div className="text-sm font-medium text-foreground">Custo das Gems</div>
                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              ${item.results.gemsCost.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">Custo dos Tokens</div>
                            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                              ${item.results.tokensCost.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">Custo Total</div>
                            <div className="text-lg font-bold text-red-600 dark:text-red-400">
                              ${item.results.totalCost.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">Tokens Líquidos</div>
                            <div className="text-lg font-bold text-green-600 dark:text-green-400">
                              {item.results.totalTokens.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">Tokens Utilizados</div>
                            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                              {item.results.tokensEquipment.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">Eficiência</div>
                            <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                              {item.results.efficiency.toFixed(1)}/load
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Notas */}
                      {item.notes && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                            📝 Notas:
                          </div>
                          <div className="text-sm text-blue-700 dark:text-blue-300">
                            {item.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}