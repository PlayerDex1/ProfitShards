import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { CalculatorFormData, CalculationResults, HistoryItem, CalculationBreakdown } from '@/types/calculator';
import { getCurrentUsername, useAuth } from '@/hooks/use-auth';
import { appendHistoryItem, refreshHistory, getHistoryCached } from '@/lib/historyApi';

const DEFAULT_FORM: CalculatorFormData = {
	// Removido: investment, gemsPurchased, gemsRemaining - não são mais necessários
	gemsConsumed: 0, // Calculado automaticamente
	tokensEquipment: 0, // Calculado automaticamente
	
	// Equipamentos separados
	weaponGems: 0,
	weaponTokens: 0,
	armorGems: 0,
	armorTokens: 0,
	axeGems: 0,
	axeTokens: 0,
	pickaxeGems: 0,
	pickaxeTokens: 0,
	
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


	// Restaurar do localStorage ao montar e quando auth mudar
	useEffect(() => {
		const load = () => {
			const key = storageKeyForUser(getCurrentUsername());
			try {
				const raw = localStorage.getItem(key);
				const loadedData = raw ? JSON.parse(raw) : DEFAULT_FORM;
				// Garantir que o valor padrão da gema seja aplicado se for 0
				if (loadedData.gemPrice === 0) {
					loadedData.gemPrice = 0.00714;
				}
				setFormData(loadedData);
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


	// Load history on mount and when updated
	useEffect(() => {
		const loadedHistory = getHistoryCached();
		console.log('🔍 DEBUG: Carregando histórico inicial:', loadedHistory);
		setHistory(loadedHistory);
		
		const handleHistoryUpdate = () => {
			const updatedHistory = getHistoryCached();
			console.log('🔍 DEBUG: Histórico atualizado:', updatedHistory);
			setHistory(updatedHistory);
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
		// Always return results, even with zero values - let users see the calculator
		// if (formData.tokenPrice <= 0 && formData.tokensFarmed <= 0) {
		//	return null;
		// }

		// Use defaults for missing values
		const tokenPrice = formData.tokenPrice || 0;
		const gemPrice = formData.gemPrice || 0.00714; // default gem price
		const tokensFarmed = formData.tokensFarmed || 0;
		const loadsUsed = formData.loadsUsed || 1; // avoid division by zero

		// Calcular totais dos equipamentos separados
		const totalEquipmentGems = (formData.weaponGems || 0) + (formData.armorGems || 0) + (formData.axeGems || 0) + (formData.pickaxeGems || 0);
		const totalEquipmentTokens = (formData.weaponTokens || 0) + (formData.armorTokens || 0) + (formData.axeTokens || 0) + (formData.pickaxeTokens || 0);

		// Breakdown por equipamento
		const equipmentBreakdown = {
			weapon: {
				gems: formData.weaponGems || 0,
				tokens: formData.weaponTokens || 0,
				cost: (formData.weaponGems || 0) * gemPrice + (formData.weaponTokens || 0) * tokenPrice
			},
			armor: {
				gems: formData.armorGems || 0,
				tokens: formData.armorTokens || 0,
				cost: (formData.armorGems || 0) * gemPrice + (formData.armorTokens || 0) * tokenPrice
			},
			axe: {
				gems: formData.axeGems || 0,
				tokens: formData.axeTokens || 0,
				cost: (formData.axeGems || 0) * gemPrice + (formData.axeTokens || 0) * tokenPrice
			},
			pickaxe: {
				gems: formData.pickaxeGems || 0,
				tokens: formData.pickaxeTokens || 0,
				cost: (formData.pickaxeGems || 0) * gemPrice + (formData.pickaxeTokens || 0) * tokenPrice
			}
		};

		// LÓGICA CORRETA: Tokens líquidos = Tokens farmados - Tokens utilizados nos equipamentos
		const netFarmedTokens = Math.max(0, tokensFarmed - totalEquipmentTokens);
		const totalTokens = netFarmedTokens;
		
		// Valor dos tokens líquidos (lucro real)
		const netTokenValue = netFarmedTokens * tokenPrice;
		
		// Custo apenas das gems (investimento inicial)
		const gemsCost = totalEquipmentGems * gemPrice;
		
		// Custo dos tokens utilizados nos equipamentos
		const tokensCost = totalEquipmentTokens * tokenPrice;
		
		// Custo total (gems + tokens)
		const totalCost = gemsCost + tokensCost;
		
		// LUCRO REAL = Valor dos tokens líquidos - Custo das gems
		const grossProfit = netTokenValue;
		const rebuyCost = 0;
		const finalProfit = grossProfit - gemsCost;
		const netProfit = finalProfit;
		
		// ROI baseado apenas no custo das gems (investimento inicial)
		const roi = gemsCost > 0 ? (finalProfit / gemsCost) * 100 : 0;
		const efficiency = loadsUsed > 0 ? netFarmedTokens / loadsUsed : 0;

		return {
			totalTokens,
			tokensEquipment: totalEquipmentTokens, // Para compatibilidade
			tokensFarmed,
			totalTokenValue: netTokenValue, // Valor dos tokens líquidos
			gemsCost, // Apenas custo das gems
			tokensCost, // Custo dos tokens utilizados
			totalCost, // Custo total (gems + tokens)
			grossProfit,
			rebuyCost,
			finalProfit,
			netProfit,
			roi,
			efficiency,
			equipmentBreakdown,
		};
	}, [formData]);

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

		console.log('🔍 DEBUG: Salvando no histórico:', historyItem);
		appendHistoryItem(historyItem);
		console.log('🔍 DEBUG: Histórico após salvar:', getHistoryCached());
		
		// Disparar evento para tracking de missões
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent('calculation-completed', {
				detail: { historyItem }
			}));
		}
		
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