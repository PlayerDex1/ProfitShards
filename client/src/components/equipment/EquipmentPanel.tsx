import { Edit2 } from "lucide-react";
import { Equipment, EquipmentSession, EquipmentType, RARITY_COLORS } from "@/types/equipment";
import { EquipmentEditor } from "@/components/equipment/EquipmentEditor";
import { useEffect, useState } from "react";
import { getCurrentUsername } from "@/hooks/use-auth";
import { useI18n } from "@/i18n";

interface EquipmentPanelProps {
	session: EquipmentSession;
	totalLuck: number;
	onEquipmentChange?: (type: EquipmentType, equipment: Equipment) => void;
}

export function EquipmentPanel({ session, totalLuck, onEquipmentChange }: EquipmentPanelProps) {
	const [editingEquipment, setEditingEquipment] = useState<EquipmentType | null>(null);
	const username = getCurrentUsername() ?? 'Convidado';
	const { t } = useI18n();

	useEffect(() => {}, []);

	const handleSaveEquipment = (equipment: Equipment) => {
		if (onEquipmentChange && editingEquipment) {
			onEquipmentChange(editingEquipment, equipment);
		}
		setEditingEquipment(null);
	};

	const renderEquipmentItem = (type: EquipmentType, equipment: Equipment) => {
		const isEditing = editingEquipment === type;
		if (isEditing) {
			return (
				<div key={type} className="space-y-3">
					<h3 className="text-lg font-semibold text-white">{t(`equipment.slot.${type}`)}</h3>
					<EquipmentEditor type={type} equipment={equipment} onSave={handleSaveEquipment} onCancel={() => setEditingEquipment(null)} />
				</div>
			);
		}
		return (
			<div key={type} className="space-y-3">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold text-white">{t(`equipment.slot.${type}`)}</h3>
					<button onClick={() => setEditingEquipment(type)} className="text-gray-300 hover:text-white transition-colors p-2 rounded hover:bg-slate-800">
						<Edit2 className="h-5 w-5" />
					</button>
				</div>
				<div className="flex items-center justify-between text-base">
					<span className="text-gray-300">{t('equipment.rarity')}:</span>
					<span className={`font-medium ${RARITY_COLORS[equipment.rarity]}`}>{t(`equipment.rarity.${equipment.rarity}`)}</span>
				</div>
				<div className="flex items-center justify-between text-base">
					<span className="text-gray-300">{t('equipment.luck')}:</span>
					<span className="text-white font-medium">{equipment.luck}</span>
				</div>
			</div>
		);
	};

	return (
		<div className="bg-black/50 border border-slate-700 rounded-lg">
			<div className="flex items-center justify-between p-6 border-b border-slate-700">
				<div>
					<h1 className="text-2xl font-bold text-white">{t('equipment.title')}{username}</h1>
					<p className="text-gray-400 text-sm mt-1">{t('equipment.config')}</p>
				</div>
			</div>
			<div className="p-6 space-y-6">
				<div className="grid grid-cols-2 gap-8">
					<div className="space-y-6">
						{renderEquipmentItem('weapon', session.weapon)}
						{renderEquipmentItem('axe', session.axe)}
					</div>
					<div className="space-y-6">
						{renderEquipmentItem('armor', session.armor)}
						{renderEquipmentItem('pickaxe', session.pickaxe)}
					</div>
				</div>

				<div className="pt-5 text-right border-t border-slate-700 mt-5">
					<span className="text-white font-semibold text-lg">{t('equipment.totalLuck')}: {totalLuck}</span>
				</div>
			</div>
		</div>
	);
}