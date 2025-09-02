import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'wouter';

export interface NavigationEntry {
  path: string;
  title: string;
  timestamp: number;
  data?: any;
}

export function useNavigationHistory() {
  const [location] = useLocation();
  const [history, setHistory] = useState<NavigationEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  // Adicionar nova entrada ao histórico
  const addToHistory = useCallback((path: string, title: string, data?: any) => {
    const newEntry: NavigationEntry = {
      path,
      title,
      timestamp: Date.now(),
      data
    };

    setHistory(prev => {
      // Remover entradas duplicadas consecutivas
      const filtered = prev.filter((entry, index) => {
        if (index === 0) return true;
        return entry.path !== prev[index - 1].path;
      });

      // Adicionar nova entrada
      return [...filtered, newEntry];
    });

    setCurrentIndex(prev => prev + 1);
  }, []);

  // Navegar para entrada anterior
  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      const targetIndex = currentIndex - 1;
      const targetEntry = history[targetIndex];
      
      if (targetEntry) {
        setCurrentIndex(targetIndex);
        window.history.pushState({}, '', targetEntry.path);
        
        // Disparar evento para notificar mudança de rota
        window.dispatchEvent(new PopStateEvent('popstate'));
        
        return targetEntry;
      }
    }
    return null;
  }, [currentIndex, history]);

  // Navegar para entrada posterior
  const goForward = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const targetIndex = currentIndex + 1;
      const targetEntry = history[targetIndex];
      
      if (targetEntry) {
        setCurrentIndex(targetIndex);
        window.history.pushState({}, '', targetEntry.path);
        
        // Disparar evento para notificar mudança de rota
        window.dispatchEvent(new PopStateEvent('popstate'));
        
        return targetEntry;
      }
    }
    return null;
  }, [currentIndex, history]);

  // Verificar se pode voltar
  const canGoBack = currentIndex > 0;
  
  // Verificar se pode avançar
  const canGoForward = currentIndex < history.length - 1;

  // Obter entrada atual
  const currentEntry = history[currentIndex] || null;

  // Obter entrada anterior
  const previousEntry = currentIndex > 0 ? history[currentIndex - 1] : null;

  // Obter entrada posterior
  const nextEntry = currentIndex < history.length - 1 ? history[currentIndex + 1] : null;

  // Navegar para entrada específica
  const goToEntry = useCallback((index: number) => {
    if (index >= 0 && index < history.length) {
      const targetEntry = history[index];
      setCurrentIndex(index);
      window.history.pushState({}, '', targetEntry.path);
      
      // Disparar evento para notificar mudança de rota
      window.dispatchEvent(new PopStateEvent('popstate'));
      
      return targetEntry;
    }
    return null;
  }, [history]);

  // Limpar histórico
  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  // Adicionar entrada atual ao histórico quando a rota mudar
  useEffect(() => {
    if (location) {
      // Obter título da página atual
      const title = document.title || 'ProfitShards';
      
      // Adicionar ao histórico
      addToHistory(location, title);
    }
  }, [location, addToHistory]);

  // Salvar histórico no localStorage
  useEffect(() => {
    try {
      const historyData = {
        history: history.slice(-50), // Manter apenas as últimas 50 entradas
        currentIndex
      };
      localStorage.setItem('navigation-history', JSON.stringify(historyData));
    } catch (error) {
      console.error('Failed to save navigation history:', error);
    }
  }, [history, currentIndex]);

  // Carregar histórico do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('navigation-history');
      if (saved) {
        const { history: savedHistory, currentIndex: savedIndex } = JSON.parse(saved);
        if (Array.isArray(savedHistory) && typeof savedIndex === 'number') {
          setHistory(savedHistory);
          setCurrentIndex(savedIndex);
        }
      }
    } catch (error) {
      console.error('Failed to load navigation history:', error);
    }
  }, []);

  return {
    // Estado
    history,
    currentIndex,
    currentEntry,
    previousEntry,
    nextEntry,
    
    // Ações
    addToHistory,
    goBack,
    goForward,
    goToEntry,
    clearHistory,
    
    // Status
    canGoBack,
    canGoForward,
    
    // Utilitários
    historyLength: history.length
  };
}