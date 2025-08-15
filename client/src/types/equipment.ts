export type EquipmentType = 'weapon' | 'axe' | 'armor' | 'pickaxe';

export interface Equipment {
  luck: number; // 0 - 3000
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

export function clampLuck(level: number): number {
  if (Number.isNaN(level)) return 0;
  return Math.max(0, Math.min(3000, Math.floor(level)));
}