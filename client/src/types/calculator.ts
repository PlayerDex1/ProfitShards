export interface CalculatorFormData {
  investment: number;
  gemsPurchased: number;
  gemsRemaining: number;
  gemsConsumed: number; // Mantido para compatibilidade - será calculado automaticamente
  tokensEquipment: number; // Mantido para compatibilidade - será calculado automaticamente
  
  // Equipamentos separados
  weaponGems: number;
  weaponTokens: number;
  armorGems: number;
  armorTokens: number;
  axeGems: number;
  axeTokens: number;
  pickaxeGems: number;
  pickaxeTokens: number;
  
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
  
  // Breakdown por equipamento
  equipmentBreakdown: {
    weapon: { gems: number; tokens: number; cost: number; };
    armor: { gems: number; tokens: number; cost: number; };
    axe: { gems: number; tokens: number; cost: number; };
    pickaxe: { gems: number; tokens: number; cost: number; };
  };
}

export interface CalculationBreakdown {
  metric: string;
  value: string;
  period: string;
  status: 'positive' | 'negative' | 'excellent' | 'neutral';
  key?: string;
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
