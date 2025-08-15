import { useEffect, useMemo, useState } from "react";
import { Plus, Edit2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Equipment } from "@/types/calculator";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";

const DEFAULT_EQUIP: Equipment[] = [
  {
    id: "1",
    name: "Espada Mística",
    type: "sword",
    tier: "S",
    cost: 8500,
    revenuePerHour: 65,
    maintenanceCost: 75,
    roi: 84.6,
    efficiency: 8.5,
    paybackDays: 12,
    status: "active",
  },
  {
    id: "2",
    name: "Armadura de Dragão",
    type: "armor",
    tier: "A",
    cost: 6200,
    revenuePerHour: 45,
    maintenanceCost: 50,
    roi: 62.3,
    efficiency: 7.2,
    paybackDays: 18,
    status: "active",
  },
  {
    id: "3",
    name: "Cajado Ancestral",
    type: "staff",
    tier: "S",
    cost: 9800,
    revenuePerHour: 70,
    maintenanceCost: 85,
    roi: 91.2,
    efficiency: 9.1,
    paybackDays: 15,
    status: "active",
  },
];

export function EquipmentComparison() {
  const { user, isAuthenticated } = useAuth();
  const storageKey = useMemo(() => (user ? `worldshards-equip-${user}` : null), [user]);
  const [equipments, setEquipments] = useState<Equipment[]>(DEFAULT_EQUIP);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Equipment>>({});

  useEffect(() => {
    if (storageKey) {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        setEquipments(JSON.parse(raw));
      } else {
        setEquipments(DEFAULT_EQUIP);
      }
    } else {
      setEquipments(DEFAULT_EQUIP);
    }
  }, [storageKey]);

  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(equipments));
    }
  }, [equipments, storageKey]);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'S':
        return 'bg-white text-black';
      case 'A':
        return 'bg-white text-black';
      case 'B':
        return 'bg-white text-black';
      default:
        return 'bg-white text-black';
    }
  };

  const startEdit = (e: Equipment) => {
    if (!isAuthenticated) return;
    setEditingId(e.id);
    setDraft({ ...e });
  };

  const saveEdit = () => {
    if (!editingId) return;
    setEquipments((prev) => prev.map((e) => (e.id === editingId ? { ...(e as Equipment), ...(draft as Equipment), id: e.id } : e)));
    setEditingId(null);
    setDraft({});
  };

  const addEquipment = () => {
    if (!isAuthenticated) return;
    const newId = String(Date.now());
    const newEq: Equipment = {
      id: newId,
      name: "Novo Equipamento",
      type: "custom",
      tier: "B",
      cost: 0,
      revenuePerHour: 0,
      maintenanceCost: 0,
      roi: 0,
      efficiency: 0,
      paybackDays: 0,
      status: "active",
    };
    setEquipments((prev) => [newEq, ...prev]);
    setEditingId(newId);
    setDraft(newEq);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Comparação de Equipamentos</CardTitle>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <Button onClick={addEquipment} data-testid="button-add-equipment" className="bg-white text-black hover:bg-white/90">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipments.map((equipment) => (
            <Card key={equipment.id} className="hover:shadow-md transition-shadow bg-black border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  {editingId === equipment.id ? (
                    <Input
                      value={String(draft.name ?? equipment.name)}
                      onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                      className="h-9 bg-white/10 border-white/20 text-white"
                    />
                  ) : (
                    <h3 className="text-lg font-medium text-white" data-testid={`text-equipment-name-${equipment.id}`}>
                      {equipment.name}
                    </h3>
                  )}
                  <div className="flex items-center space-x-2">
                    <Badge className={getTierColor(editingId === equipment.id ? String(draft.tier ?? equipment.tier) : equipment.tier)}>
                      Tier {editingId === equipment.id ? String(draft.tier ?? equipment.tier) : equipment.tier}
                    </Badge>
                    {isAuthenticated && (
                      editingId === equipment.id ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={saveEdit}
                          className="h-8 px-2 bg-white text-black hover:bg-white/90"
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white hover:bg-white/10"
                          data-testid={`button-edit-equipment-${equipment.id}`}
                          onClick={() => startEdit(equipment)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )
                    )}
                  </div>
                </div>

                <div className="space-y-3 text-white/90">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Custo Inicial</span>
                    {editingId === equipment.id ? (
                      <Input
                        type="number"
                        value={String(draft.cost ?? equipment.cost)}
                        onChange={(e) => setDraft((d) => ({ ...d, cost: Number(e.target.value) }))}
                        className="h-8 w-28 bg-white/10 border-white/20 text-white"
                      />
                    ) : (
                      <span className="font-mono text-sm" data-testid={`text-equipment-cost-${equipment.id}`}>
                        {equipment.cost.toLocaleString()} 💎
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Receita/Hora</span>
                    {editingId === equipment.id ? (
                      <Input
                        type="number"
                        value={String(draft.revenuePerHour ?? equipment.revenuePerHour)}
                        onChange={(e) => setDraft((d) => ({ ...d, revenuePerHour: Number(e.target.value) }))}
                        className="h-8 w-28 bg-white/10 border-white/20 text-white"
                      />
                    ) : (
                      <span className="font-mono text-sm" data-testid={`text-equipment-revenue-${equipment.id}`}>
                        {equipment.revenuePerHour} 🪙
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">ROI Mensal</span>
                    {editingId === equipment.id ? (
                      <Input
                        type="number"
                        value={String(draft.roi ?? equipment.roi)}
                        onChange={(e) => setDraft((d) => ({ ...d, roi: Number(e.target.value) }))}
                        className="h-8 w-28 bg-white/10 border-white/20 text-white"
                      />
                    ) : (
                      <span className="font-mono text-sm" data-testid={`text-equipment-roi-${equipment.id}`}>
                        {equipment.roi.toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Eficiência</span>
                    {editingId === equipment.id ? (
                      <Input
                        type="number"
                        value={String(draft.efficiency ?? equipment.efficiency)}
                        onChange={(e) => setDraft((d) => ({ ...d, efficiency: Number(e.target.value) }))}
                        className="h-8 w-28 bg-white/10 border-white/20 text-white"
                      />
                    ) : (
                      <div className="flex items-center">
                        <Progress 
                          value={equipment.efficiency * 10} 
                          className="w-16 h-2 mr-2" 
                          data-testid={`progress-equipment-efficiency-${equipment.id}`}
                        />
                        <span className="text-sm text-white/70 font-mono">
                          {equipment.efficiency.toFixed(1)}/10
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-800 text-white/80 text-xs">
                  <div className="flex justify-between">
                    <span>
                      Payback: <span className="font-mono" data-testid={`text-equipment-payback-${equipment.id}`}>
                        {editingId === equipment.id ? (
                          <Input
                            type="number"
                            value={String(draft.paybackDays ?? equipment.paybackDays)}
                            onChange={(e) => setDraft((d) => ({ ...d, paybackDays: Number(e.target.value) }))}
                            className="h-8 w-20 inline-block bg-white/10 border-white/20 text-white ml-2"
                          />
                        ) : (
                          <>{equipment.paybackDays} dias</>
                        )}
                      </span>
                    </span>
                    <span>
                      Status: <span className="text-white">Ativo</span>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
