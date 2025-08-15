import { Settings } from "lucide-react";

interface EquipmentButtonProps {
  onClick: () => void;
  totalLuck: number;
}

export function EquipmentButton({ onClick, totalLuck }: EquipmentButtonProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 bg:white text:black hover:bg:white/90 px-3 h-9 rounded bg-white text-black"
    >
      <Settings className="h-4 w-4" /> Equipamento (Luck: {totalLuck})
    </button>
  );
}