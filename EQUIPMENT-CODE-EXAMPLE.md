# 💻 Exemplos de Código - Sistema de Equipamento

## 🎯 Componente Principal da Interface

```tsx
// EquipmentInterface.tsx
import { X, Edit2 } from "lucide-react";
import { Equipment, EquipmentSession, EquipmentType, EQUIPMENT_NAMES, RARITY_COLORS, RARITY_LABELS } from "@/types/equipment";
import { EquipmentEditor } from "./EquipmentEditor";
import { useState } from "react";

interface EquipmentInterfaceProps {
  session: EquipmentSession;
  totalLuck: number;
  onClose?: () => void;
  onEquipmentChange?: (type: EquipmentType, equipment: Equipment) => void;
}

export function EquipmentInterface({ 
  session, 
  totalLuck, 
  onClose, 
  onEquipmentChange 
}: EquipmentInterfaceProps) {
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
          <h3 className="text-lg font-semibold text-white">
            {EQUIPMENT_NAMES[type]}
          </h3>
          <EquipmentEditor
            equipment={equipment}
            onSave={handleSaveEquipment}
            onCancel={() => setEditingEquipment(null)}
          />
        </div>
      );
    }

    return (
      <div key={type} className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            {EQUIPMENT_NAMES[type]}
          </h3>
          <button
            onClick={() => setEditingEquipment(type)}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-800"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-300">Rareté:</span>
            <span className={`font-medium ${RARITY_COLORS[equipment.rarity]}`}>
              {RARITY_LABELS[equipment.rarity]}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Niveau de chance:</span>
            <span className="text-white font-medium">{equipment.luckLevel}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Équipement - Navriix
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Configuration d'équipement pour cette session
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Equipment Grid */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {renderEquipmentItem('weapon', session.weapon)}
              {renderEquipmentItem('axe', session.axe)}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {renderEquipmentItem('armor', session.armor)}
              {renderEquipmentItem('pickaxe', session.pickaxe)}
            </div>
          </div>
        </div>

        {/* Total Luck */}
        <div className="px-6 pb-6">
          <div className="border-t border-slate-700 pt-4">
            <div className="text-center">
              <span className="text-white text-lg">Total Luck: </span>
              <span className="text-amber-400 text-2xl font-bold">{totalLuck}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 🎨 Tipos TypeScript

```typescript
// types/equipment.ts
export type EquipmentRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export interface Equipment {
  id: string;
  name: string;
  rarity: EquipmentRarity;
  luckLevel: number;
  type: EquipmentType;
}

export type EquipmentType = 'weapon' | 'axe' | 'armor' | 'pickaxe';

export interface EquipmentSession {
  weapon: Equipment;
  axe: Equipment;
  armor: Equipment;
  pickaxe: Equipment;
}

export const EQUIPMENT_NAMES: Record<EquipmentType, string> = {
  weapon: 'Arme',
  axe: 'Hache',
  armor: 'Armure',
  pickaxe: 'Pioche'
};

export const RARITY_COLORS: Record<EquipmentRarity, string> = {
  Common: 'text-gray-400',
  Uncommon: 'text-green-400',
  Rare: 'text-blue-400',
  Epic: 'text-purple-400',
  Legendary: 'text-yellow-400'
};

export const RARITY_LABELS: Record<EquipmentRarity, string> = {
  Common: 'Commun',
  Uncommon: 'Uncommun',
  Rare: 'Rare',
  Epic: 'Épique',
  Legendary: 'Légendaire'
};
```

## 🪝 Hook Personalizado

```typescript
// hooks/useEquipment.ts
import { useState, useCallback } from 'react';
import { Equipment, EquipmentSession, EquipmentType } from '@/types/equipment';

const DEFAULT_EQUIPMENT: EquipmentSession = {
  weapon: {
    id: 'weapon-1',
    name: 'Arme',
    rarity: 'Rare',
    luckLevel: 12,
    type: 'weapon'
  },
  axe: {
    id: 'axe-1',
    name: 'Hache',
    rarity: 'Rare',
    luckLevel: 12,
    type: 'axe'
  },
  armor: {
    id: 'armor-1',
    name: 'Armure',
    rarity: 'Uncommon',
    luckLevel: 11,
    type: 'armor'
  },
  pickaxe: {
    id: 'pickaxe-1',
    name: 'Pioche',
    rarity: 'Rare',
    luckLevel: 12,
    type: 'pickaxe'
  }
};

