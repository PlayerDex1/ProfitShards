import { useState } from "react";
import { Equipment, clampLuck, Rarity, RARITY_LABELS } from "@/types/equipment";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

interface EquipmentEditorProps {
  equipment: Equipment;
  onSave: (e: Equipment) => void;
  onCancel: () => void;
}

const RARITIES: Rarity[] = ['comum', 'incomum', 'raro', 'épico', 'lendário', 'mítico'];
const RARITY_PRESETS: Record<Rarity, number> = {
  comum: 50,
  incomum: 150,
  raro: 300,
  épico: 600,
  lendário: 1200,
  mítico: 2000,
};

export function EquipmentEditor({ equipment, onSave, onCancel }: EquipmentEditorProps) {
  const { t } = useI18n();
  const [luck, setLuck] = useState<number>(equipment.luck);
  const [rarity, setRarity] = useState<Rarity>(equipment.rarity);

  const applyPreset = (r: Rarity) => {
    setRarity(r);
    setLuck(RARITY_PRESETS[r]);
  };

  const nudge = (delta: number) => setLuck((v) => clampLuck(v + delta));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="text-white/80 text-sm w-24">{t('equipment.rarity')}</label>
        <select value={rarity} onChange={(e) => applyPreset(e.target.value as Rarity)} className="bg-white/10 border-white/20 text-white h-9 px-2 rounded">
          {RARITIES.map((r) => (
            <option key={r} value={r} className="bg-black text-white">
              {t(`equipment.rarity.${r}`)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-white/80 text-sm w-24">{t('equipment.luck')}</label>
        <div className="flex items-center gap-2">
          <Button type="button" className="h-9 px-2 bg-white/10 text-white hover:bg-white/20" onClick={() => nudge(-100)}>-100</Button>
          <Button type="button" className="h-9 px-2 bg-white/10 text-white hover:bg-white/20" onClick={() => nudge(-10)}>-10</Button>
          <Input type="number" value={luck} onChange={(e) => setLuck(clampLuck(Number(e.target.value)))} className="h-9 bg-white/10 border-white/20 text-white w-32 text-center" min={0} max={3000} />
          <Button type="button" className="h-9 px-2 bg-white/10 text-white hover:bg-white/20" onClick={() => nudge(10)}>+10</Button>
          <Button type="button" className="h-9 px-2 bg-white/10 text-white hover:bg-white/20" onClick={() => nudge(100)}>+100</Button>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button className="bg-white text-black hover:bg-white/90 h-9 px-4" onClick={() => onSave({ luck, rarity })}>{t('equipment.save')}</Button>
        <Button className="bg-white/10 text-white hover:bg-white/20 h-9 px-4" onClick={onCancel}>{t('equipment.cancel')}</Button>
      </div>
    </div>
  );
}