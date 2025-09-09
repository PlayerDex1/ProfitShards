import { useState, useEffect, useCallback } from 'react';
import { 
	EquipmentAccelerations, 
	EquipmentKey, 
	NewAcceleration, 
	Acceleration,
	DEFAULT_ACCELERATION 
} from '@/types/equipment';
import { CalculatorFormData } from '@/types/calculator';

interface UseEquipmentAccelerationsProps {
	onUpdateFormData: (field: keyof CalculatorFormData, value: any) => void;
}

export const useEquipmentAccelerations = ({ onUpdateFormData }: UseEquipmentAccelerationsProps) => {
	const [equipmentAccelerations, setEquipmentAccelerations] = useState<EquipmentAccelerations>({
		weapon: {
			expanded: false,
			accelerations: [DEFAULT_ACCELERATION]
		},
		armor: {
			expanded: false,
			accelerations: [DEFAULT_ACCELERATION]
		},
		axe: {
			expanded: false,
			accelerations: [DEFAULT_ACCELERATION]
		},
		pickaxe: {
			expanded: false,
			accelerations: [DEFAULT_ACCELERATION]
		}
	});

	const [newAcceleration, setNewAcceleration] = useState<NewAcceleration>({
		gems: '',
		tokens: ''
	});

	const toggleExpanded = useCallback((equipmentKey: EquipmentKey) => {
		setEquipmentAccelerations(prev => ({
			...prev,
			[equipmentKey]: {
				...prev[equipmentKey],
				expanded: !prev[equipmentKey].expanded
			}
		}));
	}, []);

	const addAcceleration = useCallback((equipmentKey: EquipmentKey) => {
		if (newAcceleration.gems === '' && newAcceleration.tokens === '') return;
		
		setEquipmentAccelerations(prev => ({
			...prev,
			[equipmentKey]: {
				...prev[equipmentKey],
				accelerations: [
					...prev[equipmentKey].accelerations,
					{
						level: prev[equipmentKey].accelerations.length + 1,
						gems: parseFloat(newAcceleration.gems) || 0,
						tokens: parseFloat(newAcceleration.tokens) || 0
					}
				]
			}
		}));
		
		setNewAcceleration({ gems: '', tokens: '' });
	}, [newAcceleration]);

	const calculateEquipmentTotals = useCallback((equipmentKey: EquipmentKey) => {
		const equipment = equipmentAccelerations[equipmentKey];
		const totalGems = equipment.accelerations.reduce((sum, acc) => sum + acc.gems, 0);
		const totalTokens = equipment.accelerations.reduce((sum, acc) => sum + acc.tokens, 0);
		return { totalGems, totalTokens };
	}, [equipmentAccelerations]);

	// Atualizar formData quando aceleramentos mudarem
	useEffect(() => {
		const equipmentKeys: EquipmentKey[] = ['weapon', 'armor', 'axe', 'pickaxe'];
		
		equipmentKeys.forEach(key => {
			const totals = calculateEquipmentTotals(key);
			const gemField = `${key}Gems` as keyof CalculatorFormData;
			const tokenField = `${key}Tokens` as keyof CalculatorFormData;
			
			onUpdateFormData(gemField, totals.totalGems);
			onUpdateFormData(tokenField, totals.totalTokens);
		});
	}, [equipmentAccelerations, calculateEquipmentTotals, onUpdateFormData]);

	return {
		equipmentAccelerations,
		newAcceleration,
		setNewAcceleration,
		toggleExpanded,
		addAcceleration,
		calculateEquipmentTotals
	};
};