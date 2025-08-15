import { useState } from "react";
import { Plus, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Equipment } from "@/types/calculator";

export function EquipmentComparison() {
  const [equipments] = useState<Equipment[]>([
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
      status: "active"
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
      status: "active"
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
      status: "active"
    }
  ]);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'S':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
      case 'A':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      case 'B':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Comparação de Equipamentos</CardTitle>
          <Button data-testid="button-add-equipment" className="gradient-primary text-white">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Equipamento
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipments.map((equipment) => (
            <Card key={equipment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium" data-testid={`text-equipment-name-${equipment.id}`}>
                    {equipment.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Badge className={getTierColor(equipment.tier)}>
                      Tier {equipment.tier}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      data-testid={`button-edit-equipment-${equipment.id}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Custo Inicial</span>
                    <span className="font-mono text-sm" data-testid={`text-equipment-cost-${equipment.id}`}>
                      {equipment.cost.toLocaleString()} 💎
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Receita/Hora</span>
                    <span className="font-mono text-sm" data-testid={`text-equipment-revenue-${equipment.id}`}>
                      {equipment.revenuePerHour} 🪙
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">ROI Mensal</span>
                    <span className="font-mono text-sm font-medium text-success" data-testid={`text-equipment-roi-${equipment.id}`}>
                      {equipment.roi.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Eficiência</span>
                    <div className="flex items-center">
                      <Progress 
                        value={equipment.efficiency * 10} 
                        className="w-16 h-2 mr-2" 
                        data-testid={`progress-equipment-efficiency-${equipment.id}`}
                      />
                      <span className="text-sm text-muted-foreground font-mono">
                        {equipment.efficiency.toFixed(1)}/10
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      Payback: <span className="font-mono" data-testid={`text-equipment-payback-${equipment.id}`}>
                        {equipment.paybackDays} dias
                      </span>
                    </span>
                    <span>
                      Status: <span className="text-success">Ativo</span>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add Equipment Card */}
          <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center h-full text-center p-6 min-h-[300px]">
              <Plus className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Adicionar Equipamento
              </h3>
              <p className="text-sm text-muted-foreground">
                Clique para comparar novos equipamentos
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
