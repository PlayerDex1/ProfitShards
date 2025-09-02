import { useState, useEffect, useCallback } from 'react';

export interface FavoriteCalculation {
  id: string;
  name: string;
  type: 'calculator' | 'planner' | 'analysis';
  data: any;
  timestamp: number;
  description?: string;
  tags?: string[];
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteCalculation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar favoritos do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('calculation-favorites');
      if (saved) {
        const parsed = JSON.parse(saved);
        setFavorites(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  }, []);

  // Salvar favoritos no localStorage
  const saveFavorites = useCallback((newFavorites: FavoriteCalculation[]) => {
    try {
      localStorage.setItem('calculation-favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Erro ao salvar favoritos:', error);
    }
  }, []);

  // Adicionar aos favoritos
  const addToFavorites = useCallback((calculation: Omit<FavoriteCalculation, 'id' | 'timestamp'>) => {
    const newFavorite: FavoriteCalculation = {
      ...calculation,
      id: Date.now().toString(),
      timestamp: Date.now()
    };

    setFavorites(prev => {
      // Verificar se já existe
      const exists = prev.some(fav => 
        fav.name === calculation.name && fav.type === calculation.type
      );
      
      if (exists) {
        return prev; // Já existe, não adicionar
      }

      const newFavorites = [newFavorite, ...prev];
      saveFavorites(newFavorites);
      return newFavorites;
    });

    return newFavorite;
  }, [saveFavorites]);

  // Remover dos favoritos
  const removeFromFavorites = useCallback((id: string) => {
    setFavorites(prev => {
      const newFavorites = prev.filter(fav => fav.id !== id);
      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, [saveFavorites]);

  // Verificar se está nos favoritos
  const isFavorite = useCallback((name: string, type: string) => {
    return favorites.some(fav => 
      fav.name === name && fav.type === type
    );
  }, [favorites]);

  // Buscar favoritos por tipo
  const getFavoritesByType = useCallback((type: string) => {
    return favorites.filter(fav => fav.type === type);
  }, [favorites]);

  // Buscar favoritos por tag
  const getFavoritesByTag = useCallback((tag: string) => {
    return favorites.filter(fav => 
      fav.tags?.some(t => t.toLowerCase().includes(tag.toLowerCase()))
    );
  }, [favorites]);

  // Atualizar favorito
  const updateFavorite = useCallback((id: string, updates: Partial<FavoriteCalculation>) => {
    setFavorites(prev => {
      const newFavorites = prev.map(fav => 
        fav.id === id ? { ...fav, ...updates } : fav
      );
      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, [saveFavorites]);

  // Simular operação com loading
  const performFavoriteOperation = useCallback(async (operation: () => void) => {
    setIsLoading(true);
    
    try {
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 500));
      operation();
    } catch (error) {
      console.error('Erro na operação de favoritos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    favorites,
    isLoading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    getFavoritesByType,
    getFavoritesByTag,
    updateFavorite,
    performFavoriteOperation
  };
}