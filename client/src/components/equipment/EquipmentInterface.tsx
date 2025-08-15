import { X, Edit2, Save, Download, Upload, Trash2, Play, RefreshCcw, Share2 } from "lucide-react";
import { Equipment, EquipmentSession, EquipmentType, EQUIPMENT_NAMES, RARITY_LABELS, RARITY_COLORS } from "@/types/equipment";
import { EquipmentEditor } from "@/components/equipment/EquipmentEditor";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCurrentUsername } from "@/hooks/use-auth";
import { getBuilds, saveBuild, deleteBuild, exportBuilds, importBuilds, EquipmentBuild } from "@/lib/equipmentBuilds";
import { calculateLuckEffectFromArray } from "@/lib/luckEffect";
import { useI18n } from "@/i18n";
import { getEquipmentLuckHistory } from "@/lib/equipmentHistory";

interface EquipmentInterfaceProps {
  session: EquipmentSession;
  totalLuck: number;
  onClose?: () => void;
  onEquipmentChange?: (type: EquipmentType, equipment: Equipment) => void;
}

export function EquipmentInterface({ session, totalLuck, onClose, onEquipmentChange }: EquipmentInterfaceProps) {
  const [editingEquipment, setEditingEquipment] = useState<EquipmentType | null>(null);
  const username = getCurrentUsername() ?? 'Convidado';

  const [builds, setBuilds] = useState<EquipmentBuild[]>([]);
  const [buildName, setBuildName] = useState("");
  const [whatIfLuck, setWhatIfLuck] = useState<number>(totalLuck);
  const [compareA, setCompareA] = useState<string>("");
  const [compareB, setCompareB] = useState<string>("");

  const buildById = (id: string) => builds.find(b => b.id === id);
  const luckOfBuild = (b?: EquipmentBuild) => b ? (b.session.weapon.luck + b.session.axe.luck + b.session.armor.luck + b.session.pickaxe.luck) : 0;

  const diff = useMemo(() => {
    const a = buildById(compareA);
    const b = buildById(compareB);
    const luckA = luckOfBuild(a);
    const luckB = luckOfBuild(b);
    const delta = luckB - luckA;
    // aproximação do efeito relativo baseado em média [luckA, luckB]
    const effect = (luckA && luckB) ? calculateLuckEffectFromArray([luckA, luckB], luckB) : 1.0;
    return { luckA, luckB, delta, effect };
  }, [compareA, compareB, builds]);

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

  useEffect(() => {
    const history = getEquipmentLuckHistory().map(h => h.luck);
    window.dispatchEvent(new CustomEvent('worldshards-whatif-luck', { detail: { targetLuck: whatIfLuck, history } }));
  }, [whatIfLuck]);

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
        <div key={type} className="space-y-2">
          <h3 className="text-base font-semibold text-white">{t(`equipment.slot.${type}`)}</h3>
          <EquipmentEditor equipment={equipment} onSave={handleSaveEquipment} onCancel={() => setEditingEquipment(null)} />
        </div>
      );
    }
    return (
      <div key={type} className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">{t(`equipment.slot.${type}`)}</h3>
          <button onClick={() => setEditingEquipment(type)} className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-800">
            <Edit2 className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300">{t('equipment.rarity')}:</span>
          <span className={`font-medium ${RARITY_COLORS[equipment.rarity]}`}>{t(`equipment.rarity.${equipment.rarity}`)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
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
      const payload = btoa(unescape(encodeURIComponent(data)));
      const link = `${location.origin}${location.pathname}?builds=${encodeURIComponent(payload)}`;
      navigator.clipboard.writeText(link).catch(() => {});
    } catch {}
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-4xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <div>
            <h1 className="text-xl font-bold text-white">{t('equipment.title')}{username}</h1>
            <p className="text-gray-400 text-xs mt-1">{t('equipment.config')}</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              {renderEquipmentItem('weapon', session.weapon)}
              {renderEquipmentItem('axe', session.axe)}
            </div>
            <div className="space-y-4">
              {renderEquipmentItem('armor', session.armor)}
              {renderEquipmentItem('pickaxe', session.pickaxe)}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Favoritos/Builds */}
            <div className="bg-black/30 border border-slate-700 rounded p-3">
              <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <input
                    value={buildName}
                    onChange={(e) => setBuildName(e.target.value)}
                    placeholder={t('equipment.builds.name')}
                    className="h-8 px-2 rounded bg-white/10 border border-white/20 text-white text-sm w-full"
                  />
                  <button
                    className="h-8 px-3 bg-white text-black text-sm rounded flex items-center gap-2 whitespace-nowrap"
                    onClick={() => saveBuild(buildName, session)}
                  >
                    <Save className="h-4 w-4" /> {t('equipment.save')}
                  </button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    className="h-8 px-3 bg-white/10 text-white text-sm rounded flex items-center gap-2"
                    onClick={() => {
                      const text = exportBuilds();
                      navigator.clipboard.writeText(text).catch(() => {});
                    }}
                    title={t('equipment.export')}
                  >
                    <Download className="h-4 w-4" /> {t('equipment.export')}
                  </button>
                  <button
                    className="h-8 px-3 bg-white/10 text-white text-sm rounded flex items-center gap-2"
                    onClick={handleDownloadJson}
                    title={t('equipment.exportFile')}
                  >
                    <Download className="h-4 w-4" /> {t('equipment.exportFile')}
                  </button>
                  <button
                    className="h-8 px-3 bg-white/10 text-white text-sm rounded flex items-center gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    title={t('equipment.importFile')}
                  >
                    <Upload className="h-4 w-4" /> {t('equipment.importFile')}
                  </button>
                  <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={(e) => handleUploadJson(e.target.files?.[0])} />
                  <button
                    className="h-8 px-3 bg-white/10 text-white text-sm rounded flex items-center gap-2"
                    onClick={() => {
                      const text = prompt(t('equipment.import.prompt'));
                      if (text) importBuilds(text);
                    }}
                    title={t('equipment.import')}
                  >
                    <Upload className="h-4 w-4" /> {t('equipment.import')}
                  </button>
                  <button
                    className="h-8 px-3 bg-white/10 text-white text-sm rounded flex items-center gap-2"
                    onClick={handleShareLink}
                    title={t('equipment.share')}
                  >
                    <Share2 className="h-4 w-4" /> {t('equipment.share')}
                  </button>
                </div>
              </div>
              <div className="space-y-2 max-h-48 overflow-auto pr-2">
                {builds.length === 0 ? (
                  <p className="text-white/60 text-sm">{t('equipment.builds.none')}</p>
                ) : (
                  builds.map((b) => (
                    <div key={b.id} className="flex items-center justify-between text-sm bg-white/5 rounded px-2 py-1">
                      <span className="text-white/90 truncate">{b.name}</span>
                      <div className="flex items-center gap-2">
                        <button className="h-7 px-2 bg-white/10 text-white rounded" onClick={() => applyBuild(b)}>{t('equipment.apply')}</button>
                        <button className="h-7 px-2 bg-white/10 text-white rounded" onClick={() => deleteBuild(b.id)}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* What-if de Luck */}
            <div className="bg-black/30 border border-slate-700 rounded p-3">
              <h3 className="text-white font-semibold text-sm mb-2">{t('equipment.whatif')}</h3>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={12000}
                  step={10}
                  value={whatIfLuck}
                  onChange={(e) => setWhatIfLuck(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-white text-sm w-16 text-right">{whatIfLuck}</span>
              </div>
              <p className="text-white/70 text-xs mt-2">{t('equipment.whatif.hint')}</p>
            </div>

            {/* Comparar Builds */}
            <div className="bg-black/30 border border-slate-700 rounded p-3">
              <h3 className="text-white font-semibold text-sm mb-2">{t('equipment.compare')}</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <select value={compareA} onChange={(e) => setCompareA(e.target.value)} className="bg-white/10 border-white/20 text-white h-8 px-2 rounded w-full">
                    <option value="" className="bg-black text-white">{t('equipment.selectA')}</option>
                    {builds.map((b) => (
                      <option key={b.id} value={b.id} className="bg-black text-white">{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <select value={compareB} onChange={(e) => setCompareB(e.target.value)} className="bg-white/10 border-white/20 text-white h-8 px-2 rounded w-full">
                    <option value="" className="bg-black text-white">{t('equipment.selectB')}</option>
                    {builds.map((b) => (
                      <option key={b.id} value={b.id} className="bg-black text-white">{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="text-white/90 text-sm space-y-1">
                  <div className="flex justify-between"><span>{t('equipment.luckA')}:</span><span>{diff.luckA}</span></div>
                  <div className="flex justify-between"><span>{t('equipment.luckB')}:</span><span>{diff.luckB}</span></div>
                  <div className="flex justify-between"><span>{t('equipment.diff')}:</span><span>{diff.delta > 0 ? `+${diff.delta}` : diff.delta}</span></div>
                  <div className="flex justify-between"><span>{t('equipment.effect')}:</span><span>×{diff.effect.toFixed(2)}</span></div>
                </div>
                {buildById(compareB) && (
                  <button className="h-8 px-3 bg-white text-black text-sm rounded flex items-center gap-2 w-full justify-center" onClick={() => applyBuild(buildById(compareB)!)}>
                    <RefreshCcw className="h-4 w-4" /> {t('equipment.applyBuildB')}
                  </button>
                )}
                <p className="text-white/60 text-xs">{t('equipment.compareNote')}</p>
              </div>
            </div>

            {/* Dica/Histórico */}
            <div className="bg-black/30 border border-slate-700 rounded p-3">
              <h3 className="text-white font-semibold text-sm mb-2">Dica</h3>
              <p className="text-white/70 text-sm">Use os presets de raridade e os botões ± para ajustar rapidamente. Suas builds e sessões são salvas por usuário.</p>
            </div>
          </div>

          <div className="pt-5 text-right border-t border-slate-700 mt-5">
            <span className="text-white font-semibold">{t('equipment.totalLuck')}: {totalLuck}</span>
          </div>
        </div>
      </div>
    </div>
  );
}