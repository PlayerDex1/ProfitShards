import { X, Edit2 } from "lucide-react";
import { Equipment, EquipmentSession, EquipmentType, EQUIPMENT_NAMES, RARITY_COLORS, RARITY_LABELS } from "@/types/equipment";
import { EquipmentEditor } from "@/components/equipment/EquipmentEditor";
import { useState } from "react";

interface EquipmentInterfaceProps {
  session: EquipmentSession;
  totalLuck: number;
  onClose?: () => void;
  onEquipmentChange?: (type: EquipmentType, equipment: Equipment) => void;
}

export function EquipmentInterface({ session, totalLuck, onClose, onEquipmentChange }: EquipmentInterfaceProps) {
  const [editingEquipment, setEditingEquipment] = useState<EquipmentType | null>(null);

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
        <div key={type} className="space-y-2">
          <h3 className="text-lg font-semibold text-white">{EQUIPMENT_NAMES[type]}</h3>
          <EquipmentEditor equipment={equipment} onSave={handleSaveEquipment} onCancel={() => setEditingEquipment(null)} />
        </div>
      );
    }
    return (
      <div key={type} className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{EQUIPMENT_NAMES[type]}</h3>
          <button onClick={() => setEditingEquipment(type)} className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-800">
            <Edit2 className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-300">Raridade:</span>
            <span className={`font-medium ${RARITY_COLORS[equipment.rarity]}`}>{RARITY_LABELS[equipment.rarity]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Nível de sorte:</span>
            <span className="text-white font-medium">{equipment.luckLevel}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h1 className="text-2xl font-bold text-white">Équipement - Navriix</h1>
            <p className="text-gray-400 text-sm mt-1">Configuração de equipamento para esta sessão</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="p-6">
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
          <div className="pt-6 text-right border-t border-slate-700 mt-6">
            <span className="text-white font-semibold">Total Luck: {totalLuck}</span>
          </div>
        </div>
      </div>
    </div>
  );
}