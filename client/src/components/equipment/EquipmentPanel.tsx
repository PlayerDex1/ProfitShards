import { Edit2, Eye, EyeOff, User, Save } from "lucide-react";
import { Equipment, EquipmentSession, EquipmentType, RARITY_COLORS } from "@/types/equipment";
import { EquipmentEditor } from "@/components/equipment/EquipmentEditor";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/i18n";

interface EquipmentPanelProps {
	session: EquipmentSession;
	totalLuck: number;
	onEquipmentChange?: (type: EquipmentType, equipment: Equipment) => void;
	visible?: boolean;
	onChangeVisibility?: (value: boolean) => void;
}

export function EquipmentPanel({ session, totalLuck, onEquipmentChange, visible = true, onChangeVisibility }: EquipmentPanelProps) {
	const [editingEquipment, setEditingEquipment] = useState<EquipmentType | null>(null);
	const [editingNickname, setEditingNickname] = useState(false);
	const [newNickname, setNewNickname] = useState('');
	const [nicknameLoading, setNicknameLoading] = useState(false);
	const { user } = useAuth();
	const { t } = useI18n();

	useEffect(() => {
		if (user?.username) {
			setNewNickname(user.username);
		}
	}, [user?.username]);

	const handleUpdateNickname = async () => {
		if (!newNickname.trim() || newNickname === user?.username) {
			setEditingNickname(false);
			return;
		}

		setNicknameLoading(true);
		try {
			const response = await fetch('/api/user/update-nickname', {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ nickname: newNickname.trim() })
			});

			const result = await response.json();
			
			if (result.success) {
				// Força refresh da auth para atualizar o username
				window.location.reload();
			} else {
				alert(`❌ Erro: ${result.error}`);
				setNewNickname(user?.username || '');
			}
		} catch (error) {
			console.error('Erro ao atualizar nickname:', error);
			alert('❌ Erro ao atualizar nickname');
			setNewNickname(user?.username || '');
		} finally {
			setNicknameLoading(false);
			setEditingNickname(false);
		}
	};

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

	if (!visible) {
		return (
			<div className="bg-black/50 border border-slate-700 rounded-lg">
				<div className="flex items-center justify-between p-6">
					<h1 className="text-sm font-medium text-white/80">Equipamento (oculto)</h1>
					<button onClick={() => onChangeVisibility?.(true)} className="text-gray-300 hover:text-white transition-colors p-2 rounded hover:bg-slate-800" aria-label="Mostrar seção">
						<Eye className="h-5 w-5" />
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-black/50 border border-slate-700 rounded-lg">
			<div className="flex items-center justify-between p-6 border-b border-slate-700">
				<div>
					<h1 className="text-2xl font-bold text-white">{t('equipment.title')}{username}</h1>
					<p className="text-gray-400 text-sm mt-1">{t('equipment.config')}</p>
				</div>
				<button onClick={() => onChangeVisibility?.(false)} className="text-gray-300 hover:text-white transition-colors p-2 rounded hover:bg-slate-800" aria-label="Ocultar seção">
					<EyeOff className="h-5 w-5" />
				</button>
			</div>
			<div className="p-6 space-y-6">
				{/* Seção de Configurações do Usuário */}
				<div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
					<div className="flex items-center space-x-2 mb-3">
						<User className="h-5 w-5 text-blue-400" />
						<h3 className="text-lg font-semibold text-white">Configurações do Usuário</h3>
					</div>
					
					<div className="space-y-3">
						<div>
							<label className="text-sm font-medium text-gray-300 block mb-1">Nickname</label>
							{editingNickname ? (
								<div className="flex items-center space-x-2">
									<input
										type="text"
										value={newNickname}
										onChange={(e) => setNewNickname(e.target.value)}
										className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										placeholder="Digite seu nickname"
										maxLength={20}
										disabled={nicknameLoading}
									/>
									<button
										onClick={handleUpdateNickname}
										disabled={nicknameLoading || !newNickname.trim()}
										className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded transition-colors flex items-center space-x-1"
									>
										{nicknameLoading ? (
											<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
										) : (
											<Save className="h-4 w-4" />
										)}
									</button>
									<button
										onClick={() => {
											setEditingNickname(false);
											setNewNickname(user?.username || '');
										}}
										disabled={nicknameLoading}
										className="px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white rounded transition-colors"
									>
										Cancelar
									</button>
								</div>
							) : (
								<div className="flex items-center justify-between bg-slate-700/50 px-3 py-2 rounded border border-slate-600">
									<span className="text-white font-medium">{user?.username || 'Carregando...'}</span>
									<button
										onClick={() => setEditingNickname(true)}
										className="text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
									>
										<Edit2 className="h-4 w-4" />
										<span className="text-sm">Editar</span>
									</button>
								</div>
							)}
							<p className="text-xs text-gray-400 mt-1">
								Seu nickname será exibido publicamente nos rankings e estatísticas
							</p>
						</div>
					</div>
				</div>

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