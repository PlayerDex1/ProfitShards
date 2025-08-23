import { memo, useEffect, useMemo, useState } from "react";
import { DollarSign, Gem, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalculatorFormData } from "@/types/calculator";
import { useI18n } from "@/i18n";

interface CalculatorProps {
	formData: CalculatorFormData;
	onUpdateFormData: (field: keyof CalculatorFormData, value: any) => void;
	onSaveToHistory: () => void;
}

export const Calculator = memo(function Calculator({ formData, onUpdateFormData, onSaveToHistory }: CalculatorProps) {
	const { t } = useI18n();
	const [touched, setTouched] = useState<Record<string, boolean>>({});
	const [error, setError] = useState<string | null>(null);
	const [saveMessage, setSaveMessage] = useState<string>('');

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
		setSaveMessage('✅ Cálculo salvo no histórico!');
		setTimeout(() => setSaveMessage(''), 3000);
		onSaveToHistory();
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
							<Label htmlFor="investment" className="text-sm font-medium text-foreground">
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
							<Label htmlFor="gemPrice" className="text-sm font-medium text-foreground">
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
							<Label htmlFor="gemsPurchased" className="text-sm font-medium text-foreground">
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
							<Label htmlFor="gemsRemaining" className="text-sm font-medium text-foreground">
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
							<Label htmlFor="gemsConsumed" className="text-sm font-medium text-foreground">
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
							<Label htmlFor="tokensEquipment" className="text-sm font-medium text-foreground">
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
							<Label htmlFor="tokensFarmed" className="text-sm font-medium text-foreground">
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
							<Label htmlFor="loadsUsed" className="text-sm font-medium text-foreground">
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
							<Label htmlFor="tokenPrice" className="text-sm font-medium text-foreground">
								{t('calc.tokenPrice')}
							</Label>
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
						<p className="text-xs text-muted-foreground mb-3">
							💡 Clique no botão abaixo para salvar este cálculo no seu histórico
						</p>
						<Button onClick={handleManualSave} className="w-full" size="lg">
							{t('calc.button')}
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
});
