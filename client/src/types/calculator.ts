export interface CalculatorFormData {
  investment: number;
  gemsPurchased: number;
  gemsRemaining: number;
  gemsConsumed: number;
  tokensEquipment: number;
  tokensFarmed: number;
  loadsUsed: number;
  tokenPrice: number;
  gemPrice: number;
}

export interface CalculationResults {
  totalTokens: number;
  tokensEquipment: number;
  tokensFarmed: number;
  totalTokenValue: number;
  gemsCost: number;
  grossProfit: number;
  rebuyCost: number;
  finalProfit: number;
  netProfit: number;
  roi: number;
  efficiency: number;
}

export interface CalculationBreakdown {
  metric: string;
  value: string;
  period: string;
  status: 'positive' | 'negative' | 'excellent' | 'neutral';
}

export interface HistoryItem {
  timestamp: number;
  formData: CalculatorFormData;
  results: CalculationResults;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  tier: string;
  cost: number;
  revenuePerHour: number;
  maintenanceCost: number;
  roi: number;
  efficiency: number;
  paybackDays: number;
  status: 'active' | 'inactive';
}
