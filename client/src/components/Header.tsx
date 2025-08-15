import { Moon, Sun, Calculator, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { AuthModal } from "@/components/AuthModal";

export function Header() {
  const { isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <header className="bg-black sticky top-0 z-50 w-full border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white rounded-xl">
                <Calculator className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Calculadora de Lucro - Worldshards</h1>
                <p className="text-sm text-white/70">Configure seus investimentos e calcule o lucro líquido final</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <span className="text-white/80 text-sm hidden sm:inline">Olá, {user}</span>
                <Button
                  variant="ghost"
                  className="h-10 px-3 rounded-lg text-white hover:bg-white/10"
                  onClick={logout}
                >
                  <LogOut className="h-5 w-5 mr-2" /> Sair
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                className="h-10 px-3 rounded-lg text-white hover:bg-white/10"
                onClick={() => setShowAuth(true)}
              >
                <LogIn className="h-5 w-5 mr-2" /> Entrar
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-toggle-theme"
              className="h-10 w-10 rounded-lg text-white hover:bg-white/10"
            >
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="sr-only">Alternar tema</span>
            </Button>
          </div>
        </div>
      </div>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </header>
  );
}
