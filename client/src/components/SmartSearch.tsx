import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, X, Clock, TrendingUp, Filter, 
  Calculator, Gift, Users, BarChart3, Map
} from "lucide-react";

export interface SearchResult {
  id: string;
  type: 'giveaway' | 'calculator' | 'analytics' | 'winners' | 'maps';
  title: string;
  description: string;
  url: string;
  relevance: number;
  tags: string[];
}

export interface SearchFilter {
  type: string;
  active: boolean;
}

interface SmartSearchProps {
  onSearch?: (query: string, filters: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function SmartSearch({ onSearch, placeholder = "Buscar...", className = "" }: SmartSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilter[]>([
    { type: 'Todos', active: true },
    { type: 'Giveaways', active: false },
    { type: 'Calculadora', active: false },
    { type: 'Analytics', active: false },
    { type: 'Ganhadores', active: false },
    { type: 'Mapas', active: false }
  ]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Dados mock para demonstração
  const mockSearchData: SearchResult[] = [
    {
      id: '1',
      type: 'giveaway',
      title: 'Giveaway de Tokens WorldShards',
      description: 'Sorteio especial com prêmios em tokens',
      url: '/admin/giveaways',
      relevance: 95,
      tags: ['tokens', 'sorteio', 'prêmios']
    },
    {
      id: '2',
      type: 'calculator',
      title: 'Calculadora de Farming',
      description: 'Calcule ROI e eficiência de farming',
      url: '/calculator',
      relevance: 90,
      tags: ['farming', 'roi', 'cálculos']
    },
    {
      id: '3',
      type: 'analytics',
      title: 'Dashboard de Métricas',
      description: 'Análise completa de performance',
      url: '/admin/analytics',
      relevance: 85,
      tags: ['métricas', 'performance', 'análise']
    },
    {
      id: '4',
      type: 'winners',
      title: 'Gerenciador de Ganhadores',
      description: 'Gerencie notificações e entregas',
      url: '/admin/winners',
      relevance: 80,
      tags: ['ganhadores', 'notificações', 'entregas']
    },
    {
      id: '5',
      type: 'maps',
      title: 'Planejador de Mapas',
      description: 'Otimize estratégias de farming',
      url: '/maps',
      relevance: 75,
      tags: ['mapas', 'estratégia', 'otimização']
    }
  ];

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Gerar sugestões baseadas no input
  useEffect(() => {
    if (searchTerm.length > 2) {
      const relevantSuggestions = mockSearchData
        .filter(item => 
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .slice(0, 5)
        .map(item => item.title.split(' ')[0]); // Primeira palavra do título
      
      setSuggestions([...new Set(relevantSuggestions)]);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  // Buscar
  const handleSearch = (query: string = searchTerm) => {
    if (query.trim()) {
      setIsSearching(true);
      
      // Adicionar ao histórico
      setSearchHistory(prev => [query, ...prev.filter(h => h !== query)].slice(0, 5));
      
      // Simular busca
      setTimeout(() => {
        setIsSearching(false);
        setShowSuggestions(false);
        
        // Chamar callback se fornecido
        if (onSearch) {
          const activeFilters = filters.filter(f => f.active).map(f => f.type);
          onSearch(query, activeFilters);
        }
        
        console.log('🔍 Buscando:', query, 'com filtros:', filters.filter(f => f.active).map(f => f.type));
      }, 500);
    }
  };

  // Atualizar filtros
  const toggleFilter = (filterType: string) => {
    setFilters(prev => prev.map(f => 
      f.type === filterType 
        ? { ...f, active: !f.active }
        : f.type === 'Todos' && filterType !== 'Todos'
          ? { ...f, active: false }
          : f
    ));
  };

  // Limpar busca
  const clearSearch = () => {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Buscar com Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      clearSearch();
    }
  };

  // Atalho de teclado Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Busca Inteligente
            <Badge variant="secondary" className="ml-auto text-xs">
              Ctrl+K
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Campo de busca principal */}
          <div className="relative">
            <Input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyPress}
              onFocus={() => setShowSuggestions(true)}
              className="pr-20"
            />
            
            {/* Botões de ação */}
            <div className="absolute right-1 top-1 flex gap-1">
              {searchTerm && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-muted"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="sm"
                className="h-8 px-3"
                onClick={() => handleSearch()}
                disabled={!searchTerm.trim() || isSearching}
              >
                {isSearching ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <Badge
                  key={filter.type}
                  variant={filter.active ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => toggleFilter(filter.type)}
                >
                  {filter.type === 'Giveaways' && <Gift className="h-3 w-3 mr-1" />}
                  {filter.type === 'Calculadora' && <Calculator className="h-3 w-3 mr-1" />}
                  {filter.type === 'Analytics' && <BarChart3 className="h-3 w-3 mr-1" />}
                  {filter.type === 'Ganhadores' && <Users className="h-3 w-3 mr-1" />}
                  {filter.type === 'Mapas' && <Map className="h-3 w-3 mr-1" />}
                  {filter.type}
                </Badge>
              ))}
            </div>
          </div>

          {/* Sugestões em tempo real */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Sugestões:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => {
                      setSearchTerm(suggestion);
                      handleSearch(suggestion);
                    }}
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
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Buscas recentes:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((term, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => {
                      setSearchTerm(term);
                      handleSearch(term);
                    }}
                  >
                    {term}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Resultados da busca (mock) */}
          {isSearching && (
            <div className="text-center py-4">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Buscando...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}