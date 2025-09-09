export interface Acceleration {
	level: number;
	gems: number;
	tokens: number;
}

export interface EquipmentData {
	expanded: boolean;
	accelerations: Acceleration[];
}

export interface EquipmentAccelerations {
	weapon: EquipmentData;
	armor: EquipmentData;
	axe: EquipmentData;
	pickaxe: EquipmentData;
}

export interface NewAcceleration {
	gems: string;
	tokens: string;
}

export type EquipmentKey = keyof EquipmentAccelerations;

export interface EquipmentConfig {
	key: EquipmentKey;
	name: string;
	icon: string;
	gemField: string;
	tokenField: string;
}

export const EQUIPMENT_CONFIGS: EquipmentConfig[] = [
	{
		key: 'weapon',
		name: 'Arma',
		icon: '⚔️',
		gemField: 'weaponGems',
		tokenField: 'weaponTokens'
	},
	{
		key: 'armor',
		name: 'Armadura',
		icon: '🛡️',
		gemField: 'armorGems',
		tokenField: 'armorTokens'
	},
	{
		key: 'axe',
		name: 'Machado',
		icon: '🪓',
		gemField: 'axeGems',
		tokenField: 'axeTokens'
	},
	{
		key: 'pickaxe',
		name: 'Picareta',
		icon: '⛏️',
		gemField: 'pickaxeGems',
		tokenField: 'pickaxeTokens'
	}
];

export const DEFAULT_ACCELERATION: Acceleration = {
	level: 1,
	gems: 887,
	tokens: 1050
};