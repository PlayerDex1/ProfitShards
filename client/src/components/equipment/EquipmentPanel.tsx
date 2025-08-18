import { Edit2, Save, Download, Upload, Trash2, RefreshCcw, Share2 } from "lucide-react";
import { Equipment, EquipmentSession, EquipmentType, RARITY_COLORS } from "@/types/equipment";
import { EquipmentEditor } from "@/components/equipment/EquipmentEditor";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCurrentUsername } from "@/hooks/use-auth";
import { getBuilds, saveBuild, deleteBuild, exportBuilds, importBuilds, EquipmentBuild } from "@/lib/equipmentBuilds";
import { calculateLuckEffectFromArray } from "@/lib/luckEffect";
import { useI18n } from "@/i18n";
import { getEquipmentLuckHistory } from "@/lib/equipmentHistory";

interface EquipmentPanelProps {
	session: EquipmentSession;
	totalLuck: number;
	onEquipmentChange?: (type: EquipmentType, equipment: Equipment) => void;
}

export function EquipmentPanel({ session, totalLuck, onEquipmentChange }: EquipmentPanelProps) {
	const [editingEquipment, setEditingEquipment] = useState<EquipmentType | null>(null);
	const username = getCurrentUsername() ?? 'Convidado';

	const [builds, setBuilds] = useState<EquipmentBuild[]>([]);
	const [buildName, setBuildName] = useState("");
	const [whatIfLuck, setWhatIfLuck] = useState<number>(totalLuck);
	const [compareA, setCompareA] = useState<string>("");
	const [compareB, setCompareB] = useState<string>("");

	const buildById = (id: string) => builds.find(b => b.id === id);
	const luckOfBuild = (b?: EquipmentBuild) => b ? (b.session.weapon.luck + b.session.axe.luck + b.session.armor.luck + b.session.pickaxe.luck) : 0;

	useEffect(() => {
		const load = () => setBuilds(getBuilds());
		load();
		const onUpd = () => load();
		window.addEventListener('worldshards-equip-builds-updated', onUpd);
		return () => window.removeEventListener('worldshards-equip-builds-updated', onUpd);
	}, []);

	useEffect(() => {
		setWhatIfLuck(totalLuck);
	}, [totalLuck]);

	const handleSaveEquipment = (equipment: Equipment) => {
		if (onEquipmentChange && editingEquipment) {
			onEquipmentChange(editingEquipment, equipment);
		}
		setEditingEquipment(null);
	};

	const applyBuild = (b: EquipmentBuild) => {
		if (!onEquipmentChange) return;
		(Object.keys(b.session) as EquipmentType[]).forEach((k) => onEquipmentChange(k, b.session[k]));
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
			<div key={type} className="space-y-2">
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

	const { t } = useI18n();

	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const handleDownloadJson = () => {
		const data = exportBuilds();
		const blob = new Blob([data], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'profitshards-builds.json';
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	};

	const handleUploadJson = async (file?: File) => {
		try {
			if (!file && fileInputRef.current?.files?.[0]) file = fileInputRef.current.files[0];
			if (!file) return;
			const text = await file.text();
			importBuilds(text);
			if (fileInputRef.current) fileInputRef.current.value = '';
		} catch {}
	};

	const handleShareLink = () => {
		try {
			const data = exportBuilds();
			import('lz-string').then(({ compressToEncodedURIComponent }) => {
				const compressed = compressToEncodedURIComponent(data);
				const link = `${location.origin}${location.pathname}?b=${compressed}`;
				navigator.clipboard.writeText(link).catch(() => {});
			}).catch(() => {
				const payload = btoa(unescape(encodeURIComponent(data)));
				const link = `${location.origin}${location.pathname}?builds=${encodeURIComponent(payload)}`;
				navigator.clipboard.writeText(link).catch(() => {});
			});
		} catch {}
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

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Builds (sem salvar) */}
					<div className="bg-black/30 border border-slate-700 rounded p-4 space-y-3">
						<div className="flex items-center gap-2 flex-wrap">
							<button className="h-10 px-4 bg-white/10 text-white text-sm rounded flex items-center gap-2" onClick={() => { const text = exportBuilds(); navigator.clipboard.writeText(text).catch(() => {}); }} title={t('equipment.export')}>
								<Download className="h-5 w-5" /> {t('equipment.export')}
							</button>
							<button className="h-10 px-4 bg-white/10 text-white text-sm rounded flex items-center gap-2" onClick={handleDownloadJson} title={t('equipment.exportFile')}>
								<Download className="h-5 w-5" /> {t('equipment.exportFile')}
							</button>
							<button className="h-10 px-4 bg-white/10 text-white text-sm rounded flex items-center gap-2" onClick={() => fileInputRef.current?.click()} title={t('equipment.importFile')}>
								<Upload className="h-5 w-5" /> {t('equipment.importFile')}
							</button>
							<input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={(e) => handleUploadJson(e.target.files?.[0])} />
							<button className="h-10 px-4 bg-white/10 text-white text-sm rounded flex items-center gap-2" onClick={() => { const text = prompt(t('equipment.import.prompt')); if (text) importBuilds(text); }} title={t('equipment.import')}>
								<Upload className="h-5 w-5" /> {t('equipment.import')}
							</button>
							<button className="h-10 px-4 bg-white/10 text-white text-sm rounded flex items-center gap-2" onClick={handleShareLink} title={t('equipment.share')}>
								<Share2 className="h-5 w-5" /> {t('equipment.share')}
							</button>
						</div>
						<div className="space-y-2 max-h-56 overflow-auto pr-2">
							{builds.length === 0 ? (
								<p className="text-white/60 text-base">{t('equipment.builds.none')}</p>
							) : (
								builds.map((b) => (
									<div key={b.id} className="flex items-center justify-between text-base bg-white/5 rounded px-3 py-2">
										<span className="text-white/90 truncate">{b.name}</span>
										<div className="flex items-center gap-2">
											<button className="h-9 px-3 bg-white/10 text-white rounded" onClick={() => applyBuild(b)}>{t('equipment.apply')}</button>
											<button className="h-9 px-3 bg-white/10 text-white rounded" onClick={() => deleteBuild(b.id)}>
												<Trash2 className="h-5 w-5" />
											</button>
										</div>
									</div>
								))
							)}
						</div>
					</div>

					{/* Seções What-if e Comparar Builds removidas */}
				</div>

				<div className="pt-5 text-right border-t border-slate-700 mt-5">
					<span className="text-white font-semibold text-lg">{t('equipment.totalLuck')}: {totalLuck}</span>
				</div>
			</div>
		</div>
	);
}