import { memo, useEffect, useMemo, useState } from "react";
import { DollarSign, Gem, Zap, RefreshCw, BarChart3, Download, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalculatorFormData, CalculationResults } from "@/types/calculator";
import { useI18n } from "@/i18n";
import { useTokenPrice } from "@/hooks/use-token-price";
import { useCalculatorHistory } from "@/hooks/use-calculator-history";
import { CalculatorChartsSimple } from "@/components/CalculatorChartsSimple";
import { useToastContext } from "@/contexts/ToastContext";

interface CalculatorProps {
	formData: CalculatorFormData;
	results: CalculationResults;
	onUpdateFormData: (field: keyof CalculatorFormData, value: any) => void;
	onSaveToHistory: (formData: CalculatorFormData, results: CalculationResults) => void;
}

export const Calculator = memo(function Calculator({ formData, results, onUpdateFormData, onSaveToHistory }: CalculatorProps) {
	const { t } = useI18n();
	const { price: tokenPrice, loading: priceLoading, error: priceError, refreshPrice, isStale } = useTokenPrice();
	const { calculations, addCalculation, clearHistory, getStats, exportHistory } = useCalculatorHistory();
	const { success, error: showError, info } = useToastContext();
	const [showCharts, setShowCharts] = useState(false);
	const [touched, setTouched] = useState<Record<string, boolean>>({});
	const [error, setError] = useState<string | null>(null);
	const [saveMessage, setSaveMessage] = useState<string>('');

	// Atualizar preço do token quando disponível
	useEffect(() => {
		if (tokenPrice && tokenPrice > 0) {
			onUpdateFormData('tokenPrice', tokenPrice);
		}
	}, [tokenPrice, onUpdateFormData]);

	// Notificar quando preço do token é atualizado
	useEffect(() => {
		if (tokenPrice && tokenPrice > 0 && !priceLoading) {
			info('Preço Atualizado', `WorldShards: $${tokenPrice.toFixed(5)}`);
		}
	}, [tokenPrice, priceLoading, info]);

	// Função para atualizar preço manualmente
	const handleRefreshPrice = async () => {
		await refreshPrice();
	};

	useEffect(() => {
		// Mark fields as touched if they already have non-zero value
		try {
			const init: Record<string, boolean> = {};
			(Object.keys(formData) as (keyof CalculatorFormData)[]).forEach((k) => {
				const v = formData[k] as any;
				if (k === 'gemPrice') init[k] = true; // always show default gem price
				else init[k] = typeof v === 'number' ? v !== 0 : !!v;
			});
			setTouched(init);
			setError(null);
		} catch (err) {
			console.error('Error initializing calculator:', err);
			setError('Erro ao inicializar calculadora');
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleInputChange = (field: keyof CalculatorFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
		try {
			const raw = e.target.value.replace(',', '.');
			const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : (raw === '' ? 0 : parseFloat(raw) || 0);
			
			// Validate the value
			if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
				console.warn(`Invalid value for ${field}:`, value);
				return;
			}
			
			onUpdateFormData(field, value);
			setTouched((prev) => ({ ...prev, [field]: true }));
			setError(null);
		} catch (err) {
			console.error(`Error updating field ${field}:`, err);
			setError(`Erro ao atualizar ${field}`);
		}
	};

	const displayValue = (field: keyof CalculatorFormData, v: number) => {
		if (field === 'gemPrice') return v; // keep default visible
		return !touched[field] && v === 0 ? '' : Number.isFinite(v) ? Number(v) : 0;
	};

	const handleManualSave = () => {
		// Manual save with feedback
		success('Cálculo Salvo!', `ROI: ${results.roi.toFixed(1)}% - Lucro: ${results.profit.toFixed(2)} tokens`);
		onSaveToHistory(formData, results);
		
		// Also add to local history for charts
		addCalculation({
			gemsSpent: formData.gemsSpent,
			tokensEarned: formData.tokensEarned,
			profit: results.profit,
			roi: results.roi,
			tokenPrice: formData.tokenPrice,
			strategy: 'Manual Calculation',
		});
	};

	if (error) {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="text-center text-red-500">
						<p>{error}</p>
						<Button 
							onClick={() => {
								setError(null);
								window.location.reload();
							}} 
							variant="outline" 
							className="mt-4"
						>
							Recarregar
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
		<Card>
			<CardHeader className="py-4">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-primary rounded-lg">
						<DollarSign className="w-5 h-5 text-primary-foreground" />
					</div>
					<CardTitle className="text-xl font-bold text-foreground">
						{t('calc.title')}
					</CardTitle>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Investment Section */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
						<DollarSign className="w-4 h-4" />
						Investimento
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<Label htmlFor="investment" className="text-base font-medium text-foreground">
								{t('calc.investment')}
							</Label>
							<Input
								id="investment"
								type="number"
								step="0.01"
								value={displayValue('investment', formData.investment)}
								onChange={handleInputChange('investment')}
								placeholder="0.00"
								className="mt-1"
							/>
						</div>
						<div>
							<Label htmlFor="gemPrice" className="text-base font-medium text-foreground">
								{t('calc.gemPrice')}
							</Label>
							<Input
								id="gemPrice"
								type="number"
								step="0.00001"
								value={displayValue('gemPrice', formData.gemPrice)}
								onChange={handleInputChange('gemPrice')}
								placeholder="0.00714"
								className="mt-1"
							/>
						</div>
					</div>
				</div>

				{/* Gems Section */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
						<Gem className="w-4 h-4" />
						Gemas
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<Label htmlFor="gemsPurchased" className="text-base font-medium text-foreground">
								{t('calc.gemsPurchased')}
							</Label>
							<Input
								id="gemsPurchased"
								type="number"
								value={displayValue('gemsPurchased', formData.gemsPurchased)}
								onChange={handleInputChange('gemsPurchased')}
								placeholder="0"
								className="mt-1"
							/>
						</div>
						<div>
							<Label htmlFor="gemsRemaining" className="text-base font-medium text-foreground">
								{t('calc.gemsRemaining')}
							</Label>
							<Input
								id="gemsRemaining"
								type="number"
								value={displayValue('gemsRemaining', formData.gemsRemaining)}
								onChange={handleInputChange('gemsRemaining')}
								placeholder="0"
								className="mt-1"
							/>
						</div>
						<div>
							<Label htmlFor="gemsConsumed" className="text-base font-medium text-foreground">
								{t('calc.gemsConsumed')}
							</Label>
							<Input
								id="gemsConsumed"
								type="number"
								value={displayValue('gemsConsumed', formData.gemsConsumed)}
								onChange={handleInputChange('gemsConsumed')}
								placeholder="0"
								className="mt-1"
							/>
						</div>
					</div>
				</div>

				{/* Tokens Section */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
						<Zap className="w-4 h-4" />
						Tokens
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<Label htmlFor="tokensEquipment" className="text-base font-medium text-foreground">
								{t('calc.tokensEquipment')}
							</Label>
							<Input
								id="tokensEquipment"
								type="number"
								value={displayValue('tokensEquipment', formData.tokensEquipment)}
								onChange={handleInputChange('tokensEquipment')}
								placeholder="0"
								className="mt-1"
							/>
						</div>
						<div>
							<Label htmlFor="tokensFarmed" className="text-base font-medium text-foreground">
								{t('calc.tokensFarmed')}
							</Label>
							<Input
								id="tokensFarmed"
								type="number"
								value={displayValue('tokensFarmed', formData.tokensFarmed)}
								onChange={handleInputChange('tokensFarmed')}
								placeholder="0"
								className="mt-1"
							/>
						</div>
						<div>
							<Label htmlFor="loadsUsed" className="text-base font-medium text-foreground">
								{t('calc.loadsUsed')}
							</Label>
							<Input
								id="loadsUsed"
								type="number"
								value={displayValue('loadsUsed', formData.loadsUsed)}
								onChange={handleInputChange('loadsUsed')}
								placeholder="0"
								className="mt-1"
							/>
						</div>
						<div>
							<div className="flex items-center justify-between mb-2">
								<Label htmlFor="tokenPrice" className="text-base font-medium text-foreground">
									{t('calc.tokenPrice')}
								</Label>
								<div className="flex items-center gap-2">
									{tokenPrice && (
										<span className={`text-xs px-2 py-1 rounded-full ${
											isStale 
												? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' 
												: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
										}`}>
											{isStale ? `⚠️ ${t('calc.outdated')}` : `✅ ${t('calc.updated')}`}
										</span>
									)}
									<Button
										variant="outline"
										size="sm"
										onClick={handleRefreshPrice}
										disabled={priceLoading}
										className="p-2 h-8 w-8"
										title={t('calc.refreshPrice')}
									>
										<RefreshCw className={`w-4 h-4 ${priceLoading ? 'animate-spin' : ''}`} />
									</Button>
								</div>
							</div>
							
							{tokenPrice && (
								<div className="mb-2 text-sm text-muted-foreground">
									💰 {t('calc.currentPrice')}: <span className="font-medium">${tokenPrice.toFixed(5)}</span>
									{priceError && (
										<span className="text-red-500 ml-2">⚠️ {t('calc.error')}: {priceError}</span>
									)}
								</div>
							)}
							
							<Input
								id="tokenPrice"
								type="number"
								step="0.00001"
								value={displayValue('tokenPrice', formData.tokenPrice)}
								onChange={handleInputChange('tokenPrice')}
								placeholder="0.00000"
								className="mt-1"
							/>
						</div>
					</div>
				</div>

				{/* Manual Save Button */}
				<div className="pt-4 border-t space-y-3">
					{saveMessage && (
						<div className="text-center text-sm p-2 rounded-lg bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800">
							{saveMessage}
						</div>
					)}
					
					<div className="text-center">
						<p className="text-sm text-muted-foreground mb-3">
							💡 Clique no botão abaixo para salvar este cálculo no seu histórico
						</p>
						<Button 
							onClick={handleManualSave} 
							className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 hover:shadow-lg hover:scale-[1.02] transition-all duration-300" 
							size="lg"
						>
							<Zap className="w-4 h-4 mr-2" />
							{t('calc.button')}
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>

		{/* Controles de Gráficos */}
		<div className="mt-6 flex gap-4 justify-center">
			<Button
				onClick={() => setShowCharts(!showCharts)}
				variant="outline"
				className="btn-premium"
			>
				<BarChart3 className="w-4 h-4 mr-2" />
				{showCharts ? 'Ocultar Gráficos' : 'Mostrar Gráficos'}
			</Button>
			
			{calculations.length > 0 && (
				<>
					<Button
						onClick={() => {
							exportHistory();
							info('Histórico Exportado', 'Arquivo JSON baixado com sucesso!');
						}}
						variant="outline"
						className="btn-premium"
					>
						<Download className="w-4 h-4 mr-2" />
						Exportar
					</Button>
					
					<Button
						onClick={() => {
							clearHistory();
							info('Histórico Limpo', 'Todos os dados foram removidos');
						}}
						variant="outline"
						className="btn-premium text-red-600 hover:text-red-700"
					>
						<Trash2 className="w-4 h-4 mr-2" />
						Limpar
					</Button>
				</>
			)}
		</div>

		{/* Gráficos */}
		{showCharts && results && (
			<div className="mt-6">
				<CalculatorChartsSimple 
					calculations={calculations}
					currentData={{
						gemsSpent: formData.gemsSpent || 0,
						tokensEarned: formData.tokensEarned || 0,
						profit: results.profit || 0,
						roi: results.roi || 0,
					}}
				/>
			</div>
		)}
		</>
	);
});