export function useEquipment() {
  const [session, setSession] = useState<EquipmentSession>(DEFAULT_EQUIPMENT);
  const [isOpen, setIsOpen] = useState(false);

  const calculateTotalLuck = useCallback((equipmentSession: EquipmentSession) => {
    return Object.values(equipmentSession).reduce((total, equipment) => {
      return total + equipment.luckLevel;
    }, 0);
  }, []);

  const updateEquipment = useCallback((type: EquipmentType, updates: Partial<Equipment>) => {
    setSession(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        ...updates
      }
    }));
  }, []);

  const openEquipment = useCallback(() => setIsOpen(true), []);
  const closeEquipment = useCallback(() => setIsOpen(false), []);

  const totalLuck = calculateTotalLuck(session);

  return {
    session,
    totalLuck,
    isOpen,
    openEquipment,
    closeEquipment,
    updateEquipment
  };
}
```

## 🔧 Editor de Equipamentos

```tsx
// EquipmentEditor.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Equipment, EquipmentRarity, RARITY_COLORS, RARITY_LABELS } from "@/types/equipment";

interface EquipmentEditorProps {
  equipment: Equipment;
  onSave: (equipment: Equipment) => void;
  onCancel: () => void;
}

const RARITY_OPTIONS: EquipmentRarity[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

export function EquipmentEditor({ equipment, onSave, onCancel }: EquipmentEditorProps) {
  const [editedEquipment, setEditedEquipment] = useState<Equipment>(equipment);

  const handleSave = () => {
    onSave(editedEquipment);
  };

  const updateField = (field: keyof Equipment, value: string | number) => {
    setEditedEquipment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
      <div className="space-y-2">
        <Label htmlFor="rarity" className="text-white">Rareté</Label>
        <Select
          value={editedEquipment.rarity}
          onValueChange={(value: EquipmentRarity) => updateField('rarity', value)}
        >
          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            {RARITY_OPTIONS.map(rarity => (
              <SelectItem key={rarity} value={rarity}>
                <span className={RARITY_COLORS[rarity]}>{RARITY_LABELS[rarity]}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="luckLevel" className="text-white">Niveau de chance</Label>
        <Input
          id="luckLevel"
          type="number"
          min="1"
          max="20"
          value={editedEquipment.luckLevel}
          onChange={(e) => updateField('luckLevel', parseInt(e.target.value) || 1)}
          className="bg-slate-700 border-slate-600 text-white"
        />
      </div>

      <div className="flex space-x-2 pt-2">
        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
          Sauvegarder
        </Button>
        <Button onClick={onCancel} variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
          Annuler
        </Button>
      </div>
    </div>
  );
}
```

## 🚀 Integração na Página Principal

```tsx
// pages/calculator.tsx
import { EquipmentButton } from "@/components/equipment/EquipmentButton";
import { EquipmentInterface } from "@/components/equipment/EquipmentInterface";
import { useEquipment } from "@/hooks/useEquipment";

export default function CalculatorPage() {
  const { state, results, updateState } = useCalculator();
  const { session, totalLuck, isOpen, openEquipment, closeEquipment, updateEquipment } = useEquipment();

  return (
    <div className="min-h-screen p-4 lg:p-8 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center">
            <Calculator className="text-green-600 mr-3 h-8 w-8" />
            Calculadora de Lucro - Worldshards
          </h1>
          <p className="text-slate-600">
            Configure seus investimentos e calcule o lucro líquido final após recompra das gemas.
          </p>
        </div>

        {/* Equipment Section */}
        <div className="mb-8">
          <div className="flex justify-center">
            <EquipmentButton onClick={openEquipment} totalLuck={totalLuck} />
          </div>
        </div>

        {/* Main Calculator Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Configuration Panel */}
          <div>
            <SimpleConfig state={state} onUpdate={updateState} />
          </div>

          {/* Results Summary */}
          <div>
            <SimpleResults results={results} />
          </div>
        </div>

        {/* Equipment Interface Modal */}
        {isOpen && (
          <EquipmentInterface
            session={session}
            totalLuck={totalLuck}
            onClose={closeEquipment}
            onEquipmentChange={updateEquipment}
          />
        )}
      </div>
    </div>
  );
}
```

## 🎯 Como Usar

1. **Importe os componentes** no seu projeto
2. **Use o hook** `useEquipment` para gerenciar o estado
3. **Renderize o botão** `EquipmentButton` onde desejar
4. **Renderize o modal** `EquipmentInterface` quando necessário
5. **Personalize** as cores e estilos conforme sua necessidade

## 🔍 Características Técnicas

- **TypeScript** para tipagem segura
- **React Hooks** para gerenciamento de estado
- **Tailwind CSS** para estilização responsiva
- **Componentes reutilizáveis** e modulares
- **Interface acessível** com labels e navegação por teclado
- **Design system** consistente com o resto da aplicação

---

*Este código demonstra a implementação completa do sistema de equipamento para Worldshards Calculator*
