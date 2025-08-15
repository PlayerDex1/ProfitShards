import { useState } from "react";
import { Equipment, Rarity, clampLuck } from "@/types/equipment";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EquipmentEditorProps {
  equipment: Equipment;
  onSave: (e: Equipment) => void;
  onCancel: () => void;
}

const RARITIES: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export function EquipmentEditor({ equipment, onSave, onCancel }: EquipmentEditorProps) {
  const [rarity, setRarity] = useState<Rarity>(equipment.rarity);
  const [luckLevel, setLuckLevel] = useState<number>(equipment.luckLevel);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-white/80 text-sm w-24">Raridade</label>
        <select
          value={rarity}
          onChange={(e) => setRarity(e.target.value as Rarity)}
          className="bg-white/10 border-white/20 text-white h-9 px-2 rounded"
        >
          {RARITIES.map((r) => (
            <option key={r} value={r} className="bg-black text-white">
              {r}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-white/80 text-sm w-24">Luck</label>
        <Input
          type="number"
          value={luckLevel}
          onChange={(e) => setLuckLevel(clampLuck(Number(e.target.value)))}
          className="h-9 bg-white/10 border-white/20 text-white w-28"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <Button className="bg-white text-black hover:bg-white/90 h-9 px-4" onClick={() => onSave({ rarity, luckLevel })}>Salvar</Button>
        <Button className="bg-white/10 text-white hover:bg-white/20 h-9 px-4" onClick={onCancel}>Cancelar</Button>
      </div>
    </div>
  );
}