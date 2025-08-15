import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { CalculatorFormData, CalculationResults, HistoryItem, CalculationBreakdown } from '@/types/calculator';
import { getCurrentUsername } from '@/hooks/use-auth';
import { calculateLuckEffectFromArray } from '@/lib/luckEffect';

export function useCalculator() {
	const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	
	const [formData, setFormData] = useState<CalculatorFormData>({
		investment: 100,
		gemsPurchased: 14000,
		gemsRemaining: 443,
		gemsConsumed: 13557,
		tokensEquipment: 1096,
		tokensFarmed: 4566,
		loadsUsed: 84,
		tokenPrice: 0.042,
		gemPrice: 0.0071,
	});

	const [luckMultiplier, setLuckMultiplier] = useState<number>(1);

	useEffect(() => {
		const onWhatIf = (e: Event) => {
			const custom = e as CustomEvent<{ targetLuck: number; history: number[] }>;
			const { targetLuck, history } = custom.detail || { targetLuck: 0, history: [] };
			const m = calculateLuckEffectFromArray(history || [], targetLuck || 0);
			setLuckMultiplier(m > 0 ? m : 1);
		};
		window.addEventListener('worldshards-whatif-luck', onWhatIf);
		return () => window.removeEventListener('worldshards-whatif-luck', onWhatIf);
	}, []);

	const updateFormData = useCallback((field: keyof CalculatorFormData, value: number) => {
		setFormData(prev => ({
			...prev,
			[field]: value,
		}));
	}, []);

	const results = useMemo((): CalculationResults | null => {
		if (formData.investment <= 0 || formData.tokenPrice <= 0 || formData.gemPrice <= 0) {
			return null;
		}

		// Tokens efetivamente farmados líquidos (subtrai os tokens gastos na aceleração)
		const netFarmedTokens = Math.max(0, formData.tokensFarmed - formData.tokensEquipment);
		const totalTokens = netFarmedTokens;
		const totalTokenValue = totalTokens * formData.tokenPrice * luckMultiplier;
		const gemsCost = formData.gemsConsumed * formData.gemPrice;
		const grossProfit = totalTokenValue; // já não somamos tokens gastos
		const rebuyCost = 0; // remover duplicidade: custo de gemas já está em gemsCost
		const finalProfit = grossProfit - gemsCost;
		const netProfit = finalProfit;
		const roi = formData.investment > 0 ? (finalProfit / formData.investment) * 100 : 0;
		const efficiency = formData.loadsUsed > 0 ? netFarmedTokens / formData.loadsUsed : 0;

		return {
			totalTokens,
			tokensEquipment: formData.tokensEquipment,
			tokensFarmed: formData.tokensFarmed,
			totalTokenValue,
			gemsCost,
			grossProfit,
			rebuyCost,
			finalProfit,
			netProfit,
			roi,
			efficiency,
		};
	}, [formData, luckMultiplier]);

	const breakdown = useMemo((): CalculationBreakdown[] => {
		if (!results) return [];

		return [
			{
				metric: 'Valor Total dos Tokens',
				key: 'results.totalTokenValue',
				value: `$${results.totalTokenValue.toFixed(2)}`,
				period: '',
				status: 'positive'
			},
			{
				metric: 'Custo das Gemas',
				key: 'results.gemsCost',
				value: `-$${results.gemsCost.toFixed(2)}`,
				period: '',
				status: 'negative'
			},
			{
				metric: 'Lucro Bruto',
				key: 'results.grossProfit',
				value: `$${results.grossProfit.toFixed(2)}`,
				period: '',
				status: results.grossProfit > 0 ? 'positive' : 'negative'
			},
			{
				metric: 'Lucro Líquido',
				key: 'results.finalProfit',
				value: `$${results.finalProfit.toFixed(2)}`,
				period: '',
				status: results.finalProfit > 0 ? 'positive' : 'negative'
			},
			{
				metric: 'ROI',
				key: 'results.roi',
				value: `${results.roi.toFixed(1)}%`,
				period: '',
				status: results.roi > 30 ? 'excellent' : results.roi > 0 ? 'positive' : 'negative'
			}
		];
	}, [results]);

	const saveToHistory = useCallback((formData: CalculatorFormData, results: CalculationResults) => {
		if (debounceTimeoutRef.current) {
			clearTimeout(debounceTimeoutRef.current);
		}

		debounceTimeoutRef.current = setTimeout(() => {
			const historyItem: HistoryItem = {
				timestamp: Date.now(),
				formData,
				results,
			};

			const username = getCurrentUsername() ?? 'guest';
			const key = `worldshards-history-${username}`;
			const existingHistory = localStorage.getItem(key);
			const history: HistoryItem[] = existingHistory ? JSON.parse(existingHistory) : [];
			
			const lastItem = history[history.length - 1];
			if (lastItem && Date.now() - lastItem.timestamp < 60000) {
				const isDuplicate = JSON.stringify(lastItem.formData) === JSON.stringify(formData);
				if (isDuplicate) return;
			}
			
			const updatedHistory = [...history, historyItem].slice(-50);
			localStorage.setItem(key, JSON.stringify(updatedHistory));
			if (typeof window !== 'undefined') {
				window.dispatchEvent(new CustomEvent('worldshards-history-updated'));
			}
		}, 500);
	}, [debounceTimeoutRef]);

	return {
		formData,
		results,
		breakdown,
		updateFormData,
		saveToHistory,
	};
}
