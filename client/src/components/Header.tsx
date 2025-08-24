import { Moon, Sun, Calculator, LogIn, LogOut, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/useTheme";
import { useState } from "react";
import { AuthModal } from "@/components/AuthModal";
import { useI18n } from "@/i18n";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const [showAuth, setShowAuth] = useState(false);
  const { t, lang, setLang } = useI18n();

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-sm">
        <div className="container mx-auto px-4 flex h-16 items-center">
          <div className="mr-6 flex items-center group">
            <div className="p-2 bg-primary/10 rounded-full mr-3 group-hover:bg-primary/20 transition-colors">
              <Calculator className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              ProfitShards
            </span>
          </div>
          
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
            </div>
            
            <nav className="flex items-center space-x-3">
              {/* Language Selector */}
              <div className="flex items-center space-x-1">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as 'pt' | 'en')}
                  className="bg-transparent text-sm text-foreground border-none outline-none cursor-pointer hover:text-primary transition-colors"
                >
                  <option value="pt" className="bg-background text-foreground">🇧🇷 PT</option>
                  <option value="en" className="bg-background text-foreground">🇺🇸 EN</option>
                </select>
              </div>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {isDark ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
                <span className="sr-only">Alternar tema</span>
              </Button>
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium px-3 py-1 bg-gradient-to-r from-green-500/10 to-emerald-600/10 border border-green-500/20 rounded-full">
                    Olá, <span className="text-green-600 font-bold">{user}</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all duration-300"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> {t('header.logout')}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowAuth(true)}
                  className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <LogIn className="h-4 w-4 mr-2" /> {t('header.login')}
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
