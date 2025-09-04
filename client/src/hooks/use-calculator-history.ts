import { useState, useEffect, useCallback } from 'react';

interface CalculationRecord {
  id: string;
  timestamp: number;
  gemsSpent: number;
  tokensEarned: number;
  profit: number;
  roi: number;
  tokenPrice: number;
  strategy: string;
}

const CALCULATOR_HISTORY_KEY = 'calculator_history';

export function useCalculatorHistory() {
  const [calculations, setCalculations] = useState<CalculationRecord[]>([]);

  // Carregar histórico do localStorage
  useEffect(() => {
    const saved = localStorage.getItem(CALCULATOR_HISTORY_KEY);
    if (saved) {
      try {
        setCalculations(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading calculator history:', error);
      }
    }
  }, []);

  // Salvar no localStorage sempre que o histórico mudar
  useEffect(() => {
    localStorage.setItem(CALCULATOR_HISTORY_KEY, JSON.stringify(calculations));
  }, [calculations]);

  const addCalculation = useCallback((data: {
    gemsSpent: number;
    tokensEarned: number;
    profit: number;
    roi: number;
    tokenPrice: number;
    strategy?: string;
  }) => {
    const newCalculation: CalculationRecord = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      strategy: data.strategy || 'Standard',
      ...data,
    };

    setCalculations(prev => {
      const updated = [newCalculation, ...prev];
      // Manter apenas os últimos 50 cálculos
      return updated.slice(0, 50);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setCalculations([]);
    localStorage.removeItem(CALCULATOR_HISTORY_KEY);
  }, []);

  const deleteCalculation = useCallback((id: string) => {
    setCalculations(prev => prev.filter(calc => calc.id !== id));
  }, []);

  const getStats = useCallback(() => {
    if (calculations.length === 0) {
      return {
        totalCalculations: 0,
        averageROI: 0,
        bestROI: 0,
        worstROI: 0,
        totalProfit: 0,
        totalGemsSpent: 0,
        totalTokensEarned: 0,
      };
    }

    const totalProfit = calculations.reduce((sum, calc) => sum + calc.profit, 0);
    const totalGemsSpent = calculations.reduce((sum, calc) => sum + calc.gemsSpent, 0);
    const totalTokensEarned = calculations.reduce((sum, calc) => sum + calc.tokensEarned, 0);
    const averageROI = calculations.reduce((sum, calc) => sum + calc.roi, 0) / calculations.length;
    const bestROI = Math.max(...calculations.map(calc => calc.roi));
    const worstROI = Math.min(...calculations.map(calc => calc.roi));

    return {
      totalCalculations: calculations.length,
      averageROI,
      bestROI,
      worstROI,
      totalProfit,
      totalGemsSpent,
      totalTokensEarned,
    };
  }, [calculations]);

  const getRecentCalculations = useCallback((limit: number = 10) => {
    return calculations.slice(0, limit);
  }, [calculations]);

  const exportHistory = useCallback(() => {
    const dataStr = JSON.stringify(calculations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `calculator-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [calculations]);

  const importHistory = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          setCalculations(imported);
        }
      } catch (error) {
        console.error('Error importing calculator history:', error);
        alert('Erro ao importar histórico. Verifique se o arquivo é válido.');
      }
    };
    reader.readAsText(file);
  }, []);

  return {
    calculations,
    addCalculation,
    clearHistory,
    deleteCalculation,
    getStats,
    getRecentCalculations,
    exportHistory,
    importHistory,
  };
}