import { useCallback, useEffect, useState } from 'react';
import { getCurrentUsername } from '@/hooks/use-auth';
import { useCloudStorage } from '@/hooks/useCloudStorage';

export interface CalculatorState {
	initialInvestmentUSD: number;
	gemsBought: number;
	gemsConsumed: number;
	equipmentTokens: number;
	farmedTokens: number;
	tokenPrice: number;
	gemPrice: number;
}

export const defaultCalculatorState: CalculatorState = {
	initialInvestmentUSD: 0,
	gemsBought: 0,
	gemsConsumed: 0,
	equipmentTokens: 0,
	farmedTokens: 0,
	tokenPrice: 0,
	gemPrice: 0,
};

export function useCalculator() {
	const [state, setState] = useState<CalculatorState>(defaultCalculatorState);
	const { saveCalculation, isCloudEnabled } = useCloudStorage();

	const saveToStorage = useCallback((newState: CalculatorState) => {
		const username = getCurrentUsername();
		const key = username ? `worldshards-form-${username}` : 'worldshards-form-guest';
		
		try {
			localStorage.setItem(key, JSON.stringify(newState));
			console.log('💾 [LOCAL] Calculator state saved to localStorage');
			
			// Save to cloud if user is logged in
			if (isCloudEnabled && username) {
				saveCalculation({
					type: 'profit',
					data: newState,
					results: calculateResults(newState)
				}).then((result) => {
					if (result.success) {
						console.log('☁️ [CLOUD] Calculator state synced to cloud');
					}
				});
			}
		} catch (error) {
			console.error('❌ Failed to save calculator state:', error);
		}
	}, [saveCalculation, isCloudEnabled]);

	const loadFromStorage = useCallback(() => {
		const username = getCurrentUsername();
		const key = username ? `worldshards-form-${username}` : 'worldshards-form-guest';
		
		try {
			const saved = localStorage.getItem(key);
			if (saved) {
				const parsedState = JSON.parse(saved);
				setState(parsedState);
				console.log('📥 [LOCAL] Calculator state loaded from localStorage');
				return parsedState;
			}
		} catch (error) {
			console.error('❌ Failed to load calculator state:', error);
		}
		
		setState(defaultCalculatorState);
		return defaultCalculatorState;
	}, []);

	// Calculate results
	const calculateResults = useCallback((calcState: CalculatorState) => {
		const totalTokens = calcState.equipmentTokens + calcState.farmedTokens;
		const totalValue = totalTokens * calcState.tokenPrice;
		const gemsCost = calcState.gemsConsumed * calcState.gemPrice;
		const grossProfit = totalValue - gemsCost;
		const rebuyCost = calcState.gemsConsumed * calcState.gemPrice;
		const netProfit = grossProfit - rebuyCost;
		const roi = calcState.initialInvestmentUSD > 0 ? (netProfit / calcState.initialInvestmentUSD) * 100 : 0;

		return {
			totalTokens,
			totalValue,
			gemsCost,
			grossProfit,
			rebuyCost,
			netProfit,
			roi,
			calculatedAt: Date.now()
		};
	}, []);

	// Restaurar do localStorage ao montar e quando auth mudar
	useEffect(() => {
		loadFromStorage();
	}, [loadFromStorage]);

	useEffect(() => {
		const onAuth = () => {
			console.log('🔄 [CALCULATOR] Auth changed, reloading calculator state');
			loadFromStorage();
		};

		window.addEventListener('worldshards-auth-updated', onAuth);
		return () => window.removeEventListener('worldshards-auth-updated', onAuth);
	}, [loadFromStorage]);

	// Listen for cloud data loaded event
	useEffect(() => {
		const onCloudDataLoaded = (event: CustomEvent) => {
			const cloudData = event.detail;
			console.log('☁️ [CALCULATOR] Cloud data received:', cloudData);
			
			if (cloudData?.data?.calculations) {
				// Find the most recent profit calculation
				const recentCalculation = cloudData.data.calculations
					.filter((calc: any) => calc.type === 'profit')
					.sort((a: any, b: any) => b.createdAt - a.createdAt)[0];

				if (recentCalculation) {
					console.log('📥 [CALCULATOR] Loading recent calculation from cloud');
					setState(recentCalculation.data);
					
					// Also save to localStorage for offline access
					const username = getCurrentUsername();
					const key = username ? `worldshards-form-${username}` : 'worldshards-form-guest';
					localStorage.setItem(key, JSON.stringify(recentCalculation.data));
				}
			}
		};

		window.addEventListener('cloud-data-loaded', onCloudDataLoaded as EventListener);
		return () => window.removeEventListener('cloud-data-loaded', onCloudDataLoaded as EventListener);
	}, []);

	const updateState = useCallback((updates: Partial<CalculatorState>) => {
		const newState = { ...state, ...updates };
		setState(newState);
		saveToStorage(newState);
	}, [state, saveToStorage]);

	const resetState = useCallback(() => {
		setState(defaultCalculatorState);
		saveToStorage(defaultCalculatorState);
	}, [saveToStorage]);

	return {
		state,
		updateState,
		resetState,
		calculateResults: () => calculateResults(state),
		isCloudSynced: isCloudEnabled
	};
}