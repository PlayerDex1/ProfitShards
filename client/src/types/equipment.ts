export type EquipmentType = 'weapon' | 'axe' | 'armor' | 'pickaxe';

export type Rarity = 'comum' | 'incomum' | 'raro' | 'épico' | 'lendário' | 'mítico';

export interface Equipment {
  luck: number; // 0 - 3000
  rarity: Rarity;
}

export interface EquipmentSession {
  weapon: Equipment;
  axe: Equipment;
  armor: Equipment;
  pickaxe: Equipment;
}

export const EQUIPMENT_NAMES: Record<EquipmentType, string> = {
  weapon: 'Arma',
  axe: 'Machado',
  armor: 'Armadura',
  pickaxe: 'Picareta',
};

export const RARITY_LABELS: Record<Rarity, string> = {
  comum: 'Comum',
  incomum: 'Incomum',
  raro: 'Raro',
  épico: 'Épico',
  lendário: 'Lendário',
  mítico: 'Mítico',
};

export const RARITY_COLORS: Record<Rarity, string> = {
  comum: 'text-gray-300',
  incomum: 'text-green-400',
  raro: 'text-blue-400',
  épico: 'text-purple-400',
  lendário: 'text-yellow-300',
  mítico: 'text-orange-400',
};

export function clampLuck(level: number): number {
  if (Number.isNaN(level)) return 0;
  return Math.max(0, Math.min(3053, Math.floor(level)));
}