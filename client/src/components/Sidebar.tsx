import { Calculator, Package, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalculationResults } from "@/types/calculator";

interface SidebarProps {
  results: CalculationResults | null;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Sidebar({ results, activeSection, onSectionChange }: SidebarProps) {
  const menuItems = [
    { id: 'calculator', label: 'Calculadora', icon: Calculator },
    { id: 'equipment', label: 'Equipamentos', icon: Package },
    { id: 'history', label: 'Histórico', icon: BarChart3 },
  ];

  return (
    <div className="lg:col-span-3">
      <div className="bg-black rounded-xl shadow-sm border border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Resumo Rápido</h2>
        
        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="text-sm text-white/70 font-medium">Lucro Total</div>
            <div className="text-2xl font-bold text-white font-mono" data-testid="text-total-profit">
              {results ? `$${results.netProfit.toFixed(2)}` : '$0.00'}
            </div>
          </div>
          
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="text-sm text-white/70 font-medium">ROI</div>
            <div className="text-2xl font-bold text-white font-mono" data-testid="text-roi">
              {results ? `${results.roi.toFixed(1)}%` : '0.0%'}
            </div>
          </div>
          
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="text-sm text-white/70 font-medium">Eficiência</div>
            <div className="text-2xl font-bold text-white font-mono" data-testid="text-efficiency">
              {results ? `${results.efficiency.toFixed(1)}/10` : '0.0/10'}
            </div>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <div className="mt-8">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  data-testid={`button-nav-${item.id}`}
                  className={cn(
                    "flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "text-black bg-white"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
