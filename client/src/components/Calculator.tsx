import { memo } from "react";
import { DollarSign, Gem, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalculatorFormData } from "@/types/calculator";

interface CalculatorProps {
  formData: CalculatorFormData;
  onUpdateFormData: (field: keyof CalculatorFormData, value: number) => void;
  onSaveToHistory: () => void;
}

export const Calculator = memo(function Calculator({ formData, onUpdateFormData, onSaveToHistory }: CalculatorProps) {
  const handleInputChange = (field: keyof CalculatorFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    onUpdateFormData(field, value);
  };

  return (
    <Card className="bg-black text-white shadow-lg border border-gray-800">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg">
            <DollarSign className="w-5 h-5 text-black" />
          </div>
          <CardTitle className="text-xl font-semibold text-white">
            Configuração de Investimento
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Investment Inputs */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="investment" className="text-sm font-medium text-white/80">
                Investimento Inicial (USD)
              </Label>
              <Input
                id="investment"
                type="number"
                value={formData.investment}
                onChange={handleInputChange('investment')}
                data-testid="input-investment"
                className="font-mono mt-2 bg-white/10 border-white/20 text-white placeholder-white/40"
              />
            </div>
            
            <div>
              <Label htmlFor="gemsConsumed" className="text-sm font-medium text-white/80">
                Gemas Consumidas
              </Label>
              <Input
                id="gemsConsumed"
                type="number"
                value={formData.gemsConsumed}
                onChange={handleInputChange('gemsConsumed')}
                data-testid="input-gems-consumed"
                className="font-mono mt-2 bg-white/10 border-white/20 text-white placeholder-white/40"
              />
            </div>
            
            <div>
              <Label htmlFor="loadsUsed" className="text-sm font-medium text-white/80">
                Cargas Utilizadas
              </Label>
              <Input
                id="loadsUsed"
                type="number"
                value={formData.loadsUsed}
                onChange={handleInputChange('loadsUsed')}
                data-testid="input-loads-used"
                className="font-mono mt-2 bg-white/10 border-white/20 text-white placeholder-white/40"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="gemsPurchased" className="text-sm font-medium text-white/80">
                Gemas Compradas
              </Label>
              <Input
                id="gemsPurchased"
                type="number"
                value={formData.gemsPurchased}
                onChange={handleInputChange('gemsPurchased')}
                data-testid="input-gems-purchased"
                className="font-mono mt-2 bg-white/10 border-white/20 text-white placeholder-white/40"
              />
            </div>
            
            <div>
              <Label htmlFor="tokensEquipment" className="text-sm font-medium text-white/80">
                Tokens dos Equipamentos
              </Label>
              <Input
                id="tokensEquipment"
                type="number"
                value={formData.tokensEquipment}
                onChange={handleInputChange('tokensEquipment')}
                data-testid="input-tokens-equipment"
                className="font-mono mt-2 bg-white/10 border-white/20 text-white placeholder-white/40"
              />
            </div>
            
            <div>
              <Label htmlFor="tokenPrice" className="text-sm font-medium text-white/80">
                Preço Token (USD)
              </Label>
              <Input
                id="tokenPrice"
                type="number"
                step="0.0001"
                value={formData.tokenPrice}
                onChange={handleInputChange('tokenPrice')}
                data-testid="input-token-price"
                className="font-mono mt-2 bg-white/10 border-white/20 text-white placeholder-white/40"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="gemsRemaining" className="text-sm font-medium text-white/80">
                Gemas Restantes
              </Label>
              <Input
                id="gemsRemaining"
                type="number"
                value={formData.gemsRemaining}
                onChange={handleInputChange('gemsRemaining')}
                data-testid="input-gems-remaining"
                className="font-mono mt-2 bg-white/10 border-white/20 text-white placeholder-white/40"
              />
            </div>
            
            <div>
              <Label htmlFor="tokensFarmed" className="text-sm font-medium text-white/80">
                Tokens Farmados
              </Label>
              <Input
                id="tokensFarmed"
                type="number"
                value={formData.tokensFarmed}
                onChange={handleInputChange('tokensFarmed')}
                data-testid="input-tokens-farmed"
                className="font-mono mt-2 bg-white/10 border-white/20 text-white placeholder-white/40"
              />
            </div>
            
            <div>
              <Label htmlFor="gemPrice" className="text-sm font-medium text-white/80">
                Preço Gema (USD)
              </Label>
              <Input
                id="gemPrice"
                type="number"
                step="0.0001"
                value={formData.gemPrice}
                onChange={handleInputChange('gemPrice')}
                data-testid="input-gem-price"
                className="font-mono mt-2 bg-white/10 border-white/20 text-white placeholder-white/40"
              />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Button 
            onClick={onSaveToHistory}
            className="w-full bg-white text-black hover:bg-white/90 font-semibold py-4 px-6 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl"
            data-testid="button-calculate"
          >
            <div className="flex items-center justify-center gap-3">
              <Gem className="w-5 h-5" />
              Calcular Lucro Líquido
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
