import { Moon, Sun, Calculator, LogIn, LogOut, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { AuthModal } from "@/components/AuthModal";
import { useI18n } from "@/i18n";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout, refreshAuth } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const { t } = useI18n();
  const [defaultMode, setDefaultMode] = useState<'login' | 'register' | 'forgot' | 'reset' | undefined>(undefined);
  const [defaultToken, setDefaultToken] = useState<string | undefined>(undefined);

  // Debug function to test auth
  const debugAuth = async () => {
    console.log('🐛 [DEBUG] Manual auth check triggered');
    try {
      const response = await fetch('/api/debug/auth-status', { credentials: 'include' });
      const data = await response.json();
      console.log('🐛 [DEBUG] Auth status:', data);
      
      // Force refresh auth
      refreshAuth();
    } catch (error) {
      console.error('🐛 [DEBUG] Auth status error:', error);
    }
  };

  // Listen for auth parameter changes
  useState(() => {
    const url = new URL(window.location.href);
    const mode = url.searchParams.get('auth') as 'login' | 'register' | 'forgot' | 'reset' | null;
    const token = url.searchParams.get('token');
    if (mode) {
      setDefaultMode(mode);
      setDefaultToken(token || undefined);
      if (mode !== 'reset' || token) {
        setShowAuth(true);
      }
    }
  });

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Calculator className="h-6 w-6 mr-2" />
            <span className="hidden font-bold sm:inline-block">
              ProfitShards
            </span>
          </div>
          
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
            </div>
            
            <nav className="flex items-center space-x-2">
              {/* Debug button - temporary */}
              <Button
                variant="ghost"
                size="sm"
                onClick={debugAuth}
                className="text-xs"
              >
                <Bug className="h-4 w-4 mr-1" />
                Debug
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {user}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                  >
                    <LogOut className="h-5 w-5 mr-2" /> Sair
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAuth(true)}
                >
                  <LogIn className="h-5 w-5 mr-2" /> {t('header.login')}
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
