import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { CalculatorFormData, CalculationResults, HistoryItem, CalculationBreakdown } from '@/types/calculator';
import { getCurrentUsername, useAuth } from '@/hooks/use-auth';
import { calculateLuckEffectFromArray } from '@/lib/luckEffect';
import { appendHistoryItem, refreshHistory, getHistoryCached } from '@/lib/historyApi';

const DEFAULT_FORM: CalculatorFormData = {
	investment: 0,
	gemsPurchased: 0,
	gemsRemaining: 0,
	gemsConsumed: 0,
	tokensEquipment: 0,
	tokensFarmed: 0,
	loadsUsed: 0,
	tokenPrice: 0,
	gemPrice: 0.00714,
};

function storageKeyForUser(user: string | null) {
	return `worldshards-form-${user ?? 'guest'}`;
}

export function useCalculator() {
	const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const { isAuthenticated } = useAuth();
	
	const [formData, setFormData] = useState<CalculatorFormData>(DEFAULT_FORM);
	const [history, setHistory] = useState<HistoryItem[]>([]);

	const [luckMultiplier, setLuckMultiplier] = useState<number>(1);

	// Restaurar do localStorage ao montar e quando auth mudar
	useEffect(() => {
		const load = () => {
			const key = storageKeyForUser(getCurrentUsername());
			try {
				const raw = localStorage.getItem(key);
				setFormData(raw ? JSON.parse(raw) : DEFAULT_FORM);
			} catch {
				setFormData(DEFAULT_FORM);
			}
			// warm history cache from server
			refreshHistory().catch(() => {});
		};
		load();
		const onAuth = () => {
			const user = getCurrentUsername();
			if (!user) {
				// logout (inclusive AFK): limpar e voltar ao padrão
				try { localStorage.removeItem(storageKeyForUser(null)); } catch {}
				setFormData(DEFAULT_FORM);
			} else {
				load();
			}
		};
		window.addEventListener('worldshards-auth-updated', onAuth);
		return () => window.removeEventListener('worldshards-auth-updated', onAuth);
	}, []);

	// Salvar automaticamente o formulário por usuário (apenas logado)
	useEffect(() => {
		const user = getCurrentUsername();
		if (!user) return;
		try {
			localStorage.setItem(storageKeyForUser(user), JSON.stringify(formData));
		} catch {}
	}, [formData]);

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

	// Load history on mount and when updated
	useEffect(() => {
		setHistory(getHistoryCached());
		
		const handleHistoryUpdate = () => {
			setHistory(getHistoryCached());
		};
		
		window.addEventListener('worldshards-history-updated', handleHistoryUpdate);
		return () => window.removeEventListener('worldshards-history-updated', handleHistoryUpdate);
	}, []);

	const updateFormData = useCallback((field: keyof CalculatorFormData, value: number) => {
		setFormData(prev => ({
			...prev,
			[field]: value,
		}));
	}, []);

	const results = useMemo((): CalculationResults | null => {
		// Only require that at least some meaningful data is provided
		if (formData.tokenPrice <= 0 && formData.tokensFarmed <= 0 && formData.investment <= 0) {
			return null;
		}

		// Use defaults for missing values
		const investment = formData.investment || 0;
		const tokenPrice = formData.tokenPrice || 0;
		const gemPrice = formData.gemPrice || 0.00714; // default gem price
		const tokensFarmed = formData.tokensFarmed || 0;
		const tokensEquipment = formData.tokensEquipment || 0;
		const gemsConsumed = formData.gemsConsumed || 0;
		const loadsUsed = formData.loadsUsed || 1; // avoid division by zero

		// Tokens efetivamente farmados líquidos (subtrai os tokens gastos na aceleração)
		const netFarmedTokens = Math.max(0, tokensFarmed - tokensEquipment);
		const totalTokens = netFarmedTokens;
		const totalTokenValue = totalTokens * tokenPrice * luckMultiplier;
		const gemsCost = gemsConsumed * gemPrice;
		const grossProfit = totalTokenValue; // já não somamos tokens gastos
		const rebuyCost = 0; // remover duplicidade: custo de gemas já está em gemsCost
		const finalProfit = grossProfit - gemsCost;
		const netProfit = finalProfit;
		const roi = investment > 0 ? (finalProfit / investment) * 100 : 0;
		const efficiency = loadsUsed > 0 ? netFarmedTokens / loadsUsed : 0;

		return {
			totalTokens,
			tokensEquipment,
			tokensFarmed,
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
				metric: 'Lucro Final',
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

	const saveToHistory = useCallback(async (formData: CalculatorFormData, results: CalculationResults) => {
		// Manual save - immediate save
		const historyItem: HistoryItem = {
			timestamp: Date.now(),
			formData,
			results,
		};

		appendHistoryItem(historyItem);
		
		// Salvar métricas anônimas se usuário autenticado
		if (isAuthenticated && results.finalProfit !== undefined) {
			try {
				await fetch('/api/admin/save-metrics', {
					method: 'POST',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						type: 'calculation',
						data: formData,
						results: results
					})
				});
			} catch (error) {
				console.log('Metrics save failed (non-critical):', error);
			}
		}
	}, [isAuthenticated]);

	return {
		formData,
		results,
		breakdown,
		updateFormData,
		saveToHistory,
		history,
	};
}