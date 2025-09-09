import { memo } from 'react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EquipmentConfig, EquipmentKey, NewAcceleration, Acceleration } from '@/types/equipment-accelerations';
import { CalculatorFormData } from '@/types/calculator';

interface EquipmentCardProps {
	config: EquipmentConfig;
	formData: CalculatorFormData;
	equipmentData: {
		expanded: boolean;
		accelerations: Acceleration[];
	};
	newAcceleration: NewAcceleration;
	onToggleExpanded: (key: EquipmentKey) => void;
	onAddAcceleration: (key: EquipmentKey) => void;
	onUpdateNewAcceleration: (field: keyof NewAcceleration, value: string) => void;
	onUpdateFormData: (field: keyof CalculatorFormData, value: any) => void;
	displayValue: (field: keyof CalculatorFormData, value: number) => string | number;
	handleInputChange: (field: keyof CalculatorFormData) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EquipmentCard = memo(function EquipmentCard({
	config,
	formData,
	equipmentData,
	newAcceleration,
	onToggleExpanded,
	onAddAcceleration,
	onUpdateNewAcceleration,
	onUpdateFormData,
	displayValue,
	handleInputChange
}: EquipmentCardProps) {
	return (
		<div className="p-4 bg-muted/30 rounded-lg border border-border/50">
			<div className="flex items-center justify-between mb-3">
				<h4 className="text-base font-medium text-foreground flex items-center gap-2">
					{config.icon} {config.name}
				</h4>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => onToggleExpanded(config.key)}
					className="p-1 h-8 w-8"
				>
					{equipmentData.expanded ? 
						<ChevronDown className="w-4 h-4" /> : 
						<ChevronRight className="w-4 h-4" />
					}
				</Button>
			</div>
			
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<Label htmlFor={config.gemField} className="text-sm font-medium text-foreground">
						Gemas Gastas
					</Label>
					<Input
						id={config.gemField}
						type="number"
						value={displayValue(config.gemField as keyof CalculatorFormData, formData[config.gemField as keyof CalculatorFormData] as number)}
						onChange={handleInputChange(config.gemField as keyof CalculatorFormData)}
						placeholder="0"
						className="mt-1"
					/>
				</div>
				<div>
					<Label htmlFor={config.tokenField} className="text-sm font-medium text-foreground">
						Tokens Gastos
					</Label>
					<Input
						id={config.tokenField}
						type="number"
						value={displayValue(config.tokenField as keyof CalculatorFormData, formData[config.tokenField as keyof CalculatorFormData] as number)}
						onChange={handleInputChange(config.tokenField as keyof CalculatorFormData)}
						placeholder="0"
						className="mt-1"
					/>
				</div>
			</div>

			{/* Detalhes dos Aceleramentos */}
			{equipmentData.expanded && (
				<div className="mt-4 pt-4 border-t border-border/30">
					<h5 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
						🚀 Aceleramentos ({equipmentData.accelerations.length})
					</h5>
					
					{/* Lista de Aceleramentos */}
					<div className="space-y-2 mb-4">
						{equipmentData.accelerations.map((acc, idx) => (
							<div key={idx} className="flex items-center justify-between p-2 bg-muted/20 rounded text-sm">
								<span className="text-muted-foreground">{idx + 1}º Aceleramento</span>
								<div className="flex gap-4">
									{acc.gems > 0 && <span className="text-blue-400">💎 {acc.gems.toLocaleString()}</span>}
									{acc.tokens > 0 && <span className="text-orange-400">🔥 {acc.tokens.toLocaleString()}</span>}
								</div>
							</div>
						))}
					</div>

					{/* Adicionar Novo Aceleramento */}
					<div className="bg-muted/20 p-3 rounded-lg">
						<h6 className="text-xs font-medium mb-2 text-foreground">
							➕ Adicionar {equipmentData.accelerations.length + 1}º Aceleramento
						</h6>
						<div className="grid grid-cols-3 gap-2">
							<Input
								type="number"
								placeholder="Gemas"
								value={newAcceleration.gems}
								onChange={(e) => onUpdateNewAcceleration('gems', e.target.value)}
								className="text-sm"
							/>
							<Input
								type="number"
								placeholder="Tokens"
								value={newAcceleration.tokens}
								onChange={(e) => onUpdateNewAcceleration('tokens', e.target.value)}
								className="text-sm"
							/>
							<Button
								onClick={() => onAddAcceleration(config.key)}
								size="sm"
								className="flex items-center justify-center"
							>
								<Plus className="w-3 h-3 mr-1" />
								Add
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
});