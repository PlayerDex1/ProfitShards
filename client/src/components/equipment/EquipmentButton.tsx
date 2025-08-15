import { Settings } from "lucide-react";
import { useI18n } from "@/i18n";

interface EquipmentButtonProps {
  onClick: () => void;
  totalLuck: number;
}

export function EquipmentButton({ onClick, totalLuck }: EquipmentButtonProps) {
  const { t } = useI18n();
  const label = t('equipment.button').replace('{luck}', String(totalLuck));
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 bg:white text:black hover:bg:white/90 px-3 h-9 rounded bg-white text-black"
    >
      <Settings className="h-4 w-4" /> {label}
    </button>
  );
}