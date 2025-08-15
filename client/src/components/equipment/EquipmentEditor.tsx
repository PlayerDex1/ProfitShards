import { useState } from "react";
import { Equipment, clampLuck, Rarity, RARITY_LABELS } from "@/types/equipment";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EquipmentEditorProps {
  equipment: Equipment;
  onSave: (e: Equipment) => void;
  onCancel: () => void;
}

const RARITIES: Rarity[] = ['comum', 'incomum', 'raro', 'épico', 'lendário', 'mítico'];

export function EquipmentEditor({ equipment, onSave, onCancel }: EquipmentEditorProps) {
  const [luck, setLuck] = useState<number>(equipment.luck);
  const [rarity, setRarity] = useState<Rarity>(equipment.rarity);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="text-white/80 text-sm w-24">Raridade</label>
        <select
          value={rarity}
          onChange={(e) => setRarity(e.target.value as Rarity)}
          className="bg-white/10 border-white/20 text-white h-9 px-2 rounded"
        >
          {RARITIES.map((r) => (
            <option key={r} value={r} className="bg-black text-white">
              {RARITY_LABELS[r]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-white/80 text-sm w-24">Luck</label>
        <Input
          type="number"
          value={luck}
          onChange={(e) => setLuck(clampLuck(Number(e.target.value)))}
          className="h-9 bg-white/10 border-white/20 text-white w-40"
          min={0}
          max={3000}
        />
      </div>
      <div className="flex gap-2 pt-1">
        <Button className="bg-white text-black hover:bg-white/90 h-9 px-4" onClick={() => onSave({ luck, rarity })}>Salvar</Button>
        <Button className="bg-white/10 text-white hover:bg-white/20 h-9 px-4" onClick={onCancel}>Cancelar</Button>
      </div>
    </div>
  );
}