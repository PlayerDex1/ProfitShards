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
	
	// Debug logs
	console.log('🔍 Calculator - formData:', formData);
	console.log('🔍 Calculator - results:', results);
	console.log('🔍 Calculator - calculations:', calculations);

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
		const totalGemsUsed = (formData.weaponGems || 0) + (formData.armorGems || 0) + (formData.axeGems || 0) + (formData.pickaxeGems || 0);
		const totalTokensUsed = (formData.weaponTokens || 0) + (formData.armorTokens || 0) + (formData.axeTokens || 0) + (formData.pickaxeTokens || 0);
		success('Cálculo Salvo!', `ROI: ${results.roi.toFixed(1)}% - ${totalGemsUsed} gems + ${totalTokensUsed} tokens`);
		onSaveToHistory(formData, results);
		
		// Also add to local history for charts
		addCalculation({
			gemsSpent: totalGemsUsed,
			tokensEarned: formData.tokensFarmed,
			profit: results.finalProfit,
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
				{/* Gem Price Section */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
						<Gem className="w-4 h-4" />
						Preço das Gemas
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-1 gap-4">
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
							<p className="text-sm text-muted-foreground mt-1">
								💡 Preço atual de cada gema em USD
							</p>
						</div>
					</div>
				</div>

				{/* Auto-calculated summary */}
				{(() => {
					const totalGemsUsed = (formData.weaponGems || 0) + (formData.armorGems || 0) + (formData.axeGems || 0) + (formData.pickaxeGems || 0);
					const totalTokensUsed = (formData.weaponTokens || 0) + (formData.armorTokens || 0) + (formData.axeTokens || 0) + (formData.pickaxeTokens || 0);
					const gemsCost = totalGemsUsed * (formData.gemPrice || 0.00714);
					
					if (totalGemsUsed > 0 || totalTokensUsed > 0) {
						return (
							<div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
								<div className="space-y-2">
									<h4 className="font-medium text-blue-800 dark:text-blue-200">
										📊 Resumo dos Gastos
									</h4>
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div>
											<p className="text-blue-600 dark:text-blue-300">
												💎 {totalGemsUsed.toLocaleString()} gemas
											</p>
											<p className="text-blue-600 dark:text-blue-300">
												💰 {totalTokensUsed.toLocaleString()} tokens utilizados
											</p>
										</div>
										<div className="text-right">
											<p className="text-lg font-bold text-blue-800 dark:text-blue-200">
												${gemsCost.toFixed(2)}
											</p>
											<p className="text-xs text-blue-600 dark:text-blue-300">
												Custo das gems
											</p>
										</div>
									</div>
									<div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
										<p className="text-xs text-blue-600 dark:text-blue-300">
											💡 Os tokens utilizados serão descontados dos tokens farmados
										</p>
									</div>
								</div>
							</div>
						);
					}
					return null;
				})()}

				{/* Equipamentos Section */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
						<Zap className="w-4 h-4" />
						Equipamentos (Aceleração)
					</h3>
					
					{/* Arma */}
					<div className="p-4 bg-muted/30 rounded-lg border border-border/50">
						<h4 className="text-base font-medium text-foreground mb-3 flex items-center gap-2">
							⚔️ Arma
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="weaponGems" className="text-sm font-medium text-foreground">
									Gemas Gastas
								</Label>
								<Input
									id="weaponGems"
									type="number"
									value={displayValue('weaponGems', formData.weaponGems)}
									onChange={handleInputChange('weaponGems')}
									placeholder="0"
									className="mt-1"
								/>
							</div>
							<div>
								<Label htmlFor="weaponTokens" className="text-sm font-medium text-foreground">
									Tokens Gastos
								</Label>
								<Input
									id="weaponTokens"
									type="number"
									value={displayValue('weaponTokens', formData.weaponTokens)}
									onChange={handleInputChange('weaponTokens')}
									placeholder="0"
									className="mt-1"
								/>
							</div>
						</div>
					</div>

					{/* Armadura */}
					<div className="p-4 bg-muted/30 rounded-lg border border-border/50">
						<h4 className="text-base font-medium text-foreground mb-3 flex items-center gap-2">
							🛡️ Armadura
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="armorGems" className="text-sm font-medium text-foreground">
									Gemas Gastas
								</Label>
								<Input
									id="armorGems"
									type="number"
									value={displayValue('armorGems', formData.armorGems)}
									onChange={handleInputChange('armorGems')}
									placeholder="0"
									className="mt-1"
								/>
							</div>
							<div>
								<Label htmlFor="armorTokens" className="text-sm font-medium text-foreground">
									Tokens Gastos
								</Label>
								<Input
									id="armorTokens"
									type="number"
									value={displayValue('armorTokens', formData.armorTokens)}
									onChange={handleInputChange('armorTokens')}
									placeholder="0"
									className="mt-1"
								/>
							</div>
						</div>
					</div>

					{/* Machado */}
					<div className="p-4 bg-muted/30 rounded-lg border border-border/50">
						<h4 className="text-base font-medium text-foreground mb-3 flex items-center gap-2">
							🪓 Machado
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="axeGems" className="text-sm font-medium text-foreground">
									Gemas Gastas
								</Label>
								<Input
									id="axeGems"
									type="number"
									value={displayValue('axeGems', formData.axeGems)}
									onChange={handleInputChange('axeGems')}
									placeholder="0"
									className="mt-1"
								/>
							</div>
							<div>
								<Label htmlFor="axeTokens" className="text-sm font-medium text-foreground">
									Tokens Gastos
								</Label>
								<Input
									id="axeTokens"
									type="number"
									value={displayValue('axeTokens', formData.axeTokens)}
									onChange={handleInputChange('axeTokens')}
									placeholder="0"
									className="mt-1"
								/>
							</div>
						</div>
					</div>

					{/* Picareta */}
					<div className="p-4 bg-muted/30 rounded-lg border border-border/50">
						<h4 className="text-base font-medium text-foreground mb-3 flex items-center gap-2">
							⛏️ Picareta
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="pickaxeGems" className="text-sm font-medium text-foreground">
									Gemas Gastas
								</Label>
								<Input
									id="pickaxeGems"
									type="number"
									value={displayValue('pickaxeGems', formData.pickaxeGems)}
									onChange={handleInputChange('pickaxeGems')}
									placeholder="0"
									className="mt-1"
								/>
							</div>
							<div>
								<Label htmlFor="pickaxeTokens" className="text-sm font-medium text-foreground">
									Tokens Gastos
								</Label>
								<Input
									id="pickaxeTokens"
									type="number"
									value={displayValue('pickaxeTokens', formData.pickaxeTokens)}
									onChange={handleInputChange('pickaxeTokens')}
									placeholder="0"
									className="mt-1"
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Tokens Section */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
						<Zap className="w-4 h-4" />
						Tokens Farmados
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

		{/* Breakdown por Equipamento */}
		{results && results.equipmentBreakdown && (
			<Card className="mt-6">
				<CardHeader>
					<CardTitle className="text-lg font-semibold flex items-center gap-2">
						📊 Breakdown por Equipamento
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{/* Arma */}
						<div className="p-4 bg-muted/30 rounded-lg border border-border/50">
							<h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
								⚔️ Arma
							</h4>
							<div className="space-y-1 text-sm">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Gemas:</span>
									<span className="font-medium">{results.equipmentBreakdown.weapon.gems}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Tokens:</span>
									<span className="font-medium">{results.equipmentBreakdown.weapon.tokens}</span>
								</div>
								<div className="flex justify-between pt-1 border-t border-border/30">
									<span className="text-muted-foreground">Custo Total:</span>
									<span className="font-medium text-orange-600">${results.equipmentBreakdown.weapon.cost.toFixed(2)}</span>
								</div>
							</div>
						</div>

						{/* Armadura */}
						<div className="p-4 bg-muted/30 rounded-lg border border-border/50">
							<h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
								🛡️ Armadura
							</h4>
							<div className="space-y-1 text-sm">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Gemas:</span>
									<span className="font-medium">{results.equipmentBreakdown.armor.gems}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Tokens:</span>
									<span className="font-medium">{results.equipmentBreakdown.armor.tokens}</span>
								</div>
								<div className="flex justify-between pt-1 border-t border-border/30">
									<span className="text-muted-foreground">Custo Total:</span>
									<span className="font-medium text-orange-600">${results.equipmentBreakdown.armor.cost.toFixed(2)}</span>
								</div>
							</div>
						</div>

						{/* Machado */}
						<div className="p-4 bg-muted/30 rounded-lg border border-border/50">
							<h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
								🪓 Machado
							</h4>
							<div className="space-y-1 text-sm">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Gemas:</span>
									<span className="font-medium">{results.equipmentBreakdown.axe.gems}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Tokens:</span>
									<span className="font-medium">{results.equipmentBreakdown.axe.tokens}</span>
								</div>
								<div className="flex justify-between pt-1 border-t border-border/30">
									<span className="text-muted-foreground">Custo Total:</span>
									<span className="font-medium text-orange-600">${results.equipmentBreakdown.axe.cost.toFixed(2)}</span>
								</div>
							</div>
						</div>

						{/* Picareta */}
						<div className="p-4 bg-muted/30 rounded-lg border border-border/50">
							<h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
								⛏️ Picareta
							</h4>
							<div className="space-y-1 text-sm">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Gemas:</span>
									<span className="font-medium">{results.equipmentBreakdown.pickaxe.gems}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Tokens:</span>
									<span className="font-medium">{results.equipmentBreakdown.pickaxe.tokens}</span>
								</div>
								<div className="flex justify-between pt-1 border-t border-border/30">
									<span className="text-muted-foreground">Custo Total:</span>
									<span className="font-medium text-orange-600">${results.equipmentBreakdown.pickaxe.cost.toFixed(2)}</span>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		)}


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
