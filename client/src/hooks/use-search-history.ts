import { useState, useEffect, useCallback } from 'react';

export interface SearchHistoryItem {
  id: string;
  term: string;
  timestamp: number;
  category?: string;
  resultCount?: number;
}

export function useSearchHistory() {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar histórico do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('search-history');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSearchHistory(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de busca:', error);
    }
  }, []);

  // Salvar histórico no localStorage
  const saveHistory = useCallback((newHistory: SearchHistoryItem[]) => {
    try {
      localStorage.setItem('search-history', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Erro ao salvar histórico de busca:', error);
    }
  }, []);

  // Adicionar nova busca ao histórico
  const addSearch = useCallback((term: string, category?: string, resultCount?: number) => {
    if (!term.trim()) return;

    const newItem: SearchHistoryItem = {
      id: Date.now().toString(),
      term: term.trim(),
      timestamp: Date.now(),
      category,
      resultCount
    };

    setSearchHistory(prev => {
      // Remover duplicatas e manter apenas os últimos 20 itens
      const filtered = prev.filter(item => item.term.toLowerCase() !== term.toLowerCase());
      const newHistory = [newItem, ...filtered].slice(0, 20);
      saveHistory(newHistory);
      return newHistory;
    });
  }, [saveHistory]);

  // Remover item do histórico
  const removeSearch = useCallback((id: string) => {
    setSearchHistory(prev => {
      const newHistory = prev.filter(item => item.id !== id);
      saveHistory(newHistory);
      return newHistory;
    });
  }, [saveHistory]);

  // Limpar todo o histórico
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('search-history');
  }, []);

  // Buscar no histórico
  const searchInHistory = useCallback((query: string) => {
    if (!query.trim()) return [];
    
    return searchHistory.filter(item => 
      item.term.toLowerCase().includes(query.toLowerCase())
    );
  }, [searchHistory]);

  // Simular busca com loading
  const performSearch = useCallback(async (term: string, category?: string) => {
    setIsLoading(true);
    
    try {
      // Simular delay de busca
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simular resultado
      const resultCount = Math.floor(Math.random() * 100) + 10;
      
      addSearch(term, category, resultCount);
      
      return { success: true, resultCount };
    } catch (error) {
      console.error('Erro na busca:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [addSearch]);

  return {
    searchHistory,
    isLoading,
    addSearch,
    removeSearch,
    clearHistory,
    searchInHistory,
    performSearch
  };
}