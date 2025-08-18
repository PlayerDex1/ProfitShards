import { memo } from "react";
import { DollarSign, Gem, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalculatorFormData } from "@/types/calculator";
import { useI18n } from "@/i18n";

interface CalculatorProps {
  formData: CalculatorFormData;
  onUpdateFormData: (field: keyof CalculatorFormData, value: any) => void;
  onSaveToHistory: () => void;
}

export const Calculator = memo(function Calculator({ formData, onUpdateFormData, onSaveToHistory }: CalculatorProps) {
  const { t } = useI18n();
  const handleInputChange = (field: keyof CalculatorFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : parseFloat(e.target.value) || 0;
    onUpdateFormData(field, value);
  };

  return (
    <Card className="bg-black text-white shadow-lg border border-gray-800">
      <CardHeader className="py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg">
            <DollarSign className="w-5 h-5 text-black" />
          </div>
          <CardTitle className="text-lg font-semibold text-white">
            {t('calc.title')}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="investment" className="text-xs font-medium text-white/80">
                {t('calc.investment')}
              </Label>
              <Input id="investment" type="number" value={formData.investment} onChange={handleInputChange('investment')} data-testid="input-investment" className="font-mono mt-1 bg-white/10 border-white/20 text-white placeholder-white/40 h-9" />
            </div>
            <div>
              <Label htmlFor="gemsConsumed" className="text-xs font-medium text-white/80">
                {t('calc.gemsConsumed')}
              </Label>
              <Input id="gemsConsumed" type="number" value={formData.gemsConsumed} onChange={handleInputChange('gemsConsumed')} data-testid="input-gems-consumed" className="font-mono mt-1 bg-white/10 border-white/20 text-white placeholder-white/40 h-9" />
            </div>
            <div>
              <Label htmlFor="loadsUsed" className="text-xs font-medium text-white/80">
                {t('calc.loadsUsed')}
              </Label>
              <Input id="loadsUsed" type="number" value={formData.loadsUsed} onChange={handleInputChange('loadsUsed')} data-testid="input-loads-used" className="font-mono mt-1 bg-white/10 border-white/20 text-white placeholder-white/40 h-9" />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="gemsPurchased" className="text-xs font-medium text-white/80">
                {t('calc.gemsPurchased')}
              </Label>
              <Input id="gemsPurchased" type="number" value={formData.gemsPurchased} onChange={handleInputChange('gemsPurchased')} data-testid="input-gems-purchased" className="font-mono mt-1 bg-white/10 border-white/20 text-white placeholder-white/40 h-9" />
            </div>
            <div>
              <Label htmlFor="tokenPrice" className="text-xs font-medium text-white/80">
                {t('calc.tokenPrice')}
              </Label>
              <Input id="tokenPrice" type="number" step="0.0001" value={formData.tokenPrice} onChange={handleInputChange('tokenPrice')} data-testid="input-token-price" className="font-mono mt-1 bg-white/10 border-white/20 text-white placeholder-white/40 h-9" />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="gemsRemaining" className="text-xs font-medium text-white/80">
                {t('calc.gemsRemaining')}
              </Label>
              <Input id="gemsRemaining" type="number" value={formData.gemsRemaining} onChange={handleInputChange('gemsRemaining')} data-testid="input-gems-remaining" className="font-mono mt-1 bg-white/10 border-white/20 text-white placeholder-white/40 h-9" />
            </div>
            <div>
              <Label htmlFor="tokensFarmed" className="text-xs font-medium text-white/80">
                {t('calc.tokensFarmed')}
              </Label>
              <Input id="tokensFarmed" type="number" value={formData.tokensFarmed} onChange={handleInputChange('tokensFarmed')} data-testid="input-tokens-farmed" className="font-mono mt-1 bg-white/10 border-white/20 text-white placeholder-white/40 h-9" />
            </div>
            <div>
              <Label htmlFor="gemPrice" className="text-xs font-medium text-white/80">
                {t('calc.gemPrice')}
              </Label>
              <Input id="gemPrice" type="number" step="0.00001" value={formData.gemPrice} onChange={handleInputChange('gemPrice')} data-testid="input-gem-price" className="font-mono mt-1 bg-white/10 border-white/20 text-white placeholder-white/40 h-9" />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={onSaveToHistory} className="w-full bg-white text-black hover:bg-white/90 font-semibold py-3 px-6 transition-all duration-300" data-testid="button-calculate">
            <div className="flex items-center justify-center gap-3">
              <Gem className="w-5 h-5" />
              {t('calc.button')}
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
