import { useState, useEffect, useCallback } from 'react';

interface OpenLootConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  baseURL: string;
}

interface OpenLootUser {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

interface OpenLootItem {
  id: string;
  name: string;
  description: string;
  image: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  value: number;
  category: string;
}

interface OpenLootTransaction {
  id: string;
  type: 'purchase' | 'sale' | 'trade';
  item: OpenLootItem;
  amount: number;
  price: number;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

// Configuração da API OpenLoot
const OPENLOOT_CONFIG: OpenLootConfig = {
  clientId: process.env.VITE_OPENLOOT_CLIENT_ID || '',
  clientSecret: process.env.VITE_OPENLOOT_CLIENT_SECRET || '',
  redirectUri: process.env.VITE_OPENLOOT_REDIRECT_URI || `${window.location.origin}/profile`,
  baseURL: 'https://api.openloot.com'
};

export function useOpenLoot() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<OpenLootUser | null>(null);
  const [inventory, setInventory] = useState<OpenLootItem[]>([]);
  const [transactions, setTransactions] = useState<OpenLootTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar se está autenticado
  useEffect(() => {
    const token = localStorage.getItem('openloot_access_token');
    if (token) {
      setIsAuthenticated(true);
      fetchUserData();
    }
  }, []);

  // Iniciar processo de autenticação OAuth
  const authenticate = useCallback(() => {
    const authUrl = `${OPENLOOT_CONFIG.baseURL}/oauth/v1/authorize?` +
      `client_id=${OPENLOOT_CONFIG.clientId}&` +
      `redirect_uri=${encodeURIComponent(OPENLOOT_CONFIG.redirectUri)}&` +
      `response_type=code&` +
      `scope=read:user read:inventory read:transactions`;
    
    window.location.href = authUrl;
  }, []);

  // Buscar dados do usuário
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('openloot_access_token');
      if (!token) return;

      const response = await fetch(`${OPENLOOT_CONFIG.baseURL}/v1/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('OpenLoot auth error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar inventário
  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('openloot_access_token');
      if (!token) return;

      const response = await fetch(`${OPENLOOT_CONFIG.baseURL}/v1/inventory`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const inventoryData = await response.json();
        setInventory(inventoryData.items || []);
      } else {
        throw new Error('Failed to fetch inventory');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('OpenLoot inventory error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar transações
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('openloot_access_token');
      if (!token) return;

      const response = await fetch(`${OPENLOOT_CONFIG.baseURL}/v1/transactions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const transactionsData = await response.json();
        setTransactions(transactionsData.transactions || []);
      } else {
        throw new Error('Failed to fetch transactions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('OpenLoot transactions error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('openloot_access_token');
    localStorage.removeItem('openloot_refresh_token');
    setIsAuthenticated(false);
    setUser(null);
    setInventory([]);
    setTransactions([]);
  }, []);

  // Calcular valor total do inventário
  const getTotalInventoryValue = useCallback(() => {
    return inventory.reduce((total, item) => total + item.value, 0);
  }, [inventory]);

  // Calcular ROI das transações
  const getTransactionROI = useCallback(() => {
    const sales = transactions.filter(t => t.type === 'sale');
    const purchases = transactions.filter(t => t.type === 'purchase');
    
    const totalSales = sales.reduce((sum, t) => sum + t.price, 0);
    const totalPurchases = purchases.reduce((sum, t) => sum + t.price, 0);
    
    if (totalPurchases === 0) return 0;
    return ((totalSales - totalPurchases) / totalPurchases) * 100;
  }, [transactions]);

  return {
    // Estado
    isAuthenticated,
    user,
    inventory,
    transactions,
    loading,
    error,
    
    // Ações
    authenticate,
    fetchUserData,
    fetchInventory,
    fetchTransactions,
    logout,
    
    // Utilitários
    getTotalInventoryValue,
    getTransactionROI,
    
    // Configuração
    config: OPENLOOT_CONFIG
  };
}