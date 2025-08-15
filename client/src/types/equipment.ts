export type EquipmentType = 'weapon' | 'axe' | 'armor' | 'pickaxe';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Equipment {
  rarity: Rarity;
  luckLevel: number; // 0 - 20
}

export interface EquipmentSession {
  weapon: Equipment;
  axe: Equipment;
  armor: Equipment;
  pickaxe: Equipment;
}

export const EQUIPMENT_NAMES: Record<EquipmentType, string> = {
  weapon: 'Arme',
  axe: 'Hache',
  armor: 'Armure',
  pickaxe: 'Pioche',
};

export const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Commun',
  uncommon: 'Uncommun',
  rare: 'Rare',
  epic: 'Épique',
  legendary: 'Légendaire',
};

export const RARITY_COLORS: Record<Rarity, string> = {
  common: 'text-white',
  uncommon: 'text-white',
  rare: 'text-white',
  epic: 'text-white',
  legendary: 'text-white',
};

export function clampLuck(level: number): number {
  if (Number.isNaN(level)) return 0;
  return Math.max(0, Math.min(20, Math.floor(level)));
}