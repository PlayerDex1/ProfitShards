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
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">Resumo Rápido</h2>
        
        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg">
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">Lucro Total</div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300 font-mono" data-testid="text-total-profit">
              {results ? `$${results.netProfit.toFixed(2)}` : '$0.00'}
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg">
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">ROI</div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 font-mono" data-testid="text-roi">
              {results ? `${results.roi.toFixed(1)}%` : '0.0%'}
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-4 rounded-lg">
            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Eficiência</div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300 font-mono" data-testid="text-efficiency">
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
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
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
